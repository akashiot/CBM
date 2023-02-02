const db= require('../model/dbconfig')
exports.addSensorvalue =async function(req,res){
    // Add new sensor type
    try {
        db.query(`SELECT * FROM limit_configuration where sensor_name='${req.body.sensor_name}' `, function (err, rows) {
            if(err) console.log(err)
            if (rows.length!==1) {
                db.query(`insert into limit_configuration(sensor_name,sensor_address,unit,lsl,hsl,lsl_delay,hsl_delay,description)values(
                '${req.body.sensor_name}','${req.body.sensor_address}','${req.body.unit}','${req.body.lsl}','${req.body.hsl}','${req.body.lsl_delay}','${req.body.hsl_delay}','${req.body.description}')`, function (err, result) {
                        if(err)   console.log(err)
                        else {
                            res.json({ status:true, result:"Create sensor details Successfully!"})
                        }
                })            
            }
            else{
                res.json({status:false,result:"Sensor-name is already exits !!!"})
            }
        })
    } catch (error) {
        console.error(error)
    }       
}
exports.updateSensorvalue=async function(req,res){
    // Update the configured sensor type
    try {
        db.query(`SELECT * FROM limit_configuration where limits_id='${req.body.id}' `, function (err, rows) {
            if(err) console.log(err)
            if(rows.length==1){
                db.query(`update limit_configuration set sensor_name='${req.body.sensor_name}',sensor_address='${req.body.sensor_address}',
                unit='${req.body.unit}',lsl='${req.body.lsl}',hsl='${req.body.hsl}',lsl_delay='${req.body.lsl_delay}',hsl_delay='${req.body.hsl_delay}', description='${req.body.description}' where limits_id='${req.body.id}' `, function(err,results){ 
                if(err){
                    console.log(err)
                }
                else{
                    res.json({status:true, result:"Sensor details updated successfully!"})
                }
                })
            }
            else{
                res.json({status:false,result:"Something went worng!!!"})
            }
        })
    } catch (error) {
        console.error(error)
    }
}
exports.deleteSensorvalue=async function(req,res){
    // Delete the selected sensor type
    try {
        db.query(`SELECT * FROM limit_configuration where limits_id='${req.body.id}' `, function (err, rows) {        
            if(err) console.log(err)            
            else if(rows.length==1){
                db.query(`DELETE FROM limit_configuration where limits_id='${req.body.id}' `, function (err, result) {
                })
                res.json({status:true,result:"Sensor details Deleted Successfully!"})
            }else if(rows.length==0){
                res.json({status:false,result:"No Records!!!"})
            }           
        })
    } catch (error) {
        console.error(error)
    }
}
exports.getSensorvalue=async function(req,res){
    // Get the list of sensor type
    try {
        db.query(`SELECT  * FROM limit_configuration `, function (err, rows) {
            if(rows.length>=1){
                res.json({status:true,result:" Getting all Sensor details Successfully!",data:rows})
            }            
            else{
                res.json({status:false,result:"No Records!!!"})
            }
        })
    } catch (error) {
        console.error(error)
    }
}