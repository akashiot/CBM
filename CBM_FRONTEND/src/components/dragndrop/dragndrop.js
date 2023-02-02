import { height } from '@mui/system';
import axios from 'axios';
import React, {useState} from 'react';
// import Dropzone from 'react-dropzone';
import url from '../../configuration/url.json';

// import { parse } from "papaparse";

import * as XLSX from "xlsx";
 function Fileupload() {
  const [items, setItems] = useState([]);
  var apiCall = async(d)=>{
    const fileupload  = await axios.post(url?.baseurl2+"upload",d);
  }

  const readExcel = (file) => {
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = (e) => {
        const bufferArray = e.target.result;

        const wb = XLSX.read(bufferArray, { type: "buffer" });

        const wsname = wb.SheetNames[0];

        const ws = wb.Sheets[wsname];

        const data = XLSX.utils.sheet_to_json(ws);

        resolve(data);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });

    promise.then((d) => {
      apiCall(d);
      setItems(d);
      
    });
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files[0];
          readExcel(file);
        }}
      />
    </div>
  );


}

export default Fileupload