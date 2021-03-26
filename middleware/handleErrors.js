module.exports = (error, request, response, next) => {
  if (error.name === 'CastError') {
    response.status(400).send({ id: 'id malformed' })
  } else {
    response.status(500).end()
  }
}
