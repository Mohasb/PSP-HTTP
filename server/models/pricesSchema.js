const mongoose = require("mongoose");

const pricesSchema = new mongoose.Schema({});

const pricesModel = mongoose.model("prices", pricesSchema);

module.exports = pricesModel;
