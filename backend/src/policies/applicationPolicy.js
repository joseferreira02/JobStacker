

const canAccess = (user, resource) => user.sub === resource.user_id;

module.exports = { canAccess};