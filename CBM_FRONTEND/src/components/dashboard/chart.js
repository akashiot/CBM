import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';



function Sensorchart(props){
  // Chart variables
    const [xLine,setXLine]=useState([])
    const [yLine,setYLine]=useState([])
    const [lsl,setLsl]=useState([])
    const [hsl,setHsl]=useState([])
    const [label,setLabel]=useState("")
    const [chartOption, setChartOption] = useState({})

  // Assigning data to chart
    useEffect(()=>{
      
      const options = {
        textStyle: {
          fontWeight : 'bold',
          fontSize:'14px'
        },
        tooltip: {
                    trigger: 'axis',
                  },
                      yAxis: {
                        show:true,
                        type: 'value',
                        name: label,
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
                          data: xLine,
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
                            max:parseInt(props?.lslLimit),
                            color:"#FFEA00"
                          },
                          {
                            min:parseInt(props?.lslLimit),
                            max:parseInt(props?.hslLimit),
                            color:"#00E676"
                          },
                          {
                            min: parseInt(props?.hslLimit),
                            color:"#FF1744"
                          }
                        ]
                      },
                      series: [
                        {
                          data: yLine,
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
                          data: lsl,
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
                          data: hsl,
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
        setXLine(props?.xAxis);
        setYLine(props?.yAxis);
        const name=props?.label1.toUpperCase()+" - "+props?.label2.toUpperCase();
        setLabel(name);
        setLsl(props?.lsl);
        setHsl(props?.hsl);
        setChartOption(options)

    },[props?.trigger])

   
    return <ReactECharts option={chartOption} style={{width:'100%', height:"100%", minHeight:"430px"}}
  />

}
export default Sensorchart;