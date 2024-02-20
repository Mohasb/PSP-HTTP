const mongoose = require("mongoose");
const DatabaseUrl = process.env.DATABASE_URL;
const { rojo, verde, log } = require("./helpers/colors");

try {
  mongoose.connect(DatabaseUrl);
  const database = mongoose.connection;

  database.on("error", (error) => {
    log(rojo + `Error conectando a la base de datos: ${error.code}`);
    if (error.message && error.message.includes("timeout")) {
      log(rojo + "Error timeout en la conexon a la base de datos:", error.code);
    }
  });

  database.on("connected", () => {
    log(verde + "Conectado a la base de datos correctamente");
  });
} catch (error) {
  log(rojo + `Error during database connection: ${error}`);
}
