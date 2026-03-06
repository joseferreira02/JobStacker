'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    static associate(models) {
      Company.hasMany(models.Job, { foreignKey: 'company_id' });
    }
  }

  Company.init({
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    location: {
      type: DataTypes.STRING(255)
    }
  }, {
    sequelize,
    modelName: 'Company',
    tableName: 'companies',
    timestamps: false
  });

  return Company;
};
