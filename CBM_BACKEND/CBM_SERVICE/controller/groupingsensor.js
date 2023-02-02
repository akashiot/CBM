const db= require('../model/dbconfig')
const moment=require('moment');
const axios=require('axios');
var settings = require('../configuration/config.json')
const sequelize = require("../model/database");

exports.addGroupingsensorvalue =async function(req,res){
    // Add new sensor to the database based on the sensor group configuration
    try {
        var timestamp =moment().format('YYYY-MM-DD HH:mm:ss:SSS')
        db.query(`SELECT * FROM grouping_configuration where tag_address='${req.body.sensor_address}' AND station_name='${req.body.station_name}' OR tag_address='${req.body.sensor_address}' AND sensor_name='${req.body.sensor_name}'`, function (err, rows) {
            if(err) console.log(err)
            if(rows.length==1){
                    res.json({status:false,result:"This sensor name or tag address is already exits in this station!!!"})
                }               
                else if(`${req.body.type}`=="sensor") {
                    db.query(`insert into grouping_configuration(station_name,sensor_name,tag_address,unit,manufacture,type,sensor_type,lsl,hsl,lsl_delay,hsl_delay,description)values(
                        '${req.body.station_name}','${req.body.sensor_name}','${req.body.sensor_address}','${req.body.unit}','${req.body.manufacture}','${req.body.type}','${req.body.sensor_name}',${req.body.lsl},${req.body.hsl},${req.body.lsl_delay},${req.body.hsl_delay},'${req.body.description}')`, function (err, result) {
                            if(err)   console.log(err)
                            else {
                                 axios.get(settings.serviceUrl+'/generateplcdata')
                                res.json({ status:true, result:"Created sensor details Successfully!"})
                            }               
                    })            
                }
                else if(`${req.body.type}`=="type"){
                    db.query(`SELECT * FROM limit_configuration where limits_id='${req.body.id}' `, function (err, limitconfig) {
                        if(err) console.log(err)                       
                        limitconfig.forEach(data=>{
                            db.query(`insert into grouping_configuration(station_name,sensor_name,tag_address,unit,manufacture,type,sensor_type,lsl,hsl,lsl_delay,hsl_delay,description)values(
                                '${req.body.station_name}','${req.body.sensor_name}','${req.body.sensor_address}','${req.body.unit}','${req.body.manufacture}','${req.body.type}','${data.sensor_name}',${data.lsl},${data.hsl},${req.body.lsl_delay},${req.body.hsl_delay},'${req.body.description}')`, function (err, results) {
                                    if(err)   console.log(err)
                                    else {
                                        axios.get(settings.serviceUrl+'/generateplcdata')
                                        res.json({ status:true, result:"Created type details Successfully!"})
                                    }               
                            }) 
                        })
                        
                    })                     
                }
        })
    } catch (error) {
        console.log(error)
    }       
}
exports.updateGroupingsensorvalue=async function(req,res){
        // Update sensor to the database based on the sensor group configuration
    try {
        db.query(`SELECT * FROM grouping_configuration where grp_id='${req.body.id}' `, function (err, rows) {
            if(err) console.log(err)
            if(rows.length==1){
                        db.query(`update grouping_configuration set sensor_name='${req.body.sensor_name}',tag_address='${req.body.sensor_address}',unit='${req.body.unit}',
                        manufacture= '${req.body.manufacture}',sensor_type='${req.body.sensor_type}',lsl=${req.body.lsl},hsl=${req.body.hsl},lsl_delay=${req.body.lsl_delay},hsl_delay=${req.body.hsl_delay},description='${req.body.description}' where grp_id='${req.body.id}' `, function(err,validate){ 
                            if(err) console.log(err)
                            else{
                                res.json({status:true, result:"Grouping sensor details updated successfully!"})
                                axios.get(settings.serviceUrl+'/generateplcdata')
                            }
                        })       
            }
            else{
                res.json({status:false,result:"No records!!!"})
            }
        })
    } catch (error) {
        console.error(error)
    }
}
exports.deleteGroupingsensorvalue=async function(req,res){
        // Delete the selected sensor in the database
    try {
        db.query(`SELECT * FROM grouping_configuration where grp_id='${req.body.id}' `, function (err, rows) {        
            if(err) console.log(err)            
            else if(rows.length==1){
                db.query(`DELETE FROM grouping_configuration where grp_id='${req.body.id}' `, function (err, result) {
                })
                res.json({status:true,result:"Groping sensor details Deleted Successfully!"})
            }else if(rows.length==0){
                res.json({status:false,result:"No Records!!!"})
            }            
        })
    } catch (error) {
        console.error(error)
    }
}
exports.getGroupingsensorvalue=async function(req,res){
    // Format the sensor configuration list on the stationwise
    try {
        var sta={}
            const select =  await sequelize.query(`SELECT * FROM grouping_configuration`);
                for await (const ele of select[0]) {
                    if(sta[ele?.station_name]){
                        if(sta[ele?.station_name][ele?.sensor_name]){
                            sta[ele?.station_name][ele?.sensor_name]['sensor_name'].ele?.sensor_name
                            sta[ele?.station_name][ele?.sensor_name]['id'].ele?.grp_id
                            sta[ele?.station_name][ele?.sensor_name]['tag_address'].ele?.tag_address
                            sta[ele?.station_name][ele?.sensor_name]['unit'].ele?.unit
                            sta[ele?.station_name][ele?.sensor_name]['manufacture'].ele?.manufacture
                            sta[ele?.station_name][ele?.sensor_name]['type'].ele?.type
                            sta[ele?.station_name][ele?.sensor_name]['sensor_type'].ele?.sensor_type
                            sta[ele?.station_name][ele?.sensor_name]['lsl'].ele?.lsl
                            sta[ele?.station_name][ele?.sensor_name]['hsl'].ele?.hsl
                            sta[ele?.sensor_type][ele?.station_name]['lsl_delay'].ele?.lsl_delay
                            sta[ele?.sensor_type][ele?.station_name]['hsl_delay'].ele?.hsl_delay
                            sta[ele?.station_name][ele?.sensor_name]['description'].ele?.description
                            console.log('if,if',sta[ele?.station_name][ele?.sensor_name]['sensor_name'].ele?.sensor_name);
                        } else {
                            sta[ele?.station_name][ele?.sensor_name] = {
                                "id": ele?.grp_id,
                                "sensor_name": ele?.sensor_name,
                                "tag_address": ele?.tag_address,
                                "unit": ele?.unit,
                                "manufacture": ele?.manufacture,
                                "type": ele?.type,
                                "sensor_type": ele?.sensor_type,
                                "lsl": ele?.lsl,
                                "hsl": ele?.hsl,
                                "lsl_delay":ele?.lsl_delay,
                                "hsl_delay":ele?.hsl_delay,
                                "description": ele?.description,
                            }
                            // console.log('if,if,else',sta);
                        }  
                    } 
                    else {
                        sta[ele?.station_name] = {}
                        if(sta[ele?.station_name][ele?.sensor_name]){
                            sta[ele?.station_name][ele?.sensor_name]['sensor_name'].ele?.sensor_name
                            sta[ele?.station_name][ele?.sensor_name]['id'].ele?.grp_id
                            sta[ele?.station_name][ele?.sensor_name]['tag_address'].ele?.tag_address
                            sta[ele?.station_name][ele?.sensor_name]['unit'].ele?.unit
                            sta[ele?.station_name][ele?.sensor_name]['manufacture'].ele?.manufacture
                            sta[ele?.station_name][ele?.sensor_name]['type'].ele?.type
                            sta[ele?.station_name][ele?.sensor_name]['sensor_type'].ele?.sensor_type
                            sta[ele?.station_name][ele?.sensor_name]['lsl'].ele?.lsl
                            sta[ele?.station_name][ele?.sensor_name]['hsl'].ele?.hsl
                            sta[ele?.sensor_type][ele?.station_name]['lsl_delay'].ele?.lsl_delay
                            sta[ele?.sensor_type][ele?.station_name]['hsl_delay'].ele?.hsl_delay
                            sta[ele?.station_name][ele?.sensor_name]['description'].ele?.description

                            // console.log('if,else,if',sta);
                        } else {
                            sta[ele?.station_name][ele?.sensor_name] = {
                                "id": ele?.grp_id,
                                "sensor_name": ele?.sensor_name,
                                "tag_address": ele?.tag_address,
                                "unit": ele?.unit,
                                "manufacture": ele?.manufacture,
                                "type": ele?.type,
                                "sensor_type": ele?.sensor_type,
                                "lsl": ele?.lsl,
                                "hsl": ele?.hsl,
                                "lsl_delay":ele?.lsl_delay,
                                "hsl_delay":ele?.hsl_delay,
                                "description": ele?.description,
                            }
                            // console.log('if,else,if,else',sta);
                        }
                    }
                }      
             await res.json({status:true,Result:sta})
    } catch (error) {
        console.error(error)
    }
}

// for groupwise data
exports.getGroupingtypevalue=async function(req,res){
    // Format the sensor configuration list on the groupwise
    try {
        var sta={}
            const select =  await sequelize.query(`SELECT * FROM grouping_configuration`);
                for await (const ele of select[0]) {
                    if(sta[ele?.sensor_type]){
                        if(sta[ele?.sensor_type][ele?.station_name]){
                            sta[ele?.sensor_type][ele?.station_name]['id'].ele?.grp_id
                            sta[ele?.sensor_type][ele?.station_name]['station_name'].ele?.station_name
                            sta[ele?.sensor_type][ele?.station_name]['sensor_name'].ele?.sensor_name
                            sta[ele?.sensor_type][ele?.station_name]['tag_address'].ele?.tag_address
                            sta[ele?.sensor_type][ele?.station_name]['unit'].ele?.unit
                            sta[ele?.sensor_type][ele?.station_name]['manufacture'].ele?.manufacture
                            sta[ele?.sensor_type][ele?.station_name]['lsl'].ele?.lsl
                            sta[ele?.sensor_type][ele?.station_name]['hsl'].ele?.hsl
                            sta[ele?.sensor_type][ele?.station_name]['lsl_delay'].ele?.lsl_delay
                            sta[ele?.sensor_type][ele?.station_name]['hsl_delay'].ele?.hsl_delay
                            sta[ele?.sensor_type][ele?.station_name]['description'].ele?.description
                        console.log('sta',sta)
                        } else {
                            sta[ele?.sensor_type][ele?.station_name] = {
                                "id": ele?.grp_id,
                                "station_name": ele?.station_name,
                                "sensor_name": ele?.sensor_name,
                                "tag_address": ele?.tag_address,
                                "unit": ele?.unit,
                                "manufacture": ele?.manufacture,
                                "lsl": ele?.lsl,
                                "hsl": ele?.hsl,
                                "lsl_delay":ele?.lsl_delay,
                                "hsl_delay":ele?.hsl_delay,
                                "description": ele?.description,
                            }
                        }  
                    } 
                    else {
                        sta[ele?.sensor_type] = {}
                        if(sta[ele?.sensor_type][ele?.station_name]){
                            sta[ele?.sensor_type][ele?.station_name]['id'].ele?.grp_id
                            sta[ele?.sensor_type][ele?.station_name]['station_name'].ele?.station_name
                            sta[ele?.sensor_type][ele?.station_name]['sensor_name'].ele?.sensor_name
                            sta[ele?.sensor_type][ele?.station_name]['tag_address'].ele?.tag_address
                            sta[ele?.station_name][ele?.sensor_name]['unit'].ele?.unit
                            sta[ele?.sensor_type][ele?.station_name]['manufacture'].ele?.manufacture
                            sta[ele?.sensor_type][ele?.station_name]['lsl'].ele?.lsl
                            sta[ele?.sensor_type][ele?.station_name]['hsl'].ele?.hsl
                            sta[ele?.sensor_type][ele?.station_name]['lsl_delay'].ele?.lsl_delay
                            sta[ele?.sensor_type][ele?.station_name]['hsl_delay'].ele?.hsl_delay
                            sta[ele?.sensor_type][ele?.station_name]['description'].ele?.description
                        } else {
                            sta[ele?.sensor_type][ele?.station_name] = {
                                "id": ele?.grp_id,
                                "station_name": ele?.station_name,
                                "sensor_name": ele?.sensor_name,
                                "tag_address": ele?.tag_address,
                                "unit": ele?.unit,
                                "manufacture": ele?.manufacture,
                                "lsl": ele?.lsl,
                                "hsl": ele?.hsl,
                                "lsl_delay":ele?.lsl_delay,
                                "hsl_delay":ele?.hsl_delay,
                                "description": ele?.description,
                            }
                        }
                    }
                }      
             await res.json({status:true,Result:sta})          
    } catch (error) {
        console.error(error)
    }
}
