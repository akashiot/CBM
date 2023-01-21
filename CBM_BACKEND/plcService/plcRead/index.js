var nodes7 = require('nodes7');
var cors=require('cors')
const express= require('express')
const  fs=require('fs');
const sequelize = require('../configuration/database.js')
const app=express()
app.use(cors());
const port=3001;

let plcConnected = false;
var readVar;
var datafromPlc = {}
var jsonData={}
app.get("/getPlcData", async (req, res) => {
    return res.json(datafromPlc)
})

app.listen(`${port}`,()=>{
    console.log(`listening port on ${port}`);
})

var conn = {}
var timeRef = {}

exports.plcReadData = async function (plcInfo){
    
        conn[plcInfo.name] = new nodes7;
        if(!datafromPlc[plcInfo.name]) datafromPlc[plcInfo.name] = {}
        // if(!timeRef[plcInfo.name]) timeRef[plcInfo.name] = {}
        await initPLC()
        async function clearPLC() {
            try {
                if (server.clients.size === 0) {
                    await clearInterval(timeRef[plcInfo.name])
                    await conn[plcInfo.name].dropConnection()
                }
            } catch (err) { console.log('Error While Clearing PLC Connection') }
        }

        async function initPLC () {
            try { await clearInterval(timeRef[plcInfo.name]) } catch { }
            try {
                // await conn[plcInfo.name].dropConnection(() => {
                    try { connectPLC() } catch { console.log('Error While Initating PLC Connection') }
                // })
            } catch (err) { console.log(err, 'Error while disconnecting') }
        
        }
        async function reInitPLC() {
            try { await clearInterval(timeRef[plcInfo.name]) } catch { }
            try {
                // await conn[plcInfo.name].dropConnection(() => {
                    try { connectPLC() } catch { console.log('Error While Initating PLC Connection') }
                // })
            } catch (err) { console.log(err, 'Error while disconnecting') }
        
        }

        async function connectPLC() {
            // console.log(plcInfo.name);
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
                        // console.log(values)
                        datafromPlc[plcInfo.name]['connection'] = true
                    }
                    if(!datafromPlc[plcInfo.name]) datafromPlc[plcInfo.name]= {}
                    Object.keys(values).forEach((key) => {
                        const station = key.split('_')[0]
//  console.log(station)
                        if(!datafromPlc[plcInfo.name][station]) datafromPlc[plcInfo.name][station]={}
                        datafromPlc[plcInfo.name][station][key.split("_").slice(2).join("_")] = values[key]
                    });
                }
            catch (err) { console.log(err) }
        }
    }