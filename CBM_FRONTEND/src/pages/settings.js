import { MDBCard, 
    MDBCol, 
    MDBContainer, 
    MDBRow, 
    MDBTypography,
    MDBAccordion, 
    MDBAccordionItem,
    MDBRadio,
    MDBBtn,
    MDBModal,
    MDBModalDialog,
    MDBModalContent,
    MDBModalHeader,
    MDBModalTitle,
    MDBModalBody,
    MDBModalFooter, 
    MDBSpinner
} from "mdb-react-ui-kit";
import { useNavigate } from "react-router-dom";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSliders, faHouseCrack, faPencil, faPlus} from '@fortawesome/free-solid-svg-icons';
import Navbar from "../components/navbar";
import Settingtable from "../components/settings/settingtable";
import Groupwisetable from "../components/settings/groupwisetable";
import Sensorlist from "../components/settings/sensorlist";
import Stationlist from "../components/settings/stationlist";
import Getstationlist from "../configuration/stationlist.json";
import url from '../configuration/url.json';
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../components/context"; 
import { Input, message } from "antd";
import axios from "axios";

export default function Test(){
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
        sensorList,setSensorList,
        groupSensorList,setGroupSensorList,
        groupwiseGroupSensor,setGroupwiseGroupSensor,
        radioSelected,setRadioSelected
        } =useContext(UserContext)

    const [machine,setMachine]=useState('')
    const [configType,setConfigType]=useState(true)
    const [add,setAdd]=useState(false)
    const [type,setType]=useState('type')
    const [id,setId]=useState('')
    const [trigger,setTrigger]=useState(false)
    const [list,setList]=useState([])
    const [stationlist,setStationList]=useState([])
    const [fieldEnable,setFieldEnable]=useState(false)
    const [swapStn,setSwapStn]=useState(false)
    const [swapGrp,setSwapGrp]=useState(false)
    const [isLoaderEnable,setIsLoaderEnable]=useState(false)

// for modal
    const [centredModal, setCentredModal] = useState(false);

    const toggleShow = () => {
        setCentredModal(!centredModal);
        setErrMsg(false);
        setName('')
        setLsl('')
        setHsl('')
        setAddress('');
        setDescription('')
    }

    const [largeCentredModal, setLargeCentredModal] = useState(false);

    const showModalLarge = () => {setLargeCentredModal(!largeCentredModal);}

    const [sensorListModal,setSensorListModal] = useState(false) 
    const showSensorListModal = () =>{setSensorListModal(!sensorListModal)}

    const [stationListModal,setStationListModal] = useState(false) 
    const showStationListModal = () =>{setStationListModal(!stationListModal)}

// for validation type configuration
    const [errMsg,setErrMsg]=useState(false)

    const [name,setName]=useState('');
    const getName = (e) =>{setName(e?.target.value)}

    const [address,setAddress]=useState('');
    const getAddress = (e) =>{setAddress(e?.target.value)}

    const [lsl,setLsl]=useState('');
    const getLsl = (e) =>{setLsl(e.target.value)}

    const [hsl,setHsl]=useState('');
    const getHsl = (e) =>{setHsl(e.target.value)}

    const [description,setDescription]=useState('');
    const getDescription = (e) =>{setDescription(e.target.value)}

    const [unit,setUnit]=useState('');
    const getUnit = (e) =>{setUnit(e.target.value)}

    const [lslDelay,setLslDelay]=useState('');
    const getLslDelay = (e) =>{setLslDelay(e.target.value)}

    const [hslDelay,setHslDelay]=useState('');
    const getHslDelay = (e) =>{setHslDelay(e.target.value)}

    const [stationAdd,setStationAdd]=useState('');
    const getStationAdd = (e) =>{setStationAdd(e.target.value)}


    const [tokenExpired,setTokenExperied]=useState(false)


    const validate = () =>{
        if(name!=='' && lsl!=='' && hsl!=='' && lsl<=1500 && hsl<=1500){
            toggleShow();
            setName('')
            setLsl('')
            setHsl('')
            setDescription('')
            addSensorType(name,address,unit,description,lsl,hsl,lslDelay,hslDelay);
        }
        else if(name==='' && lsl==='' && hsl===''){
            setErrMsg(true);
        }
    }

    // method to add sensor in type configuration
    async function addSensorType(name,tag,unit,description,lsl,hsl,lslDelay,hslDelay){
        const msg=message.loading("Adding new sensor type...",0)
        try {
            setIsLoaderEnable(true)
            const addSensorType = await axios.post(url?.baseurl2+'configuration/addSensor',{
                sensor_name:name.toLowerCase(),
                sensor_address:tag,
                unit:unit,
                description:description.toLowerCase(),
                lsl:lsl,
                hsl:hsl,
                lsl_delay:lslDelay,
                hsl_delay:hslDelay
            })
            if(addSensorType?.data?.status===true){
                setIsLoaderEnable(false)
                message.success("Sensor type added successfully!")
                getSensors();
                msg();
            }
            else if(addSensorType?.data?.status===false){
                setIsLoaderEnable(false)
                message.error("This sensor type name is already exists!")
                msg();
            }
        } catch (error) {
            console.error(error);
        }
    }

    // method to show sensor list
    async function getSensors(){
        const msg=message.loading("Please wait loading...",0)   
        try {
         const getSensor = await axios.get(url?.baseurl2+'configuration/getSensor')
            if(getSensor?.data?.status===true){
                setIsLoaderEnable(false)
                msg();
                setList(getSensor?.data?.data);
                setTrigger((p)=>!p)
            }
            else if(getSensor?.data?.status===false){
                setIsLoaderEnable(false)
                msg();
                message.error("Something went to wrong!")
            }
        } catch (error) {
            console.error(error)
        }
    }

    // method for get stations
    async function getStation() {

        const data = { Flag: 'SubSystem',CompanyCode:"TEAL_SVT",PlantCode:"TEAL_SVT01",LineCode:"Proj_Bat" };


        fetch('http://192.168.20.104:9000/historicapi/api/Toollife/GetSettingDatas', {
            method: 'POST', // or 'PUT'
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization':'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImFkbWluIiwibmJmIjoxNjcxMTAzMTgyLCJleHAiOjE2NzExMDQ5ODIsImlhdCI6MTY3MTEwMzE4Mn0.pHD9rfmJvu70VBS7ShlN2lWYIYjN3rQzFBN_8xItdrU:admin'
                'Authorization':'Bearer '+localStorage.getItem('token')+":"+localStorage.getItem("username")
            },
            body: JSON.stringify(data),
            })
            .then((response) => response.json())
            .then((data) => {
                setStationList(data?.data);
                setTokenExperied(false)
            })
            .catch((error) => {
                setTokenExperied(true)
                // message.error(error?.message);
            });
    }

    // method to add stations
    async function addStation(name) {
        try {
           const addStation= await axios.post(url?.baseurl2+'configuration/addStation',{
            station_name:name.toLowerCase()
           }) 
           if(addStation?.data?.status===true){
            message.success("Station added successfully!")
            getStation();
           }
           else if(addStation?.data?.status===false){
            message.error(addStation?.data?.result)
           }
        } catch (error) {
            console.error(error)
        }
    }
    // for validation sensor configuration
        const [newStation,setNewStation]=useState('');
        const getNewStation = (e) =>{setNewStation(e?.target.value)}
    
        const [newSensor,setNewSensor]=useState('');
        const getNewSensor = (e) =>{setNewSensor(e?.target.value)}

        const [newAddress,setNewAddress]=useState('');
        const getNewAddress = (e) =>{setNewAddress(e?.target.value)}

        const [newId,setNewId]=useState('');
        const getNewId = (e) =>{setNewId(e?.target.value)}

        const [newlsl,setNewLsl]=useState('');
        const getNewLsl = (e) =>{setNewLsl(e.target.value)}

        const [newhsl,setNewHsl]=useState('');
        const getNewHsl = (e) =>{setNewHsl(e.target.value)}

        const [newDescription,setNewDescription]=useState('');
        // const getNewDescription = (e) =>{setNewDescription(e.target.value)}

        const [manufacturer,setManufacturer]=useState('');
        const getManufacturer = (e) =>{setManufacturer(e.target.value)}

        const [newUnit,setNewUnit]=useState('');
        const getNewUnit = (e) =>{setNewUnit(e.target.value)}

        const [newLslDelay,setNewLslDelay]=useState('');
        const getNewLslDelay = (e) =>{setNewLslDelay(e.target.value)}

        const [newHslDelay,setNewHslDelay]=useState('');
        const getNewHslDelay = (e) =>{setNewHslDelay(e.target.value)}

    // method to add grouping Sensor
    async function addGroupingSensor(station,sensor,address,unit,make,type,id,lsl,hsl,lslDelay,hslDelay,description) {
        const msg=message.loading("Adding new sensor...",0)
        try {
           const addGroupingSensor= await axios.post(url?.baseurl2+'configuration/addGroupingsensor',{
            station_name:station.toLowerCase(),
            sensor_name:sensor.toLowerCase(),
            sensor_address:address,
            unit:unit,
            manufacture:make.toLowerCase(),
            type:type,
            id:id.toString(),
            lsl:lsl,
            hsl:hsl,
            lsl_delay:lslDelay,
            hsl_delay:hslDelay,
            description:description.toLowerCase()
           }) 
           if(addGroupingSensor?.data?.status===true){
            message.success("Sensor added successfully!")
            getGroupSensor();
            msg();
           }
           else if(addGroupingSensor?.data?.status===false){
            message.error(addGroupingSensor?.data?.result)
            msg();
           }
        } catch (error) {
            console.error(error)
        }
    }
        
        // get grouping sensor
    async function getGroupSensor() {
        try {
            const groupSensor = await axios.get(url?.baseurl2+'configuration/getGroupingsensor')
            if(groupSensor?.data?.status===true){
                // setListOfStation(groupSensor?.data?.data);
                // setTrigger((p)=>!p)
                setGroupSensorList(groupSensor?.data?.Result);
                setSwapStn((p)=>!p);
            }
            else if(groupSensor?.data?.status===false){
                message.error("Something went to wrong!")
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function GroupwiseGroupSensor() {
        try {
            const groupwiseSensor= await axios.get(url?.baseurl2+'configuration/getTypewisedata')
            if(groupwiseSensor?.data?.status===true){
                setGroupSensorList(groupwiseSensor?.data?.Result);
                setSwapGrp((p)=>!p);
            }
            else if(groupwiseSensor?.data?.status===false){
                message.error(groupwiseSensor?.data?.Result)
            }
        } catch (error) {
            console.error(error)
        }
    }

    // get grouping table data
    // async function getGroupSensor() {
    //     try {
    //         const groupSensor = await axios.get(url?.baseurl2+'configuration/getGroupingsensor')
    //         if(groupSensor?.data?.status===true){
    //             // setListOfStation(groupSensor?.data?.data);
    //             // setTrigger((p)=>!p)
    //             setGroupSensorList(groupSensor?.data?.Result);
    //         }
    //         else if(groupSensor?.data?.status===false){
    //             message.error("Something went to wrong!")
    //         }
    //     } catch (error) {
    //         console.error(error);
    //     }
    // }
    // select sensor to auto fill input field
    const fill = (par) =>{
        setNewId(par)
        list.map((ele,i)=>{
            console.log(par);
            if(ele?.limits_id===parseInt(par)){
                console.log(ele);
                setNewAddress(ele?.sensor_address);
                setNewUnit(ele?.unit)
                setNewLsl(ele?.lsl)
                setNewHsl(ele?.hsl)
                setNewLslDelay(ele?.lsl_delay)
                setNewHslDelay(ele?.hsl_delay)
                setFieldEnable(true)
            }
            if(par==="general"){
                setType('sensor')
                setNewAddress('');
                setNewUnit('')
                setNewLsl('')
                setNewHsl('')
                setFieldEnable(false)
            }
        })
    }

    const validateAddSensor = () =>{
        if(newStation!=="" && newSensor!=="" && newAddress!=="" && type!=="" && newlsl!=="" && newhsl!=="" && manufacturer!==""){
            // console.log(newStation,newSensor,newAddress,manufacturer,type,newId,newlsl,newhsl,newDescription);
            addGroupingSensor(newStation,newSensor,newAddress,newUnit,manufacturer,type,newId,newlsl,newhsl,newLslDelay,newHslDelay,newDescription);
            getGroupSensor()
            showModalLarge();
        }else{
            message.error("Please fill all required fields!",1)
        }
    }

    const [filter,setFilter]=useState('')

    const sensorFilter = (par) =>{
        setFilter(par)
    }

    const val=Object.keys(groupSensorList)

    const [iconsActive, setIconsActive] = useState('tab1');

    const handleIconsClick = (value) => {
        if (value === iconsActive) {
        return;
        }

        setIconsActive(value);
    };

    useEffect(()=>{
        // getStation();
        // getSensors();
        // getGroupSensor()
    })

   

    return(
        <MDBContainer fluid id="container" className="py-2">
            <Navbar/>
            <MDBRow>
                <MDBCol lg="12" className=" px-3 py-3">
                    <MDBCard className="border shadow rounded-6 ">
                        <div className="shadow px-3 py-2 bg-info" id="header" style={{borderRadius:" 12px 12px 0 0"}}>
                            <MDBTypography tag={'h6'} className="fw-bold text-light pt-2"><FontAwesomeIcon icon={faSliders} className='px-2 fs-5'/><span>Sensor Limit Configuration</span></MDBTypography>                           
                        </div>
                        <MDBRow>
                            <MDBCol lg="6" className="mt-4 px-4"> 
                                    <MDBRadio name='inlineRadio' id='inlineRadio1' value='option1' label='StationWise' onClick={()=>{getGroupSensor();setRadioSelected(true);}} inline defaultChecked={radioSelected ? true : false} />
                                    <MDBRadio name='inlineRadio' id='inlineRadio2' value='option2' label='Groupwise' onClick={()=>{GroupwiseGroupSensor();setFilter("");setRadioSelected(false);}} inline defaultChecked={radioSelected ? false : true} />
                            </MDBCol>
                            <MDBCol lg="6" className="d-flex justify-content-end  pb-2 mt-4 px-5">
                                {/* <button className="btn btn-primary" onClick={getStation}>Test</button> */}
                                <MDBBtn color="info" rounded className="fw-bold" onClick={()=>{getStation();getSensors();showModalLarge()}}><FontAwesomeIcon icon={faPlus} className='text-light fs-6'/> Add Sensor</MDBBtn>
                            </MDBCol>
                        </MDBRow>
                         
                         <MDBRow className="px-1">
                            <MDBCol lg="3" className="px-4">
                                <label className="fw-bold" hidden={radioSelected ? false : true}>Filter Sensor</label>
                                <input type={radioSelected ? "text" : "hidden"} className="form-control" placeholder="Enter sensor name to filter" value={filter} onChange={(e)=>{sensorFilter(e.target.value);setSwapStn((p)=>!p)}} disabled={radioSelected ? false : true}></input>
                            </MDBCol>
                            <MDBCol lg="9">

                            </MDBCol>
                         </MDBRow>
                         <div className="px-2 py-1 d-flex">
                        </div>
                         <div className="" style={{height:'70vh',width:'100%',overflowY:"scroll"}}>
                            
                            <MDBAccordion alwaysOpen initialActive={1} className="shad1ow p-3">
                                {
                                    val.map((item,index)=>{
                                            let match = Object.keys(groupSensorList?.[item]).find((element,i) => {
                                                if (element.includes(filter)) {
                                                  return true
                                                }
                                                else if(!element.includes(filter)){
                                                    return false
                                                }
                                              });
                                            let accordionItemName=<h6 className="fw-bold text-capitalize"><FontAwesomeIcon icon={faHouseCrack} className="text-info fs-6 px-2"/>{item}</h6>
                                                    return <MDBAccordionItem hidden={match!==undefined ? false : true}  collapseId={index+1} headerTitle={accordionItemName}>
                                                            {
                                                                radioSelected ? <div>
                                                                                        <Settingtable data={groupSensorList?.[item]} val={groupSensorList} getGroup={getGroupSensor} filter={filter} trigger={swapStn} />
                                                                                </div> : 
                                                                                <Groupwisetable data={groupSensorList?.[item]} getGroup={getGroupSensor} val={item} trigger={swapGrp}/>
                                                            }
                                                            
                                                            </MDBAccordionItem>                                
                                    })
                                }
                            </MDBAccordion>
                         </div>
                    </MDBCard>
                </MDBCol>
            </MDBRow>

             
            
            {/* modal for add sensor in sensor configutaion */}
            <MDBModal nonInvasive="true" tabIndex='-1' show={largeCentredModal} setShow={setLargeCentredModal}>
                <MDBModalDialog size="xl" centered>
                    <MDBModalContent className="shadow-lg">
                        <MDBModalHeader className="bg-info">
                            <MDBModalTitle className="text-light fw-bold"><FontAwesomeIcon icon={faPlus} className='px-2 fs-5'/>Add Sensor</MDBModalTitle>
                            <MDBBtn className='btn-close' color='light' onClick={showModalLarge}></MDBBtn>
                        </MDBModalHeader>
                        <MDBModalBody>
                           <div>
                                 <MDBRow className="d-flex justify-content-center">
                                        <MDBCol lg={'12'}>
                                                <MDBRow className="px-2 py-2">
                                                    <MDBCol lg={'6'} className="px-5 py-1">
                                                        <label className="fw-bold">Select Station<span className="text-danger fw-bold">*</span></label>
                                                        <div className="d-flex">
                                                            <select className={tokenExpired ?"form-select text-capitalize" :"form-select text-capitalize"} value={newStation} onChange={getNewStation}>
                                                                {/* {
                                                                    tokenExpired ? <option value="" className="text-danger" >Token Experiered!</option> : null

                                                                } */}
                                                                <option value="" selected disabled>Select</option>
                                                                {/* {
                                                                    stationlist.map((e,i)=>{
                                                                        return <option key={i} value={e?.Name} className="text-capitalize">{e?.Name}</option>
                                                                    })
                                                                } */}
                                                                {
                                                                    [
                                                                        {"Name": "op_10"},
                                                                        {"Name": "op_20"},
                                                                        {"Name": "op_30"},
                                                                        {"Name": "op_40"},
                                                                        {"Name": "op_50"},
                                                                        {"Name": "op_60"},
                                                                        {"Name": "op_70"},
                                                                        {"Name": "op_80"}
                                                                       
                                                                    ].map((e,i)=>{
                                                                        // console.log(e);
                                                                        return <option key={i} value={e?.Name} className="text-capitalize">{e?.Name}</option>
                                                                    })
                                                                }
                                                            </select>
                                                        </div>
                                                    </MDBCol>
                                                    <MDBCol lg={'6'} className="px-5 py-1">
                                                        <label className="fw-bold">Sensor Name<span className="text-danger fw-bold">*</span></label>
                                                        <input type="text" className="form-control text-capitalize" placeholder="Enter sensor name" value={newSensor} onChange={getNewSensor}></input>
                                                    </MDBCol>
                                                    <MDBCol lg={'6'} className="px-5 py-1">
                                                    <label className="fw-bold px-1">Type<span className="text-danger fw-bold">*</span></label>
                                                                    <div className="d-flex">
                                                                        <select className="form-select text-capitalize" value={newId} onChange={(e)=>{getNewId();fill(e.target.value)}}>
                                                                                <option value="" selected disabled>Select</option>
                                                                                <option value={'general'} className="text-capitalize">general</option>
                                                                                {
                                                                                    list.map((e,i)=>{
                                                                                        return <option key={i} value={e?.limits_id} className="text-capitalize">{e?.sensor_name}</option>
                                                                                    })
                                                                                }
                                                                            </select>
                                                                            <FontAwesomeIcon icon={faPencil} className='px-2 pt-2 text-info fs-5' onClick={()=>{getSensors();showSensorListModal();}}/>
                                                                        </div>  
                                                        <label className="fw-bold mt-3">Tag Address<span className="text-danger fw-bold">*</span></label>
                                                        <input type="text" className="form-control text-capitalize" placeholder="Enter tag address"  value={newAddress} onChange={getNewAddress}></input>
                                                    </MDBCol>
                                                    <MDBCol lg={'6'} className="px-5 py-1">
                                                        <label className="fw-bold">Manufacturer<span className="text-danger fw-bold">*</span></label>
                                                        <input type="text" className="form-control text-capitalize" placeholder="Enter manufacturer of sensor" value={manufacturer} onChange={getManufacturer}></input>

                                                        <label className="fw-bold mt-3">Unit<span className="text-danger fw-bold">*</span></label>
                                                        <input type="text" className="form-control text-capitalize" placeholder="Enter unit of sensor" value={newUnit} onChange={getNewUnit} disabled={fieldEnable}></input>
                                                    </MDBCol>
                                                    <MDBCol lg={'12'} className="px-0 py-1 mb-1">
                                                        <div className="px-3">
                                                                <MDBRow className="py-1">
                                                                    <MDBCol lg={'6'} className="px-5 mb-3">
                                                                        <label className="fw-bold mt-1">Low Limit (LSL)<span className="text-danger fw-bold">*</span></label>
                                                                        <input type="number" className="form-control" placeholder="Enter sensor LSL" value={newlsl} onChange={getNewLsl} disabled={fieldEnable}></input>
                                                                    </MDBCol>
                                                                    <MDBCol lg={'6'} className="px-5 mb-3">
                                                                        <label className="fw-bold mt-1">High Limit (HSL)<span className="text-danger fw-bold">*</span></label>
                                                                        <input type="number" className="form-control" placeholder="Enter sensor HSL"value={newhsl} onChange={getNewHsl} disabled={fieldEnable}></input>
                                                                    </MDBCol>
                                                                    <MDBCol lg={'6'} className="px-5 mb-3">
                                                                        <label className="fw-bold mt-1">Low Limit Delay(LSL Delay)<span className="text-danger fw-bold">*</span></label>
                                                                        <input type="text" className="form-control" placeholder="Enter sensor LSL Delay" value={newLslDelay} onChange={getNewLslDelay} disabled={fieldEnable}></input>
                                                                    </MDBCol>
                                                                    <MDBCol lg={'6'} className="px-5 mb-3">
                                                                        <label className="fw-bold mt-1">High Limit Delay(HSL Delay)<span className="text-danger fw-bold">*</span></label>
                                                                        <input type="text" className="form-control" placeholder="Enter sensor HSL Delay"value={newHslDelay} onChange={getNewHslDelay} disabled={fieldEnable}></input>
                                                                    </MDBCol>
                                                                    <MDBCol lg={'12'} className="px-5 py-1 mb-2">
                                                                        <label className="fw-bold">Description</label>
                                                                        <textarea type="text" className="form-control text-capitalize" style={{height:"50%",minHeight:"100px"}} value={newDescription} onChange={(e) =>{setNewDescription(e.target.value)}}></textarea>
                                                                    </MDBCol>
                                                                </MDBRow>
                                                            </div>
                                                    </MDBCol>
                                                </MDBRow>
                                            {/* </MDBCard> */}
                                        </MDBCol>
                                    </MDBRow>
                           </div>
                           <div className="d-flex justify-content-center">
                            <MDBBtn color="info" className="mx-1 fw-bold" rounded onClick={()=>{
                                    // addGroupingSensor(newStation,newSensor,newAddress,manufacturer,type,newId,newlsl,newhsl,newDescription);
                                    validateAddSensor();
                                    // showModalLarge();
                                }
                                    }>Save</MDBBtn>
                                <MDBBtn color='info' className="mx-1 fw-bold" rounded onClick={showModalLarge}>Cancel</MDBBtn>                                                 
                           </div>
                        </MDBModalBody>
                    </MDBModalContent>
                </MDBModalDialog>
            </MDBModal>

        {/* for sensor list */}
            <MDBModal nonInvasive="true" tabIndex='-1' show={sensorListModal} setShow={setSensorListModal}>
            <MDBModalDialog size="xl" centered>
            <MDBModalContent className="shadow-lg">
                <MDBModalHeader className="bg-info">
                <MDBModalTitle className="fw-bold text-light">Sensor List</MDBModalTitle>
                <MDBBtn className='btn-close' color='light' onClick={showSensorListModal}></MDBBtn>
                </MDBModalHeader>
                <MDBModalBody>
                <div>
                    <Sensorlist trigger={trigger} data={list} getSensor={getSensors}/>
                </div>
                </MDBModalBody>
                <MDBModalFooter className="d-flex justify-content-center">
                <MDBBtn color='info' rounded onClick={()=>{toggleShow()}}>Add Sensor</MDBBtn>
                <MDBBtn color='info' rounded onClick={showSensorListModal}>Cancel</MDBBtn>
                </MDBModalFooter>
            </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>

        <MDBModal nonInvasive="true" tabIndex='-1' show={stationListModal} setShow={setStationListModal}>
            <MDBModalDialog size="md" centered>
            <MDBModalContent className="shadow-lg">
                <MDBModalHeader className="bg-info">
                <MDBModalTitle className="fw-bold text-light">Station List</MDBModalTitle>
                <MDBBtn className='btn-close' color='light' onClick={()=>{setAdd(false);showStationListModal()}}></MDBBtn>
                </MDBModalHeader>
                <MDBModalBody>
                <div className="text-center">
                    <Stationlist data={stationlist} trigger={trigger} getStation={getStation}/>                
                    {
                        add ? 
                        <div className="text-start">
                            <MDBRow>
                                <MDBCol lg="8">
                                    <label className="fw-bold">Station Name</label>
                                    <input type="text" className="form-control mb-2 mx-0 text-capitalize" placeholder="Enter station name" value={stationAdd} onChange={getStationAdd}></input>
                                </MDBCol>
                                <MDBCol lg="4" className="text-center pt-4">
                                    <MDBBtn color="info" rounded size="md" className="mx-0" onClick={()=>{addStation(stationAdd);setAdd(false);}}>OK</MDBBtn>
                                </MDBCol>
                            </MDBRow>
                            
                        </div> : <MDBBtn color="info" rounded className="fw-bold" onClick={()=>{setAdd(true)}}>ADD</MDBBtn>
                    }
                </div>
                </MDBModalBody>
            </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>

        {/* modal for add sensor in type configuration */}
        <MDBModal nonInvasive="true" tabIndex='-1' show={centredModal} setShow={setCentredModal}>
                <MDBModalDialog size="lg"  centered>
                    <MDBModalContent className="shadow-lg">
                        <MDBModalHeader className="bg-info">
                            <MDBModalTitle className="text-light fw-bold"><FontAwesomeIcon icon={faPlus} className='px-2 fs-5'/>Add Sensor</MDBModalTitle>
                            <MDBBtn className='btn-close' color='light' onClick={toggleShow}></MDBBtn>
                        </MDBModalHeader>
                        <MDBModalBody>
                           <div>
                                <label className="fw-bold">Sensor Type<span className="text-danger fw-bold">*</span></label>
                                <input type='text' className="form-control mb-2 text-capitalize" value={name} maxLength="30" onChange={getName} placeholder="Enter Sensor Type"></input>

                                <label className="fw-bold">Tag Address<span className="text-danger fw-bold">*</span></label>
                                <input type='text' className="form-control mb-2 text-capitalize" value={address} maxLength="20" onChange={getAddress}  placeholder="Enter Tag Address"></input>

                                <label className="fw-bold">Unit<span className="text-danger fw-bold">*</span></label>
                                <input type='text' className="form-control mb-2 text-capitalize" value={unit} maxLength="20" onChange={getUnit}  placeholder="Enter Sensor Unit"></input>

                                <label className="fw-bold">Low Limit (LSL)<span className="text-danger fw-bold">*</span></label>
                                <input type='number' className="form-control mb-2" value={lsl} onChange={getLsl} max="1500" placeholder="Enter Sensor LSL"></input>

                                <label className="fw-bold">High Limit (HSL)<span className="text-danger fw-bold">*</span></label>
                                <input type='number' className="form-control mb-2" value={hsl} onChange={getHsl} max="1500"  placeholder="Enter Sensor HSL"></input>

                                <label className="fw-bold">Low Limit Delay(LSL Delay)<span className="text-danger fw-bold">*</span></label>
                                <input type='text' className="form-control mb-2" value={lslDelay} onChange={getLslDelay} max="1500" placeholder="Enter Sensor LSL Delay"></input>

                                <label className="fw-bold">High Limit Delay(HSL Delay)<span className="text-danger fw-bold">*</span></label>
                                <input type='text' className="form-control mb-2" value={hslDelay} onChange={getHslDelay} max="1500"  placeholder="Enter Sensor HSL Delay"></input>

                                <label className="fw-bold">Description</label>
                                <textarea type='number' className="form-control mb-2 text-capitalize" value={description} maxLength="150" onChange={getDescription} style={{height:'50px'}}></textarea>
                                {errMsg ? <p className="text-danger fw-bold">Please fill required fields!</p> : null}
                                
                                <div className="d-flex justify-content-center mt-3 mb-2">
                                    <MDBBtn rounded color="info" className="fw-bold mx-1" onClick={()=>{validate()}}>Save</MDBBtn>
                                    <MDBBtn rounded color="info" className="fw-bold mx-1" onClick={toggleShow}>Cancel</MDBBtn>
                                </div>
                           </div>
                        </MDBModalBody>
                    </MDBModalContent>
                </MDBModalDialog>
            </MDBModal>

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