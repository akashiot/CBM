const db= require('../model/dbconfig')
const moment=require('moment');
const express=require('express');
const app = express();

exports.insertData =async function(req,res){
    console.log("req",req);
    try {  
        console.log('Object.keys(req.body[0]',Object.keys(req.body[0]) );
        await res.json({ status:true, result:"File updated "})
    } catch (error) {
        console.log(error)
    }

     
}