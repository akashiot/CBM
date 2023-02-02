const {OPCUAClient, AttributeIds, StatusCode, check_flag}=require('node-opcua')
const async =require('async')
const express =require('express')
const app=express()
const datafromplc={}
var nodeidread={}
var refresh={}
const port=3008;
const ip = require('../plcRead/connectionurl');

const connectionURL = `opc.tcp://${ip.connectionURLS}:4840`;
console.log(connectionURL);

app.get("/getopcuadata", async (req, res) => {
    // Pass the actual PLC data based on the OPCUA configuration
    return res.json(datafromplc)
})
app.listen(`${port}`,()=>{
    // OPCUA services execution started on the configured port.
    console.log(`listening port on ${port}`);
})
exports.plcReadData = async function (plcinfo){
// Get response from OPCUA tags
// const endpointUrl=plcinfo.IP Arut
const endpointUrl = connectionURL;  // It will take the local ip address
const client = OPCUAClient.create({endpointMustExist:false})
// Retrying connection if device connection is lost
client.on("backoff",(retry,delay)=>{
    console.log(`try to connect ${endpointUrl},retry ${retry} next attemt in ${delay/1000} sec`)
    if (retry) {
        datafromplc[plcinfo.name]={}
        datafromplc[plcinfo.name]['connection']=false
    }
    
})
// 
async.series([
    function(callback){
        client.connect(endpointUrl,(err)=>{
            if(err){
                console.log(`can't connect to endpointUrl : ${endpointUrl}`)
            }
            else { 
                datafromplc[plcinfo.name]={}
                datafromplc[plcinfo.name]['connection']=true
                console.log("connected !!")
        }
        callback()

        })
    },
    // Authentication for device credentials
    function(callback){
        // client.createSession({userName:url.username,password:url.password},(err,session)=>{      //new line
        client.createSession((err,session)=>{
            if(err) {console.log("Invalid username or password"); return}
            // else if(session){
                the_session=session
                callback()
            // }            
        })
    },  
     function (){  
        //Reading data from plc based on the OPCUA configuration     
        var sa =Object.keys(plcinfo.Tags)
        clearInterval(refresh[plcinfo.name])
        sa.forEach(element => { 
            refresh[plcinfo.name]=setInterval(() => {
            const nodeToRead=[
                {nodeId:plcinfo.Tags[element],attributeId:AttributeIds.Value}
            ]
                    for (var i = 0; i < nodeToRead.length; i++) {
                        const element1 = nodeToRead[i];
                        the_session.read(element1,function(err,dataValue){
                            if(dataValue) {
                            datafromplc[plcinfo.name]={}
                            datafromplc[plcinfo.name]['connection']=true
                            nodeidread[element]=dataValue.value.value[1]
                        }
                        Object.keys(nodeidread).forEach(key => {
                            const station= key.split('_')[0]+ '_' + key.split('_')[1]
                            if(!datafromplc[plcinfo.name][station]) datafromplc[plcinfo.name][station]={}
                            datafromplc[plcinfo.name][station][key.split("_").slice(2).join("_")]=nodeidread[key]
                        });
                    });
                     }
        }, plcinfo.refresh_rate );
    })
    }
])
}
