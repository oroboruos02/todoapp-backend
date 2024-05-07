const express = require('express');
const router = express.Router();
const taskController = require('./taskController');

// Rutas para las tareas
router.get('/tasks/:userId', taskController.getTasksByUser);
router.post('/tasks', taskController.createTask);
router.put('/tasks/:id', taskController.updateTask);
router.delete('/tasks/:id', taskController.deleteTask);
router.put('/tasks/archive/:id', taskController.archiveTask);
router.put('/tasks/:id/priority', tasksController.updateTaskPriority);

module.exports = router;  