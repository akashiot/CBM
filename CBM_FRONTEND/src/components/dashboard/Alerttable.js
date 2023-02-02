
import { SearchOutlined } from '@ant-design/icons';
import { Button, Input, Space, Table, Tag, Typography} from 'antd';
import React, { useEffect, useRef, useState } from 'react';

const { Text } = Typography;
const Alerttable = (props) => {
  // Table Variables
  const[data,setData]=useState([])
  const[lsl,setLsl]=useState('')
  const[hsl,setHsl]=useState('')

// Assigning data to table
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

  if(data === undefined){
    return <Table columns={columns} dataSource={[]} size="middle" scroll={{x:500 ,y:"100%"}}/>;

  }else{
    return <Table columns={columns} dataSource={data} size="middle" scroll={{x:500 ,y:"100%"}} pagination={{ pageSize: 4}}/>;
  }
};
export default Alerttable;