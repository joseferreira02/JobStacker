'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_interviews_status" AS ENUM ('scheduled', 'completed', 'canceled', 'passed', 'failed');
    `);

    await queryInterface.createTable('interviews', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      application_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'applications',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      round_type: {
        type: Sequelize.STRING(255)
      },
      scheduled_start: {
        type: Sequelize.DATE,
        allowNull: false
      },
      scheduled_end: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: 'enum_interviews_status',
        defaultValue: 'scheduled'
      },
      notes: {
        type: Sequelize.TEXT
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('interviews');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_interviews_status";');
  }
};
