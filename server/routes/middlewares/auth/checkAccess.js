const checkAccess = async (req, res, next) => {
  try {
    const userEmail = req.params.email;
    // Verificar si el usuario es "admin" o si está accediendo a su propio perfil
    /*eq.user.email === userEmail: Verifica si el correo electrónico del usuario autenticado es igual
    al correo electrónico proporcionado en la URL (userEmail). Si es así, esta condición es verdadera.*/
    
    if (
      req.user &&
      (req.user.role === "admin" || req.user.email === userEmail)
    ) {
      return next();
    } else {
      res.status(403).json({ error: "Acceso prohibido checkAcces" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = checkAccess;
