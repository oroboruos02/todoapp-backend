const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('mysql://root:12345@localhost:3306/todolist');

const Usuario = sequelize.define('users', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});


// Definir el modelo Task
const Task = sequelize.define('tasks', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false
  },
  completed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  priority: {
    type: DataTypes.STRING,
    allowNull: true
  },
  priorityColor: { // Cambio de 'color' a 'priorityColor'
    type: DataTypes.STRING,
    allowNull: true
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true // Permitir que la fecha límite sea opcional
  },
  archived: { // Nuevo campo para indicar si la tarea está archivada
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false // Por defecto, una tarea no está archivada
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
});

async function inicializarBaseDeDatos() {
  try {
    await sequelize.sync();
    console.log('Modelos sincronizados con la base de datos');
  } catch (error) {
    console.error('Error al sincronizar los modelos con la base de datos:', error);
  }
}

inicializarBaseDeDatos();

module.exports = {
  Usuario,
  Task
};