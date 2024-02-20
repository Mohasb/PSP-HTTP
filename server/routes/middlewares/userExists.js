const userSchema = require("../../models/userSchema");

// Verificar la existencia del usuario
const checkUserExistence = async (req, res, next) => {
  try {
    const email = req.body.email || req.params.email;

    if (req.method === "POST") {
      // Verificar la NO existencia para POST
      const existingUser = await userSchema.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email ya registrado" });
      }
    } else if (req.method === "PUT") {
      // Verificar la  SI existencia para PUT
      const existingUser = await userSchema.findOne({ email });
      if (!existingUser) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
    }

    next();
  } catch (error) {
    res
      .status(500)
      .json({ error, message: "Error al verificar la existencia del usuario" });
  }
};

module.exports = checkUserExistence;
