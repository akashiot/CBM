var mysql =require('mysql')
var db = mysql.createConnection({
    host:'172.22.59.68',//host
    user:'root',//username
    password:'password',//password
    database:'cbm'//databse name
  });

module.exports=db;