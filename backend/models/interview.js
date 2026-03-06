'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Interview extends Model {
    static associate(models) {
      Interview.belongsTo(models.Application, { foreignKey: 'application_id' });
    }
  }

  Interview.init({
    application_id: {
      type: DataTypes.INTEGER,
      references: { model: 'applications', key: 'id' }
    },
    round_type: {
      type: DataTypes.STRING(255)
    },
    scheduled_start: {
      type: DataTypes.DATE,
      allowNull: false
    },
    scheduled_end: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'completed', 'canceled', 'passed', 'failed'),
      defaultValue: 'scheduled'
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'Interview',
    tableName: 'interviews',
    timestamps: false
  });

  return Interview;
};
