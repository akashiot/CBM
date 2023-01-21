import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';



function Sensorchart(props){
    const [xLine,setXLine]=useState([])
    const [yLine,setYLine]=useState([])
    const [lsl,setLsl]=useState([])
    const [hsl,setHsl]=useState([])
    const [label,setLabel]=useState("")
    const [chartOption, setChartOption] = useState({})

    

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
      // if(props?.xAxis.length!==0 && props?.yAxis.length!==0 && props?.lsl.length!==0 && props?.hsl.length!==0){
      //   setXLine(props?.xAxis);
      //   setYLine(props?.yAxis);
      //   const name=props?.label1.toUpperCase()+" - "+props?.label2.toUpperCase();
      //   setLabel(name);
      //   setLsl(props?.lsl);
      //   setHsl(props?.hsl);
      //   setChartOption(options)
      // }
      // else{
      //   setXLine(props?.xAxis);
      //   setYLine(props?.yAxis);
      //   const name=props?.label1.toUpperCase()+" - "+props?.label2.toUpperCase();
      //   setLabel(name);
      //   setLsl(props?.lsl);
      //   setHsl(props?.hsl);
      //   setChartOption(options)
      // }
        setXLine(props?.xAxis);
        setYLine(props?.yAxis);
        const name=props?.label1.toUpperCase()+" - "+props?.label2.toUpperCase();
        setLabel(name);
        setLsl(props?.lsl);
        setHsl(props?.hsl);
        setChartOption(options)
        // console.log(options);

    },[props?.trigger])

   
    return <ReactECharts option={chartOption} style={{width:'100%', height:"100%", minHeight:"430px"}}
  />

}
export default Sensorchart;

// class Sensorchart extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state={x:props?.xAxis,
//                 y:props?.yAxis,    
//             }
        
//     this.options = {
//         tooltip: {
//                     trigger: 'axis'
//                   },
//                       yAxis: {
//                         show:true,
//                         type: 'value',
//                         splitLine: {
//                           show: true
//                        },
//                       },
                      
//                       xAxis: {
//                           show:true,
//                           type: 'category',
//                           data: this?.state?.x,
//                           showGrid:true,
//                           splitLine: {
//                             show: true
//                          },
//                       },
//                       visualMap:{
//                         show:false,
//                         pieces:[
//                           {
//                             min:0,
//                             max:20,
//                             color:"#FFEA00"
//                           },
//                           {
//                             min:20,
//                             max:40,
//                             color:"#64DD17"
//                           },
//                           {
//                             min:40,
//                             color:"#F44336"
//                           }
//                         ]
//                       },
//                       series: [
//                         {
//                           data: this?.state?.y,
//                           type: 'line',
//                           smooth: true,
//                           showSymbol: false,
//                           animation:false,
//                           lineStyle: {
//                             normal: {
//                               width: 2,
//                             }
//                           },
//                           markLine:{
//                               data:[
//                                   {
//                                    name:"LSL",
//                                    yAxis:20, 
//                                    lineStyle: {color: 'Green',width:2}
//                                 },
//                                 {
//                                   name:"HSL",
//                                    yAxis:40,
//                                    lineStyle: {color: 'red',width:2}
//                                  }
//                               ]
//                           }
//                         }
//                       ]
//       };
//   }


  
//   render() {
//     return (
//     <div>
//       <ReactECharts
//         option={this.options}
//         style={{width:'100%', height:"100%", minHeight:"430px"}}
//       />
     
//       </div>
//     );
//   }
// }
// export default Sensorchart;


