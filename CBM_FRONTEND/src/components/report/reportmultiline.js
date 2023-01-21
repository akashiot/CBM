import ReactECharts from 'echarts-for-react';
import { useEffect, useState } from 'react';
import url from 'D:/cbm/CBM Projects/CBM_FRONTEND/src/configuration/chartseries.json'

export default function Reportmultilinechart(props) {

  const [multiSeries,setMultiSeries]=useState([])
  const [timeSeries,setTimeSeries]=useState([])
  // const [multilineChartOption, setMultilineChartOption] = useState({})

   
  useEffect(()=>{
    let multiLine=[];
    let series =[];
    let xaxis=[];
    let name=[];
    if(props?.data){
        Object.keys(props?.data).forEach((ele,i)=>{
            if(i===0){
                xaxis=props?.data?.[ele]?.xaxis;
                series.push(
                    {
                        data: props?.data?.[ele]?.lsl,
                        name:"LSL",
                        type: 'line',
                        smooth: true,
                        showSymbol: false,
                        animation:false,
                        lineStyle: {
                          normal: {
                            width: 3,
                            color:"#FFEA00",
                            type: 'dashed',
                          }
                        }
                      },
                      {
                        data: props?.data?.[ele]?.hsl,
                        name:"HSL",
                        type: 'line',
                        smooth: true,
                        showSymbol: false,
                        animation:false,
                        lineStyle: {
                          normal: {
                            width: 3,
                            color:"#00E676",
                            type: 'dashed'
                          }
                        }
                      }
                )
            }
            name.push(ele);
            multiLine.push(props?.data?.[ele]?.yaxis);
        })
        multiLine.forEach((seriesData,i)=>{
            series.push(
                {
                    data: seriesData,
                    name:name[i].toUpperCase(),
                    type: 'line',
                    smooth: true,
                    showSymbol: false,
                    animation:false,
                    lineStyle: {
                      normal: {
                        width: 3,
                      }
                    },
                  },
            )
        })
    }
    else{
      multiLine =[];
      series =[];
      xaxis=[];
      name=[];
    }
    setMultiSeries(series);
    setTimeSeries(xaxis);
  },[props?.trigger])
   
    const options = {
        textStyle: {
          fontWeight : 'bold',
          fontSize:'14px'
        },
        tooltip: {
                    trigger: 'axis'
                  },
                      yAxis: {
                        show:true,
                        type: 'value',
                        name: props?.station.toUpperCase(),
                        nameLocation: 'middle',
                        nameGap: 40,
                        // min: (parseFloat(Math.min(...yLine))+ (parseFloat(Math.min(...yLine)) * 0.5)) || -2,
                        min:-15,
                        showGrid:true,
                        splitLine: {
                          show: true
                       },
                       axisLabel: {
                        align: 'left',
                        margin: 30
                      },
                      },
                      xAxis: {
                          show:true,
                          type: 'category',
                          name:"Time",
                          nameLocation: 'middle',
                          nameGap: 30,
                          data: timeSeries,
                          showGrid:true,
                          splitLine: {
                            show: true
                         },
                         axisLabel: {
                          align: 'middle',
                          margin: 10
                        },
                      },
                      visualMap:{
                        show:false,
                        pieces:[
                          {
                            min:-5,
                            // max:10,
                            max:parseFloat(multiSeries[0]?.data.slice(-1)[0]) || 0,
                            color:"#FFEA00"
                          },
                          {
                            // min: 10,
                            // max: 30,
                            min:parseFloat(multiSeries[0]?.data.slice(-1)[0]) || 0,
                            max:parseFloat(multiSeries[1]?.data.slice(-1)[0]) || 0,
                            color:"#00E676"
                          },
                          {
                            // min: 30,
                            min: parseFloat(multiSeries[1]?.data.slice(-1)[0]) || 0,
                            color:"#FF1744"
                          }
                        ]
                      },
                      series:multiSeries
      };
    return <ReactECharts option={options} style={{width:'100%', height:"100%", minHeight:"430px"}}/>
}
