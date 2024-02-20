const express = require("express");
const router = express.Router();
const roomSchema = require("../../models/roomSchema");
require("dotenv");
const getPrices = require("../middlewares/getPrices");
const authorize = require("../middlewares/auth/AutorizationMW.js");
const checkAccess = require("../middlewares/auth/checkAccess");
const baseURL = process.env.BASE_URL_IMAGES ;
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const errorHandler = require("../../validations/errorHandlers.js");


router.get("/", authorize("admin"), async (req, res) => {
  try {
    const rooms = await roomSchema.find().sort({ room_number: 1 });

    const roomsWithImageURLs = rooms.map((room) => {
      const roomCopy = {
        ...room.toObject(),
        images: room.images.map((image) => ({
          ...image.toObject(),
          url: `${baseURL}${image.image}.jpg`,
        })),
      };
      return roomCopy;
    });

    res.status(200).json(roomsWithImageURLs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/unique-rooms", authorize("admin"), async (req, res) => {
  try {
    const uniqueRooms = await roomSchema.aggregate([
      {
        $group: {
          _id: "$type",
          firstRoom: { $first: "$$ROOT" }, // Primer documento de cada grupo
        },
      },
      {
        $replaceRoot: { newRoot: "$firstRoom" }, // Reemplazar la raíz con el primer documento de cada grupo
      },
      {
        $sort: { room_number: 1 }, // Ordenar por price_per_night
      },
    ]);

    const uniqueRoomsWithImageURLs = uniqueRooms.map((room) => {
      const roomCopy = {
        ...room,
        //_id: room._id.toString(),
        images: room.images.map((image) => ({
          ...image,
          url: `${baseURL}${Object.values(image)[0]}.jpg`,
        })),
      };
      return roomCopy;
    });

    //console.dir(uniqueRoomsWithImageURLs, { depth: null });

    res.status(200).json(uniqueRoomsWithImageURLs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/type/:type", authorize("admin"), async (req, res) => {
  const { type } = req.params;

  try {
    const room = await roomSchema.findOne({ type });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const roomWithImageURLs = {
      ...room._doc,
      images: room.images.map((image) => ({
        ...image._doc,
        url: `${baseURL}${image.image}.jpg`,
      })),
    };

    res.status(200).json(roomWithImageURLs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/room/:room_number", authorize("admin"), async (req, res) => {
  const { room_number } = req.params;
  try {
    const room = await roomSchema.findOne({ room_number });

    if (!room) {
      return res.status(404).json({ message: `Room ${room_number}not found` });
    }

    const roomWithImageURLs = {
      ...room._doc,
      images: room.images.map((image) => ({
        ...image._doc,
        url: `${baseURL}${image.image}.jpg`,
      })),
    };

    res.status(200).json(roomWithImageURLs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post("/", authorize("admin"), getPrices, async (req, res) => {
  const roomDetails = req.body;
  let imagesWithUrls;
  try {
    const existingRoom = await roomSchema.findOne({
      room_number: roomDetails.room_number,
    });

    if (existingRoom) {
      return res.status(400).json({
        message: "Ya existe una habitación con el mismo numero de habitación",
      });
    }

    // Update price
    const prices = res.locals.prices;
    const roomType = req.body.type
      ? req.body.type.toLowerCase()
      : existingRoom.type;
    const price = req.body.type
      ? prices._doc[roomType]
      : existingRoom.price_per_night;
    roomDetails.price_per_night = price;

    // Convertir las imágenes base64 a URLs y guardarlas en assets
    imagesWithUrls = await Promise.all(
      roomDetails.images.map(async (image) => {
        const imageName = `${uuidv4()}.jpg`; // Generar un nombre único para cada imagen
        const imagePath = path.join(
          "server",
          "assets",
          "roomImages",
          imageName
        );
        // Guardar la imagen en el directorio
        await fs.promises.writeFile(imagePath, image.image, "base64");
        return imageName;
      })
    );

    // Crear la nueva habitación con las URLs de las imágenes
    const newRoom = await roomSchema.create({
      ...roomDetails,
      images: imagesWithUrls.map((imageName) => ({ image: imageName })),
    });

    res.status(201).json(newRoom);
  } catch (error) {
    errorHandler(error, res);
    console.log("Error al crear la habitación");

    // Eliminar las imágenes creadas en caso de error
    if (imagesWithUrls && imagesWithUrls.length > 0) {
      await Promise.all(
        imagesWithUrls.map(async (imageName) => {
          const imagePath = path.join(
            "server",
            "assets",
            "roomImages",
            imageName
          );
          try {
            await fs.promises.unlink(imagePath);
          } catch (unlinkError) {
            console.error(
              `Error al eliminar la imagen ${imageName}: ${unlinkError.message}`
            );
          }
        })
      );
    }
  }
});

router.patch(
  "/:room_number",
  authorize("admin"),
  getPrices,
  async (req, res) => {
    try {
      const { room_number } = req.params;

      const existingRoom = await roomSchema.findOne({ room_number });
      if (!existingRoom) {
        return res.status(404).json({ error: "Habitación no encontrada" });
      }

      const prices = res.locals.prices;
      const roomType = req.body.type
        ? req.body.type.toLowerCase()
        : existingRoom.type;
      const price = req.body.type
        ? prices._doc[roomType]
        : existingRoom.price_per_night;

      const updateFields = {
        room_number: req.body.room_number,
        type: req.body.type,
        description: req.body.description,
        price_per_night: price,
        rate: req.body.rate,
        max_occupancy: req.body.max_occupancy,
        isAvailable: req.body.isAvailable,
      };

      if (req.body.images && req.body.images.length > 0) {
        // Convertir las imágenes base64 a URLs y guardarlas en assets
        const imagesWithUrls = await Promise.all(
          req.body.images.map(async (image) => {
            const imageName = `${uuidv4()}.jpg`; // Generar un nombre único para cada imagen
            const imagePath = path.join(
              "server",
              "assets",
              "roomImages",
              imageName
            ); 
            await fs.promises.writeFile(imagePath, image.image, "base64");

            // Crear la URL de la imagen
            const imageUrl = `${baseURL}assets/roomImages/${imageName}`;
            return imageName;
          })
        );

        // Agregar las imágenes al objeto de actualización
        updateFields.images = imagesWithUrls.map((imageName) => ({
          image: imageName,
        }));
      }

      Object.keys(updateFields).forEach(
        (key) => updateFields[key] === undefined && delete updateFields[key]
      );

      const resultado = await roomSchema.updateOne(
        { room_number },
        { $set: updateFields }
      );
      console.log(updateFields);

      if (resultado.modifiedCount === 0) {
        return res.status(404).json({ message: "Documento no encontrado" });
      }

      res.status(200).json({ message: "Documento actualizado exitosamente" });
    } catch (error) {
      errorHandler(error, res);
    }
  }
);

router.delete("/:room_number", authorize("admin"), async (req, res) => {
  const { room_number } = req.params;

  try {
    const deletedRoom = await roomSchema.findOneAndDelete({ room_number });

    if (!deletedRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({
      message: `Habitación '${room_number}' eliminada correctamente`,
      status: 204,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
