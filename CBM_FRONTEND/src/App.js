import "./App.css";
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Alarm from "./pages/alarm";
import Report from "./pages/report";
import Settings from "./pages/settings";
import { UserContext } from "./components/context";
import { MDBContainer, MDBRow } from "mdb-react-ui-kit";
import axios from "axios";
import url from "./configuration/url.json";
import Fileupload from "./pages/draganddrop";
import { message } from "antd";

let timer;

function App() {
  const [Handshake, setHandshake] = useState("");
  const [selectStation, setSelectStation] = useState("station-1");
  const [selectSensorIndex, setSelectSensorIndex] = useState(0);
  const [sensorName, setSensorName] = useState("Sensor-1");
  const [seriesX, setseriesX] = useState("");
  const [seriesY, setseriesY] = useState("");
  const [seriesLSL, setSeriesLSL] = useState("");
  const [seriesHSL, setSeriesHSL] = useState("");
  const [sensorList, setSensorList] = useState("");

  const [selectReportStation, setSelectReportStation] = useState("");
  const [selectReportIndex, setSelectReportIndex] = useState("");

  const [plcLiveData, setPlcLiveData] = useState("");
  const [onehourData, setOnehourData] = useState([]);
  // this not used if we comment the code we have to check the other file since it used on other files
  const [onehourGroupData, setOnehourGroupData] = useState("");
  const [oneHourStationData, getOneHourStationData] = useState([]);
  const [oneHourGroupData, getOneHourGroupData] = useState([]);
  const [alert, setAlert] = useState("");

  const [getSensorlist, setGetSensorList] = useState("");
  const [tabControl, setTabControl] = useState("tab1");
  const [groupSensorList, setGroupSensorList] = useState("");
  const [groupwiseGroupSensor, setGroupwiseGroupSensor] = useState("");

  const [command, setCommand] = useState("stationwise");
  const [dataSwaper, setDataSwaper] = useState("");
  const [invoke, setInvoke] = useState(false);
  const [radioSelected, setRadioSelected] = useState(true);

  const [startLimit, setStartLimit] = useState(0);
  const [endLimit, setEndLimit] = useState(1000);
  const [refreshChart, setRefreshChart] = useState(false);
  const [isLoaderEnable, setIsLoaderEnable] = useState(false);

  async function oneHourData() {
    try {
      const onehourdata = await axios.get(url?.baseurl2 + "onehourdata");
      const onehourgroupingdata = await axios.get(
        url?.baseurl2 + "groupingonehourdata"
      );

      if (onehourdata?.data?.status === true) {
        // API call for getting live data (Stationwise)
        getOneHourStationData(onehourdata?.data?.Result);
        console.log("onehourdata", onehourdata?.data?.Result);
      } else if (onehourdata?.data?.status === false) {
        // console.log("Please check connection!"); Arut
        message.error("Please check connection!");
      }
      if (onehourgroupingdata?.data?.status === true) {
        // API call for getting live data (Groupwise)
        getOneHourGroupData(onehourgroupingdata?.data?.Result);
      } else if (onehourgroupingdata?.data?.status === false) {
        // console.log("Please check connection!"); Arut
        message.error("Please check connection!");
      }
      setRefreshChart(!refreshChart);
    } catch (error) {
      console.error(error);
    }
  }
  // This setOnehourGroupData is used in oneHourData
  async function oneHourGroupingData() {
    // API call for getting live data (Groupwise)
    try {
      const onehourgroupingdata = await axios.get(
        url?.baseurl2 + "groupingonehourdata"
      );
      if (onehourgroupingdata?.data?.status === true) {
        setOnehourGroupData(onehourgroupingdata?.data?.Result);
      } else if (onehourgroupingdata?.data?.status === false) {
        console.log("Please check connection!");
      }
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    getDashboardData();
  }, [invoke]);

  const getDashboardData = () => {
    if (command === "stationwise") {
      setOnehourData(oneHourStationData);
    } else if (command === "groupwise") {
      setOnehourData(oneHourGroupData);
    }
    oneHourData();
    oneHourGroupingData();
  };
  clearInterval(timer);
  timer = setInterval(() => {
    // refresh the dashboard every 2 seconds
    getDashboardData();
  }, 60000);

  return (
    <MDBContainer fluid>
      <MDBRow></MDBRow>
      <BrowserRouter>
        <UserContext.Provider
          value={{
            Handshake,
            setHandshake,
            selectStation,
            setSelectStation,
            selectSensorIndex,
            setSelectSensorIndex,
            sensorName,
            setSensorName,
            seriesX,
            setseriesX,
            seriesY,
            setseriesY,
            seriesLSL,
            setSeriesLSL,
            seriesHSL,
            setSeriesHSL,
            plcLiveData,
            setPlcLiveData,
            onehourData,
            setOnehourData,
            alert,
            setAlert,
            sensorList,
            setSensorList,
            groupSensorList,
            setGroupSensorList,
            groupwiseGroupSensor,
            setGroupwiseGroupSensor,
            command,
            setCommand,
            dataSwaper,
            setDataSwaper,
            invoke,
            setInvoke,
            onehourGroupData,
            setOnehourGroupData,
            tabControl,
            setTabControl,
            radioSelected,
            setRadioSelected,
            selectReportStation,
            setSelectReportStation,
            selectReportIndex,
            setSelectReportIndex,
            startLimit,
            setStartLimit,
            endLimit,
            setEndLimit,
            refreshChart,
            setRefreshChart,
          }}
        >
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/alarm" element={<Alarm />} />
            <Route path="/report" element={<Report />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/upload" element={<Fileupload />} />
          </Routes>
        </UserContext.Provider>
      </BrowserRouter>
    </MDBContainer>
  );
}

export default App;
