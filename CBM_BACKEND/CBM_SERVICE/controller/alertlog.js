const moment=require('moment');
const sequelize = require("../model/database");
const db= require('../model/dbconfig')
var nodemailer = require('nodemailer')
var smtpTransport= require('nodemailer-smtp-transport')
var settings = require('../configuration/config.json')
var store=require('store2');
var emailCredentials=require('../configuration/emailconfig.json')
const fs=require('fs')
var fastcsv=require('fast-csv')


// individual alarm email generation
async function emailGeneration(param) {
    db.query(`SELECT * FROM email_configuration where active='true'`,async function(err,data){
            let receivers=[]
            if(err){
                console.log(err);
            }
            data.forEach((e,i)=>{
                receivers.push(e?.mail_id);
            })
            let testAccount = await nodemailer.createTestAccount();
            let transporter = nodemailer.createTransport({
            host: emailCredentials?.host,
            port: 465,
            secure: true, 
            auth: {
                user: emailCredentials?.sender, 
                pass: emailCredentials?.pass, 
            },
            });
        
            let info = await transporter.sendMail({
            from: emailCredentials?.sender, 
            to: receivers, 
            subject: "Alarm Triggered", 
            text: "Alarm Mail", 
            html: param, 
            });
        
            console.log("Message sent: %s", info.messageId);
        
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        })
  }
  
// csv Creation for over all active alarms
function CsvFileGenerate(){
    try {
        db.query(`SELECT * from alert_log where status= 'Active' `, function (err, data) {  
            if (err) throw err;
              const jsonData = JSON.parse(JSON.stringify(data));
              const ws = fs.createWriteStream('D:/cbm/CBM Projects/CBM_BACKEND/CBM_SERVICE/controller/Alarm.csv');      
              fastcsv
              .write(jsonData) // with header
                .on("finish", function () {
                  console.log("CSV File created Sucessfully!");
                })
                .pipe(ws);
            });        
    } catch (error) {        
        console.error(error);        
    }
  }

// over all active alarms email generation
  async function overallEmailGeneration(param) {
    db.query(`SELECT * FROM email_configuration where active='true'`,async function(err,data){
        let receivers=[]
        if(err){
            console.log(err);
        }
        data.forEach((e,i)=>{
            receivers.push(e?.mail_id);
        })
        db.query(`SELECT distinct station FROM alert_log`,async function(err,data){
            let layout=""
            data.forEach((e,i,arr)=>{
                db.query(`SELECT COUNT(sensor) FROM  alert_log where station='${e?.station}' AND status='Active'`,async function(err,res){
                    layout+=`<tr>
                                <td style="padding: 5px;border: 1px solid;">${e?.station.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())}</td>
                                <td style="padding: 5px;border: 1px solid;">${res[0]?.['COUNT(sensor)']}</td>
                            </tr>`
                    if(i=== arr.length-1){
                        let table=`
                                    <h2 style="font-weight:bold;text-align:center;padding:8px">Overall Alarm</h2>
                                    <div style="display: flex;justify-content: center;">
                                        <table style="text-align: center; width: 50%;border: 1px solid;border-collapse: collapse;">
                                            <thead style="background-color: #3F51B5;color:white;">
                                                <th style="padding: 5px;border: 1px solid black;">Station</th>
                                                <th style="padding: 5px;border: 1px solid black;">Active Alarms Count</th>
                                            </thead>
                                            <tbody>
                                                ${layout}
                                            </tbody>
                                        </table>
                                    </div>
                                    <p style="margin-top:10px; color:red; text-align:center">*Please download the attachment to get detail overall alarm list*</p>`
                        CsvFileGenerate()
                        let testAccount = await nodemailer.createTestAccount();
                        let transporter = nodemailer.createTransport({
                        host: emailCredentials?.host,
                        port: 465,
                        secure: true, 
                        auth: {
                            user: emailCredentials?.sender, 
                            pass: emailCredentials?.pass, 
                        },
                        });
                    
                        let info = await transporter.sendMail({
                        from: emailCredentials?.sender, 
                        //   to: emailCredentials?.receiver, 
                        to: receivers, 
                        subject: "Active Alarms", 
                        text: "Overall active alarms", 
                        html: table, 
                        attachments:[
                            {
                            filename: 'Alarm.csv',
                            path: __dirname + '/Alarm.csv',
                    
                        }]
                        });
                    
                        console.log("Message sent: %s", info.messageId);
                    
                        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                                        }
                })

            })
        })
    })
  }

// alert logging
exports.alertLog =async function(ele,data){
    try {
        var alm={}
        var timeStamp= moment().format('YYYY-MM-DD HH:mm:ss.SSS')
        var date= moment().format('YYYY-MM-DD')
        var stan = Object.keys(data).map(k => ({ [k]: data[k] }));
        db.query(`select distinct station_name,sensor_name,lsl,hsl,sensor_type,lsl_delay,hsl_delay from grouping_configuration `,function(err,result){
            result.forEach((element,i)=>{
                if(data?.[element?.sensor_name]!==undefined){
                    let alert_id="A_"+element?.station_name+"_"+element?.sensor_name+"_"+timeStamp;
                    // ALert enter into LSL range
                    if(parseFloat(data?.[element?.sensor_name].toFixed(2)) < element?.lsl){
                        db.query(`select * from alert_log where station='${element?.station_name}' AND sensor='${element?.sensor_name}'AND fault_type='Instant' AND status='Active'`,function(err,alertData){
                            if(alertData.length===0){
                                    if(store.get('lsl_delay')===null || moment(store.get("lsl_delay")).add(element?.lsl_delay,'seconds').format('YYYY-MM-DD HH:mm:ss.SSS')<=timeStamp){
                                        if(store.get('lsl_delay')===null){
                                            // console.log("lsl null executing",timeStamp);
                                        }else{    
                                            // console.log("start to logging",timeStamp);                                   
                                            db.query(`insert into alert_log(alert_no,station,sensor,sensor_type,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,duration,status,timelapse,date,remarks,acknowledge)values(
                                                '${alert_id}','${element?.station_name}','${element.sensor_name}','${element?.sensor_type}','Low limit','Instant','${element?.lsl}','${parseFloat(data?.[element?.sensor_name].toFixed(2))}','${element?.hsl}','${timeStamp}',' ',' ','Active',0,'${date}',' ',' ')`)
                                            let content=`<div style="padding:10px;border:1px solid black;text-align:center">
                                                            <h3 style="margin-bottom:10px">Station Name : ${element?.station_name.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())}</h3>
                                                            <h3 style="margin-bottom:10px">Sensor Name : ${element?.sensor_name.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())}</h3>
                                                            <h3 style="margin-bottom:10px">Alarm Type : Value crossed Low Limit</h3>
                                                            <h3 style="margin-bottom:10px">Low Limit Value : ${element?.lsl}</h3>
                                                            <h3 style="margin-bottom:10px">Actual Value : ${parseFloat(data?.[element?.sensor_name].toFixed(2))}</h3>
                                                            <h3 style="margin-bottom:10px">High Limit Value : ${element?.hsl}</h3>
                                                            <h3 style="margin-bottom:10px">Triggered Time : ${moment(timeStamp).add(element?.lsl_delay,'seconds').format('YYYY-MM-DD HH:mm:ss.SSS')}</h3>
                                                        </div>`
                                            // emailGeneration(content).catch(console.error);
                                        }
                                    store.set("lsl_delay",timeStamp)
                                }
                            }
                            else if(alertData.length!==0){
                                if(moment(alertData[0]?.start_time).add(1,'minutes').format('YYYY-MM-DD HH:mm:ss.SSS') <= timeStamp && moment(alertData[0]?.start_time).add(10,'minutes').format('YYYY-MM-DD HH:mm:ss.SSS') > timeStamp){
                                    db.query(`select * from alert_log where station='${element?.station_name}' AND sensor='${element?.sensor_name}' AND fault_type='One Minute' AND status='Active'`,function(err,activeCheck){
                                        if(activeCheck.length===0){
                                            db.query(`insert into alert_log(alert_no,station,sensor,sensor_type,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,duration,status,timelapse,date,remarks,acknowledge)values(
                                                '${alert_id}','${element?.station_name}','${element.sensor_name}','${element?.sensor_type}','Low limit','One minute','${element?.lsl}','${parseFloat(data?.[element?.sensor_name].toFixed(2))}','${element?.hsl}','${timeStamp}',' ',' ','Active',0,'${date}',' ',' ')`)
                                        }
                                    })
                                }
                                else if(moment(alertData[0]?.start_time).add(10,'minutes').format('YYYY-MM-DD HH:mm:ss.SSS') <= timeStamp===true){
                                    db.query(`select * from alert_log where station='${element?.station_name}' AND sensor='${element?.sensor_name}'AND fault_type='Ten minute' AND status='Active'`,function(err,alertMinData){
                                        if(alertMinData.length===0){
                                              db.query(`insert into alert_log(alert_no,station,sensor,sensor_type,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,duration,status,timelapse,date,remarks,acknowledge)values(
                                                '${alert_id}','${element?.station_name}','${element.sensor_name}','${element?.sensor_type}','Low limit','Ten Minute','${element?.lsl}','${parseFloat(data?.[element?.sensor_name].toFixed(2))}','${element?.hsl}','${timeStamp}',' ',' ','Active',0,'${date}',' ',' ')`)
                                       }
                                   })
                                }        
                                //Logging Timelapse 
                                var startLap = moment(alertData[0]?.start_time);
                                var endLap=moment(timeStamp);
                                var differLap=moment.duration(endLap.diff(startLap))
                                db.query(`update alert_log set timelapse='${differLap.hours()} Hr ${differLap.minutes()} Min ${differLap.seconds()}' where status='Active' AND station='${element?.station_name}' AND sensor='${element?.sensor_name}' AND alert_type='Low limit' `)
                            }
                        })
                    }

                    // ALert return into normal range 
                    else if(parseFloat(data?.[element?.sensor_name].toFixed(2)) > element?.lsl && parseFloat(data?.[element?.sensor_name].toFixed(2)) < element?.hsl){
                        db.query(`select * from alert_log where status='Active' AND station='${element?.station_name}' AND sensor='${element?.sensor_name}' AND alert_type='Low limit'`,function(err,updateLslStatus){
                            if(updateLslStatus.length!==0){
                                var start = moment(updateLslStatus[0]?.start_time);
                                var end=moment(moment(timeStamp).add(element?.lsl_delay,'seconds').format('YYYY-MM-DD HH:mm:ss.SSS'));
                                var differ=moment.duration(end.diff(start))
                                var duration=`${differ.hours()} Hr ${differ.minutes()} Min ${differ.seconds()} Sec`
                                db.query(`update alert_log set status='In Active',end_time='${moment(timeStamp).add(element?.lsl_delay,'seconds').format('YYYY-MM-DD HH:mm:ss.SSS')}',duration='${duration}' where status='Active' AND station='${element?.station_name}' AND sensor='${element?.sensor_name}'`,function(err,res){
                                })
                            }
                        })

                        db.query(`select * from alert_log where status='Active' AND station='${element?.station_name}' AND sensor='${element?.sensor_name}' AND alert_type='High limit'`,function(err,updateHslStatus){
                            if(updateHslStatus.length!==0){
                                var start = moment(updateHslStatus[0]?.start_time);
                                var end=moment(moment(timeStamp).add(element?.hsl_delay,'seconds').format('YYYY-MM-DD HH:mm:ss.SSS'));
                                var differ=moment.duration(end.diff(start))
                                var duration=`${differ.hours()} Hr ${differ.minutes()} Min ${differ.seconds()} Sec`
                                db.query(`update alert_log set status='In Active',end_time='${moment(timeStamp).add(element?.hsl_delay,'seconds').format('YYYY-MM-DD HH:mm:ss.SSS')}',duration='${duration}' where status='Active' AND station='${element?.station_name}' AND sensor='${element?.sensor_name}'`,function(err,res){
                                })
                            }
                        })
                    }

                    // ALert enter into HSL range 
                    else if(parseFloat(data?.[element?.sensor_name].toFixed(2)) > element?.hsl){
                        db.query(`select * from alert_log where station='${element?.station_name}' AND sensor='${element?.sensor_name}'AND fault_type='Instant' AND status='Active'`,function(err,alertData){
                            if(alertData.length===0){
                                if(store.get('hsl_delay')===null || moment(store.get("hsl_delay")).add(element?.hsl_delay,'seconds').format('YYYY-MM-DD HH:mm:ss.SSS')<=timeStamp){
                                    if(store.get('hsl_delay')===null){
                                        // console.log("hsl null executing",timeStamp);
                                    }else{          
                                        // console.log("start to hsl logging",timeStamp);                                                           
                                        db.query(`insert into alert_log(alert_no,station,sensor,sensor_type,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,duration,status,timelapse,date,remarks,acknowledge)values(
                                            '${alert_id}','${element?.station_name}','${element.sensor_name}','${element?.sensor_type}','High limit','Instant','${element?.lsl}','${parseFloat(data?.[element?.sensor_name].toFixed(2))}','${element?.hsl}','${timeStamp}',' ',' ','Active',0,'${date}',' ',' ')`)
                                        let content=`<div style="padding:10px;border:1px solid black;text-align:center">
                                            <h3 style="margin-bottom:10px">Station Name : ${element?.station_name.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())}</h3>
                                            <h3 style="margin-bottom:10px">Sensor Name : ${element?.sensor_name.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())}</h3>
                                            <h3 style="margin-bottom:10px">Alarm Type : Value crossed High Limit</h3>
                                            <h3 style="margin-bottom:10px">Low Limit Value : ${element?.lsl}</h3>
                                            <h3 style="margin-bottom:10px">Actual Value : ${parseFloat(data?.[element?.sensor_name].toFixed(2))}</h3>
                                            <h3 style="margin-bottom:10px">High Limit Value : ${element?.hsl}</h3>
                                            <h3 style="margin-bottom:10px">Triggered Time : ${moment(timeStamp).add(element?.lsl_delay,'seconds').format('YYYY-MM-DD HH:mm:ss.SSS')}</h3>
                                        </div>`
                                        // emailGeneration(content).catch(console.error);
                                    }
                                    store.set('hsl_delay',timeStamp)
                                }
                            }
                            else if(alertData.length!==0){
                                if(moment(alertData[0]?.start_time).add(1,'minutes').format('YYYY-MM-DD HH:mm:ss.SSS') <= timeStamp && moment(alertData[0]?.start_time).add(10,'minutes').format('YYYY-MM-DD HH:mm:ss.SSS') > timeStamp){
                                    db.query(`select * from alert_log where station='${element?.station_name}' AND sensor='${element?.sensor_name}' AND fault_type='One Minute' AND status='Active'`,function(err,activeCheck){
                                        if(activeCheck.length===0){
                                            db.query(`insert into alert_log(alert_no,station,sensor,sensor_type,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,duration,status,timelapse,date,remarks,acknowledge)values(
                                                '${alert_id}','${element?.station_name}','${element.sensor_name}','${element?.sensor_type}','High limit','One minute','${element?.lsl}','${parseFloat(data?.[element?.sensor_name].toFixed(2))}','${element?.hsl}','${timeStamp}',' ',' ','Active',0,'${date}',' ',' ')`)
                                        }
                                    })
                                }
                                else if(moment(alertData[0]?.start_time).add(10,'minutes').format('YYYY-MM-DD HH:mm:ss.SSS') <= timeStamp===true){
                                    db.query(`select * from alert_log where station='${element?.station_name}' AND sensor='${element?.sensor_name}'AND fault_type='Ten minute' AND status='Active'`,function(err,alertMinData){
                                        if(alertMinData.length===0){
                                              db.query(`insert into alert_log(alert_no,station,sensor,sensor_type,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,duration,status,timelapse,date,remarks,acknowledge)values(
                                                '${alert_id}','${element?.station_name}','${element.sensor_name}','${element?.sensor_type}','High limit','Ten Minute','${element?.lsl}','${parseFloat(data?.[element?.sensor_name].toFixed(2))}','${element?.hsl}','${timeStamp}',' ',' ','Active',0,'${date}',' ',' ')`)
                                       }
                                   })
                                }
                                //Logging Timelapse
                                var startLap = moment(alertData[0]?.start_time);
                                var endLap=moment(timeStamp);
                                var differLap=moment.duration(endLap.diff(startLap))
                                db.query(`update alert_log set timelapse='${differLap.hours()} Hr ${differLap.minutes()} Min ${differLap.seconds()}' where status='Active' AND station='${element?.station_name}' AND sensor='${element?.sensor_name}' AND alert_type='High limit' `)
                            }
                        })
                    }
                }
            })
        })

        if(store.get("time")===null || moment(store.get("time")).add(30,'minutes').format('YYYY-MM-DD HH:mm:ss.SSS')<=timeStamp){
            // overallEmailGeneration()
            store.set("time",timeStamp)
        }
    } catch (error) {
        console.log(error)
    }
}

exports.alertAPI =async function(req,res){
    try {
        var sta=[]
            const select =  await sequelize.query(`select * from alert_log WHERE start_time BETWEEN '${req?.body?.fromDate}' AND '${req?.body?.toDate}' order by alert_id  desc`);
            select[0].forEach((ele,i)=>{
               sta.push(ele)
            })
            if(sta.length===0){
                await res.json({status:false,Result:"No record found!"})
            }
         await res.json({status:true,Result:sta})
        } catch (error) {
            console.log(error)
        }
}


exports.remarksAPI = async function (req,res) {
    try {
        db.query(`update alert_log set remarks='${req?.body?.remark}',acknowledge='${req?.body?.acknowledge}' where alert_no='${req?.body?.alarm_id}' AND station='${req?.body?.station}' AND sensor='${req?.body?.sensor}'`,function(err,result){
            if(err){
                 res.json({status:false,Result:"Error Occured!"})
            }
                res.json({status:true,Result:"Remarks Updated!"})
        });
    } catch (error) {
        console.error(error)
    }
}

exports.acknowledgeAPI = async function (req,res) {
    try {
        db.query(`update alert_log set acknowledge='${req?.body?.acknowledge}' where alert_no='${req?.body?.alarm_id}' AND station='${req?.body?.station}' AND sensor='${req?.body?.sensor}' AND acknowledge='unacknowledged'`,function(err,result){
            if(err){
                 res.json({status:false,Result:"Error Occured!"})
            }
                res.json({status:true,Result:"Alarm Acknowledged!"})
        });
    } catch (error) {
        console.error(error)
    }
}


























//     await stan.forEach(key=>{
//         var sensorname = Object.keys(key)
//         var actualvalue = Object.values(key)
//         db.query(`select distinct station_name,sensor_name,lsl,hsl from grouping_configuration `,function(err,result){
            
//             db.query(`select * from alert_log where station='${ele}' AND sensor='${sensorname}'AND fault_type='Instant' AND start_time > now() - interval 1 minute `, function(err,alertres){
//             // alertres.forEach(datas => {
//                 // console.log(actualvalue);
//                 db.query(`select * from alert_log where station= '${ele}' AND sensor='${sensorname}' AND fault_type='Instant' AND start_time > now() - interval
//                  ${settings.alertqurey_intervaltime} ${settings.alert_timeformat} `, function(err,tenmins){
//                 //  })
//                 if(err) console.log(err)
//                 result.forEach(element => {
//                     var ll=element.lsl
//                     var hl=element.hsl
//                     // console.log(ele==element.station_name && sensorname == element.sensor_name && actualvalue[0] > hl && tenmins.length>0)
//                     // console.log("low limit :",ele==element.station_name && sensorname==element.sensor_name && actualvalue[0] <ll && tenmins.length>0)
//                     // console.log("high limit :",ele==element.station_name && sensorname==element.sensor_name && actualvalue[0] > hl && tenmins.length>0)
//                     if (ele==element.station_name && sensorname==element.sensor_name && actualvalue[0] < ll) {
//                         // console.log(actualvalue[0] , ll)
//                         // db.query(`select * from alert_log where station= '${ele}' AND sensor='${sensorname}' AND fault_type ='Instant' AND end_time='' ` , function(err,instantlog){
//                             db.query(`select * from grouping_configuration where lsl < '${actualvalue[0]}'` , function(err,instantlog){
//                             if(instantlog.length>0  && !alertres.length){
//                                 db.query(`insert into alert_log(station,sensor,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,date)values(
//                                     '${ele}','${element.sensor_name}','Low limit','Instant','${ll}','${actualvalue[0]}','${hl}','${timeStamp}',"",'${date}')`,function(err,result){ 
//                                         if (err) console.log(err)
//                                     });
//                                 }
//                             })
//                     } else if(ele==element.station_name && sensorname==element.sensor_name && actualvalue[0] > hl) {
//                         // db.query(`select * from alert_log where station= '${ele}' AND sensor='${sensorname}' AND fault_type ='Instant' AND end_time='' ` , function(err,instantlog){
//                             db.query(`select * from grouping_configuration where hsl > '${actualvalue[0]}'` , function(err,instantlog){    
//                         if(instantlog.length>0  && !alertres.length){
//                         db.query(`insert into alert_log(station,sensor,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,date)values(
//                                 '${ele}','${element.sensor_name}','High limit','Instant','${ll}','${actualvalue[0]}','${hl}','${timeStamp}',"",'${date}')`,function(err,result){ 
//                                     if (err) console.log(err)
//                                 });
//                             }
//                         })
//                     }
//                     // else if(tenmins.length > 0){
//                         // oneminsAlarm(ele,sensorname,actualvalue,ll,hl)
//                     // }
//                     else if(ele==element.station_name && sensorname==element.sensor_name && actualvalue[0] < ll && tenmins.length > 0){
//                         db.query(`select * from alert_log where fault_type='One minute' OR fault_type='Instant' AND station='${ele}' AND sensor='${sensorname}'AND start_time > now() - interval 1 minute `, function(err,oneminalm){
//                             if (oneminalm.length>0) {
//                                 db.query(`select * from alert_log where fault_type='One minute' AND station='${ele}' AND sensor='${sensorname}'AND  start_time > now() - interval 1 minute `, function(err,oldalm){
//                                     if(!oldalm.length){
//                                         db.query(`insert into alert_log(station,sensor,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,date)values(
//                                             '${ele}','${element.sensor_name}','Low limit','One minute','${ll}','${actualvalue[0]}','${hl}','${timeStamp}',"",'${date}')`,function(err,result){ 
//                                                 if (err) console.log(err)
//                                             });
//                                     }
//                                 })                                    
//                             }
//                         })                        
//                     } else if(ele==element.station_name && sensorname == element.sensor_name && actualvalue[0] > hl && tenmins.length>0){
//                         db.query(`select * from alert_log where fault_type='One minute'  OR fault_type='Instant' AND station='${ele}' AND sensor='${sensorname}'AND  start_time > now() - interval 1 minute `, function(err,onemin){
//                             if (onemin.length>0) {
//                                 db.query(`select * from alert_log where fault_type='One minute' AND station='${ele}' AND sensor='${sensorname}'AND  start_time > now() - interval 1 minute `, function(err,oldalm){
//                                     if(!oldalm.length){
//                                         // console.log("2")
//                                         db.query(`insert into alert_log(station,sensor,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,date)values(
//                                             '${ele}','${element.sensor_name}','High limit','One minute','${ll}','${actualvalue[0]}','${hl}','${timeStamp}',"",'${date}')`,function(err,result){ 
//                                                 if (err) console.log(err)
//                                             });
//                                     }
//                                 })                                
//                             }
//                         })                        
//                     }
//                  // alertres.forEach(datas=>{
//                         // var start_date = moment(datas.start_time, 'YYYY-MM-DD HH:mm:ss');
//                         // var end_date = moment(timeStamp, 'YYYY-MM-DD HH:mm:ss');
//                         // var duration = moment.duration(end_date.diff(start_date));
//                         // var minutes = duration.asSeconds();
//                         // console.log(minutes)
//                     //     db.query(`select * from alert_log where station='${ele}' AND sensor='${sensorname}' AND fault_type='Instant' AND start_time < now() - interval 1 minute  `, function(err,onemins){
//                     //     if (err) console.log(err)
//                     //     onemins.forEach(datas=>{
//                     //     if(ele==datas.station && sensorname==datas.sensor && actualvalue[0] < ll && onemins.length>0){
//                     //         db.query(`insert into alert_log(station,sensor,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,date)values(
//                     //             '${data.station}','${data.sensor}','Low limit','One minute','${ll}','${actualvalue[0]}','${hl}','${timeStamp}',"",'${date}')`,function(err,result){ 
//                     //                 if (err) console.log(err)
//                     //             });
//                     //     } else if(ele==datas.station && sensorname==datas.sensor && actualvalue[0] > hl && onemins.length>0){
//                     //         db.query(`insert into alert_log(station,sensor,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,date)values(
//                     //             '${ele}','${sensorname}','High limit','One minute','${ll}','${actualvalue[0]}','${hl}','${timeStamp}',"",'${date}')`,function(err,result){ 
//                     //                 if (err) console.log(err)
//                     //             });
//                     //         }
//                     //     })
//                     // })

//                 // instantres.forEach(datas=>{
//                     // var faulttype=datas.fault_type
//                     // console.log("*********************",onemins,onemins!='Oneminute',datas.timestamp)
//                 //     clearInterval(clear)
//                 //    var clear= setInterval(() => {
//                 //         db.query(`select * from alert_log where station= '${ele}' AND sensor='${sensorname}'  AND fault_type='Instant' AND timestamp > now() - interval
//                 //           ${settings.alertqurey_intervaltime} ${settings.alert_timeformat} `, function(err,instantres){
//                 //             if (ele==element.station_name && sensorname==element.sensor_name && actualvalue[0] < ll) {
//                 //                 db.query(`insert into alert_log(station,sensor,alert_type,fault_type,lsl,alert_value,hsl,timestamp,date)values(
//                 //                     '${ele}','${element.sensor_name}','Low limit','Oneminute','${ll}','${actualvalue[0]}','${hl}','${timeStamp}','${date}')`,function(err,result){ 
//                 //                         if (err) console.log(err)
//                 //                     });
//                 //             } else if(ele==element.station_name && sensorname==element.sensor_name && actualvalue[0] > hl) {
//                 //                 db.query(`insert into alert_log(station,sensor,alert_type,fault_type,lsl,alert_value,hsl,timestamp,date)values(
//                 //                     '${ele}','${element.sensor_name}','High limit','Oneminute','${ll}','${actualvalue[0]}','${hl}','${timeStamp}','${date}')`,function(err,result){ 
//                 //                         if (err) console.log(err)
//                 //                     });
//                 //             }
//                 //           })
//                 //     }, 60000);                  
//                     // console.log("******************",datas.fault_type)
//                 // })
//             });
//             // })    
//         })
//     })
// })
//         // })
//     })







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




                    // function oneminsAlarm(ele,sensorname,actualvalue,ll,hl) {
                    //     // console.log("asdf")
                    //     // db.query(`select distinct station,sensor from alert_log`, function(err,onemins){
                    //         db.query(`select * from alert_log where station='${ele}' AND sensor='${sensorname}' AND fault_type='Instant' AND start_time > now() - interval 1 minute  `, function(err,onemins){
                    //             if (err) console.log(err)
                    //             onemins.forEach(element=>{
                    //                 db.query(`select * from alert_log where station='${element.station}' AND sensor='${element.sensor}'  AND start_time > now() - interval 1 minute  `, function(err,oneminsres){
                    //                 oneminsres.forEach(datas => {
                    //                 // console.log("HIGH LIMIT*****@@@@")
                    //                     if(ele==datas.station && sensorname==datas.sensor && actualvalue[0] < ll && datas.fault_type!='One minute'){
                    //                         // if (datas.fault_type!='One minute') {
                    //                             db.query(`insert into alert_log(station,sensor,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,date)values(
                    //                                 '${datas.station}','${datas.sensor}','Low limit','One minute','${ll}','${actualvalue[0]}','${hl}','${timeStamp}',"",'${date}')`,function(err,result){ 
                    //                                     if (err) console.log(err)
                    //                                 });
                    //                             // }
                    //                         } else if(ele==datas.station && sensorname==datas.sensor && actualvalue[0] > hl && datas.fault_type!='One minute'){
                    //                             // if (datas.fault_type!='One minute') {
                    //                             // console.log("HIGH LIMIT")
                    //                                 db.query(`insert into alert_log(station,sensor,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,date)values(
                    //                                     '${datas.station}','${datas.sensor}','High limit','One minute ','${ll}','${actualvalue[0]}','${hl}','${timeStamp}',"",'${date}')`,function(err,result){ 
                    //                                         if (err) console.log(err)
                    //                                     });
                    //                                 // }
                    //                             }
                    //                         })
                    //                     })
                    //                 });                    
                    //             })
                    //         }






                     // sta=[...new Set(stationName)]
            // var finalOut=[]
            // var out={}
            // var resultData={};
            // const getStn =  await sequelize.query(`select distinct station from alert_log order by alert_id  desc`);
            // getStn[0].forEach(async (data,index,dt)=>{
            //     finalOut.push({[data?.station]:{}})
            //     const getSensor =  await sequelize.query(`select distinct sensor from alert_log where station='${data?.station}' order by alert_id  desc`);
            //     getSensor[0].forEach((e,i,arr)=>{
            //         out=finalOut[index]?.[data?.station]
            //         out[e?.sensor]=[]
            //         if(i === arr.length - 1){
            //             resultData[data?.station]=out;
            //             console.log(resultData[data?.station]?.[e?.sensor]);
            //         }
            //     })
            //     if(index === dt.length -1){
            //         // console.log(resultData,data?.station);
            //     }
            // })



            // for await (const ele of select[0]) {
            //     if(sta[ele?.station]){
            //         if(sta[ele?.station][ele?.sensor]){
            //             sta[ele?.station][ele?.sensor]['alert_id'].ele?.lsl
            //             sta[ele?.station][ele?.sensor]['lsl'].ele?.lsl
            //             sta[ele?.station][ele?.sensor]['hsl'].ele?.hsl
            //             sta[ele?.station][ele?.sensor]['sensor_group'].ele?.alert_type
            //             sta[ele?.station][ele?.sensor]['alert_type'].ele?.alert_type
            //             sta[ele?.station][ele?.sensor]['alert_value'].ele?.alert_value
            //             sta[ele?.station][ele?.sensor]['fault_type'].ele?.fault_type
            //             sta[ele?.station][ele?.sensor]['timestamp'].ele?.start_time
            //             sta[ele?.station][ele?.sensor]['end_time'].ele?.start_time
            //             sta[ele?.station][ele?.sensor]['duration'].ele?.start_time
            //             sta[ele?.station][ele?.sensor]['timelapse'].ele?.start_time
            //             sta[ele?.station][ele?.sensor]['status'].ele?.start_time
            //         } 
            //         else {
            //             sta[ele?.station][ele?.sensor] = {
            //                 "alert_id":ele?.alert_no,
            //                 "lsl": ele?.lsl,
            //                 "alert_value": ele?.alert_value,
            //                 "hsl": ele?.hsl,
            //                 "sensor_group":ele?.sensor_type,
            //                 "alert_type":ele?.alert_type,
            //                 "fault_type":ele?.fault_type,
            //                 "timestamp":ele?.start_time,
            //                 "end_time":ele?.end_time,
            //                 "duration":ele?.duration,
            //                 "timelapse":ele?.timelapse,
            //                 "status":ele?.status
            //             }
            //         }  
            //     } else {
            //         sta[ele?.station] = {}
            //         if(sta[ele?.station][ele?.sensor]){
            //             sta[ele?.station][ele?.sensor]['alert_id'].ele?.lsl
            //             sta[ele?.station][ele?.sensor]['lsl'].ele?.lsl
            //             sta[ele?.station][ele?.sensor]['hsl'].ele?.hsl
            //             sta[ele?.station][ele?.sensor]['sensor_group'].ele?.alert_type
            //             sta[ele?.station][ele?.sensor]['alert_type'].ele?.alert_type
            //             sta[ele?.station][ele?.sensor]['alert_value'].ele?.alert_value
            //             sta[ele?.station][ele?.sensor]['fault_type'].ele?.fault_type
            //             sta[ele?.station][ele?.sensor]['timestamp'].ele?.start_time
            //             sta[ele?.station][ele?.sensor]['end_time'].ele?.start_time
            //             sta[ele?.station][ele?.sensor]['duration'].ele?.start_time
            //             sta[ele?.station][ele?.sensor]['timelapse'].ele?.start_time
            //             sta[ele?.station][ele?.sensor]['status'].ele?.start_time
            //         } else {
            //             sta[ele?.station][ele?.sensor] = {
            //                 "alert_id":ele?.alert_no,
            //                 "lsl": ele?.lsl,
            //                 "alert_value": ele?.alert_value,
            //                 "hsl": ele?.hsl,
            //                 "sensor_group":ele?.sensor_type,
            //                 "alert_type":ele?.alert_type,
            //                 "fault_type":ele?.fault_type,
            //                 "timestamp":ele?.start_time,
            //                 "end_time":ele?.end_time,
            //                 "duration":ele?.duration,
            //                 "timelapse":ele?.timelapse,
            //                 "status":ele?.status
            //             }
            //         }
            //     }
            // }