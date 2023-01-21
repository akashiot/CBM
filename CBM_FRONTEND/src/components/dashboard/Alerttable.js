
import { SearchOutlined } from '@ant-design/icons';
import { Button, Input, Space, Table, Tag, Typography} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import source from 'D:/cbm/CBM Projects/CBM_FRONTEND/src/configuration/alertconfig.json'

const { Text, Link } = Typography;
const Alerttable = (props) => {
  const[data,setData]=useState([])
  const[lsl,setLsl]=useState('')
  const[hsl,setHsl]=useState('')


  useEffect(()=>{
    let value=[]
    if(props?.data){
      props?.data.forEach((e,i)=>{
        if(e?.station===props?.station && e?.sensor===props?.sensor){
          value.push(e)
        }
      })
      setData(value);
      setLsl(value[0]?.lsl)
      setHsl(value[0]?.hsl)
      // if(Object.keys(props?.data).length!==0){
      //   const tabledata=Object.keys(props?.data)
      //   tabledata.forEach((ele,i)=>{
      //     Object.keys(props?.data[ele]).forEach((data,index)=>{
      //       // console.log(props?.station, props?.sensor);
      //       // setData(props?.data[ele][data]);
      //       if(ele===props?.station && data===props?.sensor){
      //         setData(props?.data[ele][data]);
      //       }
      //     })
      //   })
      // }
    }

   
  },[props?.trigger])
  

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
  const columns=[]
if(data.length!==0){
  Object.keys(data[0]).forEach((head,i)=>{
    if(head==="start_time" || head==="alert_type" || head==="fault_type" || head==="lsl" || head==="alert_value" || head==="hsl"){
      columns.push({
        title: head.toLocaleUpperCase(),
        dataIndex: head,
        key: head,
        render:( (data,i) => {
          if(head==="start_time"){
            return data?.slice(10,19)
          }
          else if(head==="alert_value"){
            let colour='success'
            if(data>hsl){
              colour='danger'
            }
            else if(data<lsl){
              colour='warning'
            }
            return <Text type={colour}>{parseFloat(data).toFixed(2)}</Text>
          }
          else if(head==="fault_type"){
            return <Tag color={data==="Instant"? 'geekblue':'volcano'} key={data}>
                    {data}
                  </Tag>
          }
          else{
            return data
          }
        })
      }) 
    }
  })
}
  // const columns=[
  //   {
  //     title: 'Timestamp',
  //     dataIndex: 'start_time',
  //     key: 'start_time',
  //   render:( (data,i) => data?.slice(10,19)),
  //   },
  //   {
  //     title: 'LSL',
  //     dataIndex: 'lsl',
  //     key: 'lsl',
  //   },
  //   {
  //     title: 'Actual',
  //     dataIndex: 'alert_value',
  //     key: 'alert_value',
  //   render:( (data,i) =>{
  //               let colour=data>'67' ? 'danger' : "success"
  //               return <Text type={colour}>{parseFloat(data).toFixed(2)}</Text>
  //             })
  //   },
  //   {
  //     title: 'HSL',
  //     dataIndex: 'hsl',
  //     key: 'hsl',
  //   },    {
  //     title: 'Type',
  //     dataIndex: 'alert_type',
  //     key: 'alert_type',
  //   },
  //   {
  //     title: 'Fault Type',
  //     dataIndex: 'fault_type',
  //     key: 'fault_type',
  //     // ...getColumnSearchProps(head),
  //   render:( (data,i) =>{
  //               let color = data==="Instant" ? 'blue' : 'red';
  //               return <Tag color={color} key={i}>
  //                       {data}
  //                     </Tag>
  //           }),
  //   },
  // ];
  
  // if(Object.keys(props?.data).length !== 0){
  //     let header=props?.data?.['station-1']['process temperature']

  //   Object.keys(header).forEach((head,i)=>{
  //     columns.push({
  //       title: head.toUpperCase(),
  //       dataIndex: head,
  //       key: head,
  //       width: '30%',
  //       ...getColumnSearchProps(head),
  //       render:( (data,i) =>{
  //         if(head==="fault_type"){
  //           let color = data==="Instant" ? 'blue' : 'red';
  //           return <Tag color={color} key={i}>
  //                   {data}
  //                 </Tag>
  //         }
  //         else if(head==="actual"){
  //           let colour=data>'67' ? 'danger' : "warning"
  //           return <Text type={colour}>{data}</Text>
  //         }
  //         else if(head === "timestamp"){
  //           return data.slice(10,20)
  //         }
  //         else{
  //           return data;
  //         }
  //       }),
  //     })
  //   })
  // }

  

  if(data === undefined){
    return <Table columns={columns} dataSource={[]} size="middle" scroll={{x:500 ,y:"100%"}}/>;

  }else{
    return <Table columns={columns} dataSource={data} size="middle" scroll={{x:500 ,y:"100%"}} pagination={{ pageSize: 4}}/>;
  }
};
export default Alerttable;