    import { useState } from "react";
    import { useNavigate } from "react-router-dom";
    import { MDBBtn, 
            MDBCard, 
            MDBCol, 
            MDBContainer, 
            MDBRow, 
            MDBTypography, 
            MDBSpinner, 
            MDBRadio, 
            MDBAccordion, 
            MDBAccordionItem, 
            MDBTable, 
            MDBTableBody, 
          } from "mdb-react-ui-kit";
    import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
    import {faTable, faHouseCrack, faChartSimple, faCircle, faChartColumn, faChevronLeft, faChevronRight} from '@fortawesome/free-solid-svg-icons';
    import Navbar from "../components/navbar";
    import Reportsparkline from "../components/report/reportsparkline";
    import Reporttable from '../components/report/reporttable'
    import Groupreporttable from "../components/report/groupreporttable";
    import Reportmultilinechart from "../components/report/reportmultiline";
    import Chart from "../components/report/chart"
    import axios from "axios";
    import { useContext } from "react";
    import { UserContext } from "../components/context"; 
    import { message } from "antd";
    import moment from "moment";
    import TextField from '@mui/material/TextField';
    import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
    import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
    import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
    import url from "../configuration/url.json";


    function Report(){
    const changepage = useNavigate();
    if(localStorage.getItem("username")===null){
        // if user is not logged in route to login page
        changepage('/')
    }

    // Calling context value from main component
        const {selectReportStation,setSelectReportStation,
               selectReportIndex,setSelectReportIndex,
               radioSelected,setRadioSelected,
                startLimit,setStartLimit,
                endLimit,setEndLimit}=useContext(UserContext)


        const [series,setSeries]=useState([]);
        const [lsl,setLsl]=useState([]);
        const [hsl,setHsl]=useState([]);
        const [timestamp,setTimestamp]=useState([]);
        const [label,setLabel]=useState('')
        const [station,setStation]=useState('')
        const [param,setparam]=useState('')
        const [groupSelected,setGroupSelected]=useState(false)
        const [overLap,setOverLap]=useState(false)
        const [invokeMulitiLine,setInvokeMultiLine]=useState(true)
        const [multiLineStation,setMultiLineStation]=useState('')
        const [tableData,setTableData]=useState({})
        const [trigger,settrigger]=useState(false);
        const[fromdate,setFromdate]=useState(moment().format('YYYY-MM-DD')+" 00:00:00.000");
        const[todate,setTodate]=useState(moment().format('YYYY-MM-DD')+" 23:59:59.000");
        const[radio,setRadio]=useState(true)
        const [filter,setFilter]=useState('')
        const [isLoaderEnable,setIsLoaderEnable]=useState(false)

        const result = (from,to) =>{
            // Limit filter record between 2 days date range
            if(from>to){
                message.error("Fromdate is greater than todate!")
            }
            else if(moment(to).subtract(2, 'days').format('yyyy-MM-DD')<=from===false){
                message.error("Sorry, selected date range with in last 2 days!")
            }
            else  if(from<=to || moment().subtract(2, 'days').format('yyyy-MM-DD')<=from!==false){
                setRadio(false)
                getStationRecord(from,to)
            }
        }
        const chartSeries = (station,param) =>{
            // Assign data for chart
            setSeries(tableData?.[station]?.[param]?.yaxis);
            setTimestamp(tableData?.[station]?.[param]?.xaxis);
            setLsl(tableData?.[station]?.[param]?.lsl);
            setHsl(tableData?.[station]?.[param]?.hsl);
            settrigger((p)=>!p)
            setStation(station);
            setparam(param)
        }
        const getStationRecord = async(from,to,par)=>{
            // Concept of showing only 1000 samples with next button to show further samples
            setIsLoaderEnable(true)
            let start=startLimit;
            let end=endLimit;
            if(par==="next"){
                start=startLimit+1000;
                end=endLimit+1000;
            }
            else if(par==="previous"){
                start=startLimit-1000;
                end=endLimit-1000;
            }
            // Stationwise Report API Call
            try {
                const report = await axios.post(url?.baseurl2+"reports/stationReport",{
                    fromdate:from,
                    todate:to,
                    startLimit:start,
                    endLimit:end
                })
                if(report?.data?.status===true){
                    setTableData(report?.data?.Result)
                    setIsLoaderEnable(false)
                }
                else if(report?.data?.status===false){
                    message.error(report?.data?.Result)
                    setIsLoaderEnable(false)
                }
            } catch (error) {
                setIsLoaderEnable(false)
                console.error(error)
            }
        }

        const getGroupRecord = async(from,to,par)=>{
            setIsLoaderEnable(true)
            let start=startLimit;
            let end=endLimit;
            if(par==="next"){
                start=startLimit+1000;
                end=endLimit+1000;
            }
            else if(par==="previous"){
                start=startLimit-1000;
                end=endLimit-1000;
            }
            // Groupwise Report API Call
            try {
                const report = await axios.post(url?.baseurl2+"reports/groupingReport",{
                    fromdate:from,
                    todate:to,
                    startLimit:start,
                    endLimit:end
                })
                if(report?.data?.status===true){
                    setTableData(report?.data?.Result)
                    setIsLoaderEnable(false)
                }
                else if(report?.data?.status===false){
                    message.error(report?.data?.Result)
                    setIsLoaderEnable(false)
                }                
            } catch (error) {
                setIsLoaderEnable(false)
                console.error(error)
            }
        }
        const val=Object.keys(tableData);
        return(
            // UI Components
            <MDBContainer fluid className="py-2" id="container">
                {/* Calling Navigation bar */}
                <Navbar/>
                             
                <MDBRow className="pt-3">
                    <MDBCol lg="6" className="px-3 py-2">
                        <MDBCard className="border shadow rounded-6" style={{height:'100%',width:'100%',minHeight:"85vh"}}>
                            <div className="d-flex justify-content-start shadow px-3 py-2 bg-info" style={{borderRadius:" 12px 12px 0 0"}}>
                                <MDBTypography tag={'h6'} className="fw-bold text-light text-capitalize pt-2"><FontAwesomeIcon icon={faTable} className="text-light fs-6 px-1"/>Tabular View</MDBTypography>                          
                            </div>
                            <MDBRow className="mt-3 mb-2">
                                <MDBCol size="lg" className="px-4 py-2">
                                    <label className="text-muted fw-bold">From Date</label>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateTimePicker className="form-control"
                                        ampm={false}
                                        openTo="day"
                                        views={['day','month','year','hours', 'minutes', 'seconds']}
                                        inputFormat="YYYY-MM-DD HH:mm:ss"
                                        value={fromdate}
                                        onChange={(newValue) => {
                                            setFromdate(moment(new Date(newValue?.$d)).format('YYYY-MM-DD HH:mm:ss'));
                                        }}
                                        renderInput={(params) => <TextField {...params} />}
                                        />
                                    </LocalizationProvider>

                                </MDBCol>
                                <MDBCol size="lg" className="px-4 py-2">
                                    <label className="text-muted fw-bold">To Date</label>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateTimePicker className="form-control"
                                        ampm={false}
                                        openTo="day"
                                        views={['day','month','year','hours', 'minutes', 'seconds']}
                                        inputFormat="YYYY-MM-DD HH:mm:ss"
                                        value={todate}
                                        onChange={(newValue) => {
                                            setTodate(moment(new Date(newValue?.$d)).format('YYYY-MM-DD HH:mm:ss'));
                                        }}
                                        renderInput={(params) => <TextField {...params} />}
                                        />
                                    </LocalizationProvider>
                                </MDBCol>
                                <MDBCol size='lg' className="px-4 pt-4 mt-2 text-center">
                                    <MDBBtn rounded color="info" className="fw-bold mt-3" onClick={()=>{result(fromdate,todate);settrigger((p)=>!p)}}>Generate</MDBBtn>
                                </MDBCol>
                                
                            </MDBRow>
                            <div className="px-2">
                                <MDBRadio name='inlineRadio' id='inlineRadio1' value='option1' label='Stationwise' disabled={radio} onClick={()=>{getStationRecord(fromdate,todate);setGroupSelected(false);setRadioSelected(true)}} inline defaultChecked/>
                                <MDBRadio name='inlineRadio' id='inlineRadio2' value='option2' label='Groupwise' disabled={radio} onClick={()=>{getGroupRecord(fromdate,todate);setGroupSelected(true);setRadioSelected(false)}} inline />
                            </div>
                            <MDBRow>
                                <MDBCol lg="5" className="px-4 py-2">
                                    <label className="fw-bold" hidden={radioSelected ? false : true}>Filter Sensor</label>
                                    <input type={radioSelected ? "text" : "hidden"} className="form-control" placeholder="Enter sensor name to filter" value={filter} onChange={(e)=>{setFilter(e.target.value)}} disabled={radio}></input>
                                </MDBCol>
                                <MDBCol lg="7" className="px-4 pt-4 text-end">
                                    <MDBBtn size="sm" className='mx-2 mt-2 border' color='link' rippleColor='light' onClick={
                                        ()=>{
                                            setStartLimit((prevValue) => prevValue - 1000);
                                            setEndLimit((prevValue) => prevValue - 1000);
                                                if(groupSelected===true){
                                                    getGroupRecord(fromdate,todate,'previous');
                                                }else{
                                                    getStationRecord(fromdate,todate,'previous');
                                                }
                                            }
                                        } 
                                        disabled={startLimit<=0 ? true : false}>
                                        <FontAwesomeIcon icon={faChevronLeft} className="text-primary fs-7 mt-1 px-0"/> Previous
                                    </MDBBtn>
                                    <MDBBtn size="sm" className='mx-3 mt-2 border' color='link' rippleColor='light' onClick={
                                        ()=>{
                                            setStartLimit((prevValue) => prevValue + 1000);
                                            setEndLimit((prevValue) => prevValue + 1000);
                                                if(groupSelected===true){
                                                    getGroupRecord(fromdate,todate,'next');
                                                }else{
                                                    getStationRecord(fromdate,todate,'next');
                                                }
                                            }
                                        }
                                        disabled={radio}>
                                        Next <FontAwesomeIcon icon={faChevronRight} className="text-primary fs-7 mt-1 px-0"/>
                                    </MDBBtn>
                                </MDBCol>
                            </MDBRow>
                            <div className="p-2" style={{height:'56vh',width:'100%',overflowY:"scroll"}}>
                                <MDBAccordion alwaysOpen initialActive={1}>
                                    {
                                        // Sensor text filter
                                        val.map((ele,i)=>{
                                            let match = Object.keys(tableData?.[ele]).find((element,i) => {
                                                if (element.includes(filter)) {
                                                  return true
                                                }
                                                else if(!element.includes(filter)){
                                                    return false
                                                }
                                              });
                                            let accordionItemName=<h6 className="fw-bold text-capitalize"><FontAwesomeIcon icon={faHouseCrack} className="text-info fs-6 px-2"/>{ele}</h6>
                                          
                                            return <MDBAccordionItem hidden={match!==undefined ? false : true} collapseId={i+1} headerTitle={accordionItemName}>
                                                    {
                                                        groupSelected ? 
                                                        <div className="d-flex justify-content-end">
                                                            <MDBBtn rounded color="info" size="sm" className="fw-bold mx-2 mb-2" onClick={()=>{setMultiLineStation(ele);setInvokeMultiLine(!invokeMulitiLine);setOverLap(true)}}>
                                                                <FontAwesomeIcon icon={faChartColumn} className="text-light fs-6 px-0"/> All
                                                            </MDBBtn>
                                                        </div>:null
                                                    }
                                                        <MDBTable className="shadow border" hover responsive>
                                                                <MDBTableBody>
                                                                    {
                                                                        Object.keys(tableData?.[ele]).map((e,i)=>{
                                                                            let classactive = ""
                                                                            if(ele===selectReportStation && e===selectReportIndex){
                                                                                classactive="active"
                                                                            }
                                                                            return <tr className={classactive} onClick={()=>{
                                                                                setOverLap(false)
                                                                                chartSeries(ele,e);
                                                                                setLabel(e);
                                                                                setSelectReportStation(ele);
                                                                                setSelectReportIndex(e)}}>
                                                                                        <td className="text-capitalize fw-bold">{e}</td>
                                                                                        {/* Calling sparkline chart */}
                                                                                        <td className=""><Reportsparkline series={tableData?.[ele]?.[e]?.yaxis}/></td>
                                                                                    </tr>
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
                        <div className="mb-3">
                            <MDBCard className="border shadow rounded-6" style={{height:"460px"}}>
                                <div className="d-flex justify-content-start shadow px-3 py-2 bg-info" style={{borderRadius:" 12px 12px 0 0"}}>
                                    <MDBTypography tag={'h6'} className="fw-bold text-light text-capitalize pt-2"><FontAwesomeIcon icon={faTable} className="text-light fs-6 px-1"/>Tabular Vizualization</MDBTypography>                          
                                </div>
                                
                                <div className="p-2 mt-3">
                                    {
                                        // Calling Report Table
                                        groupSelected ?  
                                        <Groupreporttable data={tableData?.[station]?.[param]}/> :
                                        <Reporttable data={tableData?.[station]?.[param]}/>
                                    }
                                </div>
                            </MDBCard>
                        </div>
                        <div>
                            <MDBCard className="border shadow rounded-6">
                                <div className="d-flex justify-content-start shadow px-3 py-2 bg-info" style={{borderRadius:" 12px 12px 0 0"}}>
                                    <MDBTypography tag={'h6'} className="fw-bold text-light text-capitalize pt-2"><FontAwesomeIcon icon={faChartSimple} className="text-light fs-6 px-1"/>Graphical Vizualization</MDBTypography>                          
                                </div>
                                
                                <div className="d-flex justify-content-center pt-2">
                                    <MDBTypography tag={'h6'} className="text-muted fw-bold pt-2 px-2"><FontAwesomeIcon icon={faCircle} className="text-warning fs-6 px-1"/>Low Limit</MDBTypography>
                                    <MDBTypography tag={'h6'} className="text-muted fw-bold pt-2 px-2"><FontAwesomeIcon icon={faCircle} className="text-success fs-6 px-1"/>Normal</MDBTypography>
                                    <MDBTypography tag={'h6'} className="text-muted fw-bold pt-2 px-2"><FontAwesomeIcon icon={faCircle} className="text-danger fs-6 px-1"/>High Limit</MDBTypography>
                                </div>
                                    {
                                                // calling multiline chart when groupwise is enabled
                                                overLap ?  <Reportmultilinechart data={tableData?.[multiLineStation]} station={multiLineStation} trigger={invokeMulitiLine}/>: 
                                        <div>
                                             {
                                                // calling chart when stationwise is enabled
                                                Object.keys(tableData).indexOf(station)!==-1 ? 
                                                <Chart series={series} timestamp={timestamp} lsl={lsl} hsl={hsl} name={label.toUpperCase()} station={station.toUpperCase()}/>:
                                                <Chart series={[]} timestamp={[]} lsl={[]} hsl={[]} name={""} station={""}/>
                                            }
                                        </div>
                                    }
                            </MDBCard>
                        </div>
                    </MDBCol>
                </MDBRow>            
                {/* Loader implementation */}
                 {
                    isLoaderEnable ? 
                    <div className="vh-100 mask d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
                        <MDBSpinner className='mx-2 position-relative' color='info'>
                            <span className='visually-hidden'>Loading...</span>
                        </MDBSpinner> 
                        <MDBTypography tag={'h6'} className="fw-bold pt-2">Loading...</MDBTypography>
                    </div> : null
                }    
            </MDBContainer>
        )
    }
    export default Report;