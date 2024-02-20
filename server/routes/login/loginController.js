const express = require("express");

const router = express.Router();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const schemaLogin = require("../../validations/loginSchema");
const userSchema = require("../../models/userSchema");

const loginUserController = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    
    const { error } = schemaLogin.validate(req.body);

    if (error) return res.status(400).json({ error: error.details[0].message });

    // Verificar si el usuario existe en la base de datos
    const user = await userSchema.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: false,
        message: `Usuario con email: ${email} no encontrado`,
        data: {},
      });
    }

    // Verificar la contraseña utilizando bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(200).json({
        success: false,
        message: "Contraseña incorrecta",
        data: {},
      });
    }
    
    const userConst = {
      ...user._doc, 
      password: "",
    }

    req.user = userConst;
    
    const secretKey = process.env.TOKEN_SECRET;
    const payload = {
      email: req.body.email,
      role: user.role,
    };

   /*  const options = {
      expiresIn: process.env.TOKEN_EXPIRES || "8h",
    }; */

    const token = jwt.sign(payload, secretKey);
    req.token = token;

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error durante el inicio de sesión" });
  }
};

module.exports = loginUserController;
