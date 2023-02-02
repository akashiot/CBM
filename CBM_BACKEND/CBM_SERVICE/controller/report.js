const moment=require('moment');
const db= require('../model/dbconfig')

exports.reports =async function(req,res){
        // Format the report data list on the stationwise
        try {
        var sta={}
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
        return res.json({status:true,Result:sta})
    })
    } catch (error) {
        console.error(error)
    }
}

    exports.groupingreports =async function(req,res){
    // Format the report data list on the groupwise
    try {
    var stat={}
    await db.query(`select * from actual_data WHERE  time_stamp BETWEEN '${req.body.fromdate}' AND '${req.body.todate}' order by id LIMIT ${req.body.startLimit},${req.body.endLimit}`,function(err,select){
        for  (const ele of select) {
            if(stat[ele?.groupsensor_name]){
                if(stat[ele?.groupsensor_name][ele?.sensor]){
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
    console.error(error)
}
}



