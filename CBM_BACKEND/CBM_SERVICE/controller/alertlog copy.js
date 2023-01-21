const moment=require('moment');
const sequelize = require("../model/database");
const db= require('../model/dbconfig')
var settings = require('../configuration/config.json')
var timeStamp= moment().format('YYYY-MM-DD HH:mm:ss.SSS')
var date= moment().format('YYYY-MM-DD')
exports.alertLog =async function(ele,data){
    console.log(ele,data);
    try {
        var alm={}
        var timeStamp= moment().format('YYYY-MM-DD HH:mm:ss.SSS')
        var date= moment().format('YYYY-MM-DD')
        var stan = Object.keys(data).map(k => ({ [k]: data[k] }));
    await stan.forEach(key=>{
        var sensorname = Object.keys(key)
        var actualvalue = Object.values(key)
        db.query(`select distinct station_name,sensor_name,lsl,hsl from grouping_configuration `,function(err,result){
            db.query(`select * from alert_log where  station='${ele}' AND sensor='${sensorname}'AND fault_type='Instant' OR fault_type='One minute' AND start_time > now() - interval 1 minute `, function(err,alertres){
            // alertres.forEach(datas => {
                db.query(`select * from alert_log where station= '${ele}' AND sensor='${sensorname}' AND fault_type='Instant' AND start_time < now() - interval
                 ${settings.alertqurey_intervaltime} ${settings.alert_timeformat} `, function(err,tenmins){
                //  })
                if(err) console.log(err)
                result.forEach(element => {
                    var ll=element.lsl
                    var hl=element.hsl
                    if (ele==element.station_name && sensorname==element.sensor_name && actualvalue[0] < ll && !alertres.length) {
                        // db.query(`select * from alert_log where station= '${ele}' AND sensor='${sensorname}' AND fault_type ='Instant' AND end_time='' ` , function(err,instantlog){
                            db.query(`select * from grouping_configuration where lsl < '${actualvalue[0]}'` , function(err,instantlog){
                            if(instantlog.length>0){
                                db.query(`insert into alert_log(station,sensor,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,date)values(
                                    '${ele}','${element.sensor_name}','Low limit','Instant','${ll}','${actualvalue[0]}','${hl}','${timeStamp}',"",'${date}')`,function(err,result){ 
                                        if (err) console.log(err)
                                    });
                                }
                            })
                    } else if(ele==element.station_name && sensorname==element.sensor_name && actualvalue[0] > hl && !alertres.length) {
                        // db.query(`select * from alert_log where station= '${ele}' AND sensor='${sensorname}' AND fault_type ='Instant' AND end_time='' ` , function(err,instantlog){
                            db.query(`select * from grouping_configuration where hsl > '${actualvalue[0]}'` , function(err,instantlog){    
                        if(instantlog.length>0){
                        db.query(`insert into alert_log(station,sensor,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,date)values(
                                '${ele}','${element.sensor_name}','High limit','Instant','${ll}','${actualvalue[0]}','${hl}','${timeStamp}',"",'${date}')`,function(err,result){ 
                                    if (err) console.log(err)
                                });
                            }
                        })
                    }
                    // else if(tenmins.length > 0){
                        // oneminsAlarm(ele,sensorname,actualvalue,ll,hl)
                    // }
                    else if(ele==element.station_name && sensorname==element.sensor_name && actualvalue[0] < ll && tenmins.length>0){
                        db.query(`select * from alert_log where fault_type='One minute' OR fault_type='Instant' AND station='${ele}' AND sensor='${sensorname}'AND start_time > now() - interval 1 minute `, function(err,oneminalm){
                            if (!oneminalm.length) {
                                db.query(`insert into alert_log(station,sensor,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,date)values(
                                    '${ele}','${element.sensor_name}','Low limit','One minute','${ll}','${actualvalue[0]}','${hl}','${timeStamp}',"",'${date}')`,function(err,result){ 
                                        if (err) console.log(err)
                                    });                            
                            }
                        })                        
                    } else if(ele==element.station_name && sensorname==element.sensor_name && actualvalue[0] > hl && tenmins.length>0){
                        db.query(`select * from alert_log where fault_type='One minute'  OR fault_type='Instant' AND station='${ele}' AND sensor='${sensorname}'AND  start_time > now() - interval 1 minute `, function(err,onemin){
                            console.log("1",onemin.length)
                            if (onemin.length>0) {
                                db.query(`select * from alert_log where fault_type='One minute' AND station='${ele}' AND sensor='${sensorname}'AND  start_time > now() - interval 1 minute `, function(err,oldalm){
                                    if(!oldalm.length){
                                        console.log("2")
                                        db.query(`insert into alert_log(station,sensor,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,date)values(
                                            '${ele}','${element.sensor_name}','High limit','One minute','${ll}','${actualvalue[0]}','${hl}','${timeStamp}',"",'${date}')`,function(err,result){ 
                                                if (err) console.log(err)
                                            });
                                    }
                                })                                
                            }
                        })                        
                    }
                 // alertres.forEach(datas=>{
                        // var start_date = moment(datas.start_time, 'YYYY-MM-DD HH:mm:ss');
                        // var end_date = moment(timeStamp, 'YYYY-MM-DD HH:mm:ss');
                        // var duration = moment.duration(end_date.diff(start_date));
                        // var minutes = duration.asSeconds();
                        // console.log(minutes)
                    //     db.query(`select * from alert_log where station='${ele}' AND sensor='${sensorname}' AND fault_type='Instant' AND start_time < now() - interval 1 minute  `, function(err,onemins){
                    //     if (err) console.log(err)
                    //     onemins.forEach(datas=>{
                    //     if(ele==datas.station && sensorname==datas.sensor && actualvalue[0] < ll && onemins.length>0){
                    //         db.query(`insert into alert_log(station,sensor,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,date)values(
                    //             '${data.station}','${data.sensor}','Low limit','One minute','${ll}','${actualvalue[0]}','${hl}','${timeStamp}',"",'${date}')`,function(err,result){ 
                    //                 if (err) console.log(err)
                    //             });
                    //     } else if(ele==datas.station && sensorname==datas.sensor && actualvalue[0] > hl && onemins.length>0){
                    //         db.query(`insert into alert_log(station,sensor,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,date)values(
                    //             '${ele}','${sensorname}','High limit','One minute','${ll}','${actualvalue[0]}','${hl}','${timeStamp}',"",'${date}')`,function(err,result){ 
                    //                 if (err) console.log(err)
                    //             });
                    //         }
                    //     })
                    // })
                    
                
                // instantres.forEach(datas=>{
                    // var faulttype=datas.fault_type
                    // console.log("*********************",onemins,onemins!='Oneminute',datas.timestamp)
                //     clearInterval(clear)
                //    var clear= setInterval(() => {
                //         db.query(`select * from alert_log where station= '${ele}' AND sensor='${sensorname}'  AND fault_type='Instant' AND timestamp > now() - interval
                //           ${settings.alertqurey_intervaltime} ${settings.alert_timeformat} `, function(err,instantres){
                //             if (ele==element.station_name && sensorname==element.sensor_name && actualvalue[0] < ll) {
                //                 db.query(`insert into alert_log(station,sensor,alert_type,fault_type,lsl,alert_value,hsl,timestamp,date)values(
                //                     '${ele}','${element.sensor_name}','Low limit','Oneminute','${ll}','${actualvalue[0]}','${hl}','${timeStamp}','${date}')`,function(err,result){ 
                //                         if (err) console.log(err)
                //                     });
                //             } else if(ele==element.station_name && sensorname==element.sensor_name && actualvalue[0] > hl) {
                //                 db.query(`insert into alert_log(station,sensor,alert_type,fault_type,lsl,alert_value,hsl,timestamp,date)values(
                //                     '${ele}','${element.sensor_name}','High limit','Oneminute','${ll}','${actualvalue[0]}','${hl}','${timeStamp}','${date}')`,function(err,result){ 
                //                         if (err) console.log(err)
                //                     });
                //             }
                //           })
                //     }, 60000);                  
                    // console.log("******************",datas.fault_type)
                // })
            });
            // })    
        })
    })
})
        // })
    })
    } catch (error) {
        console.log(error)
    }
}
function oneminsAlarm(ele,sensorname,actualvalue,ll,hl) {
    // console.log("asdf")
    // db.query(`select distinct station,sensor from alert_log`, function(err,onemins){
        db.query(`select * from alert_log where station='${ele}' AND sensor='${sensorname}' AND fault_type='Instant' AND start_time > now() - interval 1 minute  `, function(err,onemins){
            if (err) console.log(err)
            onemins.forEach(element=>{
                db.query(`select * from alert_log where station='${element.station}' AND sensor='${element.sensor}'  AND start_time > now() - interval 1 minute  `, function(err,oneminsres){
                oneminsres.forEach(datas => {
                // console.log("HIGH LIMIT*****@@@@")
                    if(ele==datas.station && sensorname==datas.sensor && actualvalue[0] < ll && datas.fault_type!='One minute'){
                        // if (datas.fault_type!='One minute') {
                            db.query(`insert into alert_log(station,sensor,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,date)values(
                                '${datas.station}','${datas.sensor}','Low limit','One minute','${ll}','${actualvalue[0]}','${hl}','${timeStamp}',"",'${date}')`,function(err,result){ 
                                    if (err) console.log(err)
                                });
                            // }
                        } else if(ele==datas.station && sensorname==datas.sensor && actualvalue[0] > hl && datas.fault_type!='One minute'){
                            // if (datas.fault_type!='One minute') {
                            // console.log("HIGH LIMIT")
                                db.query(`insert into alert_log(station,sensor,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,date)values(
                                    '${datas.station}','${datas.sensor}','High limit','One minute ','${ll}','${actualvalue[0]}','${hl}','${timeStamp}',"",'${date}')`,function(err,result){ 
                                        if (err) console.log(err)
                                    });
                                // }
                            }
                        })
                    })
                });                    
            })
        }

// console.log(alertres.length)
                    // if (alertres.length>0) {
                    //     for (const alert of alertres) {
                    //         if (alm[alert?.station]) { 
                    //             if (alm[alert?.station][alert?.sensor]) {
                    //                 alm[alert?.station][alert?.sensor]['station'].alert?.station
                    //                 alm[alert?.station][alert?.sensor]['sensor'].alert?.sensor
                    //                 alm[alert?.station][alert?.sensor]['timestamp'].alert?.timestamp
                    //             }                               
                    //             else{
                    //             alm[alert?.station][alert?.sensor]={
                    //                 "station":alert?.station,
                    //                 "sensor":alert?.sensor,
                    //                 "timestamp":alert?.timestamp
                    //             }
                    //         }
                    //     }
                    //     else{
                    //         alm[alert?.station]={}
                    //         if(alm[alert?.station][alert?.sensor]) {
                    //             alm[alert?.station][alert?.sensor]['station'].alert?.station
                    //             alm[alert?.station][alert?.sensor]['sensor'].alert?.sensor
                    //             alm[alert?.station][alert?.sensor]['timestamp'].alert?.timestamp
                    //         }else{
                    //         alm[alert?.station][alert?.sensor]={
                    //             "station":alert?.station,
                    //             "sensor":alert?.sensor,
                    //             "timestamp":alert?.timestamp
                    //         }
                    //         }
                    //     }
                    //     }
                    //     console.log(alm)
                    // }


exports.alertAPI =async function(req,res){
    try {
        var sta={}
            const select =  await sequelize.query(`select * from alert_log order by alert_id  desc`);
            for await (const ele of select[0]) {
                if(sta[ele?.station]){
                    if(sta[ele?.station][ele?.sensor]){
                        sta[ele?.station][ele?.sensor]['lsl'].ele?.lsl
                        sta[ele?.station][ele?.sensor]['hsl'].ele?.hsl
                        sta[ele?.station][ele?.sensor]['alert_type'].ele?.alert_type
                        sta[ele?.station][ele?.sensor]['alert_value'].ele?.alert_value
                        sta[ele?.station][ele?.sensor]['fault_type'].ele?.fault_type
                        sta[ele?.station][ele?.sensor]['timestamp'].ele?.start_time
                    } 
                    else {
                        sta[ele?.station][ele?.sensor] = {
                            "lsl": ele?.lsl,
                            "alert_value": ele?.alert_value,
                            "hsl": ele?.hsl,
                            "alert_type":ele?.alert_type,
                            "fault_type":ele?.fault_type,
                            "timestamp":ele?.start_time,
                        }
                    }  
                } else {
                    sta[ele?.station] = {}
                    if(sta[ele?.station][ele?.sensor]){
                        sta[ele?.station][ele?.sensor]['lsl'].ele?.lsl
                        sta[ele?.station][ele?.sensor]['hsl'].ele?.hsl
                        sta[ele?.station][ele?.sensor]['alert_type'].ele?.alert_type
                        sta[ele?.station][ele?.sensor]['alert_value'].ele?.alert_value
                        sta[ele?.station][ele?.sensor]['fault_type'].ele?.fault_type
                        sta[ele?.station][ele?.sensor]['timestamp'].ele?.start_time
                    } else {
                        sta[ele?.station][ele?.sensor] = {
                            "lsl": ele?.lsl,
                            "alert_value": ele?.alert_value,
                            "hsl": ele?.hsl,
                            "alert_type":ele?.alert_type,
                            "fault_type":ele?.fault_type,
                            "timestamp":ele?.start_time,
                        }
                    }
                }
            }
        // }
        // console.log(sta)
         await res.json({status:true,Result:sta})
        } catch (error) {
            console.log(error)
        }
}