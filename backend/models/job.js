'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Job extends Model {
    static associate(models) {
      Job.belongsTo(models.Company, { foreignKey: 'company_id' });
      Job.hasMany(models.Application, { foreignKey: 'job_id' });
    }
  }

  Job.init({
    company_id: {
      type: DataTypes.INTEGER,
      references: { model: 'companies', key: 'id' }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    url: {
      type: DataTypes.TEXT
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2)
    },
    work_mode: {
      type: DataTypes.ENUM('remote', 'hybrid', 'onsite')
    }
  }, {
    sequelize,
    modelName: 'Job',
    tableName: 'jobs',
    timestamps: false
  });

  return Job;
};
