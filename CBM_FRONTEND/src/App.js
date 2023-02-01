import './App.css';
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Alarm from './pages/alarm'
import Report from './pages/report';
import Settings from './pages/settings';
import {UserContext} from './components/context';
import { MDBContainer, MDBRow } from 'mdb-react-ui-kit';
import axios from 'axios';
import url from './configuration/url.json'
import Basic from './components/dragndrop/dragndrop';
import Fileupload from './components/dragndrop/dragndrop';



let timer;

function App() {
    const [Handshake,setHandshake]=useState('');
    const[selectStation,setSelectStation]=useState('station-1');
    const[selectSensorIndex,setSelectSensorIndex]=useState(0);
    const[sensorName,setSensorName]=useState('Sensor-1');
    const[seriesX,setseriesX]=useState('');
    const[seriesY,setseriesY]=useState('');
    const[seriesLSL,setSeriesLSL]=useState('');
    const[seriesHSL,setSeriesHSL]=useState('');
    const[sensorList,setSensorList]=useState('');

    const [selectReportStation,setSelectReportStation]=useState('')
    const [selectReportIndex,setSelectReportIndex]=useState('')

    const [plcLiveData,setPlcLiveData]=useState("")
    const [onehourData,setOnehourData]=useState([])
    const [onehourGroupData,setOnehourGroupData]=useState("")    
    const [oneHourStationData,getOneHourStationData]=useState([])
    const [oneHourGroupData,getOneHourGroupData]=useState([])
    const [alert,setAlert]=useState("")

    const[getSensorlist,setGetSensorList]=useState('')
    const[tabControl,setTabControl]=useState('tab1')
    const[groupSensorList,setGroupSensorList]=useState('')
    const[groupwiseGroupSensor,setGroupwiseGroupSensor]=useState('')

    const[command,setCommand]=useState('stationwise');
    const[dataSwaper,setDataSwaper]=useState('');
    const[invoke,setInvoke]=useState(false);
    const[radioSelected,setRadioSelected]=useState(true)

    const [startLimit,setStartLimit]=useState(0)
    const [endLimit,setEndLimit]=useState(1000)
    const [ip, setIP] = useState('');

    //creating function to load ip address from the API
    const getData = async () => {
      const res = await axios.get('https://geolocation-db.com/json/')
      console.log(res.data);
      setIP(res.data.IPv4)
    }
    
    useEffect( () => {
      //passing getData method to the lifecycle method
      getData()
  
    }, [])
    

    async function oneHourData(){
        try {
            const onehourdata=await axios.get(url?.baseurl2+"onehourdata")
            const onehourgroupingdata=await axios.get(url?.baseurl2+"groupingonehourdata")

            if(onehourdata?.data?.status===true){
                getOneHourStationData(onehourdata?.data?.Result);
            }
            else if(onehourdata?.data?.status===false){
                console.log("Please check connection!");
            }
            if(onehourgroupingdata?.data?.status===true){
                getOneHourGroupData(onehourgroupingdata?.data?.Result);
            }
            else if(onehourgroupingdata?.data?.status===false){
                console.log("Please check connection!");
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function oneHourGroupingData(){
        try {
            const onehourgroupingdata=await axios.get(url?.baseurl2+"groupingonehourdata")
            if(onehourgroupingdata?.data?.status===true){
                setOnehourGroupData(onehourgroupingdata?.data?.Result);
            }
            else if(onehourgroupingdata?.data?.status===false){
                console.log("Please check connection!");
            }
        } catch (error) {
            console.error(error);
        }
    }       
        useEffect(()=>{
            getDashboardData()
        },[invoke])



    const getDashboardData = () => {
        if(command==="stationwise"){
            setOnehourData(oneHourStationData);
        }
        else if(command==="groupwise"){
            setOnehourData(oneHourGroupData);
        }
        oneHourData()
        oneHourGroupingData()
    }
   

    clearInterval(timer);
    timer=setInterval(() => {
        getDashboardData()
    }, 2000);

  return (
    <MDBContainer fluid>
        <MDBRow>
           
        </MDBRow>
        <BrowserRouter>
            <UserContext.Provider value={{
                Handshake,setHandshake,
                selectStation,setSelectStation,
                selectSensorIndex,setSelectSensorIndex,
                sensorName,setSensorName,
                seriesX,setseriesX,
                seriesY,setseriesY,
                seriesLSL,setSeriesLSL,
                seriesHSL,setSeriesHSL,
                plcLiveData,setPlcLiveData,
                onehourData,setOnehourData,
                alert,setAlert,
                sensorList,setSensorList,
                groupSensorList,setGroupSensorList,
                groupwiseGroupSensor,setGroupwiseGroupSensor,
                command,setCommand,
                dataSwaper,setDataSwaper,
                invoke,setInvoke,
                onehourGroupData,setOnehourGroupData,
                tabControl,setTabControl,
                radioSelected,setRadioSelected,
                selectReportStation,setSelectReportStation,
                selectReportIndex,setSelectReportIndex,
                startLimit,setStartLimit,
                endLimit,setEndLimit
                }}>
                <Routes>
                    <Route
                        path="/"
                        element={ <Login /> }
                    />
                    <Route
                        path="/dashboard"
                        element={ <Dashboard /> }
                    />
                     <Route
                        path="/alarm"
                        element={ <Alarm /> }
                    />
                    <Route
                        path="/report"
                        element={ <Report /> }
                    />
                    <Route
                        path="/settings"
                        element={ <Settings /> }
                    /> 
                    <Route
                        path="/upload"
                        element={ <Fileupload /> }
                    /> 
                </Routes>
            </UserContext.Provider>
        </BrowserRouter>
    </MDBContainer>
  );
}

export default App;
