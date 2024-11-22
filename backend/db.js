const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('auth_db', 'root', 'Roopam@10', {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = sequelize;
