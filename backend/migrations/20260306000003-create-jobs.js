'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_jobs_work_mode" AS ENUM ('remote', 'hybrid', 'onsite');
    `);

    await queryInterface.createTable('jobs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      company_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      url: {
        type: Sequelize.TEXT
      },
      salary: {
        type: Sequelize.DECIMAL(10, 2)
      },
      work_mode: {
        type: 'enum_jobs_work_mode'
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('jobs');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_jobs_work_mode";');
  }
};
