const express = require("express");
const router = express.Router();
const userSchema = require("../../models/userSchema");
const bcrypt = require("bcrypt");
const checkUserExistence = require("../middlewares/userExists");
const { rojo, verde, log } = require("../../helpers/colors");
const authorize = require("../middlewares/auth/AutorizationMW.js");
const checkAccess = require("../middlewares/auth/checkAccess");


////////////////////////////////////////////////      GET ALL USERS      ////////////////////////////////////////////////
/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Endpoints relacionados con la gestión de usuarios
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: object
 *           properties:
 *             $oid:
 *               type: string
 *         name:
 *           type: string
 *         user_name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *         role:
 *           type: string
 *         reservations:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *       required:
 *         - user_name
 *         - email
 *         - password
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     description: Obtiene la lista de todos los usuarios registrados.
 *     tags: [Usuarios]
 *     responses:
 *       '200':
 *         description: Lista de usuarios obtenida correctamente.
 *         content:
 *           application/json:
 *             example:
 *               - _id: "60f85c8477742b001db54c4d"
 *                 user_name: "Usuario1"
 *                 email: "usuario1@gmail.com"
 *                 role: "user"
 *                 reservations: []
 *               - _id: "60f85c8477742b001db54c4e"
 *                 user_name: "Usuario2"
 *                 email: "usuario2@gmail.com"
 *                 role: "admin"
 *                 reservations: []
 *       '500':
 *         description: Error al obtener la lista de usuarios.
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al obtener la lista de usuarios."
 */
// Obtener todos los usuarios
router.get("/", authorize("admin"), async (req, res) => {
  try {
    const data = await userSchema.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

////////////////////////////////////////////////      GET ONE USER     ////////////////////////////////////////////////
/**
 * @swagger
 * /api/users/{email}:
 *   get:
 *     summary: Obtener un usuario por email
 *     description: Obtiene la información de un usuario específico mediante su dirección de correo electrónico.
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         description: Dirección de correo electrónico del usuario.
 *         example: mh@gmail.com
 *     responses:
 *       '200':
 *         description: Información del usuario obtenida correctamente.
 *         content:
 *           application/json:
 *             example:
 *               - _id: "60f85c8477742b001db54c4d"
 *                 user_name: "Usuario1"
 *                 email: "mh@gmail.com"
 *                 role: "user"
 *                 reservations: []
 *       '404':
 *         description: Usuario no encontrado.
 *         content:
 *           application/json:
 *             example:
 *               message: "Usuario 'mh@gmail.com' no encontrado"
 *       '500':
 *         description: Error al obtener la información del usuario.
 *         content:
 *           application/json:
 *             example:
 *               message: "Error al obtener la información del usuario."
 */
// Obtener un usuario
router.get(
  "/:email",
  authorize("admin", "user"),
  checkAccess,
  async (req, res) => {
    const { email } = req.params;

    try {
      const user = await userSchema.findOne({ email });

      if (!user) {
        return res
          .status(404)
          .json({ message: `Usuario '${email}' no encontrado` });
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);



////////////////////////////////////////////////      PUT EXISTENT USER     ////////////////////////////////////////////////
//modificar un usuario
/**
 * @swagger
 * /api/users/{email}:
 *   patch:
 *     summary: Actualizar usuario
 *     description: Actualiza la información de un usuario existente en la base de datos.
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         description: Correo electrónico del usuario a actualizar.
 *         schema:
 *           type: string
 *           format: email
 *     requestBody:
 *       description: Campos a actualizar del usuario.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_name:
 *                 type: string
 *                 description: Nuevo nombre de usuario.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Nuevo correo electrónico del usuario.
 *               password:
 *                 type: string
 *                 description: Nueva contraseña del usuario.
 *               reservations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     room_number:
 *                       type: number
 *                       description: Número de la habitación de la reserva.
 *                     check_in_date:
 *                       type: string
 *                       format: date
 *                       description: Fecha de entrada de la reserva.
 *                     check_out_date:
 *                       type: string
 *                       format: date
 *                       description: Fecha de salida de la reserva.
 *                 description: Lista de nuevas reservas del usuario.
 *     responses:
 *       '200':
 *         description: Documento actualizado exitosamente.
 *         content:
 *           application/json:
 *             example:
 *               message: Documento actualizado exitosamente
 *       '400':
 *         description: Error en la solicitud o en la actualización del documento.
 *         content:
 *           application/json:
 *             example:
 *               error: Detalles del error
 *               message: Mensaje de error
 *       '404':
 *         description: Usuario no encontrado en la base de datos.
 *         content:
 *           application/json:
 *             example:
 *               message: Documento no encontrado
 *       '500':
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             example:
 *               error: Detalles del error
 *               message: Mensaje de error
 */
//modificar usuario
router.patch(
  "/:email",
  authorize("admin", "user"),
  checkAccess,
  checkUserExistence,
  async (req, res) => {
    try {
      const email = req.params.email;

      // Solo actualiza los campos que se envían en el cuerpo de la solicitud
      const updateFields = {
        name: req.body.name,
        user_name: req.body.user_name,
        email: req.body.email,
        password: req.body.password,
        reservations: req.body.reservations,
      };

      // Si se proporciona un nuevo password, se hashea
      if (req.body.password) {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        updateFields.password = hashedPassword;
      }
      // Eliminamos campos undefined del objeto para que no se sobrescriban con valores undefined
      Object.keys(updateFields).forEach(
        (key) => updateFields[key] === undefined && delete updateFields[key]
      );
      console.log(updateFields);

      const resultado = await userSchema.updateOne(
        { email },
        { $set: updateFields }
      );

      if (resultado.modifiedCount === 0) {
        return res.status(404).json({ message: "No hay nada que modificar" });
      }

      res.status(200).json({
        message: "Usuario actualizado exitosamente",
        datosModificados: updateFields,
      });
    } catch (error) {
      errorHandler(error, res);
    }
  }
);

/**
 * @swagger
 * /api/users/{email}:
 *   delete:
 *     summary: Eliminar un usuario por email
 *     description: Elimina un usuario específico mediante su dirección de correo electrónico.
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         description: Dirección de correo electrónico del usuario a eliminar.
 *         example: mh@gmail.com
 *     responses:
 *       '204':
 *         description: Usuario eliminado correctamente.
 *       '404':
 *         description: Usuario no encontrado.
 *         content:
 *           application/json:
 *             example:
 *               message: "Usuario 'mh@gmail.com' no encontrado"
 *       '500':
 *         description: Error al eliminar al usuario.
 *         content:
 *           application/json:
 *             example:
 *               message: "Error al eliminar al usuario."
 */
router.delete(
  "/:email",
  authorize("admin", "user"),
  checkAccess,
  checkUserExistence,
  async (req, res) => {
    const { email } = req.params;

    try {
      const deletedUser = await userSchema.findOneAndDelete({ email });

      if (!deletedUser) {
        return res
          .status(404)
          .json({ message: `Usuario '${email}' no encontrado` });
      }
      console.log(email);
      res.status(200).json({
        message: `Usuario '${email}' eliminado correctamente`,
        status: 204,
      });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar al usuario." });
    }
  }
);

module.exports = router;
