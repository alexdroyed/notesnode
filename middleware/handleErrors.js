const ERROR_HANDLERS = {
  CastError: res =>
    res.status(400).send({ id: 'id malformed' }),

  JsonWebTokenError: res =>
    res.status(401).json({ error: 'token missing or invalid' }),

  defaulError: res =>
    res.status(500).end()
}

module.exports = (error, request, response, next) => {
  const handler = ERROR_HANDLERS[error.name] || ERROR_HANDLERS.defaulError

  handler(response, error)
}
