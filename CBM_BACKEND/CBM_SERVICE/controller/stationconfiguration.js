const db= require('../model/dbconfig')
const moment=require('moment');
const sequelize = require("../model/database");
const express=require('express');
const app = express();
exports.addStationvalue =async function(req,res){
    // app.get("/configuration/addStation", async (req, res) => {
    try {
        var timestamp =moment().format('YYYY-MM-DD HH:mm:ss:SSS')
        const check =  await sequelize.query(`SELECT * FROM station_configuration where name='${req.body.station_name}'`);
        if (check[0]==0) {
                const inserting =  await sequelize.query(`insert into station_configuration(name)values('${req.body.station_name}')`);
                   await res.json({ status:true, result:"Create Station Successfully!"})
            }
            else if (check[0]!==0){
                await res.json({status:false,result:"Station-name is already exits!!!"})
            }
    } catch (error) {
        console.log(error)
    }       
}

exports.updateStationvalue=async function(req,res){
    try {
        // const checkk =  await sequelize.query(`SELECT stn_id  FROM station_configuration where stn_id='${req.body.id}'`);
        // console.log(checkk[0][0])
        // if(checkk[0].length==1){
        //     const updating = await sequelize.query(`update station_configuration set name='${req.body.station_name}' where stn_id='${req.body.id}'`);
        //     if (updating[0].length==1) {
        //         res.json({status:true, result:"Station details updated successfully!"})
        //     }
        // }
        // else if(checkk[0]!==0){
        //     res.json({status:false,result:"Something went worng!!!"})
        // }
        db.query(`SELECT * FROM station_configuration where stn_id='${req.body.id}' `, function (err, rows) {
            if(err) console.log(err)
            if(rows.length==1){
                db.query(`update station_configuration set name='${req.body.station_name}' where stn_id='${req.body.id}' `, function(err,results){ 
                if(err){
                    console.log(err)
                }
                else{
                    res.json({status:true, result:"Station details updated successfully!"})
                }
            })
            }
            else{
                res.json({status:false,result:"Something went worng!!!"})
            }
        })
    } catch (error) {
        console.log(error)
    }
}
exports.deleteStationvalue=async function(req,res){
    try {
        db.query(`SELECT * FROM station_configuration where stn_id='${req.body.id}' `, function (err, rows) {        
            if(err) console.log(err)            
            else if(rows.length==1){
                db.query(`DELETE FROM station_configuration where stn_id='${req.body.id}' `, function (err, result) {
                })
                res.json({status:true,result:"Station details Deleted Successfully!"})
            }else if(rows.length==0){
                res.json({status:false,result:"No Records!!!"})
            }           
    })
    } catch (error) {
        console.log(error)
    }
}
exports.getStationvalue=async function(req,res){
    try {
        db.query(`SELECT stn_id,name FROM station_configuration`, function (err, rows) {
            if(rows.length>=1){
                res.json({status:true,result:" Getting all Stations Successfully!",data:rows})
            }            
            else{
                res.json({status:false,result:"No Records!!!"})
            }
        })
    } catch (error) {
        console.log(error)
    }
}

// exports.updateStationvalue=async function(req,res){
//     try {
//         const checkk =  await sequelize.query(`SELECT stn_id  FROM station_configuration where stn_id='${req.body.id}'`);
//         console.log(checkk[0])
//         if(checkk[0]==1){
//             const updating = await sequelize.query(`update station_configuration set name='${req.body.station_name}' where stn_id='${req.body.id}'`);
//             if (updating[0]==1) {
//                 res.json({status:true, result:"Station details updated successfully!"})
//             }
//         }
//         else if(checkk[0]!==0){
//             res.json({status:false,result:"Something went worng!!!"})
//         }
//         // db.query(`SELECT * FROM station_configuration where stn_id='${req.body.id}' `, function (err, rows) {
//         //     if(err) console.log(err)
//         //     if(rows.length==1){
//         //         db.query(`update station_configuration set name='${req.body.station_name}' where stn_id='${req.body.id}' `, function(err,results){ 
//         //         if(err){
//         //             console.log(err)
//         //         }
//         //         else{
//         //             res.json({status:true, result:"Station details updated successfully!"})
//         //         }
//         //     })
//         //     }
//         //     else{
//         //         res.json({status:false,result:"Something went worng!!!"})
//         //     }
//         // })
//     } catch (error) {
//         console.log(error)
//     }
// }