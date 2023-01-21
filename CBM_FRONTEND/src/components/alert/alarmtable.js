import React, { useEffect, useRef, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSquareCheck} from '@fortawesome/free-solid-svg-icons';
import { Button, Input, Space, Table, Typography, Checkbox, message, Tag } from 'antd';
import { MDBBtn,  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter } from 'mdb-react-ui-kit';
import axios from 'axios';
import url from 'D:/cbm/CBM Projects/CBM_FRONTEND/src/configuration/url.json'

const { Text, Link } = Typography;
const Alarmtable = (props) => {
  // modal
  const [basicModal, setBasicModal] = useState(false);
  const toggleShow = () => {setBasicModal(!basicModal);};  
  const[remarks,setRemarks]=useState('')
  const[station,setStation]=useState('')
  const[sensor,setSensor]=useState('')
  const[alertId,setAlertId]=useState('')
  // const[data,setData]=useState([])
  // console.log(station,sensor,alertId)
  // table
  const [checked,setChecked]=useState(false)  
  const [btnEnable,setBtnEnable]=useState(false)
  const restriction=(e)=>{
    if(e!=="" && e.match("^.*[A-Za-z].*$")){
      setBtnEnable(true);
    }
    else{
      setBtnEnable(false);
    }
}

async function enterRemarks(stn,snr,almId,remrk,ack) {
  setRemarks('')
  const msg=message.loading("Updating remarks...",0)
  try {
    const remark = await axios.post(url?.baseurl2+'alert/remarks',{
        alarm_id:almId,
        station:stn,
        sensor:snr,
        remark:remrk,
        acknowledge:ack
    })
    if(remark?.data?.status===true){
      message.success(remark?.data?.Result);
      props?.call();
      msg();
    }else if(remark?.data?.status===false){
      message.error(remark?.data?.Result)
      msg();
    }
  } catch (error) {
    message.error(error?.message)
  }
}

async function acknowledge(stn,snr,almId,ack) {
  const msg=message.loading("Acknowledging alarm...",0)
  try {
    setChecked(true)
    const acknowledge = await axios.post(url?.baseurl2+'alert/acknowledge',{
        alarm_id:almId,
        station:stn,
        sensor:snr,
        acknowledge:ack
    })
    if(acknowledge?.data?.status===true){
      message.success(acknowledge?.data?.Result)
      props?.call();
      msg()
    }else if(acknowledge?.data?.status===false){
      message.error(acknowledge?.data?.Result)
      msg();
    }
  } catch (error) {
    
  }
}


const data=[]

    if(props?.data){
      props?.data.forEach((e,i)=>{
          data.push(e)
          // console.log(e);
      })
    }

    const columns=[]
    if(data.length!==0){
      Object.keys(data[0]).forEach((e,i)=>{
        if(e!=="key" && e!=="alert_id" && e!=="timelapse"){
          if(e==="status"){
            columns.push({
              title: e.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()),
              dataIndex: e,
              filters: [
                {
                  text: 'Active',
                  value: 'Active',
                },
                {
                  text: 'In Active',
                  value: 'In Active',
                },
              ],
              filterMode: 'tree',
              filterSearch: true,
              onFilter: (value, record) => record[e].startsWith(value),
            })
          }
          else if(e==="acknowledge"){
            columns.push({
              title: e.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()),
              dataIndex: e,
              filters: [
                {
                  text: 'Acknowledged',
                  value: 'acknowledged',
                },
                {
                  text: 'Un Acknowledged',
                  value: '',
                },
              ],
              filterMode: 'tree',
              filterSearch: true,
              onFilter: (value, record) => record[e].startsWith(value),
              render:(data,i)=>{
                if(data==="acknowledged"){
                  return <Tag><FontAwesomeIcon icon={faSquareCheck} className="text-primary fs-6 px-2 pt-1"/> Acknowledged</Tag>
                }
                if(data==="unacknowledged"){
                  return <><Checkbox onClick={()=>{setStation(i?.station);setSensor(i?.sensor);setAlertId(i?.alert_no);acknowledge(station,sensor,alertId,'acknowledged')}}/> </>
                }else{
                  return <><Checkbox disabled={true}/></>
                }
              }
            })
          }
          else{
          columns.push({
            title: e.includes("_") ? e.replaceAll('_', ' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()) : 
                   e.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()),
            dataIndex: e,
            key: e,
            ellipsis: {
              showTitle: true,
            },
            render:(data,i)=>{
              if(e==="hsl"){
                return data
              }
              else if(e==="remarks"){
                if(data===" "){
                  // console.log(i?.station,i?.sensor,i?.alert_no);
                  return <Button type="primary" disabled={false}  onClick={()=>{setStation(i?.station);setSensor(i?.sensor);setAlertId(i?.alert_no);toggleShow()}}>Enter Remarks</Button>;
                }else{
                  return data
                }
              }
              else if(e==="acknowledge"){
                if(data==="acknowledged"){
                  return <Tag><FontAwesomeIcon icon={faSquareCheck} className="text-primary fs-6 px-2 pt-1"/> Acknowledged</Tag>
                }
                if(data==="unacknowledged"){
                  return <><Checkbox onClick={()=>{setStation(i?.station);setSensor(i?.sensor);setAlertId(i?.alert_no);acknowledge(station,sensor,alertId,'acknowledged')}} disabled={checked}/> </>
                }else{
                  return <><Checkbox disabled={true}/></>
                }
              }
              else if(e==="alert no" || e==="station" ||e==="sensor" ||e==="sensor_type"){
                return data.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())
              }
              else{
                return data
              }
            }
          })
        }
        }
      })
    }


const onChange = (pagination, filters, sorter, extra) => {
  console.log('params', pagination, filters, sorter, extra);
};


  if(data===undefined){
    return <Table columns={columns} dataSource={[]} scroll={{
      x: 5000,
      y: 400,
    }}/>;
  }
  return <div>
          <Table columns={columns} dataSource={data} scroll={{
            x: 5000,
            y: 500,
          }}/>;
          {/* file save modal*/}
          <MDBModal show={basicModal} setShow={setBasicModal} tabIndex='-1'>
          <MDBModalDialog>
          <MDBModalContent>
              <MDBModalBody>
                  <div className="d-flex justify-content-end">
                  </div>

                  <label className="fw-bold mb-1">Enter Remarks </label>
                  <input type="text" className="form-control" placeholder="Enter Remarks" value={remarks} onChange={(e)=>{setRemarks(e.target.value);restriction(e.target.value)}}></input>
                  <div className="d-flex justify-content-center pt-3">
                      <MDBBtn color='info' rounded className={btnEnable ? "fw-bold mx-1" : "fw-bold mx-1 disabled"} onClick={()=>{enterRemarks(station,sensor,alertId,remarks,'unacknowledged');toggleShow()}}>
                        Save
                      </MDBBtn>
                      <MDBBtn color='info' rounded className="fw-bold mx-1" onClick={toggleShow}>
                        Cancel
                      </MDBBtn>
                  </div>
              </MDBModalBody>

          </MDBModalContent>
          </MDBModalDialog>
        </MDBModal>
      </div>
};
export default Alarmtable;



//   useEffect(()=>{
//     const table=[]

//     if(props?.data){
//       props?.data.forEach((e,i)=>{
//         // if(e?.status.toString()==="Active"){
//           table.push(e)
//         // }
//         // else if(e?.acknowledge.toString()===' ' && e?.status.toString()==="In Active"){
//         //   table.push(e)
//         // }
//       })
//       setData(table)
//     }
//   },[props?.trigger])


  
//   const [field,setField]=useState('')
//   const [searchText, setSearchText] = useState('');
//   const [searchedColumn, setSearchedColumn] = useState('');
//   const searchInput = useRef(null);
//   const handleSearch = (selectedKeys, confirm, dataIndex) => {
//     confirm();
//     setSearchText(selectedKeys[0]);
//     setSearchedColumn(dataIndex);
//   };
//   const handleReset = (clearFilters) => {
//     clearFilters();
//     setSearchText('');
//   };
//   const getColumnSearchProps = (dataIndex) => ({
//     filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
//       <div
//         style={{
//           padding: 8,
//         }}
//         onKeyDown={(e) => e.stopPropagation()}
//       >
//         <Input
//           ref={searchInput}
//           placeholder={`Search ${dataIndex}`}
//           value={selectedKeys[0]}
//           onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
//           onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
//           style={{
//             marginBottom: 8,
//             display: 'block',
//           }}
//         />
//         <Space>
//           <Button
//             type="primary"
//             onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
//             icon={<SearchOutlined />}
//             size="small"
//             style={{
//               width: 90,
//             }}
//           >
//             Search
//           </Button>
//           <Button
//             onClick={() => clearFilters && handleReset(clearFilters)}
//             size="small"
//             style={{
//               width: 90,
//             }}
//           >
//             Reset
//           </Button>
//           <Button
//             type="link"
//             size="small"
//             onClick={() => {
//               confirm({
//                 closeDropdown: false,
//               });
//               setSearchText(selectedKeys[0]);
//               setSearchedColumn(dataIndex);
//             }}
//           >
//             Filter
//           </Button>
//           <Button
//             type="link"
//             size="small"
//             onClick={() => {
//               close();
//             }}
//           >
//             close
//           </Button>
//         </Space>
//       </div>
//     ),
//     filterIcon: (filtered) => (
//       <SearchOutlined
//         style={{
//           color: filtered ? '#1890ff' : undefined,
//         }}
//       />
//     ),
//     onFilter: (value, record) =>
//       record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
//     onFilterDropdownOpenChange: (visible) => {
//       if (visible) {
//         setTimeout(() => searchInput.current?.select(), 100);
//       }
//     },
//   });
  
// const columns = [
//   {
//     title: 'Name',
//     dataIndex: 'name',
//     filters: [
//       {
//         text: 'Joe',
//         value: 'Joe',
//       },
//       {
//         text: 'John',
//         value: 'John',
//       },
//       {
//         text: 'Jim',
//         value: 'Jim',
//       },
//     ],
//     filterMode: 'tree',
//     filterSearch: true,
//     onFilter: (value, record) => record.name.startsWith(value),
//     width: '30%',
//   },
//   {
//     title: 'Age',
//     dataIndex: 'age',
//     sorter: (a, b) => a.age - b.age,
//   },
//   {
//     title: 'Address',
//     dataIndex: 'address',
//     filters: [
//       {
//         text: 'London',
//         value: 'London',
//       },
//       {
//         text: 'New York',
//         value: 'New York',
//       },
//     ],
//     onFilter: (value, record) => record.address.startsWith(value),
//     filterSearch: true,
//     width: '40%',
//   },
// ];