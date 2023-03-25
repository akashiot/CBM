import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, message, Popconfirm, Table, Typography } from 'antd';
import axios from 'axios';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPenToSquare, faTrash} from '@fortawesome/free-solid-svg-icons';
import url from '../../configuration/url.json';


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
const Sensorlist = (props) => {  

  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  async function updateSensor(id,name,tagAddr,unit,description,lsl,hsl,lslDelay,hslDelay){
    // Update sensor type list
    const msg=message.loading("Updating sensor details...",0)
    try {
        const update =  await axios.post(url?.baseurl2+'configuration/updateSensor',{
            id:id.toString(),
            sensor_name:name.toLowerCase(),
            sensor_address:tagAddr,
            unit:unit,
            description:description,
            lsl:lsl,
            hsl:hsl,
            lsl_delay:lslDelay,
            hsl_delay:hslDelay,
        })
        if(update?.data?.status===true){
            message.success("Sensor info updated successfully!")
            msg();
        }
        else if(update?.data?.status===false){
            message.error("Sensor couldn't update something went to wrong!")
            msg();
        }
    } catch (error) {
        console.error(error)
    }
  }
  async function deleteSensor(id) {
    // Delete selected sensor type
    const msg=message.loading("Deleting sensor details...",0)
    try {
        const deleteSensor = await axios.post(url?.baseurl2+"configuration/deleteSensor",{
            id:id.toString()
        })
        if(deleteSensor?.data?.status===true){
            message.success("Sensor deleted successfully!")
            props?.getSensor();
            msg();
        }
        else if(deleteSensor?.data?.status===false){
            message.success(deleteSensor?.data?.result)
            msg()
        }
    } catch (error) {
        console.error(error);
    }
  }

  let tableData=props?.data;
  useEffect(()=>{
      const originData = [];
// Assigning sensor type data to table
      if(props?.data){
          tableData.forEach((ele,i)=>{
              originData.push({
                  key:i.toString(),
                  limit:(i+1).toString(),
                  sensorType:ele?.sensor_name,
                  tagAddress:ele?.sensor_address,
                  unit:ele?.unit,
                  description:ele?.description,
                  lsl:ele?.lsl,
                  lslDelay:ele?.lsl_delay,
                  hsl:ele?.hsl,
                  hslDelay:ele?.hsl_delay
              });
          })
          setData(originData)
      }
  },[props?.trigger])


  const isEditing = (record) => record.key === editingKey;
  const edit = (record) => {
    form.setFieldsValue({
        limit: '',
        sensorType: '',
        tagAddress: '',
        description: '',
        lsl: '',
        lslDelay: '',
        hsl: '',
        hslDelay: '',
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
        updateSensor(props?.data[parseInt(key)]?.limits_id,row?.sensorType,row?.tagAddress,row?.unit,row?.description,row?.lsl,row?.hsl,row?.lslDelay,row?.hslDelay);
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

  const remove = async (key) => {
    deleteSensor(props?.data[parseInt(key)]?.limits_id);
  };

  const columns = [
    {
      title: 'Id',
      dataIndex: 'limit',
      width: '10%',
      editable: true,
    },
    {
        title: 'Sensor Type',
        dataIndex: 'sensorType',
        width: '15%',
        editable: true,
      },
    {
      title: 'Tag Address',
      dataIndex: 'tagAddress',
      width: '15%',
      editable: true,
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      width: '10%',
      editable: true,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: '30%',
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
      title: 'Edit',
      dataIndex: 'operation',
      width:'10%',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.key)}
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
        title:'Remove',
        dataIndex:'remove',
        width:'10%',
        render: (_ ,record) => {
            return <Popconfirm title="Are you sure to delete this sensor?" onConfirm={()=>{remove(record.key)}} okText="Yes" cancelText="No">
                        <FontAwesomeIcon icon={faTrash} className="text-danger"/>
                    </Popconfirm>
            
            
            
        }
    }
  ].filter(item => !item.hidden);
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
        scroll={
          {x:160,y:300}
        }
      />
    </Form>
  );
};
export default Sensorlist;
