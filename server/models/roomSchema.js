const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
    image: {
      type: String,
      required: true,
    },
  });
  
  const roomSchema = new mongoose.Schema({
    room_number: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: {
      type: [imageSchema],
      required: true,
    },
    rate: {
      type: Number,
      required: true,
    },
    max_occupancy: {
      type: Number,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      required: true,
    },
  });

const roomModel = mongoose.model("rooms", roomSchema);

module.exports = roomModel;






