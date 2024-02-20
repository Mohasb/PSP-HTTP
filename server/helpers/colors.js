const rojo = "\x1b[31m";
const verde = "\x1b[32m";
const amarillo = "\x1b[33m";
const reset = "\x1b[0m";

// Escribo en el color que quieras en la consola
const log = (coloredMessaje) => {
  console.log(`${coloredMessaje}${reset}`);
};

module.exports = { rojo, verde, amarillo, log, reset };
