function errorHandler(err, req, res, next) {
  console.error("Erro capturado:", err);

  if (err.name === "CastError") {
    return res.status(400).json({ message: "ID inválido" });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "Erro de validação", erros: err.errors });
  }

  res.status(err.status || 500).json({
    message: err.message || "Erro interno no servidor",
  });
}

export default errorHandler;
