import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquareCheck } from "@fortawesome/free-solid-svg-icons";
import { Button, Table, Checkbox, message, Tag } from "antd";
import {
  MDBBtn,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalBody,
} from "mdb-react-ui-kit";
import axios from "axios";
import url from "../../configuration/url.json";

const Alarmtable = (props) => {
  // Popup modal variables
  const [basicModal, setBasicModal] = useState(false);
  const toggleShow = () => {
    setBasicModal(!basicModal);
  };
  const [remarks, setRemarks] = useState("");
  const [station, setStation] = useState("");
  const [sensor, setSensor] = useState("");
  const [alertId, setAlertId] = useState("");

  // Table variables
  const [checked, setChecked] = useState(false);
  const [btnEnable, setBtnEnable] = useState(false);
  const restriction = (e) => {
    if (e !== "" && e.match("^.*[A-Za-z].*$")) {
      setBtnEnable(true);
    } else {
      setBtnEnable(false);
    }
  };
  async function enterRemarks(stn, snr, almId, remrk, ack) {
    // Calling API to enter alarm remarks
    setRemarks("");
    const msg = message.loading("Updating remarks...", 0);
    try {
      const remark = await axios.post(url?.baseurl2 + "alert/remarks", {
        alarm_id: almId,
        station: stn,
        sensor: snr,
        remark: remrk,
        acknowledge: ack,
      });
      if (remark?.data?.status === true) {
        message.success(remark?.data?.Result);
        props?.call();
        msg();
      } else if (remark?.data?.status === false) {
        message.error(remark?.data?.Result);
        msg();
      }
    } catch (error) {
      message.error(error?.message);
    }
  }
  async function acknowledge(stn, snr, almId, ack) {
    // Calling API to acknowledge alarm
    const msg = message.loading("Acknowledging alarm...", 0);
    try {
      setChecked(true);
      const acknowledge = await axios.post(
        url?.baseurl2 + "alert/acknowledge",
        {
          alarm_id: almId,
          station: stn,
          sensor: snr,
          acknowledge: ack,
        }
      );
      if (acknowledge?.data?.status === true) {
        message.success(acknowledge?.data?.Result);
        props?.call();
        msg();
      } else if (acknowledge?.data?.status === false) {
        message.error(acknowledge?.data?.Result);
        msg();
      }
    } catch (error) {}
  }

  // Assigning data to table
  const data = [];

  if (props?.data) {
    props?.data.forEach((e, i) => {
      data.push(e);
    });
  }

  const columns = [];
  if (data.length !== 0) {
    Object.keys(data[0]).forEach((e, i) => {
      if (e !== "key" && e !== "alert_id" && e !== "timelapse") {
        if (e === "status") {
          console.log("e--------",e);
          columns.push({
            title: e.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
              letter.toUpperCase()
            ),
            dataIndex: e,
            filters: [
              {
                text: "Active",
                value: "Active",
              },
              {
                text: "In Active",
                value: "In Active",
              },
            ],
            filterMode: "tree",
            filterSearch: true,
            onFilter: (value, record) => record[e].startsWith(value),
          });
        } else if (e === "acknowledge") {
          columns.push({
            title: e.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
              letter.toUpperCase()
            ),
            dataIndex: e,
            filters: [
              {
                text: "Acknowledged",
                value: "acknowledged",
              },
              {
                text: "Un Acknowledged",
                value: "",
              },
            ],
            filterMode: "tree",
            filterSearch: true,
            onFilter: (value, record) => record[e].startsWith(value),
            render: (data, i) => {
              if (data === "acknowledged") {
                return (
                  <Tag>
                    <FontAwesomeIcon
                      icon={faSquareCheck}
                      className="text-primary fs-6 px-2 pt-1"
                    />{" "}
                    Acknowledged
                  </Tag>
                );
              }
              if (data === "unacknowledged") {
                return (
                  <>
                    <Checkbox
                      onClick={() => {
                        setStation(i?.station);
                        setSensor(i?.sensor);
                        setAlertId(i?.alert_no);
                        acknowledge(station, sensor, alertId, "acknowledged");
                      }}
                    />{" "}
                  </>
                );
              } else {
                return (
                  <>
                    <Checkbox disabled={true} />
                  </>
                );
              }
            },
          });
        } else if (e === "alert_no") {
          columns.push({
            title: "Alert Id",
            dataIndex: e,
            key: e,
          });
        } else {
          columns.push({
            title: e.includes("_")
              ? e
                  .replaceAll("_", " ")
                  .replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
                    letter.toUpperCase()
                  )
              : e.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
                  letter.toUpperCase()
                ),
            dataIndex: e,
            key: e,
            ellipsis: {
              showTitle: true,
            },
            render: (data, i) => {
              if (e === "hsl") {
                return data;
              } else if (e === "remarks") {
                if (data === " ") {
                  return (
                    <Button
                      type="primary"
                      disabled={false}
                      onClick={() => {
                        setStation(i?.station);
                        setSensor(i?.sensor);
                        setAlertId(i?.alert_no);
                        toggleShow();
                      }}
                    >
                      Enter Remarks
                    </Button>
                  );
                } else {
                  return data;
                }
              } else if (e === "acknowledge") {
                if (data === "acknowledged") {
                  return (
                    <Tag>
                      <FontAwesomeIcon
                        icon={faSquareCheck}
                        className="text-primary fs-6 px-2 pt-1"
                      />{" "}
                      Acknowledged
                    </Tag>
                  );
                }
                if (data === "unacknowledged") {
                  return (
                    <>
                      <Checkbox
                        onClick={() => {
                          setStation(i?.station);
                          setSensor(i?.sensor);
                          setAlertId(i?.alert_no);
                          acknowledge(station, sensor, alertId, "acknowledged");
                        }}
                        disabled={checked}
                      />{" "}
                    </>
                  );
                } else {
                  return (
                    <>
                      <Checkbox disabled={true} />
                    </>
                  );
                }
              } else if (
                e === "alert no" ||
                e === "station" ||
                e === "sensor" ||
                e === "sensor_type"
              ) {
                return data.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
                  letter.toUpperCase()
                );
              } else {
                return data;
              }
            },
          });
        }
      }
    });
  }

  if (data === undefined) {
    return (
      <Table
        columns={columns}
        dataSource={[]}
        scroll={{
          x: 5000,
          y: 400,
        }}
      />
    );
  }
  return (
    <div>
      <Table
        columns={columns}
        dataSource={data}
        scroll={{
          x: 5000,
          y: 500,
        }}
      />
      ;{/* Enter remarks popup*/}
      <MDBModal show={basicModal} setShow={setBasicModal} tabIndex="-1">
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalBody>
              <div className="d-flex justify-content-end"></div>

              <label className="fw-bold mb-1">Enter Remarks </label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Remarks"
                value={remarks}
                onChange={(e) => {
                  setRemarks(e.target.value);
                  restriction(e.target.value);
                }}
              ></input>
              <div className="d-flex justify-content-center pt-3">
                <MDBBtn
                  color="info"
                  rounded
                  className={
                    btnEnable ? "fw-bold mx-1" : "fw-bold mx-1 disabled"
                  }
                  onClick={() => {
                    enterRemarks(
                      station,
                      sensor,
                      alertId,
                      remarks,
                      "unacknowledged"
                    );
                    toggleShow();
                  }}
                >
                  Save
                </MDBBtn>
                <MDBBtn
                  color="info"
                  rounded
                  className="fw-bold mx-1"
                  onClick={toggleShow}
                >
                  Cancel
                </MDBBtn>
              </div>
            </MDBModalBody>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </div>
  );
};
export default Alarmtable;
