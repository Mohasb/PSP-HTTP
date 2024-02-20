const express = require("express");
const userRegister = express.Router();
const schemaRegister = require("../../validations/registerSchema");
const userSchema = require("../../models/userSchema");
const authorize = require("../middlewares/auth/AutorizationMW.js");
const checkUserExistence = require("../middlewares/userExists");
const bcrypt = require("bcrypt");
const errorHandler = require("../../validations/errorHandlers.js");
const { rojo, verde, log } = require("../../helpers/colors");


////////////////////////////////////////////////      POST NEW USER     ////////////////////////////////////////////////
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Añadir usuario
 *     description: Añade un nuevo usuario al sistema.
 *     tags: [Usuarios]
 *     parameters: []
 *     requestBody:
 *       description: Datos del nuevo usuario.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_name:
 *                 type: string
 *                 description: Nombre de usuario.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Dirección de correo electrónico única del usuario.
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario.
 *               role:
 *                 type: string
 *                 description: Rol del usuario (ej. "user", "admin", "superAdmin").
 *                 default: user
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
 *                   description: Lista de reservas del usuario.
 *                 default: []
 *     responses:
 *       '200':
 *         description: Usuario añadido exitosamente.
 *         schema:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             user_name:
 *               type: string
 *             email:
 *               type: string
 *             role:
 *               type: string
 *             reservations:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   room_number:
 *                     type: number
 *                   check_in_date:
 *                     type: string
 *                     format: date
 *                   check_out_date:
 *                     type: string
 *                     format: date
 *       '400':
 *         description: Error en la validación de datos o email ya registrado.
 *         schema:
 *           type: object
 *           properties:
 *             validationError:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error de validación.
 *             emailRegisteredError:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error de email ya registrado.
 *       '500':
 *         description: Error al añadir el usuario.
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: Mensaje de error general.
 */
//Añadir nuevo usuario
userRegister.post(
  "/",
  /*authorize("admin", "user"),*/
  checkUserExistence,
  async (req, res) => {
    // validate user
    console.log("Aqui");
    const { error } = schemaRegister.validate(req.body);

    if (error) {
      console.log({ error: error.details[0].message });
      return res.status(400).json({ error: error.details[0].message });
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    //Por defecto al registrarse el rol es user y el array de reservas está vacío

    const data = new userSchema({
      name: req.body.name,
      user_name: req.body.user_name,
      email: req.body.email,
      password: hashedPassword,
      role: "user",
      reservations: [],
    });

    try {
      const dataToSave = await data.save();
      console.log(dataToSave);
      log(verde + "Nuevo usuario añadido:");
      res.status(200).json(dataToSave);
    } catch (error) {
      errorHandler(error, res);
    }
  }
);

module.exports = userRegister;
