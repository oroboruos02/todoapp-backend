const express = require('express');
const cors = require('cors');
const { Usuario, Task } = require('./models/db'); // Asegúrate de importar el modelo Task si no lo has hecho aún

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar CORS
app.use(cors());

// Middleware para manejar el cuerpo de las solicitudes
app.use(express.json());

// Ruta para el inicio de sesión
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar las credenciales en la base de datos
    let user = await Usuario.findOne({ where: { email } });

    if (!user) {
      // Si el usuario no existe, crea un nuevo usuario
      user = await Usuario.create({ email, password });
    }

    // Devolver una respuesta exitosa
    res.status(200).json({ message: 'Inicio de sesión exitoso', userId: user.id });

  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error de servidor' });
  }
});

// Ruta para agregar una nueva tarea
app.post('/api/tasks', async (req, res) => {
  const { text, completed, priority, color, userId } = req.body;

  try {
    // Crea una nueva tarea en la base de datos asociada al usuario actual
    const newTask = await Task.create({
      text,
      completed,
      priority,
      color,
      userId,
    });

    res.status(201).json(newTask); // Devuelve la nueva tarea creada
  } catch (error) {
    console.error('Error al agregar la tarea:', error);
    res.status(500).json({ error: 'Error de servidor' });
  }
});

// Ruta para obtener las tareas de un usuario
app.get('/api/tasks', async (req, res) => {
  const { userId } = req.query;

  try {
    // Busca las tareas asociadas al usuario en la base de datos
    const tasks = await Task.findAll({ 
      where: { userId },
      attributes: ['id', 'text', 'completed', 'priority', 'priorityColor', 'deadline', 'archived'] // Especifica las columnas que deseas seleccionar
    });

    res.status(200).json(tasks); // Devuelve las tareas del usuario
  } catch (error) {
    console.error('Error al obtener las tareas del usuario:', error);
    res.status(500).json({ error: 'Error de servidor' });
  }
});

// Ruta para eliminar una tarea
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  try {
    // Busca la tarea por su ID y el ID de usuario y elimínala de la base de datos
    const deletedTask = await Task.destroy({ where: { id, userId } });

    if (deletedTask) {
      // Si se eliminó correctamente, devuelve un mensaje de éxito
      res.status(200).json({ message: 'Tarea eliminada exitosamente' });
    } else {
      // Si la tarea no se encontró, devuelve un mensaje de error
      res.status(404).json({ error: 'Tarea no encontrada' });
    }
  } catch (error) {
    console.error('Error al eliminar la tarea:', error);
    res.status(500).json({ error: 'Error de servidor' });
  }
});

// Ruta para archivar tareas completadas
app.put('/api/tasks/:taskId/archive', async (req, res) => {
  const { userId } = req.body;
  const { taskId } = req.params;
  try {
    // Actualiza la tarea con el ID proporcionado y el ID de usuario
    await Task.update({ archived: true }, { where: { id: taskId, userId } });
    res.status(200).json({ message: 'Tarea archivada correctamente.' });
  } catch (error) {
    console.error('Error al archivar la tarea:', error);
    res.status(500).json({ error: 'Error al archivar la tarea.' });
  }
});

// Ruta para eliminar tarea archivada
app.delete('/api/tasks/archive/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.query.userId;
  try {
    await Task.destroy({ where: { id, userId } });
    res.status(200).json({ message: 'Tarea archivada eliminada correctamente.' });
  } catch (error) {
    console.error('Error al eliminar la tarea archivada:', error);
    res.status(500).json({ error: 'Error al eliminar la tarea archivada.' });
  }
});

// Ruta para actualizar el estado de completado de una tarea
app.put('/api/tasks/:id/complete', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  try {
    // Busca la tarea por su ID y el ID de usuario
    const task = await Task.findOne({ where: { id, userId } });

    if (task) {
      // Actualiza el estado de completado de la tarea
      task.completed = !task.completed ? 1 : 0; // Cambiar de 1 a 0 o viceversa
      await task.save();
      
      res.status(200).json({ message: 'Estado de completado de tarea actualizado correctamente' });
    } else {
      // Si la tarea no se encontró, devuelve un mensaje de error
      res.status(404).json({ error: 'Tarea no encontrada' });
    }
  } catch (error) {
    console.error('Error al actualizar el estado de completado de la tarea:', error);
    res.status(500).json({ error: 'Error de servidor' });
  }
});

// Ruta para actualizar la fecha límite de una tarea
app.put('/api/tasks/:taskId/deadline', async (req, res) => {
  const { taskId } = req.params;
  const { userId } = req.query;
  const { deadline } = req.body;

  try {
    // Busca la tarea por su ID y el ID de usuario
    const task = await Task.findOne({ where: { id: taskId, userId } });

    if (task) {
      // Actualiza la fecha límite de la tarea
      task.deadline = deadline;
      await task.save();
      
      res.status(200).json({ message: 'Fecha límite de tarea actualizada correctamente' });
    } else {
      // Si la tarea no se encontró, devuelve un mensaje de error
      res.status(404).json({ error: 'Tarea no encontrada' });
    }
  } catch (error) {
    console.error('Error al actualizar la fecha límite de la tarea:', error);
    res.status(500).json({ error: 'Error de servidor' });
  }
});

// Endpoint para manejar la actualización de la prioridad de una tarea
app.put('/api/tasks/:taskId/priority', (req, res) => {
  const { taskId } = req.params;
  const { priority } = req.body;

  console.log('Antes de ejecutar Task.update()'); // Agregar mensaje de registro
  
  // Obtener el color correspondiente a la prioridad
  let priorityColor;
  switch (priority) {
    case 'alto':
      priorityColor = 'red';
      break;
    case 'medio':
      priorityColor = 'yellow';
      break;
    case 'bajo':
      priorityColor = 'green';
      break;
    default:
      priorityColor = 'gray';
  }

  // Actualizar la prioridad y el color de la tarea en la base de datos
  Task.update({ priority, priorityColor }, { where: { id: taskId } })
    .then(result => {
      console.log('Task.update() ejecutado correctamente'); // Agregar mensaje de registro
      
      if (result[0] !== 0) {
        // La tarea se actualizó correctamente
        res.status(200).json({ message: `Prioridad de la tarea ${taskId} actualizada a ${priority}` });
      } else {
        // No se encontró la tarea con el ID especificado
        res.status(404).json({ error: `No se encontró la tarea con el ID ${taskId}` });
      }
    })
    .catch(error => {
      console.error('Error al actualizar la prioridad de la tarea:', error);
      res.status(500).json({ error: 'Error interno del servidor al actualizar la prioridad de la tarea' });
    });
});



// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor Express iniciado en el puerto ${PORT}`);
});