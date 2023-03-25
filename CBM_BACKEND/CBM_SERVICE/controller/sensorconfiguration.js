const db= require('../model/dbconfig')
const sequelize= require('../model/database')
exports.addSensorvalue =async function(req,res){
    // Add new sensor type
    try {
        
        const select = `SELECT * FROM limit_configuration where sensor_name='${req.body.sensor_name}' `;
        sequelize.query(select).then(([selectRecord,field])=>{
            if(selectRecord.length != 1){
              const insert = `insert into limit_configuration(sensor_name,sensor_address,unit,lsl,hsl,lsl_delay,hsl_delay,description)values(
                '${req.body.sensor_name}','${req.body.sensor_address}','${req.body.unit}','${req.body.lsl}','${req.body.hsl}','${req.body.lsl_delay}','${req.body.hsl_delay}','${req.body.description}')`;
              sequelize.query(insert).then(([insertedRecords,fields])=>{
                  res.json({status:true,result:"Create sensor details Successfully!"})
              }).catch(console.log);
            }else{
              res.json({status:false, result:"Sensor name is already exists!!!"});
            }
        }).catch(console.log);
        
    } catch (error) {
        console.error(error)
    } 
    
    
    
    
    
        //db.query(`SELECT * FROM limit_configuration where sensor_name='${req.body.sensor_name}' `, function (err, rows) {
        //    if(err) console.log(err)
         //   if (rows.length!==1) {
         //       db.query(`insert into limit_configuration(sensor_name,sensor_address,unit,lsl,hsl,lsl_delay,hsl_delay,description)values(
          //      '${req.body.sensor_name}','${req.body.sensor_address}','${req.body.unit}','${req.body.lsl}','${req.body.hsl}','${req.body.lsl_delay}','${req.body.hsl_delay}','${req.body.description}')`, function (err, result) {
           //             if(err)   console.log(err)
             //           else {
           //                 res.json({ status:true, result:"Create sensor details Successfully!"})
            //            }
            //    })            
           // }
           // else{
            //    res.json({status:false,result:"Sensor-name is already exits !!!"})
            //}
        //})      
}
exports.updateSensorvalue=async function(req,res){
    // Update the configured sensor type
    try {
        
        const select = `SELECT * FROM limit_configuration where limits_id='${req.body.id}' `;
        sequelize.query(select).then(([selectedRecord,field])=>{
          console.log("selectedRecord,field",selectedRecord.length,field);
          if(selectedRecord.length ===1){
            const update = `update limit_configuration set sensor_name='${req.body.sensor_name}',sensor_address='${req.body.sensor_address}',
                unit='${req.body.unit}',lsl='${req.body.lsl}',hsl='${req.body.hsl}',lsl_delay='${req.body.lsl_delay}',hsl_delay='${req.body.hsl_delay}', description='${req.body.description}' where limits_id='${req.body.id}' `;
            sequelize.query(update).then((updatedRecord,field)=>{

              res.json({status:true,result:"Sensor details updated successfully!"});
            }).catch(console.log);
          }else{
            res.json({status:false, result: "Something went wrong!!!"});
          }
        }).catch(console.log);
    } catch (error) {
        console.error(error)
    }
       // db.query(`SELECT * FROM limit_configuration where limits_id='${req.body.id}' `, function (err, rows) {
        //    if(err) console.log(err)
          //  if(rows.length==1){
            //    db.query(`update limit_configuration set sensor_name='${req.body.sensor_name}',sensor_address='${req.body.sensor_address}',
              //  unit='${req.body.unit}',lsl='${req.body.lsl}',hsl='${req.body.hsl}',lsl_delay='${req.body.lsl_delay}',hsl_delay='${req.body.hsl_delay}', description='${req.body.description}' where limits_id='${req.body.id}' `, function(err,results){ 
                //if(err){
                  //  console.log(err)
               // }
                //else{
                  //  res.json({status:true, result:"Sensor details updated successfully!"})
               // }
                //})
            //}
            //else{
             //   res.json({status:false,result:"Something went worng!!!"})
            //}
        //})
}
exports.deleteSensorvalue=async function(req,res){
    // Delete the selected sensor type
    try {
        
        const select = `SELECT * FROM limit_configuration where limits_id='${req.body.id}' `;
        sequelize.query(select).then(([selectedRecord,fields])=>{
          if(selectRecord.length ===1){
            const delte = `DELETE FROM limit_configuration where limits_id='${req.body.id}' `;
            sequelize.query(delte).then(([deletedRecord,field])=>{
              res.json({status:true,result:"Sensor details deleted Successfully!"});
            }).catch(console.log);
          }else{
            res.json({status: false,result: "No Records!!!"});
          }
        }).catch(console.log);
    } catch (error) {
        console.error(error)
    }
      //  db.query(`SELECT * FROM limit_configuration where limits_id='${req.body.id}' `, function (err, rows) {        
        //    if(err) console.log(err)            
        //    else if(rows.length==1){
          //      db.query(`DELETE FROM limit_configuration where limits_id='${req.body.id}' `, function (err, result) {
            //    })
              //  res.json({status:true,result:"Sensor details Deleted Successfully!"})
           // }else if(rows.length==0){
             //   res.json({status:false,result:"No Records!!!"})
           // }           
       // })

}
exports.getSensorvalue=async function(req,res){
    // Get the list of sensor type
    console.log(new Date());
    try {
        const results = await sequelize.query(
            `SELECT  * FROM limit_configuration `
          );
        if(results.length>=1){
            res.json({status:true,result:" Getting all Sensor details Successfully!",data:results[0]})
            //console.log("sensor",results[0],new Date());
        }            
        else{
            res.json({status:false,result:"No Records!!!"})
        }
        // db.query(`SELECT  * FROM limit_configuration `, function (err, rows) {
        //     if(rows.length>=1){
        //         res.json({status:true,result:" Getting all Sensor details Successfully!",data:rows})
        //         console.log("sensor",rows,new Date());
        //     }            
        //     else{
        //         res.json({status:false,result:"No Records!!!"})
        //     }
        // })
    } catch (error) {
        console.error(error)
    }
}