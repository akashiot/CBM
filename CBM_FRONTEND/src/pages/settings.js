import {
  MDBCard,
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
  MDBSpinner,
} from "mdb-react-ui-kit";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSliders,
  faHouseCrack,
  faPencil,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import Navbar from "../components/navbar";
import Settingtable from "../components/settings/settingtable";
import Groupwisetable from "../components/settings/groupwisetable";
import Sensorlist from "../components/settings/sensorlist";
import { useContext, useState } from "react";
import { UserContext } from "../components/context";
import { message } from "antd";
import axios from "axios";
import url from "../configuration/url.json";

export default function Settings() {
  const changepage = useNavigate();
  if (localStorage.getItem("username") === null) {
    // if user is not logged in route to login page
    changepage("/");
  }
  // Calling context value from main component
  const {
    groupSensorList,
    setGroupSensorList,
    radioSelected,
    setRadioSelected,
  } = useContext(UserContext);

  const [type, setType] = useState("type");
  const [trigger, setTrigger] = useState(false);
  const [list, setList] = useState([]);
  const [stationlist, setStationList] = useState([]);
  const [fieldEnable, setFieldEnable] = useState(false);
  const [swapStn, setSwapStn] = useState(false);
  const [swapGrp, setSwapGrp] = useState(false);
  const [isLoaderEnable, setIsLoaderEnable] = useState(false);

  const [centredModal, setCentredModal] = useState(false);
  const toggleShow = () => {
    // To open or close add sensor type popup
    setCentredModal(!centredModal);
    setErrMsg(false);
    setName("");
    setLsl("");
    setHsl("");
    setAddress("");
    setDescription("");
  };

  const [largeCentredModal, setLargeCentredModal] = useState(false);
  const showModalLarge = () => {
    setLargeCentredModal(!largeCentredModal);
  };

  const [sensorListModal, setSensorListModal] = useState(false);
  const showSensorListModal = () => {
    setSensorListModal(!sensorListModal);
  };

  const [errMsg, setErrMsg] = useState(false);

  const [name, setName] = useState("");
  const getName = (e) => {
    setName(e?.target.value);
    console.log(name);
  };

  const [address, setAddress] = useState("");
  const getAddress = (e) => {
    setAddress(e?.target.value);
  };

  const [lsl, setLsl] = useState("");
  const getLsl = (e) => {
    setLsl(e.target.value);
  };

  const [hsl, setHsl] = useState("");
  const getHsl = (e) => {
    setHsl(e.target.value);
  };

  const [description, setDescription] = useState("");
  const getDescription = (e) => {
    setDescription(e.target.value);
  };

  const [unit, setUnit] = useState("");
  const getUnit = (e) => {
    setUnit(e.target.value);
  };

  const [lslDelay, setLslDelay] = useState("");
  const getLslDelay = (e) => {
    setLslDelay(e.target.value);
  };

  const [hslDelay, setHslDelay] = useState("");
  const getHslDelay = (e) => {
    setHslDelay(e.target.value);
  };

  const [tokenExpired, setTokenExperied] = useState(false);

  const validate = () => {
    // Validate type configuration field
    if (name !== "" && lsl !== "" && hsl !== "" && lsl <= 1500 && hsl <= 1500) {
      toggleShow();
      setName("");
      setLsl("");
      setHsl("");
      setDescription("");
      addSensorType(
        name,
        address,
        unit,
        description,
        lsl,
        hsl,
        lslDelay,
        hslDelay
      );
    } else if (name === "" && lsl === "" && hsl === "") {
      setErrMsg(true);
    }
  };

  async function addSensorType(
    name,
    tag,
    unit,
    description,
    lsl,
    hsl,
    lslDelay,
    hslDelay
  ) {
    // method to add sensor in type configuration
    const msg = message.loading("Adding new sensor type...", 0);
    try {
      setIsLoaderEnable(true);
      const addSensorType = await axios.post(
        url?.baseurl2 + "configuration/addSensor",
        {
          sensor_name: name.toLowerCase(),
          sensor_address: tag,
          unit: unit,
          description: description.toLowerCase(),
          lsl: lsl,
          hsl: hsl,
          lsl_delay: lslDelay,
          hsl_delay: hslDelay,
        }
      );
      if (addSensorType?.data?.status === true) {
        setIsLoaderEnable(false);
        message.success("Sensor type added successfully!");
        getSensors();
        msg();
      } else if (addSensorType?.data?.status === false) {
        setIsLoaderEnable(false);
        message.error("This sensor type name is already exists!");
        msg();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function getSensors() {
    // method to show sensor type list
    const msg = message.loading("Please wait loading...", 0);
    try {
      const getSensor = await axios.get(
        url?.baseurl2 + "configuration/getSensor"
      );
      if (getSensor?.data?.status === true) {
        setIsLoaderEnable(false);
        msg();
        setList(getSensor?.data?.data);
        setTrigger((p) => !p);
      } else if (getSensor?.data?.status === false) {
        setIsLoaderEnable(false);
        msg();
        message.error("Something went to wrong!");
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function getStation() {
     const stationLists = await axios.get(url?.baseurl2 + "alert/stationLists")
     if (stationLists?.data?.status === true) {
      setStationList(stationLists?.data?.data);
    } else if (stationLists?.data?.status !== true) {
      console.log("Please check connection!");
    }
    // method for get stations
    // const data = {
    //   Flag: "SubSystem",
    //   CompanyCode: "TEAL_SVT",
    //   PlantCode: "TEAL_SVT01",
    //   LineCode: "Proj_Bat",
    // };
    // fetch(
    //   "http://192.168.20.104:9000/historicapi/api/Toollife/GetSettingDatas",
    //   {
    //     method: "POST", // or 'PUT'
    //     headers: {
    //       "Content-Type": "application/json",
    //       // 'Authorization':'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImFkbWluIiwibmJmIjoxNjcxMTAzMTgyLCJleHAiOjE2NzExMDQ5ODIsImlhdCI6MTY3MTEwMzE4Mn0.pHD9rfmJvu70VBS7ShlN2lWYIYjN3rQzFBN_8xItdrU:admin'
    //       Authorization:
    //         "Bearer " +
    //         localStorage.getItem("token") +
    //         ":" +
    //         localStorage.getItem("username"),
    //     },
    //     body: JSON.stringify(data),
    //   }
    // )
    //   .then((response) => response.json())
    //   .then((data) => {
    //     setStationList(data?.data);
    //     setTokenExperied(false);
    //   })
    //   .catch((error) => {
    //     setTokenExperied(true);
    //   });
  }

  const [newStation, setNewStation] = useState("");
  const getNewStation = (e) => {
    setNewStation(e?.target.value);
  };

  const [newSensor, setNewSensor] = useState("");
  const getNewSensor = (e) => {
    setNewSensor(e?.target.value);
  };

  const [newAddress, setNewAddress] = useState("");
  const getNewAddress = (e) => {
    setNewAddress(e?.target.value);
  };

  const [newId, setNewId] = useState("");
  const getNewId = (e) => {
    setNewId(e?.target.value);
  };

  const [newlsl, setNewLsl] = useState("");
  const getNewLsl = (e) => {
    setNewLsl(e.target.value);
  };

  const [newhsl, setNewHsl] = useState("");
  const getNewHsl = (e) => {
    setNewHsl(e.target.value);
  };

  const [newDescription, setNewDescription] = useState("");

  const [manufacturer, setManufacturer] = useState("");
  const getManufacturer = (e) => {
    setManufacturer(e.target.value);
  };

  const [newUnit, setNewUnit] = useState("");
  const getNewUnit = (e) => {
    setNewUnit(e.target.value);
  };

  const [newLslDelay, setNewLslDelay] = useState("");
  const getNewLslDelay = (e) => {
    setNewLslDelay(e.target.value);
  };

  const [newHslDelay, setNewHslDelay] = useState("");
  const getNewHslDelay = (e) => {
    setNewHslDelay(e.target.value);
  };

  async function addGroupingSensor(
    station,
    sensor,
    address,
    unit,
    make,
    type,
    id,
    lsl,
    hsl,
    lslDelay,
    hslDelay,
    description
  ) {
    // method to add grouping Sensor
    const msg = message.loading("Adding new sensor...", 0);
    try {
      const addGroupingSensor = await axios.post(
        url?.baseurl2 + "configuration/addGroupingsensor",
        {
          station_name: station.toLowerCase(),
          sensor_name: sensor.toLowerCase(),
          sensor_address: address,
          unit: unit,
          manufacture: make.toLowerCase(),
          type: type,
          id: id.toString(),
          lsl: lsl,
          hsl: hsl,
          lsl_delay: lslDelay,
          hsl_delay: hslDelay,
          description: description.toLowerCase(),
        }
      );
      if (addGroupingSensor?.data?.status === true) {
        message.success("Sensor added successfully!");
        getGroupSensor();
        msg();
      } else if (addGroupingSensor?.data?.status === false) {
        message.error(addGroupingSensor?.data?.result);
        msg();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function getGroupSensor() {
    // Get sensor list when stationwise is enabled
    try {
      const groupSensor = await axios.get(
        url?.baseurl2 + "configuration/getGroupingsensor"
      );
      if (groupSensor?.data?.status === true) {
        setGroupSensorList(groupSensor?.data?.Result);
        setSwapStn((p) => !p);
      } else if (groupSensor?.data?.status === false) {
        message.error("Something went to wrong!");
      }
    } catch (error) {
      console.error(error);
    }
  }
//   useEffect(() => {
//     // getGroupSensor()
//   });
  async function GroupwiseGroupSensor() {
    // Get sensor list when groupwise is enabled
    try {
      const groupwiseSensor = await axios.get(
        url?.baseurl2 + "configuration/getTypewisedata"
      );
      if (groupwiseSensor?.data?.status === true) {
        setGroupSensorList(groupwiseSensor?.data?.Result);
        setSwapGrp((p) => !p);
      } else if (groupwiseSensor?.data?.status === false) {
        message.error(groupwiseSensor?.data?.Result);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const fill = (par) => {
    // Auto fill input field
    setNewId(par);
    list.map((ele, i) => {
      if (ele?.limits_id === parseInt(par)) {
        setNewAddress(ele?.sensor_address);
        setNewUnit(ele?.unit);
        setNewLsl(ele?.lsl);
        setNewHsl(ele?.hsl);
        setNewLslDelay(ele?.lsl_delay);
        setNewHslDelay(ele?.hsl_delay);
        setFieldEnable(true);
      }
      if (par === "general") {
        setType("sensor");
        setNewAddress("");
        setNewUnit("");
        setNewLsl("");
        setNewHsl("");
        setFieldEnable(false);
      }
    });
  };
  const validateAddSensor = () => {
    // Validate sensor configuration field
    if (
      newStation !== "" &&
      newSensor !== "" &&
      newAddress !== "" &&
      type !== "" &&
      newlsl !== "" &&
      newhsl !== "" &&
      manufacturer !== ""
    ) {
      addGroupingSensor(
        newStation,
        newSensor,
        newAddress,
        newUnit,
        manufacturer,
        type,
        newId,
        newlsl,
        newhsl,
        newLslDelay,
        newHslDelay,
        newDescription
      );
      getGroupSensor();
      showModalLarge();
    } else {
      message.error("Please fill all required fields!", 1);
    }
  };

  const [filter, setFilter] = useState("");
  const sensorFilter = (par) => {
    setFilter(par);
  };

  const val = Object.keys(groupSensorList);
  return (
    // UI Components
    <MDBContainer fluid id="container" className="py-2">
      {/* Calling Navigation bar */}
      <Navbar />
      <MDBRow>
        <MDBCol lg="12" className=" px-3 py-3">
          <MDBCard className="border shadow rounded-6 ">
            <div className="shadow px-3 py-2 bg-info" id="header" style={{ borderRadius: " 12px 12px 0 0" }}>
              <MDBTypography tag={"h6"} className="fw-bold text-light pt-2">
                <FontAwesomeIcon icon={faSliders} className="px-2 fs-5" />
                <span>Sensor Limit Configuration</span>
              </MDBTypography>
            </div>
            <MDBRow>
              <MDBCol lg="6" className="mt-4 px-4">
                <MDBRadio name="inlineRadio" id="inlineRadio1" value="option1" label="StationWise"
                  onClick={() => {
                    getGroupSensor();
                    setRadioSelected(true);
                  }}
                  inline
                  defaultChecked={radioSelected ? true : false}
                />
                <MDBRadio name="inlineRadio" id="inlineRadio2" value="option2" label="Groupwise"
                  onClick={() => {
                    GroupwiseGroupSensor();
                    setFilter("");
                    setRadioSelected(false);
                  }}
                  inline
                  defaultChecked={radioSelected ? false : true}
                />
              </MDBCol>
              <MDBCol lg="6" className="d-flex justify-content-end  pb-2 mt-4 px-5">
                <MDBBtn color="info" rounded className="fw-bold"
                  onClick={() => {
                    getStation();
                    getSensors();
                    showModalLarge();
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} className="text-light fs-6" />{" "}
                  Add Sensor
                </MDBBtn>
              </MDBCol>
            </MDBRow>

            <MDBRow className="px-1">
              <MDBCol lg="3" className="px-4">
                <label
                  className="fw-bold"
                  hidden={radioSelected ? false : true}
                >
                  Filter Sensor
                </label>
                <input
                  type={radioSelected ? "text" : "hidden"}
                  className="form-control"
                  placeholder="Enter sensor name to filter"
                  value={filter}
                  onChange={(e) => {
                    sensorFilter(e.target.value);
                    setSwapStn((p) => !p);
                  }}
                  disabled={radioSelected ? false : true}
                ></input>
              </MDBCol>
              <MDBCol lg="9"></MDBCol>
            </MDBRow>
            <div className="px-2 py-1 d-flex"></div>
            <div
              className=""
              style={{ height: "70vh", width: "100%", overflowY: "scroll" }}
            >
              <MDBAccordion
                alwaysOpen
                initialActive={1}
                className="shad1ow p-3"
              >
                {
                  // Sensor text filter
                  val.map((item, index) => {
                    let match = Object.keys(groupSensorList?.[item]).find(
                      (element, i) => {
                        if (element.includes(filter)) {
                          return true;
                        } else if (!element.includes(filter)) {
                          return false;
                        }
                      }
                    );
                    let accordionItemName = (
                      <h6 className="fw-bold text-capitalize">
                        <FontAwesomeIcon
                          icon={faHouseCrack}
                          className="text-info fs-6 px-2"
                        />
                        {item}
                      </h6>
                    );
                    return (
                      <MDBAccordionItem
                        hidden={match !== undefined ? false : true}
                        collapseId={index + 1}
                        headerTitle={accordionItemName}
                      >
                        {radioSelected ? (
                          <div>
                            {/* Calling sensor table when stationwise is enabled otherwise groupwisetable is enabled*/}
                            <Settingtable
                              data={groupSensorList?.[item]}
                              val={groupSensorList}
                              getGroup={getGroupSensor}
                              filter={filter}
                              trigger={swapStn}
                            />
                          </div>
                        ) : (
                          <Groupwisetable
                            data={groupSensorList?.[item]}
                            //station={item}  //Missed in patch
                            getGroup={getGroupSensor}
                            val={item}
                            trigger={swapGrp}
                          />
                        )}
                      </MDBAccordionItem>
                    );
                  })
                }
              </MDBAccordion>
            </div>
          </MDBCard>
        </MDBCol>
      </MDBRow>

      {/* Popup for add new sensor in sensor configutaion */}
      <MDBModal
        nonInvasive="true"
        tabIndex="-1"
        show={largeCentredModal}
        setShow={setLargeCentredModal}
      >
        <MDBModalDialog size="xl" centered>
          <MDBModalContent className="shadow-lg">
            <MDBModalHeader className="bg-info">
              <MDBModalTitle className="text-light fw-bold">
                <FontAwesomeIcon icon={faPlus} className="px-2 fs-5" />
                Add Sensor
              </MDBModalTitle>
              <MDBBtn
                className="btn-close"
                color="light"
                onClick={showModalLarge}
              ></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              <div>
                <MDBRow className="d-flex justify-content-center">
                  <MDBCol lg={"12"}>
                    <MDBRow className="px-2 py-2">
                      <MDBCol lg={"6"} className="px-5 py-1">
                        <label className="fw-bold">
                          Select Station
                          <span className="text-danger fw-bold">*</span>
                        </label>
                        <div className="d-flex">
                          <select
                            className={
                              tokenExpired
                                ? "form-select text-capitalize"
                                : "form-select text-capitalize"
                            }
                            value={newStation}
                            onChange={getNewStation}
                          >
                            <option value="" selected disabled>
                              Select
                            </option>
                            {/* Get Station list from API */}
                            {
                              
                              stationlist.map((e,i)=>{
                                console.log(e)
                                  return (<option key={i} value={e?.stationname} className="text-capitalize">{e?.stationname}</option>);
                              })
                            }
                          </select>
                        </div>
                      </MDBCol>
                      <MDBCol lg={"6"} className="px-5 py-1">
                        <label className="fw-bold">
                          Sensor Name
                          <span className="text-danger fw-bold">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control text-capitalize"
                          placeholder="Enter sensor name"
                          value={newSensor}
                          onChange={getNewSensor}
                        ></input>
                      </MDBCol>
                      <MDBCol lg={"6"} className="px-5 py-1">
                        <label className="fw-bold px-1">
                          Sensor Type<span className="text-danger fw-bold">*</span>
                        </label>
                        <div className="d-flex">
                          <select
                            className="form-select text-capitalize"
                            value={newId}
                            onChange={(e) => {
                              getNewId();
                              fill(e.target.value);
                            }}
                          >
                            <option value="" selected disabled>
                              Select
                            </option>
                            <option
                              value={"general"}
                              className="text-capitalize"
                            >
                              general
                            </option>
                            {list.map((e, i) => {
                              return (
                                <option
                                  key={i}
                                  value={e?.limits_id}
                                  className="text-capitalize"
                                >
                                  {e?.sensor_name}
                                </option>
                              );
                            })}
                          </select>
                          <FontAwesomeIcon
                            icon={faPencil}
                            className="px-2 pt-2 text-info fs-5"
                            onClick={() => {
                              getSensors();
                              showSensorListModal();
                            }}
                          />
                        </div>
                        <label className="fw-bold mt-3">
                          Tag Address
                          <span className="text-danger fw-bold">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control text-capitalize"
                          placeholder="Enter tag address"
                          value={newAddress}
                          onChange={getNewAddress}
                        ></input>
                      </MDBCol>
                      <MDBCol lg={"6"} className="px-5 py-1">
                        <label className="fw-bold">
                          Manufacturer
                          <span className="text-danger fw-bold">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control text-capitalize"
                          placeholder="Enter manufacturer of sensor"
                          value={manufacturer}
                          onChange={getManufacturer}
                        ></input>

                        <label className="fw-bold mt-3">
                          Unit<span className="text-danger fw-bold">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control text-capitalize"
                          placeholder="Enter unit of sensor"
                          value={newUnit}
                          onChange={getNewUnit}
                          //disabled={fieldEnable}
                        ></input>
                      </MDBCol>
                      <MDBCol lg={"12"} className="px-0 py-1 mb-1">
                        <div className="px-3">
                          <MDBRow className="py-1">
                            <MDBCol lg={"6"} className="px-5 mb-3">
                              <label className="fw-bold mt-1">
                                Low Limit (LSL)
                                <span className="text-danger fw-bold">*</span>
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                placeholder="Enter sensor LSL"
                                value={newlsl}
                                onChange={getNewLsl}
                                //disabled={fieldEnable}
                              ></input>
                            </MDBCol>
                            <MDBCol lg={"6"} className="px-5 mb-3">
                              <label className="fw-bold mt-1">
                                High Limit (HSL)
                                <span className="text-danger fw-bold">*</span>
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                placeholder="Enter sensor HSL"
                                value={newhsl}
                                onChange={getNewHsl}
                                //disabled={fieldEnable}
                              ></input>
                            </MDBCol>
                            <MDBCol lg={"6"} className="px-5 mb-3">
                              <label className="fw-bold mt-1">
                                Low Limit Delay(LSL Delay)
                                <span className="text-danger fw-bold">*</span>
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Enter sensor LSL Delay"
                                value={newLslDelay}
                                onChange={getNewLslDelay}
                                disabled={fieldEnable}
                              ></input>
                            </MDBCol>
                            <MDBCol lg={"6"} className="px-5 mb-3">
                              <label className="fw-bold mt-1">
                                High Limit Delay(HSL Delay)
                                <span className="text-danger fw-bold">*</span>
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Enter sensor HSL Delay"
                                value={newHslDelay}
                                onChange={getNewHslDelay}
                                disabled={fieldEnable}
                              ></input>
                            </MDBCol>
                            <MDBCol lg={"12"} className="px-5 py-1 mb-2">
                              <label className="fw-bold">Description</label>
                              <textarea
                                type="text"
                                className="form-control text-capitalize"
                                style={{ height: "50%", minHeight: "100px" }}
                                value={newDescription}
                                onChange={(e) => {
                                  setNewDescription(e.target.value);
                                }}
                              ></textarea>
                            </MDBCol>
                          </MDBRow>
                        </div>
                      </MDBCol>
                    </MDBRow>
                  </MDBCol>
                </MDBRow>
              </div>
              <div className="d-flex justify-content-center">
                <MDBBtn
                  color="info"
                  className="mx-1 fw-bold"
                  rounded
                  onClick={() => {
                    validateAddSensor();
                  }}
                >
                  Save
                </MDBBtn>
                <MDBBtn
                  color="info"
                  className="mx-1 fw-bold"
                  rounded
                  onClick={showModalLarge}
                >
                  Cancel
                </MDBBtn>
              </div>
            </MDBModalBody>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      {/* Popup for display sensor type list */}
      <MDBModal
        nonInvasive="true"
        tabIndex="-1"
        show={sensorListModal}
        setShow={setSensorListModal}
      >
        <MDBModalDialog size="xl" centered>
          <MDBModalContent className="shadow-lg">
            <MDBModalHeader className="bg-info">
              <MDBModalTitle className="fw-bold text-light">
                Sensor Type List
              </MDBModalTitle>
              <MDBBtn
                className="btn-close"
                color="light"
                onClick={showSensorListModal}
              ></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              <div>
                <Sensorlist
                  trigger={trigger}
                  data={list}
                  getSensor={getSensors}
                />
              </div>
            </MDBModalBody>
            <MDBModalFooter className="d-flex justify-content-center">
              <MDBBtn
                color="info"
                rounded
                onClick={() => {
                  toggleShow();
                }}
              >
                Add Sensor Type
              </MDBBtn>
              <MDBBtn color="info" rounded onClick={showSensorListModal}>
                Cancel
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      {/* Popup for add sensor type in sensor type configuration */}
      <MDBModal
        nonInvasive="true"
        tabIndex="-1"
        show={centredModal}
        setShow={setCentredModal}
      >
        <MDBModalDialog size="lg" centered>
          <MDBModalContent className="shadow-lg">
            <MDBModalHeader className="bg-info">
              <MDBModalTitle className="text-light fw-bold">
                <FontAwesomeIcon icon={faPlus} className="px-2 fs-5" />
                Add Sensor Type
              </MDBModalTitle>
              <MDBBtn
                className="btn-close"
                color="light"
                onClick={toggleShow}
              ></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              <div>
                <label className="fw-bold">
                  Sensor Type<span className="text-danger fw-bold">*</span>
                </label>
                <input
                  type="text"
                  className="form-control mb-2 text-capitalize"
                  value={name}
                  maxLength="30"
                  onChange={getName}
                  placeholder="Enter Sensor Type"
                ></input>

                <label className="fw-bold">
                  Tag Address<span className="text-danger fw-bold">*</span>
                </label>
                <input
                  type="text"
                  className="form-control mb-2 text-capitalize"
                  value={address}
                  maxLength="20"
                  onChange={getAddress}
                  placeholder="Enter Tag Address"
                ></input>

                <label className="fw-bold">
                  Unit<span className="text-danger fw-bold">*</span>
                </label>
                <input
                  type="text"
                  className="form-control mb-2 text-capitalize"
                  value={unit}
                  maxLength="20"
                  onChange={getUnit}
                  placeholder="Enter Sensor Unit"
                ></input>

                <label className="fw-bold">
                  Low Limit (LSL)<span className="text-danger fw-bold">*</span>
                </label>
                <input
                  type="number"
                  className="form-control mb-2"
                  value={lsl}
                  onChange={getLsl}
                  max="1500"
                  placeholder="Enter Sensor LSL"
                ></input>

                <label className="fw-bold">
                  High Limit (HSL)<span className="text-danger fw-bold">*</span>
                </label>
                <input
                  type="number"
                  className="form-control mb-2"
                  value={hsl}
                  onChange={getHsl}
                  max="1500"
                  placeholder="Enter Sensor HSL"
                ></input>

                <label className="fw-bold">
                  Low Limit Delay(LSL Delay)
                  <span className="text-danger fw-bold">*</span>
                </label>
                <input
                  type="text"
                  className="form-control mb-2"
                  value={lslDelay}
                  onChange={getLslDelay}
                  max="1500"
                  placeholder="Enter Sensor LSL Delay"
                ></input>

                <label className="fw-bold">
                  High Limit Delay(HSL Delay)
                  <span className="text-danger fw-bold">*</span>
                </label>
                <input
                  type="text"
                  className="form-control mb-2"
                  value={hslDelay}
                  onChange={getHslDelay}
                  max="1500"
                  placeholder="Enter Sensor HSL Delay"
                ></input>

                <label className="fw-bold">Description</label>
                <textarea
                  type="number"
                  className="form-control mb-2 text-capitalize"
                  value={description}
                  maxLength="150"
                  onChange={getDescription}
                  style={{ height: "50px" }}
                ></textarea>
                {errMsg ? (
                  <p className="text-danger fw-bold">
                    Please fill required fields!
                  </p>
                ) : null}

                <div className="d-flex justify-content-center mt-3 mb-2">
                  <MDBBtn
                    rounded
                    color="info"
                    className="fw-bold mx-1"
                    onClick={() => {
                      validate();
                    }}
                  >
                    Save
                  </MDBBtn>
                  <MDBBtn
                    rounded
                    color="info"
                    className="fw-bold mx-1"
                    onClick={toggleShow}
                  >
                    Cancel
                  </MDBBtn>
                </div>
              </div>
            </MDBModalBody>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      {
        // Loader Implementation
        isLoaderEnable ? (
          <div
            className="vh-100 mask d-flex justify-content-center align-items-center"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
          >
            <MDBSpinner className="mx-2 position-relative" color="info">
              <span className="visually-hidden">Loading...</span>
            </MDBSpinner>
            <MDBTypography tag={"h6"} className="fw-bold pt-2">
              Loading...
            </MDBTypography>
          </div>
        ) : null
      }
    </MDBContainer>
  );
}
