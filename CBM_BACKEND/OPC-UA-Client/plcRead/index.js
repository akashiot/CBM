const {
  OPCUAClient,
  AttributeIds,
  StatusCode,
  check_flag,
} = require("node-opcua");
const async = require("async");
const express = require("express");
const moment = require("moment");
var timestamp = moment().format("YYYY-MM-DDTHH:mm:ss.SSS");
const app = express();
const datafromplc = {};
var nodeidread = {};
var refresh = {};
const client = {};
const the_session = {};
let plcConnected = false;
const port = 3001;
const v8 = require("node:v8");
const stream = v8.getHeapSnapshot();
stream.addListener("close", () => {
  app.listen(`${port}`, () => {
    console.log(`server stoped and again listening port on ${port}`);
  });
});


//SIM
app.get("/getPlcData", async (req, res) => {
  return res.json(datafromplc);
});
app.listen(`${port}`, () => {
  console.log(`listening port on ${port}`);
});

exports.plcReadData = async function (plcinfo) {
  const endpointUrl = plcinfo.IP;
  console.log(endpointUrl)
  client[plcinfo.name] = OPCUAClient.create({ endpointMustExist: false });

  client[plcinfo.name].on("backoff", (retry, delay) => {
    console.log(
      `try to connect ${endpointUrl},retry ${retry} next attemt in ${
        delay / 1000
      } sec`
    );
    if (retry) {
      datafromplc[plcinfo.name] = {};
      datafromplc[plcinfo.name]["connection"] = false;
    }
  });
  //
  async.series([
    function (callback) {
      client[plcinfo.name].connect(endpointUrl, (err) => {
        if (err) {
          console.log(`can't connect to endpointUrl : ${endpointUrl}`);
        } else {
          datafromplc[plcinfo.name] = {};
          datafromplc[plcinfo.name]["connection"] = true;
          console.log("connected !!");
        }
        callback();
      });
    },
    // Authentication for device credentials
    function (callback) {
      if (plcinfo.username != "") {
        client[plcinfo.name].createSession(
          { userName: plcinfo.username, password: plcinfo.password },
          (err, session) => {
            //new line
            if (err) {
              console.log("Invalid username or password");
              return;
            }
            the_session[plcinfo.name] = session;
            callback();
          }
        );
      } else {
        client[plcinfo.name].createSession((err, session) => {
          if (err) {
            console.log("Invalid username or password");
            return;
          }
          the_session[plcinfo.name] = session;
          callback();
        });
      }
    },
    //reading data from plc
    function () {
      var sa = Object.keys(plcinfo.Tags);
      console.log(sa);
      clearInterval(refresh[plcinfo.name]);
      sa.forEach((element) => {
        refresh[plcinfo.name] = setInterval(() => {
          const nodeToRead = [
            { nodeId: plcinfo.Tags[element], attributeId: AttributeIds.Value },
          ];
          for (var i = 0; i < nodeToRead.length; i++) {
            const element1 = nodeToRead[i];
            the_session[plcinfo.name].read(element1, function (err, dataValue) {
              if (dataValue) {
                datafromplc[plcinfo.name] = {};
                datafromplc[plcinfo.name]["connection"] = true;
                if (!nodeidread[plcinfo.name]) nodeidread[plcinfo.name] = {};
                nodeidread[plcinfo.name][element]=dataValue.value.value
              }
              Object.keys(nodeidread[plcinfo.name]).forEach((key) => {
                const station = key.split("_")[0] + "_" + key.split("_")[1]; //sim
                if (!datafromplc[plcinfo.name][station])datafromplc[plcinfo.name][station] = {};
                datafromplc[plcinfo.name][station][key.split("_").slice(2).join("_")] = Number(nodeidread[plcinfo.name][key]); //sim
              });
            });
          }
          // console.log(datafromplc);
        }, plcinfo.refresh_rate);
      });
      // });
    },
  ]);
};
