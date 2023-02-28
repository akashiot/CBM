import axios from "axios";
import React, { useState } from "react";
import url from "../configuration/url.json";
import * as XLSX from "xlsx";
import {
  MDBContainer,
  MDBCard,
  MDBRow,
  MDBCol,
  MDBTypography,
} from "mdb-react-ui-kit";
import { faTableList } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../components/navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
// const fileTypes = ["xlsx", "csv"];

const baseStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
};
const fileUploadBorder = {
  border: "5px dashed #39c0ed",
  margin: "16px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};
const focusedStyle = {
  borderColor: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const rejectStyle = {
  borderColor: "#ff1744",
};

function Fileupload() {
  const [fileUploaded, setFileUploaded] = useState([]);
  const changepage = useNavigate();
  if (localStorage.getItem("username") === null) {
    // if user is not logged in route to login page
    changepage("/");
  }

  async function xlread(data) {
    console.log(data);
    let dataParse;
    let readedData = XLSX.read(data, { type: "binary" });
    Object.keys(readedData.Sheets).forEach((sheets, index) => {
      const sheetname = readedData.SheetNames[index];
      const wsname = readedData.SheetNames[index];
      const ws = readedData.Sheets[wsname];
      const dataParse = XLSX.utils.sheet_to_json(ws, { header: 1 });
      setFileUploaded(dataParse)
      
      // dataParse.push()
    });
    const fileupload = await axios.post(url?.baseurl2+"upload",dataParse);
  }

  const handleChange = async (e) => {
    console.log("files", e.target.files);
    var files = e.target.files,
      f = files[0];
      console.log("f",f);
    var reader = new FileReader();
    reader.onload = function (e) {
      var data = e.target.result;
      xlread(data);
      /* Convert array to json*/
    };
    reader.readAsBinaryString(f);
  };

  function handleDrop(e) {
    e.preventDefault();
    console.log(e.dataTransfer.files[0]);
    var reader = new FileReader();
    reader.onload = function (e) {
      var data = e.target.result;
      xlread(data);
    };
    reader.readAsBinaryString(e.dataTransfer.files[0]);
  }

  return (
    // UI Components
    <MDBContainer fluid className="py-2" id="container">
      {/* Calling Navigation bar */}
      <Navbar />
      <MDBRow className="mt-4">
        <MDBCol lg="12">
          <MDBCard
            className="shadow border"
            style={{ height: "100%", width: "100%", minHeight: "82vh" }}
          >
            <div
              className="shadow px-2 py-2 bg-info"
              id="header"
              style={{ borderRadius: " 11px 11px 0 0" }}
            >
              <MDBTypography tag={"h6"} className="fw-bold text-light pt-2">
                <FontAwesomeIcon icon={faTableList} className="px-2 fs-5" />
                <span>Upload Sensors</span>
              </MDBTypography>
            </div>
            <div
              className="Fileupload d-flex"
              style={fileUploadBorder}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={handleDrop}
            >
              <p>Drag 'n' drop some files here, or click to select files</p>
              <input type="file" accept="xlsx" onChange={handleChange} />
            </div>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default Fileupload;
