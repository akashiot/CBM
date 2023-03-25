const db = require("../CBM_Service/model/dbconfig");
const sequelize = require("./model/database");
const fs = require("fs");



db.query(
  `select distinct a.station_name,b.ip from grouping_configuration a inner join station_details b on b.stationname = a.station_name`,

  (err, records) => 
  {
    let plc_count = [];
    let plc_config1 = [];
    let plcData = {};
    let plc_configs;
    let ele = [];
    // console.log(tags)
   records.forEach((element, index) => {
      plc_count.push(index);
      ele.push(element);
      db.query(
        `SELECT sensor_name,tag_address FROM grouping_configuration where station_name='${element.station_name}'`,
        (err, records) => {
          records.forEach((tags) => {
            plcData[element.station_name + "_" + tags.sensor_name] =
              tags.tag_address;
          });
           tags = {
            name: `${element.station_name}`,
            IP: `${element.ip}`,
            refresh_rate: "1500",
            tags: plcData,
          };
          const obj = {plc_count: plc_count, plc_configs: tags}
          plcData = {};
          //console.log(tags)
        });
        
        
      
    });
  }
);

