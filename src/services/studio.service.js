const { Studio } = require("../models");
const AppError = require("../utils/AppError");

const getCurrent = async (studioId) => {
  const studio = await Studio.findByPk(studioId);
  if (!studio) throw AppError.notFound("Studio not found");
  return studio;
};

const updateCurrent = async (studioId, data) => {
  const studio = await Studio.findByPk(studioId);
  if (!studio) throw AppError.notFound("Studio not found");

  const fields = {};
  if (data.name !== undefined) fields.name = data.name;
  if (data.slug !== undefined) {
    const existing = await Studio.findOne({ where: { slug: data.slug } });
    if (existing && existing.id !== studioId) {
      throw AppError.badRequest("Bu slug zaten kullanımda");
    }
    fields.slug = data.slug;
  }
  if (data.email !== undefined) fields.email = data.email;
  if (data.phone !== undefined) fields.phone = data.phone;
  if (data.address !== undefined) fields.address = data.address;
  if (data.settings !== undefined) fields.settings = data.settings;

  await studio.update(fields);
  return studio;
};

module.exports = { getCurrent, updateCurrent };
