const moment = require("moment");
const sequelize = require("../model/database");
const db = require("../model/dbconfig");
var nodemailer = require("nodemailer");
var store = require("store2");
var emailCredentials = require("../configuration/emailconfig.json");
const fs = require("fs");
var fastcsv = require("fast-csv");

async function emailGeneration(param) {
  // Trigger alarm email instantly based in the database configuration.
  db.query(
    `SELECT * FROM email_configuration where active='true'`,
    async function (err, data) {
      let receivers = [];
      if (err) {
        console.log(err);
      }
      data.forEach((e, i) => {
        receivers.push(e?.mail_id);
      });
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
    }
  );
}

function CsvFileGenerate() {
  // Generate list of active alarms in csv file format.
  try {
    db.query(
      `SELECT * from alert_log where status= 'Active' `,
      function (err, data) {
        if (err) throw err;
        const jsonData = JSON.parse(JSON.stringify(data));
        const ws = fs.createWriteStream("../Alarm.csv");
        fastcsv
          .write(jsonData)
          .on("finish", function () { })
          .pipe(ws);
      }
    );
  } catch (error) {
    console.error(error);
  }
}

async function overallEmailGeneration() {
  // 1.Get the list of email receivers from the database
  // 2.Get the list of active alarms form the database
  // 3.Generate active alarms in csv file
  // 4.Trigger the email to the email receivers
  db.query(
    `SELECT * FROM email_configuration where active='true'`,
    async function (err, data) {
      let receivers = [];
      if (err) {
        console.log(err);
      }
      data.forEach((e, i) => {
        receivers.push(e?.mail_id);
      });
      db.query(
        `SELECT distinct station FROM alert_log`,
        async function (err, data) {
          let layout = "";
          data.forEach((e, i, arr) => {
            db.query(
              `SELECT COUNT(sensor) FROM  alert_log where station='${e?.station}' AND status='Active'`,
              async function (err, res) {
                layout += `<tr>
                                <td style="padding: 5px;border: 1px solid;">${e?.station.replace(
                  /(^\w{1})|(\s+\w{1})/g,
                  (letter) => letter.toUpperCase()
                )}</td>
                                <td style="padding: 5px;border: 1px solid;">${res[0]?.["COUNT(sensor)"]
                  }</td>
                            </tr>`;
                if (i === arr.length - 1) {
                  let table = `
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
                                    <p style="margin-top:10px; color:red; text-align:center">*Please download the attachment to get detail overall alarm list*</p>`;
                  CsvFileGenerate();
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
                    subject: "Active Alarms",
                    text: "Overall active alarms",
                    html: table,
                    attachments: [
                      {
                        filename: "Alarm.csv",
                        path: __dirname + "/Alarm.csv",
                      },
                    ],
                  });
                }
              }
            );
          });
        }
      );
    }
  );
}

exports.alertLog = async function (ele, data) {
  try {
    var alm = {};
    var timeStamp = moment().format("YYYY-MM-DD HH:mm:ss.SSS");
    var date = moment().format("YYYY-MM-DD");
    var stan = Object.keys(data).map((k) => ({ [k]: data[k] }));
    db.query(
      `select distinct station_name,sensor_name,lsl,hsl,sensor_type,lsl_delay,hsl_delay from grouping_configuration `,
      function (err, result) {
        result.forEach((element, i) => {
          if (data?.[element?.sensor_name] !== undefined) {
            let alert_id = "A_" + element?.station_name + "_" + element?.sensor_name + "_" + timeStamp;
            if (parseFloat(Number(data?.[element?.sensor_name]).toFixed(2)) < element?.lsl) {
              // This case executes when the actual values less than the lower limit
              db.query(
                `select * from alert_log where station='${element?.station_name}' AND sensor='${element?.sensor_name}'AND fault_type='Instant' AND status='Active'`,
                function (err, alertData) {
                  //if(alertData){
                  if (alertData.length === 0) {
                    if (
                      store.get("lsl_delay") === null ||
                      moment(store.get("lsl_delay"))
                        .add(element?.lsl_delay, "seconds")
                        .format("YYYY-MM-DD HH:mm:ss.SSS") <= timeStamp
                    ) {
                      // Logs the alarm after the delay
                      if (store.get("lsl_delay") === null) {
                      } else {
                        console.log(`insert into alert_log(alert_no,station,sensor,sensor_type,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,duration,status,timelapse,date,remarks,acknowledge)values('${alert_id}','${element?.station_name}','${element.sensor_name}','${element?.sensor_type}','Low limit','Instant','${element?.lsl}','${parseFloat(Number(data?.[element?.sensor_name]).toFixed(2))}','${element?.hsl}','${timeStamp}',' ',' ','Active',0,'${date}',' ',' ')`);
                        db.query(`insert into alert_log(alert_no,station,sensor,sensor_type,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,duration,status,timelapse,date,remarks,acknowledge)values('${alert_id}','${element?.station_name}','${element.sensor_name}','${element?.sensor_type}','Low limit','Instant','${element?.lsl}','${parseFloat(Number(data?.[element?.sensor_name]).toFixed(2))}','${element?.hsl}','${timeStamp}',' ',' ','Active',0,'${date}',' ',' ')`);
                        let content = `<div style="padding:10px;border:1px solid black;text-align:center">
                                                              <h3 style="margin-bottom:10px">Station Name : ${element?.station_name.replace(
                          /(^\w{1})|(\s+\w{1})/g,
                          (letter) =>
                            letter.toUpperCase()
                        )}</h3>
                                                              <h3 style="margin-bottom:10px">Sensor Name : ${element?.sensor_name.replace(
                          /(^\w{1})|(\s+\w{1})/g,
                          (letter) =>
                            letter.toUpperCase()
                        )}</h3>
                                                              <h3 style="margin-bottom:10px">Alarm Type : Value crossed Low Limit</h3>
                                                              <h3 style="margin-bottom:10px">Low Limit Value : ${element?.lsl
                          }</h3>
                                                              <h3 style="margin-bottom:10px">Actual Value : ${parseFloat(
                            Number(data?.[element?.sensor_name]).toFixed(2)
                          )}</h3>
                                                              <h3 style="margin-bottom:10px">High Limit Value : ${element?.hsl
                          }</h3>
                                                              <h3 style="margin-bottom:10px">Triggered Time : ${moment(
                            timeStamp
                          )
                            .add(
                              element?.lsl_delay,
                              "seconds"
                            )
                            .format(
                              "YYYY-MM-DD HH:mm:ss.SSS"
                            )}</h3>
                                                          </div>`;
                        // emailGeneration(content).catch(console.error);
                      }
                      store.set("lsl_delay", timeStamp);
                    }
                  } else if (alertData.length !== 0) {
                    if (
                      moment(alertData[0]?.start_time)
                        .add(1, "minutes")
                        .format("YYYY-MM-DD HH:mm:ss.SSS") <= timeStamp &&
                      moment(alertData[0]?.start_time)
                        .add(10, "minutes")
                        .format("YYYY-MM-DD HH:mm:ss.SSS") > timeStamp
                    ) {
                      db.query(
                        `select * from alert_log where station='${element?.station_name}' AND sensor='${element?.sensor_name}' AND fault_type='One Minute' AND status='Active'`,
                        function (err, activeCheck) {
                          if (activeCheck.length === 0) {
                            db.query(`insert into alert_log(alert_no,station,sensor,sensor_type,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,duration,status,timelapse,date,remarks,acknowledge)values(
                                                  '${alert_id}','${element?.station_name
                              }','${element.sensor_name}','${element?.sensor_type
                              }','Low limit','One minute','${element?.lsl
                              }','${parseFloat(
                                Number(data?.[element?.sensor_name]).toFixed(2)
                              )}','${element?.hsl
                              }','${timeStamp}',' ',' ','Active',0,'${date}',' ',' ')`);
                          }
                        }
                      );
                    } else if (
                      moment(alertData[0]?.start_time)
                        .add(10, "minutes")
                        .format("YYYY-MM-DD HH:mm:ss.SSS") <=
                      timeStamp ===
                      true
                    ) {
                      db.query(
                        `select * from alert_log where station='${element?.station_name}' AND sensor='${element?.sensor_name}'AND fault_type='Ten minute' AND status='Active'`,
                        function (err, alertMinData) {
                          if (alertMinData.length === 0) {
                            db.query(`insert into alert_log(alert_no,station,sensor,sensor_type,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,duration,status,timelapse,date,remarks,acknowledge)values(
                                                  '${alert_id}','${element?.station_name
                              }','${element.sensor_name}','${element?.sensor_type
                              }','Low limit','Ten Minute','${element?.lsl
                              }','${parseFloat(
                                Number(data?.[element?.sensor_name]).toFixed(2)
                              )}','${element?.hsl
                              }','${timeStamp}',' ',' ','Active',0,'${date}',' ',' ')`);
                          }
                        }
                      );
                    }
                    //original code uncommented
                    //Logging Timelapse
                    // var startLap = moment(alertData[0]?.start_time);
                    // var endLap = moment(timeStamp);
                    // var differLap = moment.duration(endLap.diff(startLap));
                    // db.query(
                    //   `update alert_log set timelapse='${differLap.hours()} Hr ${differLap.minutes()} Min ${differLap.seconds()}' where status='Active' AND station='${
                    //     element?.station_name
                    //   }' AND sensor='${
                    //     element?.sensor_name
                    //   }' AND alert_type='Low limit' `
                    // );
                  }
                  //}

                }
              );
            } else if (
              parseFloat(Number(data?.[element?.sensor_name]).toFixed(2)) >
              element?.lsl &&
              parseFloat(Number(data?.[element?.sensor_name]).toFixed(2)) < element?.hsl
            ) {
              // ALert return into normal range
              db.query(
                `select * from alert_log where status='Active' AND station='${element?.station_name}' AND sensor='${element?.sensor_name}' AND alert_type='Low limit'`,
                function (err, updateLslStatus) {
                  if (updateLslStatus.length !== 0) {
                    var start = moment(updateLslStatus[0]?.start_time);
                    var end = moment(
                      moment(timeStamp)
                        .add(element?.lsl_delay, "seconds")
                        .format("YYYY-MM-DD HH:mm:ss.SSS")
                    );
                    var differ = moment.duration(end.diff(start));
                    var duration = `${differ.hours()} Hr ${differ.minutes()} Min ${differ.seconds()} Sec`;
                    db.query(
                      `update alert_log set status='In Active',end_time='${moment(
                        timeStamp
                      )
                        .add(element?.lsl_delay, "seconds")
                        .format(
                          "YYYY-MM-DD HH:mm:ss.SSS"
                        )}',duration='${duration}' where status='Active' AND station='${element?.station_name
                      }' AND sensor='${element?.sensor_name}'`,
                      function (err, res) { }
                    );
                  }
                }
              );

              db.query(
                `select * from alert_log where status='Active' AND station='${element?.station_name}' AND sensor='${element?.sensor_name}' AND alert_type='High limit'`,
                function (err, updateHslStatus) {
                  if (updateHslStatus.length !== 0) {
                    var start = moment(updateHslStatus[0]?.start_time);
                    var end = moment(
                      moment(timeStamp)
                        .add(element?.hsl_delay, "seconds")
                        .format("YYYY-MM-DD HH:mm:ss.SSS")
                    );
                    var differ = moment.duration(end.diff(start));
                    var duration = `${differ.hours()} Hr ${differ.minutes()} Min ${differ.seconds()} Sec`;
                    db.query(
                      `update alert_log set status='In Active',end_time='${moment(
                        timeStamp
                      )
                        .add(element?.hsl_delay, "seconds")
                        .format(
                          "YYYY-MM-DD HH:mm:ss.SSS"
                        )}',duration='${duration}' where status='Active' AND station='${element?.station_name
                      }' AND sensor='${element?.sensor_name}'`,
                      function (err, res) { }
                    );
                  }
                }
              );
            } else if (
              parseFloat(Number(data?.[element?.sensor_name]).toFixed(2)) > element?.hsl
            ) {
              // This case executes when the actual values less than the higher limit
              db.query(
                `select * from alert_log where station='${element?.station_name}' AND sensor='${element?.sensor_name}'AND fault_type='Instant' AND status='Active'`,
                function (err, alertData) {
                  if (alertData.length === 0) {
                    if (
                      store.get("hsl_delay") === null ||
                      moment(store.get("hsl_delay"))
                        .add(element?.hsl_delay, "seconds")
                        .format("YYYY-MM-DD HH:mm:ss.SSS") <= timeStamp
                    ) {
                      // Logs the alarm after the delay
                      if (store.get("hsl_delay") === null) {
                      } else {
                        db.query(`insert into alert_log(alert_no,station,sensor,sensor_type,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,duration,status,timelapse,date,remarks,acknowledge)values(
                                              '${alert_id}','${element?.station_name
                          }','${element.sensor_name}','${element?.sensor_type
                          }','High limit','Instant','${element?.lsl
                          }','${parseFloat(
                            Number(data?.[element?.sensor_name]).toFixed(2)
                          )}','${element?.hsl
                          }','${timeStamp}',' ',' ','Active',0,'${date}',' ',' ')`);
                        let content = `<div style="padding:10px;border:1px solid black;text-align:center">
                                              <h3 style="margin-bottom:10px">Station Name : ${element?.station_name.replace(
                          /(^\w{1})|(\s+\w{1})/g,
                          (letter) => letter.toUpperCase()
                        )}</h3>
                                              <h3 style="margin-bottom:10px">Sensor Name : ${element?.sensor_name.replace(
                          /(^\w{1})|(\s+\w{1})/g,
                          (letter) => letter.toUpperCase()
                        )}</h3>
                                              <h3 style="margin-bottom:10px">Alarm Type : Value crossed High Limit</h3>
                                              <h3 style="margin-bottom:10px">Low Limit Value : ${element?.lsl
                          }</h3>
                                              <h3 style="margin-bottom:10px">Actual Value : ${parseFloat(
                            data?.[
                              element?.sensor_name
                            ].toFixed(2)
                          )}</h3>
                                              <h3 style="margin-bottom:10px">High Limit Value : ${element?.hsl
                          }</h3>
                                              <h3 style="margin-bottom:10px">Triggered Time : ${moment(
                            timeStamp
                          )
                            .add(
                              element?.lsl_delay,
                              "seconds"
                            )
                            .format(
                              "YYYY-MM-DD HH:mm:ss.SSS"
                            )}</h3>
                                          </div>`;
                        // emailGeneration(content).catch(console.error);
                      }
                      store.set("hsl_delay", timeStamp);
                    }
                  } else if (alertData.length !== 0) {
                    if (
                      moment(alertData[0]?.start_time)
                        .add(1, "minutes")
                        .format("YYYY-MM-DD HH:mm:ss.SSS") <= timeStamp &&
                      moment(alertData[0]?.start_time)
                        .add(10, "minutes")
                        .format("YYYY-MM-DD HH:mm:ss.SSS") > timeStamp
                    ) {
                      db.query(
                        `select * from alert_log where station='${element?.station_name}' AND sensor='${element?.sensor_name}' AND fault_type='One Minute' AND status='Active'`,
                        function (err, activeCheck) {
                          if (activeCheck.length === 0) {
                            db.query(`insert into alert_log(alert_no,station,sensor,sensor_type,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,duration,status,timelapse,date,remarks,acknowledge)values(
                                                  '${alert_id}','${element?.station_name
                              }','${element.sensor_name}','${element?.sensor_type
                              }','High limit','One minute','${element?.lsl
                              }','${parseFloat(
                                Number(data?.[element?.sensor_name]).toFixed(2)
                              )}','${element?.hsl
                              }','${timeStamp}',' ',' ','Active',0,'${date}',' ',' ')`);
                          }
                        }
                      );
                    } else if (
                      moment(alertData[0]?.start_time)
                        .add(10, "minutes")
                        .format("YYYY-MM-DD HH:mm:ss.SSS") <=
                      timeStamp ===
                      true
                    ) {
                      db.query(
                        `select * from alert_log where station='${element?.station_name}' AND sensor='${element?.sensor_name}'AND fault_type='Ten minute' AND status='Active'`,
                        function (err, alertMinData) {
                          if (alertMinData.length === 0) {
                            db.query(`insert into alert_log(alert_no,station,sensor,sensor_type,alert_type,fault_type,lsl,alert_value,hsl,start_time,end_time,duration,status,timelapse,date,remarks,acknowledge)values(
                                                  '${alert_id}','${element?.station_name
                              }','${element.sensor_name}','${element?.sensor_type
                              }','High limit','Ten Minute','${element?.lsl
                              }','${parseFloat(
                                Number(data?.[element?.sensor_name]).toFixed(2)
                              )}','${element?.hsl
                              }','${timeStamp}',' ',' ','Active',0,'${date}',' ',' ')`);
                          }
                        }
                      );
                    }
                    //Logging Timelapse
                    // var startLap = moment(alertData[0]?.start_time);
                    // var endLap=moment(timeStamp);
                    // var differLap=moment.duration(endLap.diff(startLap))
                    // db.query(`update alert_log set timelapse='${differLap.hours()} Hr ${differLap.minutes()} Min ${differLap.seconds()}' where status='Active' AND station='${element?.station_name}' AND sensor='${element?.sensor_name}' AND alert_type='High limit' `)
                  }
                }
              );
            }
          }
        });
      }
    );

    if (
      store.get("time") === null ||
      moment(store.get("time"))
        .add(30, "minutes")
        .format("YYYY-MM-DD HH:mm:ss.SSS") <= timeStamp
    ) {
      // overallEmailGeneration()
      store.set("time", timeStamp);
    }
  } catch (error) {
    console.error(error);
  }
};

exports.alertAPI = async function (req, res) {
  // Format the alarms based on the selected sensor in the UI
  try {
    var sta = [];
    console.log("alertAPI",`select * from alert_log WHERE start_time BETWEEN '${req?.body?.fromDate}' AND '${req?.body?.toDate}' order by alert_id  desc`);
    const select = await sequelize.query(
      `select * from alert_log WHERE start_time BETWEEN '${req?.body?.fromDate}' AND '${req?.body?.toDate}' order by alert_id  desc`
    );
    select[0].forEach((ele, i) => {
      sta.push(ele);
    });
    if (sta.length === 0) {
      await res.json({
        status: false,
        Result: "No alarm record found in this date or time range!",
      });
    } else if (sta.length !== 0) {
      await res.json({ status: true, Result: sta });
    }
  } catch (error) {
    console.error(error);
  }
};

exports.remarksAPI = async function (req, res) {
  // Update the alarm remarks in the database
  try {
    db.query(
      `update alert_log set remarks='${req?.body?.remark}',acknowledge='${req?.body?.acknowledge}' where alert_no='${req?.body?.alarm_id}' AND station='${req?.body?.station}' AND sensor='${req?.body?.sensor}'`,
      function (err, result) {
        if (err) {
          res.json({ status: false, Result: "Error Occured!" });
        }
        res.json({ status: true, Result: "Remarks Updated!" });
      }
    );
  } catch (error) {
    console.error(error);
  }
};

exports.acknowledgeAPI = async function (req, res) {
  // Update the alarm acknowledge status in the database
  try {
    db.query(
      `update alert_log set acknowledge='${req?.body?.acknowledge}' where alert_no='${req?.body?.alarm_id}' AND station='${req?.body?.station}' AND sensor='${req?.body?.sensor}' AND acknowledge='unacknowledged'`,
      function (err, result) {
        if (err) {
          res.json({ status: false, Result: "Error Occured!" });
        }
        res.json({ status: true, Result: "Alarm Acknowledged!" });
      }
    );
  } catch (error) {
    console.error(error);
  }
};
exports.sensorList = async function (req, res) {
  try {
    const results = await sequelize.query(`select stationname,ip,description from station_details`);
    if (results.length >= 0) {
      res.json({ status: true, result: " Getting all Station details Successfully!", data: results[0] })
    }
    console.log(results);
  } catch (error) {
    console.log(error);
  }
}
