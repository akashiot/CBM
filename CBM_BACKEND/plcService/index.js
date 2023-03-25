const fs= require('fs')
const plc = require('./plcRead')
const stn_settings = require('./configuration/plcConfig.json')


    var plcCount = stn_settings.plc_count;
    var plcconfig=stn_settings.plc_config;
    plcCount.forEach(i => {
        // Calling PLC service in index page
        const plcInfo = plcconfig[i]
        plc.plcReadData(plcInfo);
    });   



    

