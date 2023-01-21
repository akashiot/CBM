var nodemailer = require('nodemailer');
var emailCredentials=require('./configuration/emailconfig.json')
const db= require('./model/dbconfig')
const fs=require('fs')
var fastcsv=require('fast-csv')

var timer
var body
function getAlarms() {
  console.log("object");
  try {
    db.query(`SELECT SLEEP(20)`);
    db.query(`select * from alert_log`,function(err,res){
      res.forEach((e,i)=>{
        body+=` <tr>
                  <td style="border:1px solid black; padding:5px">${i+1}</td>
                  <td style="border:1px solid black; padding:5px">${e?.station}</td>
                  <td style="border:1px solid black; padding:5px">${e?.sensor}</td>
                  <td style="border:1px solid black; padding:5px">${e?.fault_type}</td>
                  <td style="border:1px solid black; padding:5px">${e?.alert_type}</td>
                  <td style="border:1px solid black; padding:5px">${e?.status}</td>
              </tr>`
      });
      main(body).catch(console.error);
    })
  } catch (error) {
    console.error(error)
  }
}


async function main(param) {
 
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

  let template=`<div>
                <h3 style="text-align:center; font-weight:bold;">Alarm Table</h3><br>
                <div style="display:flex; justify-content:center">
                    <table style="border:1px solid black; border-collapse: collapse; width:100%;">
                        <thead style="text-align:center; background-color:#3F51B5; color:white">
                            <tr>
                                <th style="border:1px solid black; padding:5px">S.no</th>
                                <th style="border:1px solid black; padding:5px">Station</th>
                                <th style="border:1px solid black; padding:5px">Sensor</th>
                                <th style="border:1px solid black; padding:5px">Fault Type</th>
                                <th style="border:1px solid black; padding:5px">Alarm Type</th>
                                <th style="border:1px solid black; padding:5px">Status</th>
                            </tr>
                        </thead>
                        <tbody style="text-align: center;">
                           ${param}
                        </tbody>
                    </table>
                </div>
              </div>    `
              fs.readFile('temp.html', {encoding: 'utf-8'},async function (err, html) {
                if(err){
                  console.log(err);
                }
                let info = await transporter.sendMail({
                  from: emailCredentials?.sender, 
                  to: emailCredentials?.receiver, 
                  subject: "Alarms", 
                  text: "Alarm Triggered!", 
                  html: html
                });
              
                console.log("Message sent: %s", info.messageId);
                // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
              
              }) 
}
clearInterval(timer)
timer=setInterval(()=>{
  // main().catch(console.error);
  // getAlarms()
},10000)


function CsvFileGenerate(){
  try {
      db.query(`SELECT * from alert_log where status= 'Active' `, function (err, data) {  
          if (err) throw err;
            const jsonData = JSON.parse(JSON.stringify(data));
            const ws = fs.createWriteStream('Alarm.csv');      
            fastcsv
            .write(jsonData) // with header
              .on("finish", function () {
                console.log("CSV File created Sucessfully!");
              })
              .pipe(ws);
          });
          getAlarms()
      
  } catch (error) {        
      console.error(error);        
  }
}
CsvFileGenerate()