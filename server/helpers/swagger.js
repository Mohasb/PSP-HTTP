const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Swagger options
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hotel Pere Maria APIw",
      version: "8.4.9",
      description: "Developers: Maria, Chitan, Muhammad",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
    },
  },
  apis: [
    "server/routes/login/loginRouter.js",
    "server/routes/users/userRouter.js",
    "server/routes/rooms/roomRouter.js",
    "server/routes/reservations/reservationRouter.js",
    "server/routes/rates/ratesRouter.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec, swaggerUi };
