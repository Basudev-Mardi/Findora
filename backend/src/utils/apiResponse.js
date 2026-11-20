function sendSuccess(res, data, message = "OK", statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function sendError(res, message = "Internal server error", statusCode = 500, details = null) {
  const payload = {
    success: false,
    message,
  };

  if (details !== null) {
    payload.details = details;
  }

  return res.status(statusCode).json(payload);
}

module.exports = {
  sendSuccess,
  sendError,
};
