import React, { useRef, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Button, Input, Space, Table } from 'antd';
import { MDBBtn,  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalBody,
   } from 'mdb-react-ui-kit';
  import { CSVLink } from "react-csv";


const Groupreporttable = (props) => {
  // Popup Variables
  const [basicModal, setBasicModal] = useState(false);
  const toggleShow = () => setBasicModal(!basicModal);
  const [fileName,setFileName]=useState('')

  const data=[]
  // Assigning data to table when stationwise enabled
  if(props?.data){
    props?.data?.hsl.forEach((e,i)=>{
      data.push({
        key:i.toString(),
        time:props?.data?.xaxis[i],
        name:props?.data?.name,
        sensor:props?.data?.sensorname,
        lsl:props?.data?.lsl[i],
        actual:props?.data?.yaxis[i],
        hsl:props?.data?.hsl[i]
      })
    })
  }
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1890ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  });
  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'time',
      key: 'time',
      ...getColumnSearchProps('time'),
    },
    {
      title: 'Station Name',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
      render:( (data,i) => {
        if(data){
            const arr = data.split(" ");
          for (var i = 0; i < arr.length; i++) {
              arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
          }
          const str2 = arr.join(" ");
          return str2
          }
    }),
    },
    {
        title: 'Sensor Name',
        dataIndex: 'sensor',
        key: 'sensor',
        ...getColumnSearchProps('sensor'),
        render:( (data,i) => {
            if(data){
                const arr = data.split(" ");
              for (var i = 0; i < arr.length; i++) {
                  arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
              }
              const str2 = arr.join(" ");
              return str2
              }
        }),
      },
    {
      title: 'LSL',
      dataIndex: 'lsl',
      key: 'lsl',
      ...getColumnSearchProps('lsl'),
    },
    {
      title: 'Actual',
      dataIndex: 'actual',
      key: 'actual',
      ...getColumnSearchProps('actual'),
      render:((data)=>{
        if(data){
          return parseFloat(data).toFixed(2)
        }
      })
    },
    {
      title: 'HSL',
      dataIndex: 'hsl',
      key: 'hsl',
      ...getColumnSearchProps('hsl'),
    },
  ];
  return (
    <div>
      <div className="d-flex justify-content-end pb-2 px-2">
        <MDBBtn rounded color="info" className="fw-bold" onClick={toggleShow}>Export as excel</MDBBtn>
      </div>
      <Table columns={columns} dataSource={data} size="middle" scroll={{x: 500,y: 230}} />;

      {/* file save popup*/}
      <MDBModal show={basicModal} setShow={setBasicModal} tabIndex='-1'>
                <MDBModalDialog>
                <MDBModalContent>
                    <MDBModalBody>
                        <div className="d-flex justify-content-end">
                        </div>

                        <label className="fw-bold mb-1">Enter filename </label>
                        <input type="text" className="form-control" placeholder="Enter file name" value={fileName} onChange={(e)=>{setFileName(e.target.value)}}></input>
                        <div className="d-flex justify-content-center pt-3">
                                    <CSVLink
                                        data={data}
                                        filename={fileName}
                                        className={fileName!=="" ? "btn btn-info btn-rounded fw-bold mx-1" : "btn btn-info btn-rounded disabled fw-bold mx-1"}
                                        onClick={toggleShow}
                                        >
                                       Save
                                    </CSVLink>

                            <MDBBtn color='info' rounded className="fw-bold" onClick={toggleShow}>
                                Cancel
                            </MDBBtn>
                        </div>
                    </MDBModalBody>

                </MDBModalContent>
                </MDBModalDialog>
            </MDBModal>
    </div>
  )
};
export default Groupreporttable;