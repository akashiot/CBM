const db = require("../CBM_Service/model/dbconfig");
const sequelize = require("./model/database");
const fs = require("fs");
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
        ] = stationTags[0][j].tag_address;
      }

      plcTags.push(
        (tags = {
          name: `${station[0][i].stationname}`,
          IP: `${station[0][i].ip}`,
          refresh_rate: "1500",
          tags: plcData,
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
    "../OPC-UA-Client/configuration/opc.json",
    JSON.stringify({ plc_count: tags.plcCount, plc_configs: tags.plcTags }),
    function (err) {
      if (err) return console.log(err);

    }
  );
});
