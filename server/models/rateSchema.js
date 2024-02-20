const mongoose = require("mongoose");

const rateSchema = new mongoose.Schema({
  user: {
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  room_type: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

const rateModel = mongoose.model("rates", rateSchema);

module.exports = rateModel;
