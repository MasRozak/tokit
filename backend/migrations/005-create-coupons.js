'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('coupons', {
      id_kupon: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal('(UUID())')
      },
      kode_kupon: {
        type: Sequelize.STRING,
        unique: true
      },
      diskon: Sequelize.FLOAT(10, 2),
      expired_at: Sequelize.DATE,
      expired_at: Sequelize.DATE,
      status: {
        type: Sequelize.ENUM('active', 'expired'),
        allowNull: false,
        defaultValue: 'active'
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('coupons');
  }
};