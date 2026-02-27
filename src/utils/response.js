const success = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

const created = (res, data) => {
  return success(res, data, 201);
};

const paginated = (res, data, pagination) => {
  return res.status(200).json({
    success: true,
    data,
    meta: pagination,
  });
};

module.exports = { success, created, paginated };
