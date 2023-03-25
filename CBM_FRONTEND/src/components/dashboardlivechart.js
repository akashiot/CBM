import axios from 'axios';
import ReactECharts from 'echarts-for-react';
import { useEffect, useState } from 'react';
import url from '../configuration/url.json';


function Livestream(props){
  // console.log(props?.station,props?.sensor);
  const [xAxis,setXaxis]=useState('')
  const [yAxis,setYaxis]=useState('')
  const x=[];
  const Y=[];
  async function oneHourData(){
    try {
        const dataSeries=await axios.post(url?.baseurl+url?.port2+'getOnehourData',
        {
          station:props?.station,
          sensorname:props?.sensor
        })
        if(dataSeries?.data?.status===true){
          let data=dataSeries?.data?.result;
          data.forEach((element,i) => {
            x.push(element?.time_stamp);
            Y.push(element?.sensor_value);
          });
          setXaxis(x);
          setYaxis(Y);
        }
        else if(dataSeries?.data?.status===false){
          console.log('Please check connection!');
          setXaxis([]);
          setYaxis([]);
        }
    } catch (error) {
      console.error(error);
    }
  }
 
  // useEffect(()=>{
    oneHourData();
  // },[])
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      // grid: {
      //   left: '2%',
      //   right: '3%',
      //   bottom: '3%',
      //   containLabel: true
      // },
          yAxis: {
            show:false,
            type: 'value',
            splitLine: {
              show: false
           },
          },
          
          xAxis: {
              show:false,
              type: 'category',
              data: xAxis,
              // data: props?.X,
              showGrid:false,
              splitLine: {
                show: false
             },
          },
          visualMap:{
            show:false,
            pieces:[
              {
                min:0,
                max:20,
                color:"#FFEA00"
              },
              {
                min:20,
                max:40,
                color:"#64DD17"
              },
              {
                min:40,
                color:"#F44336"
              }
            ]
          },
          series: [
            {
              data:yAxis,
              // data:props?.Y,
              type: 'line',
              smooth: true,
              showSymbol: false,
              animation:false,
              lineStyle: {
                normal: {
                  width: 3,
                }
              }
            }
          ]
        };
  return <ReactECharts option={option} className="bg-d1ark" style={{width:'450px', height:"70px"}}/>
  }
  export default Livestream;