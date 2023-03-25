import { MDBBtn, MDBCol, MDBContainer, MDBRow, MDBRadio, MDBSpinner, MDBCard, MDBTypography } from "mdb-react-ui-kit";
import { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import moment from 'moment';
import url from '../configuration/url.json';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTableList} from '@fortawesome/free-solid-svg-icons';
import Alarmtable from "../components/alert/alarmtable";
import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

function Alarm() {
    const changepage = useNavigate();
    if(localStorage.getItem("username")===null){
        // if user is not logged in route to login page
        changepage('/')
    }

    const [fromDate,setFromDate]=useState(moment().format("YYYY-MM-DD")+" 00:00:00.000");
    const [toDate,setToDate]=useState(moment().format("YYYY-MM-DD")+" 23:59:59.000");
    const [fieldDisable,setFieldDisable]=useState(true)
    const [alert,setAlert]=useState('')
    const [isLoaderEnable,setIsLoaderEnable]=useState(false)

    const dayFilter = (par) =>{
        // Alarm filter ranges
        if(par==="today"){
            let today=moment().format("YYYY-MM-DD")
            setFromDate(today+" 00:00:00.000")
            setToDate(today+" 23:59:59.000")
            setFieldDisable(true)
        }
        else if(par==="yesterday"){
            let yesterday=moment().subtract(1,'days').format("YYYY-MM-DD")
            setFromDate(yesterday+" 00:00:00.000")
            setToDate(yesterday+" 23:59:59.00")
            setFieldDisable(true)
        }
        else if(par==="custom"){
            setFromDate("")
            setToDate("")
            setFieldDisable(false)
        }
    }
   
    const alarm = async(stn,par)=>{
        // API call to get alarm list
        try {
            setIsLoaderEnable(true)
            const alert = await axios.post(url?.baseurl2+"alert/alertDetails",{
                fromDate:fromDate,
                toDate:toDate
            })
            if(alert?.data?.status===true){
                setAlert(alert?.data?.Result);
                setIsLoaderEnable(false)
            }
            else if(alert?.data?.status===false){
                message.error(alert?.data?.Result);
                setIsLoaderEnable(false)
            }
        } catch (error) {
            message.error(error?.message)
        }
    }
   
        return(
        // UI components
        <MDBContainer fluid className="py-2" id="container" style={{backgroundColor:"#FAFAFA"}}>
            {/* Calling Navigation bar */}
            <Navbar/>
            
            <MDBRow className="mt-4">
                <MDBCol lg="12">
                    <MDBCard className="shadow border" style={{height:"100%",width:"100%",minHeight:"82vh"}}>
                        <div className="shadow px-2 py-2 bg-info" id="header" style={{borderRadius:" 11px 11px 0 0"}}>
                            <MDBTypography tag={'h6'} className="fw-bold text-light pt-2"><FontAwesomeIcon icon={faTableList} className='px-2 fs-5'/><span>Alert Summary</span></MDBTypography>                           
                        </div>
                        <div className="px-4 py-2 mt-2">
                            <MDBRadio name='inlineRadio' id='inlineRadio1' value='option1' label='Today' onClick={()=>{dayFilter("today")}} inline defaultChecked/>
                            <MDBRadio name='inlineRadio' id='inlineRadio2' value='option2' label='Yesterday' onClick={()=>{dayFilter("yesterday")}} inline />
                            <MDBRadio name='inlineRadio' id='inlineRadio3' value='option3' label='Custom' onClick={()=>{dayFilter("custom")}} inline />
                        </div>
                            
                        <MDBRow className="px-4 py-2 mt-0">
                            <MDBCol lg="2">
                                <label className="fw-bold">From date:</label>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker className="form-control"
                                    ampm={false}
                                    openTo="day"
                                    views={['day','month','year','hours', 'minutes', 'seconds']}
                                    inputFormat="YYYY-MM-DD HH:mm:ss"
                                    value={fromDate}
                                    onChange={(newValue) => {
                                        setFromDate(moment(new Date(newValue?.$d)).format('YYYY-MM-DD HH:mm:ss'));
                                    }}
                                    renderInput={(params) => <TextField {...params} />}
                                    disabled={fieldDisable}
                                    />
                                </LocalizationProvider>
                            </MDBCol>
                            <MDBCol lg="2">
                                <label className="fw-bold">To date:</label>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker className="form-control"
                                    ampm={false}
                                    openTo="day"
                                    views={['day','month','year','hours', 'minutes', 'seconds']}
                                    inputFormat="YYYY-MM-DD HH:mm:ss"
                                    value={toDate}
                                    onChange={(newValue) => {
                                        setToDate(moment(new Date(newValue?.$d)).format('YYYY-MM-DD HH:mm:ss'));
                                    }}
                                    renderInput={(params) => <TextField {...params} />}
                                    disabled={fieldDisable}
                                    />
                                </LocalizationProvider>
                            </MDBCol>
                           
                            <MDBCol lg="2" className="pt-4 px-3 text-start">
                                <MDBBtn color="info" className="mt-2" rounded onClick={alarm}>Generate</MDBBtn>
                            </MDBCol>
                        </MDBRow>
                        <div className="p-3">
                            {/* Calling alarm table */}
                            <Alarmtable data={alert} call={alarm}/>
                        </div>
                    </MDBCard>
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
export default Alarm;