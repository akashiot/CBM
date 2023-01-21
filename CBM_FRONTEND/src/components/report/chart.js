import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';

function Reportchart(props){
    const options = {
        textStyle:{
          fontWeight : 'bold',
          fontSize:'14px'
        },
        tooltip: {
                    trigger: 'axis',
                      },
                      yAxis: {
                        show:true,
                        name:props?.station+" - "+props?.name,
                        nameLocation: 'middle',
                        nameGap: 55,
                        type: 'value',
                        splitLine: {
                          show: true
                       },
                      },
                     
                      xAxis: {
                          show:true,
                          name:"Time",
                          nameLocation: 'middle',
                          nameGap: 30,
                          type: 'category',
                          data: props?.timestamp,
                          showGrid:true,
                          splitLine: {
                            show: false
                         },
                      },
                      visualMap:{
                        show:false,
                        pieces:[
                          {
                            min:-5,
                            max:parseFloat(props?.lsl[0]),
                            color:"#FFEA00"
                          },
                          {
                            min:parseFloat(props?.lsl[0]),
                            max:parseFloat(props?.hsl[0]),
                            color:"#00E676"
                          },
                          {
                            min:parseFloat(props?.hsl[0]),
                            color:"#FF1744"
                          }
                        ]
                      },
                      series: [
                        {
                          data: props?.series,
                          name:"Actual",
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
                        {
                          data: props?.lsl,
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
                          data: props?.hsl,
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
                      ]
      };
return <ReactECharts option={options} style={{width:'100%', height:"370px", minHeight:"200px"}}/>
}

export default Reportchart;