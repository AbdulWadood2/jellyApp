const customError = (statusCode, res, error, fullError) => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error,
    fullError,
  });
};

module.exports = { customError };
