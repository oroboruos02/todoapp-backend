const db = require('../models/db');
const Task = require('../models/db').Task; // Importa el modelo Task

// Obtener todas las tareas
exports.getAllTasks = (req, res) => {
  db.query('SELECT * FROM tasks', (err, result) => {
    if (err) {
      console.error('Error al obtener las tareas:', err);
      res.status(500).json({ error: 'Error al obtener las tareas' });
      return;
    }
    res.json(result);
  });
};

// Obtener tareas por usuario
exports.getTasksByUser = (req, res) => {
  const userId = req.params.userId; // Suponiendo que la información del usuario está disponible en el objeto `req.user` después de la autenticación
  db.query('SELECT * FROM tasks WHERE user_id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Error al obtener las tareas del usuario:', err);
      res.status(500).json({ error: 'Error al obtener las tareas del usuario' });
      return;
    }
    res.json(results);
  });
};

// Crear una nueva tarea
exports.createTask = (req, res) => {
  const { text, completed, priority, deadline, userId } = req.body;
  // Asegúrate de que los valores requeridos estén presentes en la solicitud
  if (!text || !userId) {
    res.status(400).json({ error: 'Faltan datos requeridos' });
    return;
  }
  db.query('INSERT INTO tasks (text, completed, priority, deadline, user_id) VALUES (?, ?, ?, ?, ?)',
    [text, completed, priority, deadline, userId],
    (err, result) => {
      if (err) {
        console.error('Error al crear una nueva tarea:', err);
        res.status(500).json({ error: 'Error al crear una nueva tarea' });
        return;
      }
      res.json({ message: 'Tarea creada exitosamente', id: result.insertId });
    }
  );
};

// Actualizar completar una tarea
exports.updateTask = (req, res) => {
  const { id } = req.params;
  const { completed } = req.body; // Solo necesitas el estado completado para actualizar

  Task.update({ completed }, { where: { id } })
    .then(result => {
      if (result[0] !== 0) {
        res.json({ message: 'Tarea actualizada correctamente' });
      } else {
        res.status(404).json({ error: 'Tarea no encontrada' });
      }
    })
    .catch(error => {
      console.error('Error al actualizar la tarea:', error);
      res.status(500).json({ error: 'Error al actualizar la tarea' });
    });
};

// Dentro del controlador correspondiente, por ejemplo, tasksController.js
exports.deleteTask = (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  // Intenta eliminar la tarea
  try {
    Task.destroy({ where: { id, userId } })
      .then(deletedTask => {
        if (deletedTask) {
          // Tarea eliminada correctamente
          res.json({ message: 'Tarea eliminada correctamente' });
        } else {
          // No se encontró la tarea
          res.status(404).json({ error: 'Tarea no encontrada' });
        }
      })
      .catch(error => {
        console.error('Error al eliminar la tarea:', error);
        res.status(500).json({ error: 'Error al eliminar la tarea' });
      });
  } catch (error) {
    console.error('Error al procesar la solicitud de eliminación de tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud de eliminación de tarea' });
  }
};
// Archivar una tarea
/* exports.archiveTask = (req, res) => {
  const { id } = req.params;
  db.query('UPDATE tasks SET archived = true WHERE id = ?',
    [id],
    (err, result) => {
      if (err) {
        console.error('Error al archivar la tarea:', err);
        res.status(500).json({ error: 'Error al archivar la tarea' });
        return;
      }
      // Verificar si se actualizó alguna fila en la base de datos
      if (result.affectedRows === 0) {
        res.status(404).json({ error: 'Tarea no encontrada' });
        return;
      }
      res.json({ message: 'Tarea archivada correctamente' });
    }
  );
}; */

// Ruta para archivar tareas completadas
router.post('/archive', async (req, res) => {
  const { tasks, userId } = req.body;
  try {
    // Actualiza las tareas con los IDs proporcionados y el ID de usuario
    await Task.update({ archived: true }, { where: { id: tasks, userId } });
    res.status(200).json({ message: 'Tareas archivadas correctamente.' });
  } catch (error) {
    console.error('Error al archivar las tareas:', error);
    res.status(500).json({ error: 'Error al archivar las tareas.' });
  }
});

// Ruta para eliminar tarea archivada
router.delete('/archive/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.query.userId;
  try {
    // Elimina la tarea con el ID proporcionado y el ID de usuario
    await Task.destroy({ where: { id, userId } });
    res.status(200).json({ message: 'Tarea archivada eliminada correctamente.' });
  } catch (error) {
    console.error('Error al eliminar la tarea archivada:', error);
    res.status(500).json({ error: 'Error al eliminar la tarea archivada.' });
  }
});

// Actualizar la prioridad de una tarea
exports.updateTaskPriority = (req, res) => {
  const { id } = req.params;
  const { priority, priorityColor } = req.body; // Asegúrate de que priorityColor esté disponible en el cuerpo de la solicitud

  // Verifica si se proporciona priorityColor
  if (!priorityColor) {
    return res.status(400).json({ error: 'priorityColor es requerido' });
  }

  Task.update({ priority, priorityColor }, { where: { id } })
    .then(result => {
      if (result[0] !== 0) {
        res.json({ message: 'Prioridad de la tarea actualizada correctamente' });
      } else {
        res.status(404).json({ error: 'Tarea no encontrada' });
      }
    })
    .catch(error => {
      console.error('Error al actualizar la prioridad de la tarea:', error);
      res.status(500).json({ error: 'Error al actualizar la prioridad de la tarea' });
    });
};