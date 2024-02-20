const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const token = req.header("Authorization");
  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    console.error("Error de autenticación:", error.message);
    res.status(401).json({ error: error.message });
  }
};

module.exports = authenticate;
