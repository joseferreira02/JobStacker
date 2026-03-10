'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RefreshToken extends Model {
    static associate(models) {
      RefreshToken.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }

  RefreshToken.init({
    user_id: {
      type: DataTypes.INTEGER
    },
    hashed_token: {
      type: DataTypes.STRING(255)
    },
    expires_at: {
      type: DataTypes.DATE
    },
    is_revoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'RefreshToken',
    tableName: 'refresh_tokens',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return RefreshToken;
};
