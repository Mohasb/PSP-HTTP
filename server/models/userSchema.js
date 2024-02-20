const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  room_number: {
    type: Number,
    required: true,
  },
  check_in_date: {
    type: Date,
    required: true,
  },
  check_out_date: {
    type: Date,
    required: true,
  },
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  user_name: {
    type: String,
    required: true,
    min: 6,
    max: 255,
  },
  email: {
    type: String,
    required: true,
    min: 6,
    max: 255,
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 255,
  },
  role: {
    type: String,
    required: true,
    min: 6,
    max: 255,
    default: 'user',
  },
  reservations: {
    type: [reservationSchema],
    default: [],
  },
});

const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;
