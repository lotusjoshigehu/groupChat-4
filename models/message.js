const { DataTypes } = require("sequelize");
const sequelize = require("../connection/dbconnection");

const message = sequelize.define("message", {
  sender: {
    type: DataTypes.STRING,
    allowNull: false
  },
  receiver: {
    type: DataTypes.STRING,
    allowNull: false
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  }
});

module.exports = message;
