const moment=require('moment');
const sequelize = require("../model/database");
const db= require('../model/dbconfig')
var settings = require('../configuration/config.json')


exports.reports =async function(req,res){
    // app.post("/report", async (req,res) => {
        try {
        var sta={}
        // console.log(`select * from actual_data WHERE  time_stamp BETWEEN '${req.body.fromdate}' AND '${req.body.todate}' order by id LIMIT ${req.body.startLimit},${req.body.endLimit}`);

        await db.query(`select * from actual_data WHERE  time_stamp BETWEEN '${req.body.fromdate}' AND '${req.body.todate}' order by id LIMIT ${req.body.startLimit},${req.body.endLimit}`,function(err,select){
        for (const ele of select) {
            if(sta[ele?.station]){
                if(sta[ele?.station][ele?.sensor]){
                    sta[ele?.station][ele?.sensor]['lsl'].push(ele?.lsl)
                    sta[ele?.station][ele?.sensor]['hsl'].push(ele?.hsl)
                    sta[ele?.station][ele?.sensor]['xaxis'].push(moment(ele?.time_stamp).format('LTS'))
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
                    sta[ele?.station][ele?.sensor]['xaxis'].push(moment(ele?.time_stamp).format('LTS'))
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
        // console.log(sta)
        return res.json({status:true,Result:sta})
    })
    // await res.json({status:true,Result:sta})
    } catch (error) {
        console.log(error)
    }
    // })
}

    exports.groupingreports =async function(req,res){
    try {
    var stat={}
    await db.query(`select * from actual_data WHERE  time_stamp BETWEEN '${req.body.fromdate}' AND '${req.body.todate}' order by id LIMIT ${req.body.startLimit},${req.body.endLimit}`,function(err,select){
        // console.log(select);
        for  (const ele of select) {
            if(stat[ele?.groupsensor_name]){
                if(stat[ele?.groupsensor_name][ele?.sensor]){
                    // sta[ele?.groupsensor_name][ele?.sensor]['station'].push(ele?.station)
                    stat[ele?.groupsensor_name][ele?.sensor]['lsl'].push(ele?.lsl)
                    stat[ele?.groupsensor_name][ele?.sensor]['hsl'].push(ele?.hsl)
                    stat[ele?.groupsensor_name][ele?.sensor]['xaxis'].push(moment(ele?.time_stamp).format('LTS'))
                    stat[ele?.groupsensor_name][ele?.sensor]['yaxis'].push(ele?.actual_data)
                } else {
                    stat[ele?.groupsensor_name][ele?.sensor] = {
                        "name": ele?.station,
                        "sensorname": ele?.sensor,
                        "lsl":[],
                        "hsl":[],
                        "xaxis":[],
                        "yaxis":[],
                    }
                }  
            } else {
                stat[ele?.groupsensor_name] = {}
                if(stat[ele?.groupsensor_name][ele?.sensor]){
                    // sta[ele?.groupsensor_name][ele?.sensor]['station'].push(ele?.station)
                    stat[ele?.groupsensor_name][ele?.sensor]['lsl'].push(ele?.lsl)
                    stat[ele?.groupsensor_name][ele?.sensor]['hsl'].push(ele?.hsl)
                    stat[ele?.groupsensor_name][ele?.sensor]['xaxis'].push(moment(ele?.time_stamp).format('LTS'))
                    stat[ele?.groupsensor_name][ele?.sensor]['yaxis'].push(ele?.actual_data)
                } else {
                    stat[ele?.groupsensor_name][ele?.sensor] = {
                        "name": ele?.station,
                        "sensorname": ele?.sensor,
                        "lsl":[],
                        "hsl":[],
                        "xaxis":[],
                        "yaxis":[],
                    }
                }
            }
        }
    return res.json({status:true,Result:stat})

})
} catch (error) {
    console.log(error)
}
}

// exports.groupingreportSS =async function(req,res){
//     try {
// var stat={}
//     await db.query(`select * from actual_data WHERE  time_stamp BETWEEN '${req.body.fromdate}' AND '${req.body.todate}'`,function(err,select){
//         for  (const ele of select) {
//             if(stat[ele?.groupsensor_name]){
//                 if(stat[ele?.groupsensor_name][ele?.sensor]){
//                     // sta[ele?.groupsensor_name][ele?.sensor]['station'].push(ele?.station)
//                     stat[ele?.groupsensor_name][ele?.sensor]['lsl'].push(ele?.lsl)
//                     stat[ele?.groupsensor_name][ele?.sensor]['hsl'].push(ele?.hsl)
//                     stat[ele?.groupsensor_name][ele?.sensor]['xaxis'].push(moment(ele?.time_stamp).format('LTS'))
//                     stat[ele?.groupsensor_name][ele?.sensor]['yaxis'].push(ele?.actual_data)
//                 } else {
//                     stat[ele?.groupsensor_name][ele?.sensor] = {
//                         "name": ele?.station,
//                         "sensorname": ele?.sensor,
//                         "lsl":[],
//                         "hsl":[],
//                         "xaxis":[],
//                         "yaxis":[],
//                     }
//                 }  
//             } else {
//                 stat[ele?.groupsensor_name] = {}
//                 if(stat[ele?.groupsensor_name][ele?.sensor]){
//                     // sta[ele?.groupsensor_name][ele?.sensor]['station'].push(ele?.station)
//                     stat[ele?.groupsensor_name][ele?.sensor]['lsl'].push(ele?.lsl)
//                     stat[ele?.groupsensor_name][ele?.sensor]['hsl'].push(ele?.hsl)
//                     stat[ele?.groupsensor_name][ele?.sensor]['xaxis'].push(moment(ele?.time_stamp).format('LTS'))
//                     stat[ele?.groupsensor_name][ele?.sensor]['yaxis'].push(ele?.actual_data)
//                 } else {
//                     stat[ele?.groupsensor_name][ele?.sensor] = {
//                         "name": ele?.station,
//                         "sensorname": ele?.sensor,
//                         "lsl":[],
//                         "hsl":[],
//                         "xaxis":[],
//                         "yaxis":[],
//                     }
//                 }
//             }
//         }
//     // return res.json({status:true,Result:stat})
//     var stat={}
//     await db.query(`select * from actual_data WHERE  time_stamp BETWEEN '${req.body.fromdate}' AND '${req.body.todate}'`,function(err,select){
//         for  (const ele of select) {
//             if(stat[ele?.groupsensor_name]){
//                 if(stat[ele?.groupsensor_name][ele?.sensor]){
//                     // sta[ele?.groupsensor_name][ele?.sensor]['station'].push(ele?.station)
//                     stat[ele?.groupsensor_name][ele?.sensor]['lsl'].push(ele?.lsl)
//                     stat[ele?.groupsensor_name][ele?.sensor]['hsl'].push(ele?.hsl)
//                     stat[ele?.groupsensor_name][ele?.sensor]['xaxis'].push(moment(ele?.time_stamp).format('LTS'))
//                     stat[ele?.groupsensor_name][ele?.sensor]['yaxis'].push(ele?.actual_data)
//                 } else {
//                     stat[ele?.groupsensor_name][ele?.sensor] = {
//                         "name": ele?.station,
//                         "sensorname": ele?.sensor,
//                         "lsl":[],
//                         "hsl":[],
//                         "xaxis":[],
//                         "yaxis":[],
//                     }
//                 }  
//             } else {
//                 stat[ele?.groupsensor_name] = {}
//                 if(stat[ele?.groupsensor_name][ele?.sensor]){
//                     // sta[ele?.groupsensor_name][ele?.sensor]['station'].push(ele?.station)
//                     stat[ele?.groupsensor_name][ele?.sensor]['lsl'].push(ele?.lsl)
//                     stat[ele?.groupsensor_name][ele?.sensor]['hsl'].push(ele?.hsl)
//                     stat[ele?.groupsensor_name][ele?.sensor]['xaxis'].push(moment(ele?.time_stamp).format('LTS'))
//                     stat[ele?.groupsensor_name][ele?.sensor]['yaxis'].push(ele?.actual_data)
//                 } else {
//                     stat[ele?.groupsensor_name][ele?.sensor] = {
//                         "name": ele?.station,
//                         "sensorname": ele?.sensor,
//                         "lsl":[],
//                         "hsl":[],
//                         "xaxis":[],
//                         "yaxis":[],
//                     }
//                 }
//             }
//         }
//     return res.json({status:true,Stationwise:stat,Groupingwise:stat})

// })

// })
// } catch (error) {
//     console.log(error)
// }
// }

