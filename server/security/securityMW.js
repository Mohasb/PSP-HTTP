/* // Middleware para redireccionar de HTTP a HTTPS
const redirectToHTTPS = (req, res, next) => {
  if (req.secure) {
    // La solicitud ya es segura, continuar
    next();
  } else {
    // Redirigir a la versión HTTPS
    res.redirect(`https://${req.hostname}:${httpsPort}${req.url}`);
  }
};

module.exports = redirectToHTTPS;
 */