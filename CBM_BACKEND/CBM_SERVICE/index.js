const express = require("express");
const cors = require("cors");
const axios = require("axios");
const moment = require("moment");
const fs = require("fs");
var bodyparser = require("body-parser");
const sequelize = require("./model/database");
var settings = require('./configuration/config.json');
var limits = require("./controller/sensorconfiguration");
var grpconfig = require("./controller/groupingsensor");
var alert = require("./controller/alertlog");
var actual = require("./controller/actualValues");
var reports = require("./controller/report");
const ip = require("../OPC-UA-Client/plcRead/connectionurl");
const fileupload = require("../CBM_Service/controller/fileUpload");
const path = require("path");
const db = require("../CBM_Service/model/database");
const CronJob = require('cron').CronJob;

// const opcua = `http://${ip.connectionURLS}:3008`; // simu
// const plcurl = `http://${ip.connectionURLS}:3001`; //simu
// const opcua = `http://172.22.59.68:3008`;//172.22.59.68
const plcurl = `http://172.22.59.68:3001`;
console.log("plcurl endpointUrl", plcurl);
// console.log("opcua endpointUrl", opcua);
const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname + "../../CBM_FRONTEND/build")));
app.use(bodyparser.json());

const port = 7004;
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
  console.log("api")
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

app.post("/upload",(req, res)=>{
  fileupload.insertData(req, res)
});
/*** CONFIGURATION API's END****/

var stationNo;
async function valuesReady() {
  //1. Reading PLC data from the Configured PLC tags ,
  //2. Read values pass to actualvalue function to log the live data,
  //3. Read values pass to alertLog function to log the alarms,
  try {
    // const res = await axios.get(settings.plcUrl + "/getPlcData");
    // "http://192.168.200.216:3001",
    // const res = await axios.get(`http://${ip.connectionURLS}:3001` + "/getPlcData");
    const res = await axios.get(plcurl + "/getPlcData");
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
  //Format live data based on stationwise configuration
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
app.get("/generateplcdata", async (req, res) => {
//  Update or modified tags send to OPC-UA-Client service.
    var plcData={}
    const select =  await sequelize.query(`select * from grouping_configuration`);
    for await (const ele of select[0]) {
        plcData[ele?.station_name+"_"+ele?.sensor_name]=ele?.tag_address
    }
    var plcconfig=[]
            plcconfig.push({
                "name":"plc-1",
                // "IP": `opc.tcp://${ip.connectionURLS}:4840`,
                // "refresh_rate":"1500",
                "refresh_rate":"1500",
                "Tags":plcData
    })
    fs.writeFile('../OPC-UA-Client/configuration/opcuaConfig-teal.json', JSON.stringify({"plc_count":[0],plc_config:plcconfig}), function (err) {
    if (err) return console.log(err);
    })
})

function deleteActualData(){
  const sql = `DELETE from actual_data where time_stamp < now() - interval 5 minute;`
  db.query(sql,(err,rows)=>{
    console.log("rows",rows);
  });
}

var job = new CronJob(
	'* * 1 * * *',
	function() {
    deleteActualData()
		console.log('You will see this message every second');
	},
	null,
	false
);
