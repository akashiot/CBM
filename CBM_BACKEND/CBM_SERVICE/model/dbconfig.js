var mysql =require('mysql')
var db = mysql.createConnection({
    host:'127.0.0.1',//host
    user:'root',//username
    password:'password',//password
    database:'cbm'//databse name
  });
module.exports=db