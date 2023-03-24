const db = require('../model/dbconfig')
const moment = require('moment');
const axios = require('axios');
var settings = require('../configuration/config.json')
const sequelize = require("../model/database");

exports.addGroupingsensorvalue = async function (req, res) {
    // Add new sensor to the database based on the sensor group configuration
    var timestamp = moment().format('YYYY-MM-DD HH:mm:ss:SSS')
    var rows = await sequelize.query(`SELECT * FROM grouping_configuration where tag_address='${req.body.sensor_address}' AND station_name='${req.body.station_name}'`);
    console.log(`SELECT * FROM grouping_configuration where tag_address='${req.body.sensor_address}' AND station_name='${req.body.station_name}'`);
    if (rows[0].length === 1) {
        res.json({ status: false, result: "This sensor name or tag address is already exits in this station!!!" });
    } else if (`${req.body.type}` == "sensor") {
        const insert = `insert into grouping_configuration(station_name,sensor_name,tag_address,unit,manufacture,type,sensor_type,lsl,hsl,lsl_delay,hsl_delay,description)values(
                '${req.body.station_name}','${req.body.sensor_name}','${req.body.sensor_address}','${req.body.unit}','${req.body.manufacture}','${req.body.type}','${req.body.sensor_name}',${req.body.lsl},${req.body.hsl},${req.body.lsl_delay},${req.body.hsl_delay},'${req.body.description}')`;
        console.log(insert);
        sequelize.query(insert).then(([insertRecord, fields]) => {
            axios.get(settings.serviceUrl + '/generateplcdata')
            res.json({ status: true, result: "Created sensor details Successfully!" })
        }).catch(console.log);

    } else if (`${req.body.type}` == "type") {
        console.log("type", `SELECT * FROM limit_configuration where limits_id='${req.body.id}' `);
        var limitRecord = await sequelize.query(`SELECT * FROM limit_configuration where limits_id='${req.body.id}' `);
        limitRecord[0].forEach(async (data) => {
            const insert = `insert into grouping_configuration(station_name,sensor_name,tag_address,unit,manufacture,type,sensor_type,lsl,hsl,lsl_delay,hsl_delay,description)values('${req.body.station_name}','${req.body.sensor_name}','${req.body.sensor_address}','${req.body.unit}','${req.body.manufacture}','${req.body.type}','${data.sensor_name}',${data.lsl},${data.hsl},${req.body.lsl_delay},${req.body.hsl_delay},'${req.body.description}')`;
            console.log(insert);
            sequelize.query(insert).then(([insertRecord, fields]) => {
                axios.get(settings.serviceUrl + '/generateplcdata')
                res.json({ status: true, result: "Created type details Successfully!" })
            }).catch(console.log);

        });
    }
}
exports.updateGroupingsensorvalue = async function (req, res) {
    // Update sensor to the database based on the sensor group configuration
    try {

        const select = `SELECT * FROM grouping_configuration where grp_id='${req.body.id}'`;
        console.log(select);
        sequelize.query(select).then(([selectRecord, fields]) => {
            if (selectRecord.length == 1) {
                const update = `update grouping_configuration set sensor_name='${req.body.sensor_name}',tag_address='${req.body.sensor_address}',unit='${req.body.unit}',manufacture= '${req.body.manufacture}',sensor_type='${req.body.sensor_type}',lsl=${req.body.lsl},hsl=${req.body.hsl},lsl_delay=${req.body.lsl_delay},hsl_delay=${req.body.hsl_delay},description='${req.body.description}' where grp_id='${req.body.id}' `;
                console.log(update);
                sequelize.query(update).then(([updatedRecords, fields]) => {
                    axios.get(settings.serviceUrl + '/generateplcdata')
                    res.json({ status: true, result: "Grouping sensor details updated successfully!" })
                }).catch(console.log);
            } else {
                res.json({ status: false, result: "No records!!!" });
            }
        }).catch(console.log);
    } catch (error) {
        console.log(error);
    }





    // db.query(`SELECT * FROM grouping_configuration where grp_id='${req.body.id}' `, function (err, rows) {
    //   if(err) console.log(err)
    // if(rows.length==1){
    //           db.query(`update grouping_configuration set sensor_name='${req.body.sensor_name}',tag_address='${req.body.sensor_address}',unit='${req.body.unit}',manufacture= '${req.body.manufacture}',sensor_type='${req.body.sensor_type}',lsl=${req.body.lsl},hsl=${req.body.hsl},lsl_delay=${req.body.lsl_delay},hsl_delay=${req.body.hsl_delay},description='${req.body.description}' where grp_id='${req.body.id}' `, function(err,validate){ 
    //      if(err) console.log(err)
    //    else{
    //      res.json({status:true, result:"Grouping sensor details updated successfully!"})
    //    axios.get(settings.serviceUrl+'/generateplcdata')
    // }
    // })       
    // }
    //else{
    //  res.json({status:false,result:"No records!!!"})
    // }
    //})
    //} catch (error) {
    //  console.error(error)
    //}
}
exports.deleteGroupingsensorvalue = async function (req, res) {
    // Delete the selected sensor in the database
    try {

        const select = `SELECT * FROM grouping_configuration where grp_id='${req.body.id}' `;
        sequelize.query(select).then(([selectRecord, fields]) => {
            const delet = `DELETE FROM grouping_configuration where grp_id='${req.body.id}'`;
            sequelize.query(delet).then(([deleteRecord, fields]) => {
                res.json({ status: true, result: "Groping sensor details Deleted Successfully!" })
            }).catch(console.log);

        }).catch(console.log);

        //db.query(`SELECT * FROM grouping_configuration where grp_id='${req.body.id}' `, function (err, rows) {        
        //    if(err) console.log(err)            
        //   else if(rows.length==1){
        //        db.query(`DELETE FROM grouping_configuration where grp_id='${req.body.id}' `, function (err, result) {
        //        })
        //   }else if(rows.length==0){
        //       res.json({status:false,result:"No Records!!!"})
        //   }            
        //})
    } catch (error) {
        console.error(error)
    }
}
exports.getGroupingsensorvalue = async function (req, res) {
    // Format the sensor configuration list on the stationwise
    try {
        var sta = {}
        const select = await sequelize.query(`SELECT * FROM grouping_configuration`);
        for await (const ele of select[0]) {
            if (sta[ele?.station_name]) {
                if (sta[ele?.station_name][ele?.sensor_name]) {
                    //console.log("if if",sta[ele?.station_name]);
                    sta[ele?.station_name][ele?.sensor_name]['sensor_name'].ele?.sensor_name
                    sta[ele?.station_name][ele?.sensor_name]['id'].ele?.grp_id
                    sta[ele?.station_name][ele?.sensor_name]['tag_address'].ele?.tag_address
                    sta[ele?.station_name][ele?.sensor_name]['unit'].ele?.unit
                    sta[ele?.station_name][ele?.sensor_name]['manufacture'].ele?.manufacture
                    sta[ele?.station_name][ele?.sensor_name]['type'].ele?.type
                    sta[ele?.station_name][ele?.sensor_name]['sensor_type'].ele?.sensor_type
                    sta[ele?.station_name][ele?.sensor_name]['lsl'].ele?.lsl
                    sta[ele?.station_name][ele?.sensor_name]['hsl'].ele?.hsl
                    sta[ele?.station_name][ele?.sensor_name]['lsl_delay'].ele?.lsl_delay
                    sta[ele?.station_name][ele?.sensor_name]['hsl_delay'].ele?.hsl_delay
                    sta[ele?.station_name][ele?.sensor_name]['description'].ele?.description
                } else {
                    // console.log("if if else");
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
                        "lsl_delay": ele?.lsl_delay,
                        "hsl_delay": ele?.hsl_delay,
                        "description": ele?.description,
                    }
                }
            }
            else {
                sta[ele?.station_name] = {}
                if (sta[ele?.station_name][ele?.sensor_name]) {
                    // console.log("if else if");
                    sta[ele?.station_name][ele?.sensor_name]['sensor_name'].ele?.sensor_name
                    sta[ele?.station_name][ele?.sensor_name]['id'].ele?.grp_id
                    sta[ele?.station_name][ele?.sensor_name]['tag_address'].ele?.tag_address
                    sta[ele?.station_name][ele?.sensor_name]['unit'].ele?.unit
                    sta[ele?.station_name][ele?.sensor_name]['manufacture'].ele?.manufacture
                    sta[ele?.station_name][ele?.sensor_name]['type'].ele?.type
                    sta[ele?.station_name][ele?.sensor_name]['sensor_type'].ele?.sensor_type
                    sta[ele?.station_name][ele?.sensor_name]['lsl'].ele?.lsl
                    sta[ele?.station_name][ele?.sensor_name]['hsl'].ele?.hsl
                    sta[ele?.station_name][ele?.sensor_name]['lsl_delay'].ele?.lsl_delay
                    sta[ele?.station_name][ele?.sensor_name]['hsl_delay'].ele?.hsl_delay
                    sta[ele?.station_name][ele?.sensor_name]['description'].ele?.description
                } else {
                    // console.log("if else if else");
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
                        "lsl_delay": ele?.lsl_delay,
                        "hsl_delay": ele?.hsl_delay,
                        "description": ele?.description,
                    }
                }
            }
            //console.log(sta);
        }
        await res.json({ status: true, Result: sta })
    } catch (error) {
        console.error(error)
    }
}

// for groupwise data
exports.getGroupingtypevalue = async function (req, res) {
    // Format the sensor configuration list on the groupwise
    try {
        var sta = {}
        const select = await sequelize.query(`SELECT * FROM grouping_configuration`);
        for await (const ele of select[0]) {
            if (sta[ele?.sensor_type]) {
                if (sta[ele?.sensor_type][ele?.sensor_name]) {
                    sta[ele?.sensor_type][ele?.sensor_name]['id'].ele?.grp_id
                    sta[ele?.sensor_type][ele?.sensor_name]['sensor_name'].ele?.sensor_name
                    sta[ele?.sensor_type][ele?.sensor_name]['station_name'].ele?.station_name
                    sta[ele?.sensor_type][ele?.sensor_name]['tag_address'].ele?.tag_address
                    sta[ele?.sensor_type][ele?.sensor_name]['unit'].ele?.unit
                    sta[ele?.sensor_type][ele?.sensor_name]['manufacture'].ele?.manufacture
                    sta[ele?.sensor_type][ele?.sensor_name]['lsl'].ele?.lsl
                    sta[ele?.sensor_type][ele?.sensor_name]['hsl'].ele?.hsl
                    sta[ele?.sensor_type][ele?.sensor_name]['lsl_delay'].ele?.lsl_delay
                    sta[ele?.sensor_type][ele?.sensor_name]['hsl_delay'].ele?.hsl_delay
                    sta[ele?.sensor_type][ele?.sensor_name]['description'].ele?.description
                } else {
                    sta[ele?.sensor_type][ele?.sensor_name] = {
                        "id": ele?.grp_id,
                        "sensor_name": ele?.sensor_name,
                        "station_name": ele?.station_name,
                        "tag_address": ele?.tag_address,
                        "unit": ele?.unit,
                        "manufacture": ele?.manufacture,
                        "lsl": ele?.lsl,
                        "hsl": ele?.hsl,
                        "lsl_delay": ele?.lsl_delay,
                        "hsl_delay": ele?.hsl_delay,
                        "description": ele?.description,
                    }
                }
            }
            else {
                sta[ele?.sensor_type] = {}
                if (sta[ele?.sensor_type][ele?.sensor_name]) {
                    sta[ele?.sensor_type][ele?.sensor_name]['id'].ele?.grp_id
                    sta[ele?.sensor_type][ele?.sensor_name]['sensor_name'].ele?.sensor_name
                    sta[ele?.sensor_type][ele?.sensor_name]['station_name'].ele?.station_name
                    sta[ele?.sensor_type][ele?.sensor_name]['tag_address'].ele?.tag_address
                    sta[ele?.sensor_type][ele?.sensor_name]['unit'].ele?.unit
                    sta[ele?.sensor_type][ele?.sensor_name]['manufacture'].ele?.manufacture
                    sta[ele?.sensor_type][ele?.sensor_name]['lsl'].ele?.lsl
                    sta[ele?.sensor_type][ele?.sensor_name]['hsl'].ele?.hsl
                    sta[ele?.sensor_type][ele?.sensor_name]['lsl_delay'].ele?.lsl_delay
                    sta[ele?.sensor_type][ele?.sensor_name]['hsl_delay'].ele?.hsl_delay
                    sta[ele?.sensor_type][ele?.sensor_name]['description'].ele?.description
                } else {
                    sta[ele?.sensor_type][ele?.sensor_name] = {
                        "id": ele?.grp_id,
                        "sensor_name": ele?.sensor_name,
                        "station_name": ele?.station_name,
                        "tag_address": ele?.tag_address,
                        "unit": ele?.unit,
                        "manufacture": ele?.manufacture,
                        "lsl": ele?.lsl,
                        "hsl": ele?.hsl,
                        "lsl_delay": ele?.lsl_delay,
                        "hsl_delay": ele?.hsl_delay,
                        "description": ele?.description,
                    }
                }
            }
        }
        await res.json({ status: true, Result: sta })
    } catch (error) {
        console.error(error)
    }
}
