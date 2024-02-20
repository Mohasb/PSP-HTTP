const express = require("express");
const logOutUser = express.Router();
const fs = require("fs");
const { amarillo, log } = require("../../helpers/colors");
let tokensRevoked = [];

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cierra la sesión del usuario.
 *     description: Revoca el token de autenticación del usuario.
 *     responses:
 *       200:
 *         description: Logout exitoso.
 *         content:
 *           application/json:
 *             example:
 *               message: Logout exitoso
 */
logOutUser.post("/", (req, res) => {
  const token = req.headers.authorization;
  // Agregar el token a la lista de revocados
  tokensRevoked.push(token);
  fs.writeFileSync("tokensRevoked.json", JSON.stringify(tokensRevoked));
  res.status(200).json({ message: "Logout exitoso" });
});

// Middleware para verificar si el token está revocado
const checkTokenRevoked = (req, res, next) => {
  // Cargar la lista de tokens revocados desde el archivo al iniciar el servidor
  try {
    const filePath = "tokensRevoked.json";

    const loadTokensRevoked = () => {
      try {
        const data = fs.readFileSync(filePath);
        return JSON.parse(data);
      } catch (error) {
        // Si el archivo no existe o hay un error al leerlo, se asume que la lista de tokens revocados está vacía
        return [];
      }
    };

    // Middleware para verificar si el token está revocado
    const tokensRevoked = loadTokensRevoked();
    const token = req.headers.authorization;

    // Verificar si el token está en la lista de revocados
    if (tokensRevoked.includes(token)) {
      return res
        .status(401)
        .json({
          message: "Token revocado. Por favor, inicie sesión de nuevo.",
        });
    }
    tokensRevoked = JSON.parse(data);
  } catch (error) {
    // Si el archivo no existe o hay un error al leerlo, se asume que la lista de tokens revocados está vacía
    tokensRevoked = [];
  }

  const token = req.headers.authorization;
  log(amarillo + "TOKENS REVOCADOS:");
  console.log(tokensRevoked);
  // Verificar si el token está en la lista de revocados
  if (tokensRevoked.includes(token)) {
    return res
      .status(401)
      .json({ message: "Token revocado. Por favor, inicie sesión de nuevo." });
  }

  // Tarea programada para borrar tokensRevoked.json una vez a la semana
  setTimeout(() => {
    try {
      fs.unlinkSync(filePath);
      console.log("tokensRevoked.json ha sido borrado.");
    } catch (error) {
      console.error("Error al borrar tokensRevoked.json:", error.message);
    }
  }, 7 * 24 * 60 * 60 * 1000); // Una semana en milisegundos);
  // Continuar con el siguiente middleware si el token no está revocado
  next();
};

module.exports = { logOutUser, checkTokenRevoked };
