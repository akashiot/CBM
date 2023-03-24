var mysql =require('mysql')
var db = mysql.createConnection({
    host:'192.168.10.205',//host
    user:'root',//username
    password:'password',//password
    database:'cbm'//databse name
  });

module.exports=db;