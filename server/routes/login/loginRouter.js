const express = require("express");
const router = express.Router();
const loginUserController = require("./loginController");
const { rojo, verde, reset, log } = require("../../helpers/colors");

/**
 * @swagger
 * tags:
 *   name: Custom
 *   description: Endpoints para acciones personalizadas
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Login:
 *       type: object
 *       properties:
 *         user_name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *       required:
 *         - user_name
 *         - email
 *         - password
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     description: Inicia sesión de un usuario y devuelve un token de acceso.
 *     tags: [Custom]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 default: "chitan@gmail.com"
 *               password:
 *                 type: string
 *                 default: "Chitan2024!"
 *             required:
 *               - email
 *               - password
 *     responses:
 *       '200':
 *         description: Token de acceso generado correctamente.
 *         content:
 *           application/json:
 *             example:
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       '400':
 *         description: Datos de inicio de sesión inválidos.
 *         content:
 *           application/json:
 *             example:
 *               error: "Datos de inicio de sesión inválidos."
 *       '401':
 *         description: Usuario no encontrado o contraseña incorrecta.
 *         content:
 *           application/json:
 *             example:
 *               error: "Usuario no encontrado o contraseña incorrecta."
 *       '500':
 *         description: Error durante el inicio de sesión.
 *         content:
 *           application/json:
 *             example:
 *               error: "Error durante el inicio de sesión."
 */
router.post("/", loginUserController, (req, res) => {
  const responseData = {
    success: true,
    message: "Usuario conectado correctamente",
    data: {
      token: req.token,
      user: req.user,
    },
  };

  res.status(200).json(responseData);
  log(verde + "Usuario conectado correctamente.");
});

module.exports = router;
