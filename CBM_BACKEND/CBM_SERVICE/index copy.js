// import { Sequelize, Model, DataTypes } from 'sequelize';
const mysql=require('mysql2')
const express=require('express');
const cors=require('cors');
const axios=require('axios');
const db= require('./model/dbconfig')

const moment=require('moment');
var bodyparser =require('body-parser');
const sequelize = require("./model/database");
const { SMALLINT } = require('sequelize');

var settings = require('./configuration/config.json')
var limits = require('./controller/limitconfiguration')
var alert = require('./controller/alertlog')
var actual = require('./controller/actualValues')

const app = express();
app.use(cors());
app.use(bodyparser.json());


const port=7003;
    app.listen(`${port}`,()=>{
    console.log(`listening port on ${port}`);
    })

    app.post('/setlimit', function (req,res) {
        limits.valueLimits(req,res)        
    })
    app.post('/actualvalue', function (req,res) {
        actual.actualvalue(req,res)        
    })

    // app.post("/actualdata", async (req, res) => {
    //     try {
    //         var date =moment().format("YYYY-MM-DD")
    //         const selectLimit =  await sequelize.query(`select * from limit_configuration where station='${req.body.station}' AND sensor='${req.body.sensor}'`);
    //         // const results =  await sequelize.query(`call InsertActualData '${date}','${req.body.station}','${req.body.sensor}','${req.body.unit}','${req.body.lsl}','${req.body.actual_data}','${req.body.hsl}'`);
    //         selectLimit.forEach(element => {
    //             console.log(element['sensor'])
    //         });
    //         // console.log(selectLimit.sensor)
    //     } catch (error) {
    //         console.log(error)
    //     }
    // })


    var stationNo;
async function valuesReady(){
    const res = await axios.get(settings.plcUrl+'/getPlcData')
    const plcs=Object.keys(res?.data)
    plcs.forEach(plc =>{
        var connection=res.data[plc].connection;
        stationNo=Object.keys(res?.data[plc])
        stationNo.slice(2).forEach(ele=>{
            data=res.data[plc][ele]
            sensorvalue= Object.values(res?.data[plc][ele])
            sensorname= Object.keys(res?.data[plc][ele])
            result=connection
        // console.log(data)

            // if(interval) clearInterval(interval)
            if (result==true) {
            // alert.alertLog(ele,data)
            // var interval=setInterval(function(){ 
                actual.actualvalue(ele,data)
            // },5000)

            //   plcval.readvalues(ele,data)
            }else{
                console.log("check PLC communication")
            }
        });
    });
}




setInterval(function(){ 
    valuesReady()
  },settings.plc_refreshrate)

    app.get("/onehourdata", async (req, res) => {
        try {
    var sta={}
    const results =  await sequelize.query(`SELECT DISTINCT station FROM actual_data where time_stamp > now() - interval 1 minute `);
    const re = await results[0]
    for await (const data of re) {
        const select =  await sequelize.query(`select * from actual_data where station='${data.station}' AND time_stamp > now() - interval 1 minute ORDER BY id desc `);
        for await (const ele of select[0]) {
            if(sta[ele?.station]){
                if(sta[ele?.station][ele?.sensor]){
                    sta[ele?.station][ele?.sensor]['lsl'].push(ele?.lsl)
                    sta[ele?.station][ele?.sensor]['hsl'].push(ele?.hsl)
                    sta[ele?.station][ele?.sensor]['xaxis'].push(ele?.time_stamp)
                    sta[ele?.station][ele?.sensor]['yaxis'].push(ele?.actual_data)
                } else {
                    sta[ele?.station][ele?.sensor] = {
                        "name": ele?.sensor,
                        "lsl":[],
                        "hsl":[],
                        "xaxis":[],
                        "yaxis":[],
                    }
                }  
            } else {
                sta[ele?.station] = {}
                if(sta[ele?.station][ele?.sensor]){
                    sta[ele?.station][ele?.sensor]['lsl'].push(ele?.lsl)
                    sta[ele?.station][ele?.sensor]['hsl'].push(ele?.hsl)
                    sta[ele?.station][ele?.sensor]['xaxis'].push(ele?.time_stamp)
                    sta[ele?.station][ele?.sensor]['yaxis'].push(ele?.actual_data)
                } else {
                    sta[ele?.station][ele?.sensor] = {
                        "name": ele?.sensor,
                        "lsl":[],
                        "hsl":[],
                        "xaxis":[],
                        "yaxis":[],
                    }
                }
            }
        }
    }
     await res.json({status:true,Result:sta})
    } catch (error) {
        console.log(error)
    }
    })

 