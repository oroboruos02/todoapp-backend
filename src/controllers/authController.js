const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar si el usuario existe en la base de datos
    let user = await User.findOne({ where: { email } });

    // Si el usuario no existe, crear un nuevo usuario
    if (!user) {
      user = await User.create({ email, password });
    }

  } catch (error) {
    console.error('Error de inicio de sesión:', error);
    return res.status(500).json({ message: 'Error de servidor' });
  }
};