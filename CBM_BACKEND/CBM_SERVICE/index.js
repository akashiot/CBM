// import { Sequelize, Model, DataTypes } from 'sequelize';
const mysql = require("mysql2");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const db = require("./model/dbconfig");
const moment = require("moment");
const fs = require("fs");
const momentt = require("moment-timezone");
var bodyparser = require("body-parser");
const sequelize = require("./model/database");
const { SMALLINT } = require("sequelize");

var settings = require("./configuration/config.json");
var limits = require("./controller/sensorconfiguration");
var stns = require("./controller/stationconfiguration");
var grpconfig = require("./controller/groupingsensor");
var alert = require("./controller/alertlog");
var actual = require("./controller/actualValues");
var reports = require("./controller/report");
const { join } = require("path");
const ip = require("../OPC-UA-Client/plcRead/connectionurl");

// http://192.168.132.216:3008
const plcurl = `http://${ip.connectionURLS}:3008`;
console.log("endpointUrl", plcurl);
const app = express();
app.use(cors());
app.use(bodyparser.json());

const port = 7004;
app.listen(`${port}`, () => {
  console.log(`listening port on ${port}`);
});

/*** CONFIGURATION API's START****/
//SENSOR API's
app.post("/configuration/addSensor", function (req, res) {
  limits.addSensorvalue(req, res);
});
app.post("/configuration/updateSensor", function (req, res) {
  limits.updateSensorvalue(req, res);
});
app.post("/configuration/deleteSensor", function (req, res) {
  limits.deleteSensorvalue(req, res);
});
app.get("/configuration/getSensor", function (req, res) {
  limits.getSensorvalue(req, res);
});
//STATIONS API's
app.post("/configuration/addStation", function (req, res) {
  stns.addStationvalue(req, res);
});
app.post("/configuration/updateStation", function (req, res) {
  stns.updateStationvalue(req, res);
});
app.post("/configuration/deleteStation", function (req, res) {
  stns.deleteStationvalue(req, res);
});
app.get("/configuration/getStation", function (req, res) {
  stns.getStationvalue(req, res);
});
//GROUPING API's
app.post("/configuration/addGroupingsensor", function (req, res) {
  grpconfig.addGroupingsensorvalue(req, res);
});
app.post("/configuration/updateGroupingsensor", function (req, res) {
  grpconfig.updateGroupingsensorvalue(req, res);
});
app.post("/configuration/deleteGroupingsensor", function (req, res) {
  grpconfig.deleteGroupingsensorvalue(req, res);
});
app.get("/configuration/getGroupingsensor", function (req, res) {
  grpconfig.getGroupingsensorvalue(req, res);
});
app.get("/configuration/getGroupingstationvalue", function (req, res) {
  grpconfig.getGroupingstationvalue(req, res);
});
app.get("/configuration/getTypewisedata", function (req, res) {
  grpconfig.getGroupingtypevalue(req, res);
});
/*** CONFIGURATION API's END****/

// app.post('/actualvalue', function (req,res) {
//     actual.actualvalue(req,res)
// })
app.post("/alert/alertDetails", function (req, res) {
  alert.alertAPI(req, res);
});
app.post("/alert/remarks", function (req, res) {
  alert.remarksAPI(req, res);
});
app.post("/alert/acknowledge", function (req, res) {
  alert.acknowledgeAPI(req, res);
});
app.post("/reports/stationReport", function (req, res) {
  reports.reports(req, res);
});
app.post("/reports/groupingReport", function (req, res) {
  reports.groupingreports(req, res);
});
app.get("/alert/stationlist", function (req, res) {
  alert.stationList(req, res);
});
app.post("/alert/sensorlist", function (req, res) {
  alert.sensorList(req, res);
});

var stationNo;
async function valuesReady() {
  try {
    // const res = await axios.get(settings.plcUrl+'/getPlcData')
    // const res = await axios.get(settings.plcUrl+'/getopcuadata')
    const res = await axios.get(plcurl + "/getopcuadata");
    const plcs = Object.keys(res?.data);
    plcs.forEach((plc) => {
      var connection = res.data[plc].connection;
      stationNo = Object.keys(res?.data[plc]);
      stationNo.slice(1).forEach((ele) => {
        data = res.data[plc][ele];
        sensorvalue = Object.values(res?.data[plc][ele]);
        sensorname = Object.keys(res?.data[plc][ele]);
        result = connection;
        if (result == true && data !== "") {
          actual.actualvalue(ele, data);
          alert.alertLog(ele, data);
        } else {
          console.log("check PLC communication");
        }
      });
    });
  } catch (error) {
    console.log(error);
  }
}

setInterval(function () {
  valuesReady();
}, settings.plc_refreshrate);

app.get("/onehourdata", async (req, res) => {
  try {
    var sta = {};
    const results = await sequelize.query(
      `SELECT DISTINCT station FROM actual_data where time_stamp > now() - interval 5 minute `
    );
    const re = await results[0];
    for await (const data of re) {
      const select = await sequelize.query(
        `select * from actual_data where station='${data.station}' AND type='type' AND time_stamp > now() - interval 5 minute `
      );
      // console.log(select[0].length,data.station)
      for await (const ele of select[0]) {
        if (sta[ele?.station]) {
          if (sta[ele?.station][ele?.sensor]) {
            sta[ele?.station][ele?.sensor]["lsl"].push(ele?.lsl);
            sta[ele?.station][ele?.sensor]["hsl"].push(ele?.hsl);
            sta[ele?.station][ele?.sensor]["xaxis"].push(
              moment(ele?.time_stamp).format("LTS")
            );
            sta[ele?.station][ele?.sensor]["yaxis"].push(ele?.actual_data);
            sta[ele?.station][ele?.sensor]["unit"].ele?.unit;
          } else {
            sta[ele?.station][ele?.sensor] = {
              name: ele?.sensor,
              lsl: [],
              hsl: [],
              xaxis: [],
              yaxis: [],
              unit: ele?.unit,
            };
          }
        } else {
          sta[ele?.station] = {};
          if (sta[ele?.station][ele?.sensor]) {
            sta[ele?.station][ele?.sensor]["lsl"].push(ele?.lsl);
            sta[ele?.station][ele?.sensor]["hsl"].push(ele?.hsl);
            sta[ele?.station][ele?.sensor]["xaxis"].push(
              moment(ele?.time_stamp).format("LTS")
            );
            sta[ele?.station][ele?.sensor]["yaxis"].push(ele?.actual_data);
            sta[ele?.station][ele?.sensor]["unit"].ele?.unit;
          } else {
            sta[ele?.station][ele?.sensor] = {
              name: ele?.sensor,
              lsl: [],
              hsl: [],
              xaxis: [],
              yaxis: [],
              unit: ele?.unit,
            };
          }
        }
      }
    }

    // var stat={}
    // const resultss =  await sequelize.query(`SELECT DISTINCT station FROM actual_data where time_stamp > now() - interval 150 minute `);
    // const result = await resultss[0]
    // for await (const data of result) {
    //     const select =  await sequelize.query(`select * from actual_data where station='${data.station}' AND type='type' AND time_stamp > now() - interval 150 minute `);
    //     for await (const ele of select[0]) {
    //         if(stat[ele?.groupsensor_name]){
    //             if(stat[ele?.groupsensor_name][ele?.sensor]){
    //                 // sta[ele?.groupsensor_name][ele?.sensor]['station'].push(ele?.station)
    //                 stat[ele?.groupsensor_name][ele?.sensor]['lsl'].push(ele?.lsl)
    //                 stat[ele?.groupsensor_name][ele?.sensor]['hsl'].push(ele?.hsl)
    //                 stat[ele?.groupsensor_name][ele?.sensor]['xaxis'].push(moment(ele?.time_stamp).format('LTS'))
    //                 stat[ele?.groupsensor_name][ele?.sensor]['yaxis'].push(ele?.actual_data)
    //                 stat[ele?.station][ele?.sensor]['unit'].ele?.unit
    //             } else {
    //                 stat[ele?.groupsensor_name][ele?.sensor] = {
    //                     "name": ele?.station,
    //                     "sensorname": ele?.sensor,
    //                     "lsl":[],
    //                     "hsl":[],
    //                     "xaxis":[],
    //                     "yaxis":[],
    //                     "unit":ele?.unit
    //                 }
    //             }
    //         } else {
    //             stat[ele?.groupsensor_name] = {}
    //             if(stat[ele?.groupsensor_name][ele?.sensor]){
    //                 // sta[ele?.groupsensor_name][ele?.sensor]['station'].push(ele?.station)
    //                 stat[ele?.groupsensor_name][ele?.sensor]['lsl'].push(ele?.lsl)
    //                 stat[ele?.groupsensor_name][ele?.sensor]['hsl'].push(ele?.hsl)
    //                 stat[ele?.groupsensor_name][ele?.sensor]['xaxis'].push(moment(ele?.time_stamp).format('LTS'))
    //                 stat[ele?.groupsensor_name][ele?.sensor]['yaxis'].push(ele?.actual_data)
    //             } else {
    //                 stat[ele?.groupsensor_name][ele?.sensor] = {
    //                     "name": ele?.station,
    //                     "sensorname": ele?.sensor,
    //                     "lsl":[],
    //                     "hsl":[],
    //                     "xaxis":[],
    //                     "yaxis":[],
    //                     "unit":ele?.unit

    //                 }
    //             }
    //         }
    //     }
    // }
    // console.clear()
    // console.log("sta",sta);
    await res.json({ status: true, Result: sta });
    //  await res.json({status:true,Result:{StationOnehourData:sta,GroupingOnehourData:stat}})
  } catch (error) {
    console.log(error);
  }
});

app.get("/groupingonehourdata", async (req, res) => {
  try {
    var stat = {};
    const results = await sequelize.query(
      `SELECT DISTINCT station FROM actual_data where time_stamp > now() - interval 5 minute `
    );
    const re = await results[0];
    for await (const data of re) {
      const select = await sequelize.query(
        `select * from actual_data where station='${data.station}' AND type='type' AND time_stamp > now() - interval 5 minute `
      );
      for await (const ele of select[0]) {
        // console.log(stat[ele?.groupsensor_name])
        if (stat[ele?.groupsensor_name]) {
          if (stat[ele?.groupsensor_name][ele?.sensor]) {
            // sta[ele?.groupsensor_name][ele?.sensor]['station'].push(ele?.station)
            stat[ele?.groupsensor_name][ele?.sensor]["lsl"].push(ele?.lsl);
            stat[ele?.groupsensor_name][ele?.sensor]["hsl"].push(ele?.hsl);
            stat[ele?.groupsensor_name][ele?.sensor]["xaxis"].push(
              moment(ele?.time_stamp).format("LTS")
            );
            stat[ele?.groupsensor_name][ele?.sensor]["yaxis"].push(
              ele?.actual_data
            );
            stat[ele?.groupsensor_name][ele?.sensor]["unit"].ele?.unit;
          } else {
            stat[ele?.groupsensor_name][ele?.sensor] = {
              name: ele?.station,
              sensorname: ele?.sensor,
              lsl: [],
              hsl: [],
              xaxis: [],
              yaxis: [],
              unit: ele?.unit,
            };
          }
        } else {
          stat[ele?.groupsensor_name] = {};
          if (stat[ele?.groupsensor_name][ele?.sensor]) {
            // sta[ele?.groupsensor_name][ele?.sensor]['station'].push(ele?.station)
            stat[ele?.groupsensor_name][ele?.sensor]["lsl"].push(ele?.lsl);
            stat[ele?.groupsensor_name][ele?.sensor]["hsl"].push(ele?.hsl);
            stat[ele?.groupsensor_name][ele?.sensor]["xaxis"].push(
              moment(ele?.time_stamp).format("LTS")
            );
            stat[ele?.groupsensor_name][ele?.sensor]["yaxis"].push(
              ele?.actual_data
            );
            stat[ele?.groupsensor_name][ele?.sensor]["unit"].ele?.unit;
          } else {
            stat[ele?.groupsensor_name][ele?.sensor] = {
              name: ele?.station,
              sensorname: ele?.sensor,
              lsl: [],
              hsl: [],
              xaxis: [],
              yaxis: [],
              unit: ele?.unit,
            };
          }
        }
      }
    }
    // console.clear()
    await res.json({ status: true, Result: stat });
  } catch (error) {
    console.log(error);
  }
});

// app.get("/generateplcdata", async (req, res) => {
//     var plcData={}
//     const select =  await sequelize.query(`select * from grouping_configuration`);
//     for await (const ele of select[0]) {
//         plcData[ele?.station_name+"_"+ele?.sensor_name]=ele?.tag_address
//     }
//     var plcconfig=[]
//                     plcconfig.push({
//                         "name":"plc-1",
//                         "IP":"192.168.18.99",
//                         "rack":"0",
//                         "slot":"1",
//                         "port":"102",
//                         "refresh_rate":"1000",
//                         "Tags":plcData
//             })
//             //console.log({plcconfig:plcconfig})
//         fs.writeFile('../plcService/configuration/plcConfig.json', JSON.stringify({"plc_count":[0],plc_config:plcconfig}), function (err) {
//             if (err) return console.log(err);
//             })
// })

// *********** opcua ***********
app.get("/generateplcdata", async (req, res) => {
  var plcData = {};
  const select = await sequelize.query(`select * from grouping_configuration`);
  for await (const ele of select[0]) {
    plcData[ele?.station_name + "_" + ele?.sensor_name] = ele?.tag_address;
  }
  var plcconfig = [];
//   const url = `opc.tcp://${}:4840`;
const ip = require('../OPC-UA-Client/plcRead/connectionurl');
  plcconfig.push({
    name: "plc-1",
    IP: `opc.tcp://${ip.connectionURLS}:4840`,
    refresh_rate: "1500",
    Tags: plcData,
  });
  console.log({plcconfig:plcconfig})
  // fs.writeFile('../plcService/configuration/opcuaConfig.json', JSON.stringify({"plc_count":[0],plc_config:plcconfig}), function (err) {
  fs.writeFile(
    "../OPC-UA-Client/configuration/opcuaConfig-teal.json",
    JSON.stringify({ plc_count: [0], plc_config: plcconfig }),
    function (err) {
      if (err) return console.log(err);
    }
  );
});
