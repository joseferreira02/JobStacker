'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Application extends Model {
    static associate(models) {
      Application.belongsTo(models.User, { foreignKey: 'user_id' });
      Application.belongsTo(models.Job, { foreignKey: 'job_id' });
      Application.hasMany(models.Interview, { foreignKey: 'application_id' });
    }
  }

  Application.init({
    user_id: {
      type: DataTypes.INTEGER,
      references: { model: 'users', key: 'id' }
    },
    job_id: {
      type: DataTypes.INTEGER,
      references: { model: 'jobs', key: 'id' }
    },
    status: {
      type: DataTypes.ENUM('applied', 'interviewing', 'rejected', 'offered', 'ghosted'),
      defaultValue: 'applied'
    },
    applied_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Application',
    tableName: 'applications',
    timestamps: false
  });

  return Application;
};
