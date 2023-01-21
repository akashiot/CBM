const db= require('../model/dbconfig')
const moment=require('moment');
const express=require('express');
const app = express();

exports.actualvalue =async function(stn,data){
    try {
        var timestamp = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    db.query(`SELECT station_name,sensor_name,type,sensor_type,lsl,hsl,unit FROM grouping_configuration `, function (err, rows) {
        if(err)console.log(err)
            rows.forEach(ele=>{  
                // console.log("Object.keys(data)",Object.keys(data));
            var stan= Object.keys(data).map(k => ({ [k]: data[k] }));
            stan.forEach(key=>{
            var sensorname= Object.keys(key)
            var actualdata= Object.values(key)
            if(sensorname[0]==ele.sensor_name && stn==ele.station_name){
                var sens=+JSON.parse(actualdata)
                db.query(`Insert into actual_data(time_stamp, type,groupsensor_name,station,sensor, lsl, actual_data, hsl,unit) values('${timestamp}','${ele.type}','${ele.sensor_type}','${ele.station_name}','${ele.sensor_name}','${ele.lsl}','${sens.toFixed(2)}','${ele.hsl}','${ele.unit}' ) `, function (err, rows) {
                    if(err) console.log(err)                    
                })
            }
            }) 
        })
    })   
    } catch (error) {
        console.log(error)
    }
     
}

