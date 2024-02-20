const pricesSchema = require("../../models/pricesSchema");

//Obtiene los precios de la colección
const getPrices = async (req, res, next) => {
  try {
    const prices = await pricesSchema.findOne();
    res.locals.prices = prices;
    next();
  } catch (error) {
    res.status(500).json({ error, message: "Error al obtener los precios" });
  }
};

module.exports = getPrices;
