const errorHandler = (error, res) => {
  if (error.name === "ValidationError") {
    const validationErrors = error.errors
      ? Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {})
      : {};

     res.status(400).json({
      message: "Datos incompletos o incorrectos -> errorHandler",
      validationErrors,
    });
    return;
  }


  const mongoErrorCode = error.code || "";
  const validationErrors =
    error.errInfo &&
    error.errInfo.details &&
    error.errInfo.details.schemaRulesNotSatisfied
      ? error.errInfo.details.schemaRulesNotSatisfied
      : "";

  res.status(400).json({
    message: `Error: ${error.message}`,
    errorType: error.name,
    mongoErrorCode,
    validationErrors,
  });
  return;
};

module.exports = errorHandler;
