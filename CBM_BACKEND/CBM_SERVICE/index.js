const express = require("express");
const cors = require("cors");
const axios = require("axios");
const moment = require("moment");
const fs = require("fs");
var bodyparser = require("body-parser");
const sequelize = require("./model/database");
var settings = require("./configuration/config.json");
var limits = require("./controller/sensorconfiguration");
var grpconfig = require("./controller/groupingsensor");
var alert = require("./controller/alertlog");
var actual = require("./controller/actualValues");
var reports = require("./controller/report");
const fileupload = require("../CBM_Service/controller/fileUpload");
const path = require("path");
const db = require("../CBM_Service/model/database");
// const CronJob = require('cron').CronJob;

const plcurl = [`http://172.22.59.68:3001`]; //192.168.1.129
console.log("plcurl endpointUrl", plcurl);
const app = express();
app.use(cors());
app.use(bodyparser.json());

const port = 7003;
app.listen(`${port}`, () => {
  // Backend services execution started on the configured port.
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
// Alarm
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
app.get("/alert/stationLists", function (req, res) {
  alert.sensorList(req, res);
});
/*** CONFIGURATION API's END****/

var stationNo;
async function valuesReady() {
  //1. Reading PLC data from the Configured PLC tags ,
  //2. Read values pass to actualvalue function to log the live data,
  //3. Read values pass to alertLog function to log the alarms,
  try {
    let res;
    plcurl.forEach(async (url) => {
      res = await axios.get(url + "/getPlcData");
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
      // const end = await new Date().getTime()
      // await console.log('execution time: ',end - start," ", new Date())
    });
  } catch (error) {
    console.log(error);
  }
}

setInterval(function () {
  valuesReady();
}, settings.plc_refreshrate);

app.get("/onehourdata", async (req, res) => {
  //Format live data based on stationwise configuration
  try {
    var sta = {};
    const results = await sequelize.query(
      `SELECT DISTINCT station FROM actual_data where time_stamp > now() - interval 30 minute `
    );
    const re = await results[0];
    for await (const data of re) {
      const s = await new Date().getTime();
      const select = await sequelize.query(
        `select * from actual_data where station='${data.station}' AND type='type' AND time_stamp > now() - interval 30 minute `
      );
      const e = await new Date().getTime();

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
    await res.json({ status: true, Result: sta });
  } catch (error) {
    console.error(error);
  }
});
app.get("/groupingonehourdata", async (req, res) => {
  //Format live data based on groupwise configuration
  console.log("groupingonehourdata", new Date());
  try {
    var stat = {};
    const results = await sequelize.query(
      `SELECT DISTINCT station FROM actual_data where time_stamp > now() - interval 30 minute `
    );
    console.log("groupingonehourdata results", new Date());
    const re = await results[0];
    for await (const data of re) {
      const select = await sequelize.query(
        `select * from actual_data where station='${data.station}' AND type='type' AND time_stamp > now() - interval 30 minute `
      );
console.log(`select * from actual_data where station='${data.station}' AND type='type' AND time_stamp > now() - interval 30 minute `);
      for await (const ele of select[0]) {
        if (stat[ele?.groupsensor_name]) {
          if (stat[ele?.groupsensor_name][ele?.sensor]) {
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
    await res.json({ status: true, Result: stat });
  } catch (error) {
    console.error(error);
  }
});
// app.get("/generateplcdata", async (req, res) => {
//   //  Update or modified tags send to plc service.
//   var plcData = {};
//   const select = await sequelize.query(`select * from grouping_configuration`);
//   for await (const ele of select[0]) {
//     plcData[ele?.station_name + "_" + ele?.sensor_name] = ele?.tag_address;
//   }
//   var plcconfig = [];
//   plcconfig.push({
//     name: "plc-1",
//     // IP: `opc.tcp://${ip.connectionURLS}:4840`, Arut
//     IP: `${ip.connectionURLS}`,
//     rack: "0",
//     slot: "1",
//     port: "102",
//     refresh_rate: "1000",
//     Tags: plcData,
//   });
//   fs.writeFile(
//     "../plcService/configuration/plcConfig.json",
//     JSON.stringify({ plc_count: [0], plc_config: plcconfig }),
//     function (err) {
//       if (err) return console.log(err);
//     }
//   );
// });

// Below code is to be enable using OPCUA tags
// app.get("/generateplcdata", async (req, res) => {
//     //  Update or modified tags send to plc service.
//     var plcData={}
//     const select =  await sequelize.query(`select * from grouping_configuration`);
//     for await (const ele of select[0]) {
//         plcData[ele?.station_name+"_"+ele?.sensor_name]=ele?.tag_address
//     }
//     var plcconfig=[]
//                     plcconfig.push({
//                         "name":"plc-1",
//                         // "IP": `opc.tcp://${ip.connectionURLS}:4840`,
//                         // "refresh_rate":"1500",
//                         "IP":"192.168.18.99",
//                         "rack":"0",
//                         "slot":"1",
//                         "port":"102",
//                         "refresh_rate":"1000",
//                         "Tags":plcData
//             })
//         fs.writeFile('../plcService/configuration/plcConfig.json', JSON.stringify({"plc_count":[0],plc_config:plcconfig}), function (err) {
//             if (err) return console.log(err);
//         })
// })

// Below code is to be enable using OPCUA tags
// app.get("/generateplcdata", async (req, res) => {
//   //Update or modified tags send to OPC-UA-Client service.
//   var plcData = {};
//   const selects = await sequelize.query(`select b.station_name,b.ip,a.sensor_name,a.tag_address FROM grouping_configuration a inner join station_details b on b.stationname = a.station_name`);
//   const select = await sequelize.query(`select * from grouping_configuration`);
//   for await (const ele of select[0]) {
//     plcData[ele?.station_name + "_" + ele?.sensor_name] = ele?.tag_address;
//   }
//   var plcconfig = [];
//   plcconfig.push({
//     name: "plc-1",
//     // "IP": `opc.tcp://${ip.connectionURLS}:4840`,
//     // "refresh_rate":"1500",
//     refresh_rate: "1000",
//     Tags: plcData,
//   });
//   fs.writeFile(
//     "../OPC-UA-Client/configuration/opcuaConfig-teal.json",
//     JSON.stringify({ plc_count: [0], plc_config: plcconfig }),
//     function (err) {
//       if (err) return console.log(err);
//     }
//   );
// });

app.get("/generateplcdata", async (req, res) => {
  let plcData = {};
  let plcTags = [];
  let plcCount = [];
  const stationDetails = async () => {
    try {
      const station = await sequelize.query(
        `select distinct a.stationname,a.ip from station_details a inner join grouping_configuration b on b.station_name = a.stationname`
      );
      for (let c = 0; c < station[0].length; c++) {
        plcCount.push(c);
      }
      for (let i = 0; i < station[0].length; i++) {
        const stationTags = await sequelize.query(
          `SELECT station_name,sensor_name,tag_address FROM grouping_configuration where station_name='${station[0][i].stationname}'`
        );
        for (let j = 0; j < stationTags[0].length; j++) {
          plcData[
            stationTags[0][j].station_name + "_" + stationTags[0][j].sensor_name
          ] = (stationTags[0][j].tag_address).toString().toLocaleLowerCase();
        }
  
        plcTags.push(
          (tags = {
            name: `${station[0][i].stationname}`,
            IP: `opc.tcp:${station[0][i].ip}:4840`,
            refresh_rate: "1500",
            username: "TVS",
            password: "Tvs@123",
            Tags: plcData,
          })
        );
        plcData = {};
      }
      return { plcTags, plcCount };
    } catch (error) {
      console.log(error);
    }
    
  };
  stationDetails().then((tags) => {
    fs.writeFile(
      "../OPC-UA-Client/configuration/opcuaConfig-teal.json",
      JSON.stringify({ plc_count: tags.plcCount, plc_config: tags.plcTags },null,2),
      function (err) {
        if (err) return console.log(err);
        if (!err) return console.log("Tags Updated Successfully!!!");
      }
    );
  });
});

// var job = new CronJob(
// 	'* * 1 * * *',
// 	function() {
//     deleteActualData()
// 		console.log('You will see this message every second');
// 	},
// 	null,
// 	false
// );
