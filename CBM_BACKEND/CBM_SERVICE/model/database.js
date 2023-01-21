const { Sequelize, Model, DataTypes }=require('sequelize')
const mysql=require('mysql2')
const sequelize = new Sequelize("cbm", "root", "password", {
    host: "127.0.0.1",
    dialect: "mysql",
    logging:false
  });
module.exports=sequelize