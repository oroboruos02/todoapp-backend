const { pool } = require('../models/db');

const loginUser = async (req, res) => {
  const { email, password } = req.body; // Cambiado de username a email

  try {
    const query = 'SELECT id, email, contraseña FROM users WHERE email = ? AND contraseña = ?'; // Selecciona solo las columnas necesarias
    const [rows] = await pool.query(query, [email, password]); // Usando email en lugar de username

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado o contraseña incorrecta' });
    }

    return res.status(200).json({ message: 'Inicio de sesión exitoso', user: rows[0] });

  } catch (error) {
    console.error('Error de inicio de sesión:', error);
    return res.status(500).json({ message: 'Error de servidor' });
  }
};

module.exports = { loginUser };