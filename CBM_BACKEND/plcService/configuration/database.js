const { Sequelize, Model, DataTypes }=require('sequelize')
const mysql=require('mysql2')
const sequelize = new Sequelize("cbm", "root", " ", {
    host: "localhost",
    dialect: "mysql",
  });
module.exports=sequelize