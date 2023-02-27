import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Popconfirm, Table, Typography,message } from 'antd';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPenToSquare, faTrash} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import url from '../../configuration/url.json'

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
const Stationlist = (props) => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState('');

  async function updateStation(id,name) {
    try {
        const update =  await axios.post(url?.baseurl2+'configuration/updateStation',{
            id:id.toString(),
            station_name:name.toLowerCase()
        })
        if(update?.data?.status===true){
            message.success("Station updated successfully!")
        }
        else if(update?.data?.status===false){
            message.error("Station couldn't update something went to wrong!")
        }
    } catch (error) {
        console.error(error)
    }
}

async function deleteStation(id) {
    console.log("dcsc",id);
    try {
        const deleteSensor = await axios.post(url?.baseurl2+"configuration/deleteStation",{
            id:id.toString()
        })
        console.log(deleteSensor?.data);
        if(deleteSensor?.data?.status===true){
            message.success("Station deleted successfully!")
            props?.getStation();
        }
        else if(deleteSensor?.data?.status===false){
            message.success(deleteSensor?.data?.result)
        }
    } catch (error) {
        console.error(error);
    }
  }

    let tableData=props?.data;

    useEffect(()=>{
        const originData = [];
        if(props?.data){
            tableData.forEach((ele,i) => {
                originData.push({
                    key:i.toString(),
                    id:ele?.stn_id,
                    station:ele?.name
                })
            });
        }
        setData(originData)
    },[props?.trigger])

  const isEditing = (record) => record.key === editingKey;
  const edit = (record) => {
    form.setFieldsValue({
      station: '',
      id: '',
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
        updateStation(row?.id,row?.station);
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
        deleteStation(data[key]?.id);
    };
 
  const columns = [
    {
      title: 'Station Id',
      dataIndex: 'id',
      width: '10%',
      editable: true,
    },
    {
        title: 'Station Name',
        dataIndex: 'station',
        width: '40%',
        editable: true,
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
      title: 'Edit',
      dataIndex: 'operation',
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
        render: (_ ,record) => {
            return <Popconfirm title="Are you sure to delete this station?" onConfirm={()=>{remove(record.key)}} okText="Yes" cancelText="No">
                        <FontAwesomeIcon icon={faTrash} className="text-danger"/>
                    </Popconfirm>            
        }
    }
  ];
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === 'age' ? 'number' : 'text',
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
export default Stationlist;