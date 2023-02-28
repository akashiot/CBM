var nodes7 = require('nodes7');
var cors=require('cors')
const express= require('express')
const app=express()
app.use(cors());
const port=3001;

var datafromPlc = {}
app.get("/getPlcData", async (req, res) => {
    // Pass the actual PLC data based on the PLC configuration
    return res.json(datafromPlc)
})

app.listen(`${port}`,()=>{
    // plc services execution started on the configured port.
    console.log(`listening port on ${port}`);
})

var conn = {}
var timeRef = {}
exports.plcReadData = async function (plcInfo){
    // Get response from PLC tags
        conn[plcInfo.name] = new nodes7;
        if(!datafromPlc[plcInfo.name]) datafromPlc[plcInfo.name] = {}
        await initPLC()
        async function clearPLC() {
            try {
                if (server.clients.size === 0) {
                    await clearInterval(timeRef[plcInfo.name])
                    await conn[plcInfo.name].dropConnection()
                }
            } catch (err) { console.log('Error While Clearing PLC Connection') }
        }
        // Retrying connection if device connection is lost
        async function initPLC () {
            try { await clearInterval(timeRef[plcInfo.name]) } catch { }
            try {
                    try { connectPLC() } catch { console.log('Error While Initating PLC Connection') }
            } catch (err) { console.log(err, 'Error while disconnecting') }
        
        }
        async function reInitPLC() {
            try { await clearInterval(timeRef[plcInfo.name]) } catch { }
            try {
                    try { connectPLC() } catch { console.log('Error While Initating PLC Connection') }
            } catch (err) { console.log(err, 'Error while disconnecting') }
        
        }
        async function connectPLC() {
            // Initiate PLC connection
            try {
                const a = conn[plcInfo.name].initiateConnection({
                    host:plcInfo.IP,
                    port: plcInfo.port,
                    rack: plcInfo.rack,
                    slot:plcInfo.slot 
                }, connected);
            } catch (err) {
                console.log(err, 'While Connecting to PLC')
            }
        }       
        async function connected(err) {
            // Checking condition PLC is connected or not
            if(!datafromPlc[plcInfo.name]) datafromPlc[plcInfo.name] = {}
            if (typeof (err) !== 'undefined') {
                datafromPlc[plcInfo.name]['connection'] = false
                reInitPLC();
                console.log('PLC intialization error', plcInfo.name);
             }  else {
                datafromPlc[plcInfo.name]['connection'] = true
                startReading()
                plcConnected = true
            }
        }
        async function startReading() {
            //Reading data from plc based on the PLC configuration     
            const dataTags = Object.keys(plcInfo.Tags)
            await conn[plcInfo.name].setTranslationCB(function (tag) { return plcInfo.Tags[tag]; });
            await conn[plcInfo.name].removeItems()
            await conn[plcInfo.name].addItems(dataTags);
            timeRef[plcInfo.name] = await setInterval(function () {
                conn[plcInfo.name].readAllItems(valuesReady)
            }, plcInfo.refresh_rate);
        }

        async function valuesReady(anythingBad, values) {
            try {
                if (anythingBad) {
                    datafromPlc[plcInfo.name]['connection'] = false
                     console.log("SOMETHING WENT WRONG READING VALUES!!!!"); 
                    } else {
                        datafromPlc[plcInfo.name]['connection'] = true
                    }
                    if(!datafromPlc[plcInfo.name]) datafromPlc[plcInfo.name]= {}
                    Object.keys(values).forEach((key) => {
                        const station = key.split('_')[0]
                        if(!datafromPlc[plcInfo.name][station]) datafromPlc[plcInfo.name][station]={}
                        datafromPlc[plcInfo.name][station][key.split("_").slice(1).join("_")] = values[key]
                    });
                }
            catch (err) { console.error(err) }
        }
    }