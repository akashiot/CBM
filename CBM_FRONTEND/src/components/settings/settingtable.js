import { parse } from '@fortawesome/fontawesome-svg-core';
import { Form, Input, InputNumber, message, Popconfirm, Table, Typography } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import url from 'D:/cbm/CBM Projects/CBM_FRONTEND/src/configuration/url.json';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPenToSquare, faTrash} from '@fortawesome/free-solid-svg-icons';
import { useContext } from "react";
import { UserContext } from "../context";

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};
const Settingtable = (props) => {

  // if(onehourData){
  //   Object.keys(onehourData?.[props?.name]).forEach((el,i)=>{
  //       console.log(onehourData?.[props?.name]?.[el]?.lsl.pop());
  //       originData.push({
  //         key: i.toString(),
  //         name:el.charAt(0).toUpperCase() + el.slice(1),
  //         lsl: onehourData?.[props?.name]?.[el]?.lsl.pop() || 0,
  //         hsl: onehourData?.[props?.name]?.[el]?.hsl.pop() || 0,
  //       })
  //     })
  // }
 
  // Object.keys(props?.data).forEach((sensor,i)=>{
  //   originData.push({
  //     key: i.toString(),
  //     // id:props?.data?.[sensor]?.id.toString()|| 0,
  //     id:(i+1).toString()|| 0,
  //     name:props?.data?.[sensor]?.sensorname.charAt(0).toUpperCase() + sensor.slice(1) || "name",
  //     type:props?.data?.[sensor]?.sensor_type,
  //     address:props?.data?.[sensor]?.sensoraddress || "address",
  //     info:props?.data?.[sensor]?.description || "info",
  //     make:props?.data?.[sensor]?.manufacture || "make",
  //     lsl: props?.data?.[sensor]?.lsl || 0,
  //     hsl: props?.data?.[sensor]?.hsl || 0,
  //   });
  // })

  async function updateGroupingSensor(id,sensor,address,unit,make,type,lsl,hsl,lslDelay,hslDelay,description){
    // console.log(id,sensor,type,address,make,lsl,hsl,description);
    const msg=message.loading("Updating sensor details...",0)
    try {
          const updateGroupingSensor=await axios.post(url?.baseurl2+"configuration/updateGroupingsensor",{
            id:id,
            sensor_name:sensor.toLowerCase(),
            sensor_address:address.toLowerCase(),
            unit:unit,
            manufacture:make.toLowerCase(),
            sensor_type:type.toLowerCase(),
            lsl:lsl,
            hsl:hsl,
            lsl_delay:lslDelay,
            hsl_delay:hslDelay,
            description:description.toLowerCase()   
          })
          if(updateGroupingSensor?.data?.status===true){
            message.success(updateGroupingSensor?.data?.result,1)
            props?.getGroup();
            msg();
          }
          else if(updateGroupingSensor?.data?.status===false){
            message.error("Sensor didn't update!")
            msg();
          }
    } catch (error) {
      console.error(error)  
    }
  }

  async function deleteGroupingSensor(id){
    const msg=message.loading("Deleting sensor details...",0)
    try {
      const deleteGroupingSensor = await axios.post(url?.baseurl2+'configuration/deleteGroupingsensor',{
        id:id.toString()
      }) 
      if(deleteGroupingSensor?.data?.status===true){
        message.success("Sensor deleted successfully!")
        props?.getGroup();
        msg();
      }
      else if(deleteGroupingSensor?.data?.status===false){
        message.error("Something went to wrong!")
        msg();
      }
      
    } catch (error) {
      console.error(error)
    }
  }


  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [keys,setKeys] = useState([]);

  useEffect(()=>{
    const originData = [];
    let objkeys=[];

    if(props?.data){
      // console.log("stationwise : ",props?.trigger);
      objkeys=Object.keys(props?.data);
      Object.keys(props?.data).forEach((sensor,i)=>{
        if(sensor.includes(props?.filter)){
          originData.push({
            key: i.toString(),
            // id:props?.data?.[sensor]?.id.toString()|| 0,
            id:(i+1).toString()|| 0,
            name:props?.data?.[sensor]?.sensor_name || "name",
            type:props?.data?.[sensor]?.sensor_type,
            address:props?.data?.[sensor]?.tag_address || "address",
            unit:props?.data?.[sensor]?.unit || "deg c",
            info:props?.data?.[sensor]?.description || "info",
            make:props?.data?.[sensor]?.manufacture || "make",
            lsl: props?.data?.[sensor]?.lsl || 0,
            hsl: props?.data?.[sensor]?.hsl || 0,
            lslDelay:props?.data?.[sensor]?.lsl_delay || "0 sec",
            hslDelay:props?.data?.[sensor]?.hsl_delay || "0 sec"
  
          });
        }
       
      })
      setData(originData)
      setKeys(objkeys)
    }else{
      originData=[];
      setKeys([])
    }
  },[props?.trigger])

  const [editingKey, setEditingKey] = useState('');
  const isEditing = (record) => record.key === editingKey;
  const edit = (record) => {
    form.setFieldsValue({
      id:'',
      name: '',
      type: '',
      address: '',
      unit: '',
      make: '',
      lsl: '',
      hsl: '',
      lslDelay: '',
      hslDelay: '',
      info: '',
      ...record,
    });
    setEditingKey(record.key);
  };
  const cancel = () => {
    setEditingKey('');
  };
  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setData(newData);
        // console.log(props?.data?.[keys[parseInt(key)]]?.id);
        // console.log(row?.lslDelay,row?.hslDelay,);
        updateGroupingSensor(props?.data?.[keys[parseInt(key)]]?.id,row?.name,row?.address,row?.unit,row?.make,row?.type,row?.lsl,row?.hsl,row?.lslDelay,row?.hslDelay,row?.info);
        // updateGroupingSensor(data[key]?.id,row?.name,row?.address,row?.make,row?.type,row?.lsl,row?.hsl,row?.info);
        setEditingKey('');
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const remove = (e) =>{
    deleteGroupingSensor(props?.data?.[keys[parseInt(e)]]?.id);
  }

  const columns = [
    {
      title: 'Id',
      dataIndex: 'id',
      width: '5%',
      editable: true,
    },{
      title: 'Sensor Name',
      dataIndex: 'name',
      width: '20%',
      editable: true,
      render:((data,i)=>{
        return data.charAt(0).toUpperCase() + data.slice(1)
      })
    },
    {
      title: 'Sensor Type',
      dataIndex: 'type',
      width: '20%',
      editable: true,
      render:((data,i)=>{
        if(data){
          const arr = data.split(" ");
          for (var i = 0; i < arr.length; i++) {
              arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
          }
          const str2 = arr.join(" ");
          return str2      
        }
        })
    },
    {
      title: 'Tag Address',
      dataIndex: 'address',
      width: '15%',
      editable: true,
      render:((data,i)=>{
        return data.toUpperCase()
      })
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      width: '15%',
      editable: true,
      render:( (data,i) => {
        const arr = data.split(" ");
        for (var i = 0; i < arr.length; i++) {
            arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
        }
        const str2 = arr.join(" ");
        return str2
    }),
    },
    {
      title: 'Manufacturer',
      dataIndex: 'make',
      width: '15%',
      editable: true,
      render:((data,i)=>{
        return data.toUpperCase()
      })
    },
    {
      title: 'LSL',
      dataIndex: 'lsl',
      width: '10%',
      editable: true,
    },
    {
      title: 'LSL Delay',
      dataIndex: 'lslDelay',
      width: '10%',
      editable: true,
    },
    {
      title: 'HSL',
      dataIndex: 'hsl',
      width: '10%',
      editable: true,
    },
    {
      title: 'HSL Delay',
      dataIndex: 'hslDelay',
      width: '10%',
      editable: true,
    },
    {
      title: 'Description',
      dataIndex: 'info',
      width: '25%',
      editable: true,
      ellipsis: {
        showTitle: false,
      },
      render:( (data,i) => {
        const arr = data.split(" ");
        for (var i = 0; i < arr.length; i++) {
            arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
        }
        const str2 = arr.join(" ");
        return str2
    }),
    },
    {
      title: 'Edit',
      dataIndex: 'operation',
      width:'10%',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => {save(record.key);}}
              style={{
                marginRight: 8,
              }}
            >
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
              <FontAwesomeIcon icon={faPenToSquare} className="text-info"/>
          </Typography.Link>
        );
      },
    },
    {
      title: 'Remove',
      dataIndex: 'remove',
      width:'10%',
      render: (_ ,record) => {
        return <Popconfirm title="Are you sure to delete this sensor?" onConfirm={()=>{remove(record.key)}} okText="Yes" cancelText="No">
                    <FontAwesomeIcon icon={faTrash} className="text-danger"/>
                </Popconfirm>
      },
    }
  ];
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    else if(col?.dataIndex==="hsl" || col?.dataIndex==="lsl" || col?.dataIndex==="lslDelay" || col?.dataIndex==="hslDelay"){
      return { ...col,
      onCell: (record) => ({
        record,
        inputType: 'number',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),}
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });
  return (
    <Form form={form} component={false}>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={data}
        columns={mergedColumns}
        rowClassName="editable-row"
        pagination={{
          onChange: cancel,
        }}
      />
    </Form>
  );
};
export default Settingtable;
