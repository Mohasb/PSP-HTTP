const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  extras: {
    type: [
      {
        name: {
          type: String,
          enum: ["WiFi", "Completo", "Gym", "Spa", "Parking"],
          required: true,
          description: "Name of the extra service.",
        },
        value: {
          type: Boolean,
          required: true,
        },
      },
    ],
    validate: {
      validator: function (extras) {
        return extras.length >= 0 && extras.length <= 5;
      },
      message: "Array of extras must have at least 1 item and at most 5 items.",
    },
  },
  user: {
    type: {
      email: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        required: true,
      },
    },
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
  cancelation_date: {
    type: Date,
  },
  total_price: {
    type: Number,
  },
  room_number: {
    type: Number,
  },
});

const reservationModel = mongoose.model("reservations", reservationSchema);

module.exports = reservationModel;
