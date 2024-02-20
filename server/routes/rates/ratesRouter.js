const express = require("express");
const router = express.Router();
const rateSchema = require("../../models/rateSchema");
const userSchema = require("../../models/userSchema.js");
const { rojo, amarillo, verde, log, reset } = require("../../helpers/colors");
const authorize = require("../middlewares/auth/AutorizationMW.js");
const checkAccess = require("../middlewares/auth/checkAccess");
const errorHandler = require("../../validations/errorHandlers.js");

/**
 * @swagger
 * tags:
 *   name: Reseñas
 *   description: Endpoints relacionados con la gestión de reseñas
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Rates:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               description: Email del usuario que envió la reseña.
 *             name:
 *               type: string
 *               description: Nombre del usuario que envió la reseña.
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: Valor de calificación para el elemento revisado (1 a 5).
 *         comment:
 *           type: string
 *           description: Texto del comentario o reseña.
 *         room_type:
 *           type: string
 *           description: Tipo de habitación.
 *         date:
 *           type: string
 *           format: date
 *           description: Fecha de la reseña.
 */

/**
 * @swagger
 * /api/rates:
 *   get:
 *     summary: Obtiene todas las reseñas
 *     description: Endpoint para obtener todas las reseñas.
 *     tags: [Reseñas]
 *     responses:
 *       200:
 *         description: Devuelve todas las reseñas con sus detalles.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       500:
 *         description: Error del servidor
 */
router.get("/reviewsByDate", authorize("admin"), async (req, res) => {
  try {
    const reviews = await rateSchema.find().sort({ date: 1 });

    reviews.forEach(review => {
      let color;
      if (review.rating <= 2) {
        color = rojo;
      } else if (review.rating <= 4) {
        color = amarillo;
      } else {
        color = verde;
      }
      log(`${color}Review: ${review.text}, Rating: ${review.rating}${reset}`);
    });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/rates:
 *   get:
 *     summary: Obtiene todas las reseñas ordenadas por calificación
 *     description: Obtiene todas las reseñas disponibles y las ordena de mayor a menor según la calificación.
 *     tags: [Reseñas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Devuelve todas las reseñas ordenadas por calificación.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rates'
 *       403:
 *         description: Acceso prohibido (rol no autorizado) o no autenticado
 *       500:
 *         description: Error del servidor
 */

router.get("/reviewsByRating", authorize("admin", "user"), async (req, res) => {
  try {
    const reviews = await rateSchema.find().sort({ rating: -1 });

    reviews.forEach(review => {
      let color;
      if (review.rating <= 2) {
        color = rojo;
      } else if (review.rating <= 4) {
        color = amarillo;
      } else {
        color = verde;
      }
      log(`${color}Review: ${review.text}, Rating: ${review.rating}${reset}`);
    });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/rates:
 *   post:
 *     summary: Agrega una nueva reseña
 *     description: Agrega una nueva reseña al sistema.
 *     tags: [Reseñas]
 *     requestBody:
 *       description: Detalles de la nueva reseña
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Rates'
 *     responses:
 *       '201':
 *         description: Reseña agregada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rates'
 *       '400':
 *         description: Solicitud incorrecta.
 *         content:
 *           application/json:
 *             example:
 *               message: "Datos de la reseña incompletos o incorrectos"
 *       '500':
 *         description: Error del servidor
 */
router.post("/", authorize("admin", "user"), async (req, res) => {
  const reviewDetails = req.body;
  const date = new Date();
  reviewDetails.date = date;

  try {
    if (req.user.email !== reviewDetails.user.email) {
      return res.status(403).json({
        message:
          "No tienes permiso para dejar una reseña en nombre de otro usuario.",
      });
    }

    const existingUser = await userSchema.findOne({
      email: reviewDetails.user.email,
    });
    if (!existingUser) {
      return res.status(400).json({
        message: `El usuario ${reviewDetails.user.email} no existe. No se puede crear la reseña.`,
      });
    }

    const newReview = await rateSchema.create(reviewDetails);
    res.status(201).json(newReview);
  } catch (error) {
    errorHandler(error, res);
  }
});

/**
 * @swagger
 * /api/rates/{email}:
 *   get:
 *     summary: Obtiene una reseña por email
 *     description: Endpoint para obtener los detalles de una reseña por su email de usuario.
 *     tags: [Reseñas]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email del usuario para buscar la reseña
 *     responses:
 *       '200':
 *         description: Devuelve los detalles de la reseña asociada al email especificado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       '404':
 *         description: Reseña no encontrada.
 *         content:
 *           application/json:
 *             example:
 *               message: "Review not found for the specified email"
 *       '500':
 *         description: Error del servidor
 */
router.get(
  "/:email",
  authorize("admin", "user"),
  checkAccess,
  async (req, res) => {
    const { email } = req.params;

    try {
      const review = await rateSchema
        .find({ "user.email": email })
        .sort({ date: 1 });

      if (!review) {
        return res
          .status(404)
          .json({
            message: "No se ha encontrado reseña para el email proporcionado",
          });
      }

      res.status(200).json(review);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/rates/{roomType}:
 *   get:
 *     summary: Obtiene todas las reseñas de un tipo de habitación y las ordena por calificación
 *     description: Obtiene todas las reseñas disponibles de un tipo de habitación específico y las ordena de mayor a menor según la calificación.
 *     tags: [Reseñas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomType
 *         required: true
 *         schema:
 *           type: string
 *         description: Tipo de habitación para filtrar las reseñas
 *     responses:
 *       200:
 *         description: Devuelve todas las reseñas del tipo de habitación especificado, ordenadas por calificación.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rates'
 *       403:
 *         description: Acceso prohibido (rol no autorizado) o no autenticado
 *       500:
 *         description: Error del servidor
 */

router.get("/rankingType/:type", authorize("admin", "user"), async (req, res) => {
  const { type } = req.params;
  
  try {
    const reviews = await rateSchema.find({ room_type: type }).sort({ rating: -1 });

    reviews.forEach(review => {
      let color;
      if (review.rating <= 2) {
        color = rojo;
      } else if (review.rating <= 4) {
        color = amarillo;
      } else {
        color = verde;
      }
      log(`${color}Review: ${review.text}, Rating: ${review.rating}${reset}`);
    });
    
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/***
 * @swagger
 * /api/rates/{email}:
 *   patch:
 *     summary: Actualiza detalles de una reseña por email
 *     description: Actualiza los detalles de una reseña específica por su email de usuario.
 *     tags: [Reseñas]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email del usuario asociado a la reseña a actualizar.
 *     requestBody:
 *       description: Nuevos detalles de la reseña
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Review'
 *     responses:
 *       '200':
 *         description: Detalles de la reseña actualizados correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       '404':
 *         description: Reseña no encontrada.
 *         content:
 *           application/json:
 *             example:
 *               message: "Review not found for the specified email"
 *       '500':
 *         description: Error del servidor
 */

//User no puede hacer patch al no tener acceso al _id
router.patch("/:reviewId", authorize("admin", "user"), async (req, res) => {
  const { reviewId } = req.params;
  const updateFields = req.body;

  try {
    const existingReview = await rateSchema.findById(reviewId);
    if (!existingReview) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }
    console.log("Email de la reseña: " + existingReview.user.email);
    console.log("Email del que quiere modificar: " + req.user.email);
    // Comprueba si el usuario autenticado es el propietario de la reseña
    if (existingReview.user.email !== req.user.email) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para modificar esta reseña" });
    }

    const updatedReview = await rateSchema.findByIdAndUpdate(
      reviewId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    res.status(200).json(updatedReview);
  } catch (error) {
    errorHandler(error, res);
  }
});

/**
 * @swagger
 * /api/rates/{reviewId}:
 *   delete:
 *     summary: Elimina una reseña por ID
 *     description: Elimina una reseña específica por su ID. Los usuarios pueden eliminar solo sus propias reseñas, mientras que los administradores pueden eliminar cualquier reseña.
 *     tags: [Reseñas]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reseña a eliminar
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Reseña eliminada correctamente.
 *       403:
 *         description: No tienes permiso para eliminar esta reseña (usuario no autorizado).
 *       404:
 *         description: La reseña no pudo ser encontrada para el ID especificado.
 *       500:
 *         description: Error del servidor
 */
router.delete("/:reviewId", authorize("admin", "user"), async (req, res) => {
  const { reviewId } = req.params;

  try {
    const existingReview = await rateSchema.findById(reviewId);
    if (!existingReview) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    if (req.user.role === "admin") {
      const deletedReview = await rateSchema.findOneAndDelete({
        _id: reviewId,
      });

      if (!deletedReview) {
        return res
          .status(404)
          .json({ message: "Reseña no encontrada para el ID especificado" });
      }

      return res.status(204).send();
    }

    if (existingReview.user.email !== req.user.email) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para eliminar esta reseña" });
    }

    const deletedReview = await rateSchema.findOneAndDelete({
      _id: reviewId,
    });

    if (!deletedReview) {
      return res
        .status(404)
        .json({ message: "Reseña no encontrada para el ID especificado" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
