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
const nodeaddress = require("../configuration/opcuaConfig-teal.json");
const url = require("../configuration/connectionurl.json");
const datafromplc = {};
var nodeidread = {};
var refresh = {};
const ss = [];
let plcConnected = false;
const port = 3008;
const ip = require('../plcRead/connectionurl');

const connectionURL = `opc.tcp://${ip.connectionURLS}:4840`;
console.log(connectionURL);

app.get("/getopcuadata", async (req, res) => {
  return res.json(datafromplc);
});
app.listen(`${port}`, () => {
  console.log(`listening port on ${port}`);
});

exports.plcReadData = async (plcinfo) => {
  // const endpointUrl = plcinfo.IP;  // Manual update of ip address
  const endpointUrl = connectionURL;  // It will take the local ip address Arut
  const client = OPCUAClient.create({ endpointMustExist: false });

  client.on("backoff", (retry, delay) => {
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
  async.series([
    function (callback) {
      client.connect(endpointUrl, (err) => {
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
    function (callback) {
      client.createSession((err, session) => {
        if (err) {
          console.log("Invalid username or password");
          return;
        }
        the_session = session;
        callback();
      });
    },
    //reading data from plc
    function () {
      var sa = Object.keys(plcinfo.Tags);
      clearInterval(refresh[plcinfo.name]);
      sa.forEach((element) => {
        refresh[plcinfo.name] = setInterval(() => {
          const nodeToRead = [
            { nodeId: plcinfo.Tags[element], attributeId: AttributeIds.Value },
          ];
              //   may be unwanted for loop #Arut
          for (var i = 0; i < nodeToRead.length; i++) {
            const element1 = nodeToRead[i];
            the_session.read(element1, function (err, dataValue) {
              if (dataValue) {
                // console.log("datafromplc",datafromplc);
                datafromplc[plcinfo.name] = {};
                datafromplc[plcinfo.name]["connection"] = true;
                nodeidread[element] = dataValue.value.value[1];
              }
              Object.keys(nodeidread).forEach((key) => {
                const station = key.split("_")[0] + "_" + key.split("_")[1];
                if (!datafromplc[plcinfo.name][station])
                  datafromplc[plcinfo.name][station] = {};
                datafromplc[plcinfo.name][station][
                  key.split("_").slice(2).join("_")
                ] = nodeidread[key];
              });
            });
          }
        }, plcinfo.refresh_rate);
      });
    },
  ]);
};
// opc.tcp://HTLP0002:4334/UA/MyLittleServer
