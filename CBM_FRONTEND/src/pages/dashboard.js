import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBTypography, MDBRadio, 
        MDBAccordion ,MDBAccordionItem, MDBTable, MDBTableBody, MDBBadge, MDBTableHead, MDBBtn} from "mdb-react-ui-kit";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChartSimple, faTable, faHouseCrack, faSquareRss, faCircle ,faChartColumn,faCircleInfo} from '@fortawesome/free-solid-svg-icons';
import Navbar from "../components/navbar";
import Sparkline from "../components/dashboard/sparklines";
import Alerttable from "../components/dashboard/Alerttable";
import Chart from "../components/dashboard/chart";
import Multilinechart from "../components/dashboard/multilinechart";
import url from 'D:/cbm/CBM Projects/CBM_FRONTEND/src/configuration/url.json'
import { useContext } from "react";
import { UserContext } from "../components/context"; 
import { message, Popover } from "antd";
import axios from "axios";
import moment from "moment";

function Dashboard(){
    const changepage = useNavigate();
    if(localStorage.getItem("username")===null){
        changepage('/')
    }
    const {selectStation,setSelectStation,
        selectSensorIndex,setSelectSensorIndex,
        sensorName,setSensorName,
        seriesX,setseriesX,
        seriesY,setseriesY,
        seriesLSL,setSeriesLSL,
        seriesHSL,setSeriesHSL,
        plcLiveData,setPlcLiveData,
        onehourData,setOnehourData,
        alert,setAlert,
        command,setCommand,
        dataSwaper,setDataSwaper,
        invoke,setInvoke,
        tabControl,setTabControl,
        onehourGroupData,setOnehourGroupData,
        radioSelected,setRadioSelected} =useContext(UserContext)

    const [station,setStation]=useState(selectStation)
    const [sensorIndex,setSensorIndex]=useState(selectSensorIndex)
    const [tableStation,setTableStation]=useState(selectStation)
    const [tableSensor,setTableSensor]=useState(sensorName)
    const [xAxis,setXAxis]=useState(seriesX)
    const [yAxis,setYAxis]=useState(seriesY)
    const [lsl,setLsl]=useState(seriesLSL)
    const [hsl,setHsl]=useState(seriesHSL)
    const [swap,setSwap]=useState(true)
    const [overLap,setOverLap]=useState(false)
    const [invokeMulitiLine,setInvokeMultiLine]=useState(true)
    const [multiLineStation,setMultiLineStation]=useState('')
    const [multiLineXaxis,setMultiLineXaxis]=useState([])
    const [multiLineYaxis,setMultiLineYaxis]=useState([])
   

    const [trigger,setTrigger]=useState(false)
    const [description,setDescription]=useState('')
    const [filter,setFilter]=useState('')
    const [err,setErr]=useState(false)
    const [stn,setStn]=useState('')
    const [par,setPar]=useState('')
    const [faultCount,setFaultCount]=useState({})
    

       

    const alarm = async(stn,par)=>{
        let typeCount=[]
        try {
            const alert = await axios.post(url?.baseurl2+"alert/alertDetails",{
                fromDate:moment().subtract(180, 'minutes').format('YYYY-MM-DD HH:mm:ss.SSS'),
                toDate:moment().format('YYYY-MM-DD HH:mm:ss.SSS')
            })
            if(alert?.data?.status===true){
                setStn(stn);
                setPar(par);
                setAlert(alert?.data?.Result);
                alert?.data?.Result.forEach((e,i)=>{
                    if(e?.station===stn && e?.sensor===par){
                        typeCount.push(e?.fault_type)
                    }
                })
                const counts = {};
                typeCount.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; });
                setFaultCount(counts)
            }
            else if(alert?.data?.status===false){
                message.error(alert?.data?.Result);
            }
        } catch (error) {
            message.error(error?.message)
        }
    }
 

    const val=Object.keys(onehourData);
    const group =Object.keys(onehourGroupData);

    const test= (par) =>{
        const content = (
            <div>
              <p className="fw-bold">Part Number : {par}</p>
              <p className="fw-bold">Make : TEAL</p>
              <p className="fw-bold">Description </p>
              <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. <br></br>Quis, veniam maxime placeat distinctio error pariatur repudiandae Culpa.</p>
              <MDBBtn rounded color='info' size="sm" className="fw-bold" onClick={()=>{console.log(par)}}>Export</MDBBtn>
            </div>
          );
          setDescription(content)
    }


    useEffect(()=>{
    setTrigger(!trigger)
    let xaxis=[];
    let series=[];
    let multiLine=[];
        if(onehourData?.[multiLineStation]!==undefined){
            Object.keys(onehourData?.[multiLineStation]).forEach((data,i)=>{
                if(i===0){
                    xaxis=onehourData?.[multiLineStation]?.[data]?.xaxis;
                    series.push(
                        {
                            data: onehourData?.[multiLineStation]?.[data]?.lsl,
                            name:"LSL",
                            type: 'line',
                            smooth: true,
                            showSymbol: false,
                            animation:false,
                            lineStyle: {
                              normal: {
                                width: 3,
                                color:"#FFEA00",
                                type: 'dashed',
                              }
                            }
                          },
                          {
                            data: onehourData?.[multiLineStation]?.[data]?.hsl,
                            name:"HSL",
                            type: 'line',
                            smooth: true,
                            showSymbol: false,
                            animation:false,
                            lineStyle: {
                              normal: {
                                width: 3,
                                color:"#00E676",
                                type: 'dashed'
                              }
                            }
                          }
                    )
                  }
                  multiLine.push({
                                data: onehourData?.[multiLineStation]?.[data]?.yaxis,
                                name:data.toUpperCase(),
                                type: 'line',
                                smooth: true,
                                showSymbol: false,
                                animation:false,
                                lineStyle: {
                                    normal: {
                                    width: 3,
                                    }
                                },
                  })
            })
        }
        let multiSeries=series.concat(multiLine);

        setMultiLineXaxis(xaxis);
        setMultiLineYaxis(multiSeries)
    })
;
    return(
        <MDBContainer fluid className="py-2" id="container" style={{backgroundColor:"#FAFAFA"}}>
            <Navbar/>
            
            <MDBRow className="mt-2">
                <MDBCol lg="6" className="px-3 py-2">
                    <MDBCard className="border shadow rounded-6" style={{height:'100%',width:'100%',minHeight:"85vh"}}>
                   
                        <div className="px-5 bg-info shadow" id="header" style={{borderRadius:" 12px 12px 0 0"}}>
                            <MDBTable  className="text-center" borderless responsive style={{marginBottom:"0px"}}>
                                <MDBTableHead className="shado1w">
                                    <tr>
                                        <th className="text-uppercase fw-bold text-light fs-6">sensor name</th>
                                        <th className="text-uppercase fw-bold text-light fs-6">lsl</th>
                                        <th className="text-uppercase fw-bold text-light fs-6">actual</th>
                                        <th className="text-uppercase fw-bold text-light fs-6">hsl</th>
                                        <th className="text-uppercase fw-bold text-light fs-6">chart</th>
                                    </tr>
                                </MDBTableHead>
                            </MDBTable>
                        </div>
                        <div className="d-flex justify-content-around shadow px-4 py-2 bg-info" id="mobilePixel" style={{borderRadius:"12px 12px 0 0"}}>
                            <MDBTypography tag={'h6'} className="fw-bold text-light pt-2">SN</MDBTypography>
                            <MDBTypography tag={'h6'} className="fw-bold text-light pt-2">LSL</MDBTypography>
                            <MDBTypography tag={'h6'} className="fw-bold text-light pt-2">Actual</MDBTypography>
                            <MDBTypography tag={'h6'} className="fw-bold text-light pt-2">HSL</MDBTypography>
                            <MDBTypography tag={'h6'} className="fw-bold text-light pt-2">Alm</MDBTypography>
                            <MDBTypography tag={'h6'} className="fw-bold text-light pt-2">Chart</MDBTypography>                             
                        </div>

                        <div className="px-3 py-3">
                            <MDBRadio name='inlineRadio' id='inlineRadio1' value='option1' label='StationWise' onClick={()=>{setCommand("stationwise");setRadioSelected(true);setInvoke(false);setSwap(true);setTableStation('');setTableSensor('');setseriesX([]);setseriesY([]);setSeriesLSL([]);setSeriesHSL([]);setMultiLineStation('')}} inline defaultChecked={radioSelected ? true : false}/>
                            <MDBRadio name='inlineRadio' id='inlineRadio2' value='option2' label='Groupwise' onClick={()=>{setCommand("groupwise");setFilter('');setRadioSelected(false);setInvoke(true);setSwap(false);setTableStation('');setTableSensor('');setseriesX([]);setseriesY([]);setSeriesLSL([]);setSeriesHSL([])}} inline  defaultChecked={radioSelected ? false : true}/>
                        </div>
                        <MDBRow className="px-1">
                            <MDBCol lg="5" className="px-4">
                                <label className="fw-bold" hidden={radioSelected ? false : true}>Filter Sensor</label>
                                <input type={radioSelected ? "text" : "hidden"} className="form-control" placeholder="Enter sensor name to filter" value={filter} onChange={(e)=>{setFilter(e.target.value)}}></input>
                            </MDBCol>
                            <MDBCol lg="7" className="pt-4">
                                {err ? <p className="text-danger fw-bold">Sensor Not Found!</p> : null}
                            </MDBCol>
                         </MDBRow>
                            
                            <div style={{height:'68vh',width:'100%',overflowY:"scroll"}}>
                                <MDBAccordion alwaysOpen initialActive={1} className="shad1ow p-3">
                                    {
                                        val.map((item,index)=>{
                                            let match = Object.keys(onehourData?.[item]).find((element,i) => {
                                                if (element.includes(filter)){
                                                  return true
                                                }
                                                else if(!element.includes(filter)){
                                                    return false
                                                }
                                              });
                                            let accordionItemName=<h6 className="fw-bold text-capitalize"><FontAwesomeIcon icon={faHouseCrack} className="text-info fs-6 px-2"/>{item} </h6>
                                            return <MDBAccordionItem hidden={match!==undefined ? false : true} collapseId={index+1} key={index} headerTitle={accordionItemName}>
                                                {
                                                    radioSelected ? null :
                                                    <div className="d-flex justify-content-end">
                                                        <MDBBtn rounded color="info" size="sm" className="fw-bold mx-2 mb-2" onClick={()=>{ 
                                                            setMultiLineStation(item);
                                                            setInvokeMultiLine(!invokeMulitiLine);
                                                            setOverLap(true);
                                                            setStation('');
                                                            setSensorIndex('')}}>
                                                            <FontAwesomeIcon icon={faChartColumn} className="text-light fs-6 px-0"/> All
                                                        </MDBBtn>
                                                    </div>
                                                }
                                                        <MDBTable className="shadow border" hover responsive>
                                                        <MDBTableBody>
                                                            {
                                                            Object.keys(onehourData?.[item]).map((d,i)=>{
                                                                const data=onehourData?.[item][d]
                                                                if(d.includes(filter)){
                                                                    let classactive=""
                                                                        if(item===station && i===sensorIndex){
                                                                            classactive="active"
                                                                        }
                                                                        let num=data?.yaxis?.slice(-1);
                                                                    let actual=<p className="fw-bold text-success">{parseFloat(num).toFixed(2)+" "+data?.unit}</p>
                                                                    if(parseFloat(data?.yaxis.slice(-1)[0]) < parseFloat(data?.lsl.slice(-1)[0])){
                                                                        actual=<p className="fw-bold text-warning">{parseFloat(num).toFixed(2)+" "+data?.unit}</p>
                                                                    }
                                                                    else  if(parseFloat(data?.yaxis.slice(-1)[0]) > parseFloat(data?.hsl.slice(-1)[0])){
                                                                        actual=<p className="fw-bold text-danger">{parseFloat(num).toFixed(2)+" "+data?.unit}</p>
                                                                    }
                                                                    let title=<p className="fw-bold text-capitalize">{data?.name}</p>
                                                                    return <tr key={i} className={classactive} onClick={()=>{
                                                                                setOverLap(false)
                                                                                setStation(item);
                                                                                setSelectStation(item);
                                                                                setSensorIndex(i);
                                                                                setSelectSensorIndex(i);
                                                                                setTableStation(item);
                                                                                setTableSensor(swap ? data?.name : data?.sensorname);
                                                                                setSensorName(data?.name);
                                                                                setXAxis(data?.xaxis);
                                                                                setseriesX(data?.xaxis);
                                                                                setYAxis(data?.yaxis);
                                                                                setseriesY(data?.yaxis);
                                                                                setLsl(data?.lsl);
                                                                                setSeriesLSL(data?.lsl);
                                                                                setHsl(data?.hsl);
                                                                                setSeriesHSL(data?.hsl);
                                                                                swap ? 
                                                                                alarm(item,data?.name) : alarm(data?.name,data?.sensorname)
                                                                            }}>
                                                                                <td className="fw-bold text-capitalize">{swap ? data?.name : data?.name+" / "+data?.sensorname}
                                                                                <Popover placement="bottomLeft" title={title} content={description} onMouseEnter={()=>{test(i+1)}}>
                                                                                    <FontAwesomeIcon icon={faCircleInfo} className="text-info fs-7 px-1"/>
                                                                                </Popover>
                                                                                </td>
                                                                                <td className="fw-bold">{data?.lsl.slice(-1)+" "+data?.unit}</td>
                                                                                <td className="fw-bold">{actual}</td>
                                                                                <td className="fw-bold">{data?.hsl.slice(-1)+" "+data?.unit}</td>
                                                                                <td className="fw-bold" style={{width:"200px"}}>
                                                                                    <Sparkline series={data?.yaxis || []} trigger={trigger}/>
                                                                                </td>
                                                                        </tr>
                                                                }
                                                                })
                                                            }
                                                        </MDBTableBody>
                                                        </MDBTable>
                                                </MDBAccordionItem>
                                        })
                                    }
                                </MDBAccordion>
                                </div>
                    </MDBCard>
                </MDBCol>
                <MDBCol lg="6" className="px-3 py-2">
                    <MDBRow>
                        <MDBCol lg='12' className="mb-2">
                            <MDBCard className="border shadow rounded-6" style={{minHeight:'440px'}}>
                            <div className="d-flex justify-content-start shadow px-3 py-2 bg-info" style={{borderRadius:"12px 12px 0 0"}}>
                            <MDBTypography tag={'h6'} className="fw-bold text-light text-capitalize pt-2"><FontAwesomeIcon icon={faTable} className="text-light fs-6 px-1"/>Alert Summary</MDBTypography>                          
                            </div>
                            <MDBRow className="px-2">                                
                                <MDBCol lg="12" className="d-flex justify-content-center pt-2 mb-1" id="badgeHeader">
                                    <MDBBadge pill className='mx-2 my-2 p-2 bor1der border-primary' color='primary' light>
                                        Instant Count : {faultCount?.["Instant"] || 0}
                                    </MDBBadge>
                                    <MDBBadge pill className='mx-2 my-2 p-2 bor1der border-danger' color='danger' light>
                                        10 Min Count : {faultCount?.["Ten Minute"] || 0}
                                    </MDBBadge>

                                    <MDBTypography tag={'h6'} className="text-muted fw-bold pt-2 mt-1 px-2"><FontAwesomeIcon icon={faCircle} className="text-warning fs-6 px-1"/>Low Limit</MDBTypography>
                                    <MDBTypography tag={'h6'} className="text-muted fw-bold pt-2 mt-1 px-2"><FontAwesomeIcon icon={faCircle} className="text-success fs-6 px-1"/>Normal</MDBTypography>
                                    <MDBTypography tag={'h6'} className="text-muted fw-bold pt-2 mt-1 px-2"><FontAwesomeIcon icon={faCircle} className="text-danger fs-6 px-1"/>High Limit</MDBTypography>
                                </MDBCol>

                                <MDBCol lg="12" className="d-flex justify-content-center pt-2 mb-1 px-1" id="badgeMobilePixel">
                                    <MDBBadge pill className='mx-1 my-2 p-2 border-primary' color='primary' light>
                                        Instant : {faultCount?.["Instant"] || 0}
                                    </MDBBadge>
                                    <MDBBadge pill className='mx-1 my-2 p-2 border-danger' color='danger' light>
                                        10 Min : {faultCount?.["Ten Minute"] || 0}
                                    </MDBBadge>

                                    <MDBTypography tag={'p'} className="text-muted fw-bold pt-2 mt-1  d-flex" style={{fontSize:'12px'}}><FontAwesomeIcon icon={faCircle} className="text-warning fs-6 px-1"/>LSL</MDBTypography>
                                    <MDBTypography tag={'p'} className="text-muted fw-bold pt-2 mt-1  d-flex" style={{fontSize:'12px'}}><FontAwesomeIcon icon={faCircle} className="text-success fs-6 px-1"/>Actual</MDBTypography>
                                    <MDBTypography tag={'p'} className="text-muted fw-bold pt-2 mt-1  d-flex" style={{fontSize:'12px'}}><FontAwesomeIcon icon={faCircle} className="text-danger fs-6 px-1"/>HSL</MDBTypography>
                                </MDBCol>

                                <MDBCol lg="12" className="d-flex justify-content-center pt-2 mb-1 px-1" id="badgeTabPixel">
                                    <MDBBadge pill className='mx-2 my-2 p-2 border-primary' color='primary' light>
                                        Instant : {faultCount?.["Instant"] || 0}
                                    </MDBBadge>
                                    <MDBBadge pill className='mx-2 my-2 p-2 border-danger' color='danger' light>
                                        10 Min : {faultCount?.["Ten Minute"] || 0}
                                    </MDBBadge>

                                    <MDBTypography tag={'p'} className="text-muted fw-bold pt-2 mt-1 px-1 d-flex" style={{fontSize:'12px'}}><FontAwesomeIcon icon={faCircle} className="text-warning fs-6 px-1"/>LSL</MDBTypography>
                                    <MDBTypography tag={'p'} className="text-muted fw-bold pt-2 mt-1 px-1 d-flex" style={{fontSize:'12px'}}><FontAwesomeIcon icon={faCircle} className="text-success fs-6 px-1"/>Actual</MDBTypography>
                                    <MDBTypography tag={'p'} className="text-muted fw-bold pt-2 mt-1 px-1 d-flex" style={{fontSize:'12px'}}><FontAwesomeIcon icon={faCircle} className="text-danger fs-6 px-1"/>HSL</MDBTypography>
                                </MDBCol>
                            </MDBRow>
                            <div className="p-3" >
                                <MDBTypography tag={'p'} className="fw-bold text-center text-muted text-capitalize">{stn} : {par} Last One Hour Alarm Record</MDBTypography>
                                <Alerttable station={stn} sensor={par} data={alert} trigger={trigger}/>
                            </div>
                            </MDBCard>
                        </MDBCol>
                        <MDBCol lg='12'>
                            <MDBCard className="border shadow rounded-6" style={{height:"100%",minHeight:"470px"}}>
                            <div className="d-flex justify-content-start shadow px-3 py-2 bg-info" style={{borderRadius:"12px 12px 0 0"}}>
                            <MDBTypography tag={'h6'} className="fw-bold text-light text-capitalize pt-2"><FontAwesomeIcon icon={faChartSimple} className="text-light fs-6 px-1"/>Graphical Visualization</MDBTypography>                          
                            </div>
                            <div className="d-flex justify-content-center pt-2 mb-n5">
                                <MDBTypography tag={'h6'} className="text-muted fw-bold pt-2 px-2"><FontAwesomeIcon icon={faCircle} className="text-warning fs-6 px-1"/>Low Limit</MDBTypography>
                                <MDBTypography tag={'h6'} className="text-muted fw-bold pt-2 px-2"><FontAwesomeIcon icon={faCircle} className="text-success fs-6 px-1"/>Normal</MDBTypography>
                                <MDBTypography tag={'h6'} className="text-muted fw-bold pt-2 px-2"><FontAwesomeIcon icon={faCircle} className="text-danger fs-6 px-1"/>High Limit</MDBTypography>
                            </div>
                            {
                                overLap ? <div>
                                            {
                                                Object.keys(onehourData).indexOf(multiLineStation)!== -1 ?
                                                <Multilinechart data={onehourData?.[multiLineStation]} station={multiLineStation} x={multiLineXaxis} y={multiLineYaxis} trigger={trigger}/>:null
                                                // <Multilinechart data={{}} station={''} x={[]} y={[]} trigger={trigger}/>
                                            }  
                                        </div>:
                                        <div>
                                            {
                                                Object.keys(onehourData).indexOf(tableStation) !== -1 ?
                                                <Chart xAxis={onehourData?.[tableStation]?.[tableSensor]?.xaxis} 
                                                    yAxis={onehourData?.[tableStation]?.[tableSensor]?.yaxis} 
                                                    trigger={trigger} 
                                                    label1={tableStation} 
                                                    label2={tableSensor} 
                                                    lsl={onehourData?.[tableStation]?.[tableSensor]?.lsl} 
                                                    hsl={onehourData?.[tableStation]?.[tableSensor]?.hsl} 
                                                    lslLimit={onehourData?.[tableStation]?.[tableSensor]?.lsl.slice(-1)[0]} 
                                                    hslLimit={onehourData?.[tableStation]?.[tableSensor]?.hsl.slice(-1)[0]}/> :
                                                <Chart xAxis={[]} 
                                                        yAxis={[]} 
                                                        trigger={trigger} label1={''} label2={''} 
                                                        lsl={[]} 
                                                        hsl={[]} 
                                                        lslLimit={0} 
                                                        hslLimit={0}/>
                                            }
                                        </div>
                            }
                            </MDBCard>
                        </MDBCol>
                    </MDBRow>
                </MDBCol>
            </MDBRow>
        </MDBContainer>
    )
}
export default Dashboard;