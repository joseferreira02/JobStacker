'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('companies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      location: {
        type: Sequelize.STRING(255)
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('companies');
  }
};
