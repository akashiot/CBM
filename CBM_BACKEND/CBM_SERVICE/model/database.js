const { Sequelize, Model, DataTypes }=require('sequelize')
const mysql=require('mysql2')
const sequelize = new Sequelize("cbm", "root", "password", {
    host: "172.22.59.68",
    dialect: "mysql",
    logging:false
  });
module.exports=sequelize