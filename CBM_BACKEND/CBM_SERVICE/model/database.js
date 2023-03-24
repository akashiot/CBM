const { Sequelize, Model, DataTypes }=require('sequelize')
const mysql=require('mysql2')
const sequelize = new Sequelize("cbm", "root", "password", {
    host: "192.168.10.205",
    dialect: "mysql",
    logging:false
  });
module.exports=sequelize