const { ActivityLog } = require('../models');

const log = async (userId, action, entity = null, entityId = null) => {
  await ActivityLog.create({ userId, action, entity, entityId });
};

module.exports = { log };
