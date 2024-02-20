"use strict";

// Para usar express
const express = require("express");
// Para usar json
const bodyParser = require("body-parser");
// Para usar https
const fs = require("fs");
const https = require("https");
// Para usar variables de entorno
require("dotenv").config();
// Conexion a mongoDb
require("./connection");

// Puerto por defecto HTTPS
const PORT = 443;
// Instancia de express.js
const app = express();
// Import de las routes
const userRouter = require("./routes/users/userRouter");
const roomRouter = require("./routes/rooms/roomRouter");
const reservationRouter = require("./routes/reservations/reservationRouter");
const rateRouter = require("./routes/rates/ratesRouter");
// Helpers
const redirectToHTTPS = require("./security/securityMW");
const { swaggerSpec, swaggerUi } = require("./helpers/swagger");
const { verde, log, reset, amarillo } = require("./helpers/colors");
const cors = require("cors");
const { logOutUser, checkTokenRevoked } = require("./routes/logout/logout");
const authenticate = require("./routes/middlewares/auth/AuthJwtMW");
const loginUser = require("../server/routes/login/loginRouter");
const userRegister = require("./routes/users/registerUser")


/*------------------------------MIDDLEWARES--------------------------*/
//app.use(cors(corsOptions));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(redirectToHTTPS); 
/*------------------------------Routes--------------------------*/
app.use("/api/assets", express.static("server/assets"));
app.use("/api/login", loginUser);
app.use("/api/logout", logOutUser);
app.use("/api/register", userRegister); 
/*------------------------------MIDDLEWARES AUTH--------------------------*/
app.use(checkTokenRevoked, authenticate);
app.use("/api/users", userRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/reservations", reservationRouter);
app.use("/api/rates", rateRouter);
/*------------------------------Cors--------------------------*/
var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
/*------------------------------HTTPS--------------------------*/
// Cargar los archivos del certificado y la clave privada https
/* const privateKey = fs.readFileSync("./server/security/host.key", "utf8");
const certificate = fs.readFileSync("./server/security/host.crt", "utf8");
const credentials = { key: privateKey, cert: certificate }; */

// Crear un servidor HTTPS utilizando Express
//const httpsServer = https.createServer(credentials, app);

/*------------------Iniciar el servidor HTTPS-------------------*/

/* httpsServer.listen(PORT, () => {
  log(
    "\nServidor HTTPS está escuchando en la ruta: " +
      verde +
      `https://localhost:${PORT}/api` +
      amarillo +
      `\tDocumentación Swagger: https://localhost:${PORT}/api-docs`
  );
}); */

app.listen(3000, () => {
  console.log(`Server started at http://localhost:${3000}`);
});
 
