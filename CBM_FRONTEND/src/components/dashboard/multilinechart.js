import ReactECharts from 'echarts-for-react';
import { useEffect, useState } from 'react';

export default function Multilinechart(props) {
  // Multiline chart variables
  const [chartOption,setChartOption]=useState({})
  const [xAxis,setXAxis]=useState([])
  const [yAxis,setYAxis]=useState([])
  const [clear,setClear]=useState(false)

  // Assigning multiline series data to chart

  useEffect(()=>{
    setClear(false)
    if(localStorage.getItem('grpName')!==props?.station){
      setClear(true)
    }
      const  options = {
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
                        name: props?.station.toUpperCase()+" GROUP (OVERLAPPED SERIES)",
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
                          data: xAxis,
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
                            max:parseFloat(yAxis[0]?.data.slice(-1)[0]) || 0,
                            color:"#FFEA00"
                          },
                          {
                            min:parseFloat(yAxis[0]?.data.slice(-1)[0]) || 0,
                            max:parseFloat(yAxis[1]?.data.slice(-1)[0]) || 0,
                            color:"#00E676"
                          },
                          {
                            min: parseFloat(yAxis[1]?.data.slice(-1)[0]) || 0,
                            color:"#FF1744"
                          }
                        ]
                      },
                      series:yAxis
      };
      
      localStorage.setItem('grpName',props?.station)
      if(clear===true){
        setYAxis([]);
        setXAxis([]);
        setChartOption({})
      }else if(clear===false){
        setXAxis(props?.x);
        setYAxis(props?.y)
        setChartOption(options);
      }
  },[props?.trigger])

    return <ReactECharts option={chartOption} style={{width:'100%', height:"100%", minHeight:"430px"}}/>
}
