const express = require("express");
const router = express.Router();
const getPrices = require("../middlewares/getPrices");
const authorize = require("../middlewares/auth/AutorizationMW.js");
const checkAccess = require("../middlewares/auth/checkAccess");
const errorHandler = require("../../validations/errorHandlers.js");
const validateReservation = require("./reservationFunctions.js");
const reservationSchema = require("../../models/reservationSchema");
const { log, amarillo } = require("../../helpers/colors.js");

// Obtener todas las reservas
router.get("/", authorize("admin"), async (req, res) => {
  try {
    const reservations = await reservationSchema.find();
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener todas las reservas de un user por email
router.get(
  "/:email",
  authorize("admin", "user"),
  checkAccess,
  async (req, res) => {
    try {
      const userEmail = req.params.email;
      const reservations = await reservationSchema.find({
        "user.email": userEmail,
      });
      res.status(200).json(reservations);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);
// Agregar reserva
router.post("/", getPrices, authorize("admin", "user"), async (req, res) => {
  try {
    log(amarillo + "La reserva que llega:\n");
    console.log(req.body);
    const prices = res.locals.prices;

    const reservationToSave = await validateReservation(req.body, prices, res);
    log(amarillo + "Reserva realizada por el servidor: \n");
    console.log(reservationToSave);

    const createdReservation = await reservationSchema.create(
      reservationToSave
    );
    res.status(201).json({
      success: true,
      message: "Reserva agregada correctamente",
      createdReservation,
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

router.patch(
  "/:id",
  getPrices,
  authorize("admin", "user"),
  async (req, res) => {
    try {
      const reservationId = req.params.id;
      const updatedReservationDetails = req.body;

      // Limpiar propiedades undefined
      Object.keys(updatedReservationDetails).forEach(
        (key) =>
          (updatedReservationDetails[key] === undefined ||
            updatedReservationDetails[key] === null) &&
          delete updatedReservationDetails[key]
      );

      // validar datos
      const prices = res.locals.prices;
      const validatedReservation = await validateReservation(
        updatedReservationDetails,
        prices,
        res
      );

      const updatedReservation = await reservationSchema.findOneAndUpdate(
        { _id: reservationId },
        { $set: validatedReservation },
        { new: true }
      );

      if (!updatedReservation) {
        return res.status(404).json({
          success: false,
          message: "No se encontró la reserva con el ID proporcionado",
        });
      }

      res.status(200).json({
        success: true,
        message: "Reserva actualizada correctamente",
        updatedReservation,
      });
    } catch (error) {
      errorHandler(error, res);
    }
  }
);

router.delete("/:id", authorize("admin", "user"), async (req, res) => {
  try {
    const reservationId = req.params.id;
    console.log(reservationId);

    const reservationToDelete = await reservationSchema.findOne({
      _id: reservationId,
    });

    console.log(req.user.email);
    console.log(reservationToDelete.user.email);

    if (
      req.user.role !== "admin" &&
      req.user.email !== reservationToDelete.user.email
    ) {
      return res.status(403).json({ error: "Acceso prohibido checkAcces" });
    }

    // Busca y elimina la reserva en la colección reservations
    const result = await reservationSchema.deleteOne({ _id: reservationId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message:
          "No se encontraron reservas para el usuario o el id de reserva no es válido",
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Reserva eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
