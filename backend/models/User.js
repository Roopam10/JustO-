const { DataTypes } = require('sequelize'); 
const sequelize = require('../db'); 

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true, 
  },
  phone_no: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true, 
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  loginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0, 
  },
  lockedUntil: {
    type: DataTypes.DATE,
    allowNull: true, 
  },
  oneTimeToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  oneTimeTokenExpires: {
    type: DataTypes.DATE,
    allowNull: true, 
  },
}, {
  timestamps: true, 
  tableName: 'users', 
});

module.exports = User;
