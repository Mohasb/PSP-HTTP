const { amarillo, log } = require("../../../helpers/colors");

const authorize =
  (...requiredRoles) =>
  (req, res, next) => {
    // Verifica si existe un usuario y si su rol está en los roles permitidos
    log(amarillo + "Usuario haciendo la petición:");
    console.log(req.user);

    if (req.user && requiredRoles.includes(req.user.role)) {
      next(); // El usuario tiene uno de los roles necesarios, permite el acceso
    } else {
      res
        .status(403)
        .json({ error: "Acceso prohibido Auth Authorize (rol no autorizado)" });
    }
  };

module.exports = authorize;
