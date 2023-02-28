import 'antd/dist/antd.css';
import { Space, Table, Tag } from 'antd';
import React from 'react';
const columns = [
  {
    title: 'DateTime',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Oil Temperature',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Safety Temperature',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: 'Process Temperature',
    key: 'tags',
    dataIndex: 'tags',
  },
  {
    title: 'mV Reading',
    key: 'action',
   dataIndex:'action'
  },
];
const data=[];
for(var i=1;i<9;i++){
    data.push( {
        key: i,
        name: '2022-09-17 12:00:00',
        age: 32,
        address: 39,
        tags:40,
        action:90
      },)
}


function ReportTable(){
    return <Table columns={columns} dataSource={data} size="small" scroll={{
        x: 500,
        y:1000,
      }}
      pagination={false}/>
}
export default ReportTable;