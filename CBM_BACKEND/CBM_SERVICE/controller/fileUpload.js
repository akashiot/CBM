const db= require('../model/dbconfig')
const moment=require('moment');
const express=require('express');
const app = express();

exports.insertData =async function(req,res){
    let count;
    const response = req.body[0];
    try {  
        // console.log('Object.keys(req.body[0]',Object.keys(req.body[0]) );
        db.query(`SELECT COUNT(*) AS NUMBEROFCOLUMNS FROM INFORMATION_SCHEMA.COLUMNS
        WHERE table_schema = 'cbm' AND table_name = 'grouping_configuration_copy'`,(err,rows)=>{
            console.log("rows",rows[0].NUMBEROFCOLUMNS);
            count = rows[0].NUMBEROFCOLUMNS;
        })
        // if(Object.keys(req.body[0]).length === count)
        // db.query(`INSERT INTO grouping_configuration_copy VALUES `)
        await res.json({ status:true, result:{response}})
    } catch (error) {
        console.log(error)
    }    
}