const mongoose = require('mongoose');
const Task = require('../models/Task');

const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Please provide a title' });
    }

    if (status && !['Todo', 'In Progress', 'Done'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Todo, In Progress, or Done' });
    }

    if (priority && !['Low', 'Medium', 'High'].includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority. Must be Low, Medium, or High' });
    }

    if (dueDate && isNaN(Date.parse(dueDate))) {
      return res.status(400).json({ message: 'Invalid due date format' });
    }

    const task = await Task.create({
      userId: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      status: status || 'Todo',
      priority: priority || 'Medium',
      dueDate: dueDate ? new Date(dueDate) : undefined
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const { status, priority, search } = req.query;

    if (status && !['Todo', 'In Progress', 'Done'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Todo, In Progress, or Done' });
    }

    if (priority && !['Low', 'Medium', 'High'].includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority. Must be Low, Medium, or High' });
    }

    const query = { userId: req.user._id };

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (search && search.trim()) {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.title = { $regex: escapedSearch, $options: 'i' };
    }

    const tasks = await Task.find(query);
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.body.title !== undefined) {
      if (!req.body.title || !req.body.title.trim()) {
        return res.status(400).json({ message: 'Title cannot be empty' });
      }
      task.title = req.body.title.trim();
    }

    if (req.body.description !== undefined) {
      task.description = req.body.description ? req.body.description.trim() : '';
    }

    if (req.body.status !== undefined) {
      if (!['Todo', 'In Progress', 'Done'].includes(req.body.status)) {
        return res.status(400).json({ message: 'Invalid status. Must be Todo, In Progress, or Done' });
      }
      task.status = req.body.status;
    }

    if (req.body.priority !== undefined) {
      if (!['Low', 'Medium', 'High'].includes(req.body.priority)) {
        return res.status(400).json({ message: 'Invalid priority. Must be Low, Medium, or High' });
      }
      task.priority = req.body.priority;
    }

    if (req.body.dueDate !== undefined) {
      if (req.body.dueDate && isNaN(Date.parse(req.body.dueDate))) {
        return res.status(400).json({ message: 'Invalid due date format' });
      }
      task.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : undefined;
    }

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const { status } = req.body;

    if (!status || !['Todo', 'In Progress', 'Done'].includes(status)) {
      return res.status(400).json({ message: 'Please provide a valid status: Todo, In Progress, or Done' });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = status;
    const updatedTask = await task.save();

    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus
};
