const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

process.env.JWT_SECRET = 'audit_test_jwt_secret_key_12345';
process.env.NODE_ENV = 'test';

const app = require('./app');
const User = require('./models/User');
const Task = require('./models/Task');

let mongoServer;

const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  failures: []
};

async function test(name, fn) {
  stats.total++;
  try {
    await fn();
    stats.passed++;
    console.log(`  ✓ PASS: ${name}`);
  } catch (error) {
    stats.failed++;
    stats.failures.push({ name, error: error.message || error });
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    -> ${error.message || error}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || 'Assertion failed'} - Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
  }
}

async function runAudit() {
  console.log('====================================================');
  console.log('STARTING BACKEND FINAL AUDIT AND TEST SUITE');
  console.log('====================================================\n');

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  console.log('Connected to In-Memory MongoDB Server for audit testing.\n');

  try {
    // -----------------------------------------------------------------
    // SECTION 1: Health Check and Base Routes
    // -----------------------------------------------------------------
    console.log('--- SECTION 1: Health Check & Base Routes ---');
    await test('Health check GET / returns 200 with success message', async () => {
      const res = await request(app).get('/');
      assertEqual(res.status, 200, 'Status code');
      assertEqual(res.body.status, 'success', 'Status field');
      assert(res.body.message.includes('running'), 'Running message');
    });

    await test('Unknown route returns 404 with clean JSON message', async () => {
      const res = await request(app).get('/api/unknown-endpoint-xyz');
      assertEqual(res.status, 404, 'Status code');
      assert(res.body.message.includes('Not Found'), '404 message');
      assert(!res.body.stack, 'No stack trace exposed');
    });

    // -----------------------------------------------------------------
    // SECTION 2: Authentication Audit
    // -----------------------------------------------------------------
    console.log('\n--- SECTION 2: Authentication Audit ---');
    await test('Register: Fails on missing name/email/password', async () => {
      const res = await request(app).post('/api/auth/register').send({});
      assertEqual(res.status, 400, 'Status code');
      assert(res.body.message, 'Error message present');
    });

    await test('Register: Fails on password less than 6 characters', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Short Pass',
        email: 'short@example.com',
        password: '123'
      });
      assertEqual(res.status, 400, 'Status code');
    });

    await test('Register: Fails on invalid email format', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Invalid Email',
        email: 'invalid-email-format',
        password: 'password123'
      });
      assertEqual(res.status, 400, 'Status code');
    });

    let userAToken, userAId, userBToken, userBId;

    await test('Register: Successfully registers User A with password hashed', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Alice User',
        email: 'alice@example.com',
        password: 'Password123!'
      });
      assertEqual(res.status, 201, 'Status code');
      assert(res.body.token, 'Token returned');
      assertEqual(res.body.user.name, 'Alice User', 'User name');
      assertEqual(res.body.user.email, 'alice@example.com', 'User email');
      assert(res.body.user.password === undefined, 'Password not returned in response');

      userAToken = res.body.token;
      userAId = res.body.user._id;

      // Verify DB stored hash, not plain text
      const dbUser = await User.findById(userAId);
      assert(dbUser, 'User in DB');
      assert(dbUser.password !== 'Password123!', 'Password is not plaintext');
      assert(await bcrypt.compare('Password123!', dbUser.password), 'Bcrypt hash is valid');
    });

    await test('Register: Fails on duplicate email (case-insensitive)', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Alice Duplicate',
        email: 'ALICE@example.com',
        password: 'Password123!'
      });
      assertEqual(res.status, 400, 'Status code');
      assert(res.body.message.includes('already exists') || res.body.message.includes('User already exists'), 'Duplicate message');
    });

    await test('Register: Successfully registers User B', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Bob User',
        email: 'bob@example.com',
        password: 'Password456!'
      });
      assertEqual(res.status, 201, 'Status code');
      userBToken = res.body.token;
      userBId = res.body.user._id;
    });

    await test('Login: Fails on wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'alice@example.com',
        password: 'WrongPassword!'
      });
      assertEqual(res.status, 401, 'Status code');
      assertEqual(res.body.message, 'Invalid email or password', 'Error message');
    });

    await test('Login: Fails on non-existent user', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'Password123!'
      });
      assertEqual(res.status, 401, 'Status code');
      assertEqual(res.body.message, 'Invalid email or password', 'Error message');
    });

    await test('Login: Fails on non-string / missing credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 123,
        password: null
      });
      assertEqual(res.status, 400, 'Status code');
    });

    await test('Login: Succeeds with correct credentials and returns JWT', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'alice@example.com',
        password: 'Password123!'
      });
      assertEqual(res.status, 200, 'Status code');
      assert(res.body.token, 'Token present');
      assertEqual(res.body.user.email, 'alice@example.com', 'User email');
      assert(res.body.user.password === undefined, 'No password leaked');
    });

    await test('Protected Route GET /api/auth/me: Identifies user from JWT', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 200, 'Status code');
      assertEqual(res.body.user._id, userAId, 'User ID matches');
      assertEqual(res.body.user.email, 'alice@example.com', 'Email matches');
    });

    await test('Protected Route: Rejects request with missing JWT', async () => {
      const res = await request(app).get('/api/auth/me');
      assertEqual(res.status, 401, 'Status code');
      assert(res.body.message.includes('Not authorized'), 'Auth error message');
    });

    await test('Protected Route: Rejects request with invalid JWT', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.signature');
      assertEqual(res.status, 401, 'Status code');
      assert(res.body.message.includes('Not authorized'), 'Auth error message');
    });

    await test('Protected Route: Rejects request with expired JWT', async () => {
      const expiredToken = jwt.sign({ id: userAId }, process.env.JWT_SECRET, { expiresIn: '0s' });
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);
      assertEqual(res.status, 401, 'Status code');
      assert(res.body.message.includes('expired') || res.body.message.includes('Not authorized'), 'Expired message');
    });

    // -----------------------------------------------------------------
    // SECTION 3: Task CRUD Audit
    // -----------------------------------------------------------------
    console.log('\n--- SECTION 3: Task CRUD Audit ---');

    let taskA1Id, taskA2Id, taskB1Id;

    await test('Create Task: Succeeds with valid data and default values', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Task A1 - Fix Authentication'
        });
      assertEqual(res.status, 201, 'Status code');
      assertEqual(res.body.title, 'Task A1 - Fix Authentication', 'Title');
      assertEqual(res.body.status, 'Todo', 'Default status is Todo');
      assertEqual(res.body.priority, 'Medium', 'Default priority is Medium');
      assertEqual(res.body.userId, userAId, 'Assigned to User A');
      taskA1Id = res.body._id;
    });

    await test('Create Task: Client-provided userId is ignored (cannot spoof ownership)', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Task A2 - Spoof Test',
          userId: userBId,
          status: 'In Progress',
          priority: 'High',
          dueDate: new Date(Date.now() + 86400000).toISOString()
        });
      assertEqual(res.status, 201, 'Status code');
      assertEqual(res.body.userId, userAId, 'Ownership must be User A from JWT, not spoofed userBId');
      taskA2Id = res.body._id;
    });

    await test('Create Task: Fails on missing / empty title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: '   '
        });
      assertEqual(res.status, 400, 'Status code');
      assert(res.body.message.includes('title'), 'Title validation error');
    });

    await test('Create Task: Fails on invalid status', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Invalid Status Task',
          status: 'Completed'
        });
      assertEqual(res.status, 400, 'Status code');
    });

    await test('Create Task: Fails on invalid priority', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Invalid Priority Task',
          priority: 'Urgent'
        });
      assertEqual(res.status, 400, 'Status code');
    });

    await test('Create Task: Fails on invalid dueDate format', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Invalid Due Date Task',
          dueDate: 'invalid-date-string'
        });
      assertEqual(res.status, 400, 'Status code');
    });

    await test('Create Task: User B creates Task B1', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          title: 'Task B1 - Bob Work',
          status: 'Todo',
          priority: 'Low'
        });
      assertEqual(res.status, 201, 'Status code');
      assertEqual(res.body.userId, userBId, 'User B ownership');
      taskB1Id = res.body._id;
    });

    await test('Get Task By ID: User A fetches Task A1 successfully', async () => {
      const res = await request(app)
        .get(`/api/tasks/${taskA1Id}`)
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 200, 'Status code');
      assertEqual(res.body._id, taskA1Id, 'Task ID');
      assertEqual(res.body.title, 'Task A1 - Fix Authentication', 'Title');
    });

    await test('Get Task By ID: Fails on invalid ObjectId format', async () => {
      const res = await request(app)
        .get('/api/tasks/invalid-object-id-123')
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 400, 'Status code');
      assert(res.body.message.includes('Invalid task ID') || res.body.message.includes('invalid'), 'Invalid ID message');
    });

    await test('Get Task By ID: Returns 404 for non-existent valid ObjectId', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/api/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 404, 'Status code');
      assertEqual(res.body.message, 'Task not found', 'Not found message');
    });

    await test('Update Task (PUT): User A updates Task A1', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskA1Id}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Task A1 - Updated Title',
          description: 'Updated description',
          status: 'In Progress',
          priority: 'High'
        });
      assertEqual(res.status, 200, 'Status code');
      assertEqual(res.body.title, 'Task A1 - Updated Title', 'Updated title');
      assertEqual(res.body.status, 'In Progress', 'Updated status');
      assertEqual(res.body.priority, 'High', 'Updated priority');
    });

    await test('Update Task (PUT): Fails on empty title', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskA1Id}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: '   '
        });
      assertEqual(res.status, 400, 'Status code');
    });

    await test('Update Task Status (PATCH): Updates status to Done', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${taskA1Id}/status`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          status: 'Done'
        });
      assertEqual(res.status, 200, 'Status code');
      assertEqual(res.body.status, 'Done', 'Status is Done');
    });

    await test('Update Task Status (PATCH): Fails on invalid status', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${taskA1Id}/status`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          status: 'Finished'
        });
      assertEqual(res.status, 400, 'Status code');
    });

    // -----------------------------------------------------------------
    // SECTION 4: User Isolation & Authorization
    // -----------------------------------------------------------------
    console.log('\n--- SECTION 4: User Isolation & Authorization Audit ---');

    await test('User A CANNOT read User B task (GET /api/tasks/:id)', async () => {
      const res = await request(app)
        .get(`/api/tasks/${taskB1Id}`)
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 404, 'Status code 404 prevents data leak');
      assertEqual(res.body.message, 'Task not found', 'Message');
    });

    await test('User A CANNOT update User B task (PUT /api/tasks/:id)', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskB1Id}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: 'Hacked by User A' });
      assertEqual(res.status, 404, 'Status code');
    });

    await test('User A CANNOT update status of User B task (PATCH /api/tasks/:id/status)', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${taskB1Id}/status`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ status: 'Done' });
      assertEqual(res.status, 404, 'Status code');
    });

    await test('User A CANNOT delete User B task (DELETE /api/tasks/:id)', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskB1Id}`)
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 404, 'Status code');
    });

    await test('User B CANNOT read User A task (GET /api/tasks/:id)', async () => {
      const res = await request(app)
        .get(`/api/tasks/${taskA1Id}`)
        .set('Authorization', `Bearer ${userBToken}`);
      assertEqual(res.status, 404, 'Status code');
    });

    await test('User B CANNOT update User A task (PUT /api/tasks/:id)', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskA1Id}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ title: 'Hacked by User B' });
      assertEqual(res.status, 404, 'Status code');
    });

    await test('User B CANNOT delete User A task (DELETE /api/tasks/:id)', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskA1Id}`)
        .set('Authorization', `Bearer ${userBToken}`);
      assertEqual(res.status, 404, 'Status code');
    });

    // -----------------------------------------------------------------
    // SECTION 5: Filtering & Search Audit
    // -----------------------------------------------------------------
    console.log('\n--- SECTION 5: Filtering & Search Audit ---');

    // Clean tasks for User A to have deterministic dataset
    await Task.deleteMany({ userId: userAId });

    const seedTasks = [
      { title: 'Alpha Bug Fix', status: 'Todo', priority: 'High', dueDate: new Date('2026-09-01') },
      { title: 'Beta Feature Launch', status: 'In Progress', priority: 'Medium', dueDate: new Date('2026-09-15') },
      { title: 'Gamma Documentation', status: 'Done', priority: 'Low', dueDate: new Date('2026-09-10') },
      { title: 'Delta Bug Triage', status: 'Todo', priority: 'Low', dueDate: new Date('2026-09-20') },
      { title: 'Epsilon Performance Tuning', status: 'Done', priority: 'High', dueDate: new Date('2026-09-05') },
      { title: 'Zeta Code Review', status: 'In Progress', priority: 'High', dueDate: new Date('2026-09-25') }
    ];

    for (const t of seedTasks) {
      await Task.create({ ...t, userId: userAId });
    }

    await test('Filter: status=Todo returns only Todo tasks for User A', async () => {
      const res = await request(app)
        .get('/api/tasks?status=Todo')
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 200, 'Status code');
      assertEqual(res.body.pagination.totalTasks, 2, 'Total Todo tasks');
      assert(res.body.tasks.every((t) => t.status === 'Todo'), 'All tasks have status Todo');
    });

    await test('Filter: status=In Progress returns only In Progress tasks', async () => {
      const res = await request(app)
        .get('/api/tasks?status=In Progress')
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 200, 'Status code');
      assertEqual(res.body.pagination.totalTasks, 2, 'Total In Progress tasks');
      assert(res.body.tasks.every((t) => t.status === 'In Progress'), 'All tasks have status In Progress');
    });

    await test('Filter: status=Done returns only Done tasks', async () => {
      const res = await request(app)
        .get('/api/tasks?status=Done')
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 200, 'Status code');
      assertEqual(res.body.pagination.totalTasks, 2, 'Total Done tasks');
      assert(res.body.tasks.every((t) => t.status === 'Done'), 'All tasks have status Done');
    });

    await test('Filter: priority=High returns only High priority tasks', async () => {
      const res = await request(app)
        .get('/api/tasks?priority=High')
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 200, 'Status code');
      assertEqual(res.body.pagination.totalTasks, 3, 'Total High priority tasks');
      assert(res.body.tasks.every((t) => t.priority === 'High'), 'All tasks have priority High');
    });

    await test('Search: Case-insensitive partial match on title ("bug")', async () => {
      const res = await request(app)
        .get('/api/tasks?search=bug')
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 200, 'Status code');
      assertEqual(res.body.pagination.totalTasks, 2, 'Two tasks match "bug"');
      assert(res.body.tasks.every((t) => t.title.toLowerCase().includes('bug')), 'All matched titles contain "bug"');
    });

    await test('Search: No results returns empty array with totalTasks 0', async () => {
      const res = await request(app)
        .get('/api/tasks?search=NonExistentTerm123')
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 200, 'Status code');
      assertEqual(res.body.pagination.totalTasks, 0, 'Total tasks 0');
      assertEqual(res.body.tasks.length, 0, 'Empty tasks list');
    });

    await test('Filter + Search combination: status=Todo & search=Alpha', async () => {
      const res = await request(app)
        .get('/api/tasks?status=Todo&search=Alpha')
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 200, 'Status code');
      assertEqual(res.body.pagination.totalTasks, 1, '1 task matches');
      assertEqual(res.body.tasks[0].title, 'Alpha Bug Fix', 'Matched task title');
    });

    await test('Filter: Rejects invalid status with 400', async () => {
      const res = await request(app)
        .get('/api/tasks?status=InvalidStatus')
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 400, 'Status code');
    });

    await test('Filter: Rejects invalid priority with 400', async () => {
      const res = await request(app)
        .get('/api/tasks?priority=InvalidPriority')
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 400, 'Status code');
    });

    // -----------------------------------------------------------------
    // SECTION 6: Pagination Audit
    // -----------------------------------------------------------------
    console.log('\n--- SECTION 6: Pagination Audit ---');

    await test('Pagination: ?page=1&limit=2 returns first 2 tasks and correct metadata', async () => {
      const res = await request(app)
        .get('/api/tasks?page=1&limit=2')
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 200, 'Status code');
      assertEqual(res.body.tasks.length, 2, 'Page 1 returned 2 tasks');
      assertEqual(res.body.pagination.page, 1, 'Current page');
      assertEqual(res.body.pagination.limit, 2, 'Page limit');
      assertEqual(res.body.pagination.totalTasks, 6, 'Total tasks');
      assertEqual(res.body.pagination.totalPages, 3, 'Total pages');
    });

    await test('Pagination: ?page=2&limit=2 returns next 2 tasks', async () => {
      const res = await request(app)
        .get('/api/tasks?page=2&limit=2')
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 200, 'Status code');
      assertEqual(res.body.tasks.length, 2, 'Page 2 returned 2 tasks');
      assertEqual(res.body.pagination.page, 2, 'Current page');
    });

    await test('Pagination: Fails on page=0', async () => {
      const res = await request(app)
        .get('/api/tasks?page=0&limit=5')
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 400, 'Status code');
    });

    await test('Pagination: Fails on page=-1', async () => {
      const res = await request(app)
        .get('/api/tasks?page=-1&limit=5')
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 400, 'Status code');
    });

    await test('Pagination: Fails on page=abc', async () => {
      const res = await request(app)
        .get('/api/tasks?page=abc&limit=5')
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 400, 'Status code');
    });

    await test('Pagination: Fails on limit=0', async () => {
      const res = await request(app)
        .get('/api/tasks?page=1&limit=0')
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 400, 'Status code');
    });

    await test('Pagination: Fails on limit=abc', async () => {
      const res = await request(app)
        .get('/api/tasks?page=1&limit=abc')
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 400, 'Status code');
    });

    await test('Pagination: Fails on excessively large limit (limit=150)', async () => {
      const res = await request(app)
        .get('/api/tasks?page=1&limit=150')
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 400, 'Status code');
      assert(res.body.message.includes('100'), 'Limit bounds error message');
    });

    // -----------------------------------------------------------------
    // SECTION 7: Sorting Audit
    // -----------------------------------------------------------------
    console.log('\n--- SECTION 7: Sorting Audit ---');

    await test('Sorting: sortBy=priority&sortOrder=asc orders Low -> Medium -> High', async () => {
      const res = await request(app)
        .get('/api/tasks?sortBy=priority&sortOrder=asc&limit=10')
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 200, 'Status code');
      const priorities = res.body.tasks.map((t) => t.priority);
      const priorityMap = { Low: 1, Medium: 2, High: 3 };
      const numericPriorities = priorities.map((p) => priorityMap[p]);
      for (let i = 1; i < numericPriorities.length; i++) {
        assert(numericPriorities[i] >= numericPriorities[i - 1], `Ascending order check at index ${i}`);
      }
    });

    await test('Sorting: sortBy=priority&sortOrder=desc orders High -> Medium -> Low', async () => {
      const res = await request(app)
        .get('/api/tasks?sortBy=priority&sortOrder=desc&limit=10')
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 200, 'Status code');
      const priorities = res.body.tasks.map((t) => t.priority);
      const priorityMap = { Low: 1, Medium: 2, High: 3 };
      const numericPriorities = priorities.map((p) => priorityMap[p]);
      for (let i = 1; i < numericPriorities.length; i++) {
        assert(numericPriorities[i] <= numericPriorities[i - 1], `Descending order check at index ${i}`);
      }
    });

    await test('Sorting: sortBy=dueDate&sortOrder=asc orders by earliest date first', async () => {
      const res = await request(app)
        .get('/api/tasks?sortBy=dueDate&sortOrder=asc&limit=10')
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 200, 'Status code');
      const dueDates = res.body.tasks.map((t) => new Date(t.dueDate).getTime());
      for (let i = 1; i < dueDates.length; i++) {
        assert(dueDates[i] >= dueDates[i - 1], `Ascending dueDate check at index ${i}`);
      }
    });

    await test('Sorting: sortBy=dueDate&sortOrder=desc orders by latest date first', async () => {
      const res = await request(app)
        .get('/api/tasks?sortBy=dueDate&sortOrder=desc&limit=10')
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 200, 'Status code');
      const dueDates = res.body.tasks.map((t) => new Date(t.dueDate).getTime());
      for (let i = 1; i < dueDates.length; i++) {
        assert(dueDates[i] <= dueDates[i - 1], `Descending dueDate check at index ${i}`);
      }
    });

    await test('Sorting: Rejects arbitrary MongoDB sort fields', async () => {
      const res = await request(app)
        .get('/api/tasks?sortBy=password&sortOrder=asc')
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 400, 'Status code');
      assert(res.body.message.includes('sortBy'), 'Invalid sortBy error');
    });

    await test('Sorting: Rejects invalid sortOrder', async () => {
      const res = await request(app)
        .get('/api/tasks?sortBy=dueDate&sortOrder=invalid')
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 400, 'Status code');
      assert(res.body.message.includes('sortOrder'), 'Invalid sortOrder error');
    });

    // -----------------------------------------------------------------
    // SECTION 8: Analytics Audit
    // -----------------------------------------------------------------
    console.log('\n--- SECTION 8: Analytics Audit ---');

    // Create fresh user for analytics testing
    const userCTest = await User.create({
      name: 'Charlie Analytics',
      email: 'charlie@example.com',
      password: 'password123'
    });
    const userCToken = jwt.sign({ id: userCTest._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    await test('Analytics: Zero tasks returns 0 for all metrics', async () => {
      const res = await request(app)
        .get('/api/tasks/analytics')
        .set('Authorization', `Bearer ${userCToken}`);
      assertEqual(res.status, 200, 'Status code');
      assertEqual(res.body.totalTasks, 0, 'totalTasks');
      assertEqual(res.body.completedTasks, 0, 'completedTasks');
      assertEqual(res.body.pendingTasks, 0, 'pendingTasks');
      assertEqual(res.body.completionPercentage, 0, 'completionPercentage');
    });

    await test('Analytics: Only Todo tasks returns correct pending and 0% completion', async () => {
      await Task.create([
        { userId: userCTest._id, title: 'Todo 1', status: 'Todo' },
        { userId: userCTest._id, title: 'Todo 2', status: 'Todo' }
      ]);
      const res = await request(app)
        .get('/api/tasks/analytics')
        .set('Authorization', `Bearer ${userCToken}`);
      assertEqual(res.status, 200, 'Status code');
      assertEqual(res.body.totalTasks, 2, 'totalTasks');
      assertEqual(res.body.completedTasks, 0, 'completedTasks');
      assertEqual(res.body.pendingTasks, 2, 'pendingTasks');
      assertEqual(res.body.completionPercentage, 0, 'completionPercentage');
    });

    await test('Analytics: Mixed tasks (1 Todo, 1 In Progress, 2 Done) returns 50%', async () => {
      await Task.create([
        { userId: userCTest._id, title: 'Prog 1', status: 'In Progress' },
        { userId: userCTest._id, title: 'Done 1', status: 'Done' },
        { userId: userCTest._id, title: 'Done 2', status: 'Done' }
      ]);
      const res = await request(app)
        .get('/api/tasks/analytics')
        .set('Authorization', `Bearer ${userCToken}`);
      assertEqual(res.status, 200, 'Status code');
      assertEqual(res.body.totalTasks, 5, 'totalTasks');
      assertEqual(res.body.completedTasks, 2, 'completedTasks');
      assertEqual(res.body.pendingTasks, 3, 'pendingTasks');
      assertEqual(res.body.completionPercentage, 40, 'completionPercentage');
    });

    await test('Analytics: All completed tasks returns 100%', async () => {
      await Task.deleteMany({ userId: userCTest._id });
      await Task.create([
        { userId: userCTest._id, title: 'Done 1', status: 'Done' },
        { userId: userCTest._id, title: 'Done 2', status: 'Done' },
        { userId: userCTest._id, title: 'Done 3', status: 'Done' }
      ]);
      const res = await request(app)
        .get('/api/tasks/analytics')
        .set('Authorization', `Bearer ${userCToken}`);
      assertEqual(res.status, 200, 'Status code');
      assertEqual(res.body.totalTasks, 3, 'totalTasks');
      assertEqual(res.body.completedTasks, 3, 'completedTasks');
      assertEqual(res.body.pendingTasks, 0, 'pendingTasks');
      assertEqual(res.body.completionPercentage, 100, 'completionPercentage');
    });

    await test('Analytics: Strictly isolated to authenticated user', async () => {
      // User A's analytics should reflect User A's 6 tasks (2 Done, 4 Pending = 33.33%)
      const res = await request(app)
        .get('/api/tasks/analytics')
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 200, 'Status code');
      assertEqual(res.body.totalTasks, 6, 'User A total tasks');
      assertEqual(res.body.completedTasks, 2, 'User A completed tasks');
      assertEqual(res.body.pendingTasks, 4, 'User A pending tasks');
      assertEqual(res.body.completionPercentage, 33.33, 'User A completion percentage');
    });

    // -----------------------------------------------------------------
    // SECTION 9: Delete Task Audit
    // -----------------------------------------------------------------
    console.log('\n--- SECTION 9: Delete Task Audit ---');

    await test('Delete Task: User A successfully deletes own task', async () => {
      const taskToDelete = await Task.findOne({ userId: userAId });
      const res = await request(app)
        .delete(`/api/tasks/${taskToDelete._id}`)
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 200, 'Status code');
      assertEqual(res.body.message, 'Task deleted successfully', 'Success message');

      // Verify deletion in DB
      const checkDb = await Task.findById(taskToDelete._id);
      assert(checkDb === null, 'Task is deleted from MongoDB');
    });

    await test('Delete Task: Second delete on same ID returns 404', async () => {
      const deletedId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .delete(`/api/tasks/${deletedId}`)
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 404, 'Status code');
      assertEqual(res.body.message, 'Task not found', 'Not found message');
    });

    // -----------------------------------------------------------------
    // SECTION 10: Security & Injection Hardening Audit
    // -----------------------------------------------------------------
    console.log('\n--- SECTION 10: Security & Injection Hardening Audit ---');

    await test('Security: NoSQL object injection in register body is rejected safely', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Injection Test',
        email: { $gt: '' },
        password: { $gt: '' }
      });
      assertEqual(res.status, 400, 'Status code');
    });

    await test('Security: NoSQL object injection in login body is rejected safely', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: { $ne: null },
        password: { $ne: null }
      });
      assertEqual(res.status, 400, 'Status code');
    });

    await test('Security: Regex special characters in search do not crash or inject regex operators', async () => {
      const res = await request(app)
        .get('/api/tasks?search=[.*+?^${}()|[\\]\\]')
        .set('Authorization', `Bearer ${userAToken}`);
      assertEqual(res.status, 200, 'Status code');
    });

    // -----------------------------------------------------------------
    // SUMMARY
    // -----------------------------------------------------------------
    console.log('\n====================================================');
    console.log(`AUDIT COMPLETE: ${stats.passed}/${stats.total} PASSED (${stats.failed} FAILED)`);
    console.log('====================================================');

    if (stats.failed > 0) {
      console.error('\nFailures summary:');
      stats.failures.forEach((f, i) => {
        console.error(`${i + 1}. ${f.name}: ${f.error}`);
      });
      process.exit(1);
    } else {
      console.log('\nALL AUDIT TESTS PASSED CLEANLY!\n');
    }
  } finally {
    await mongoose.disconnect();
    await mongoServer.stop();
  }
}

runAudit().catch((err) => {
  console.error('Audit suite crashed with error:', err);
  process.exit(1);
});
