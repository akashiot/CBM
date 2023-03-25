// import ReactECharts from 'echarts-for-react';

// function Sensorchart(){
//     const option = {
//         tooltip: {
//           trigger: 'axis'
//         },
//             yAxis: {
//               show:true,
//               type: 'value',
//               splitLine: {
//                 show: true
//              },
//             },
            
//             xAxis: {
//                 show:true,
//                 type: 'category',
//                 data:  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
//                 showGrid:true,
//                 splitLine: {
//                   show: true
//                },
//             },
//             visualMap:{
//               show:false,
//               pieces:[
//                 {
//                   min:0,
//                   max:20,
//                   color:"#FFEA00"
//                 },
//                 {
//                   min:20,
//                   max:40,
//                   color:"#64DD17"
//                 },
//                 {
//                   min:40,
//                   color:"#F44336"
//                 }
//               ]
//             },
//             series: [
//               {
//                 data: [15, 20, 24, 28, 35, 47, 60],
//                 type: 'line',
//                 smooth: true,
//                 showSymbol: false,
//                 animation:false,
//                 lineStyle: {
//                   normal: {
//                     width: 2,
//                   }
//                 },
//                 markLine:{
//                     data:[
//                         {
//                          name:"LSL",
//                          yAxis:20, 
//                          lineStyle: {color: 'Green',width:2}
//                       },
//                       {
//                         name:"HSL",
//                          yAxis:40,
//                          lineStyle: {color: 'red',width:2}
//                        }
//                     ]
//                 }
//               }
//             ]
//           };
//     return <ReactECharts option={option} className="bg-dar1k" style={{width:'100%', height:"100%", minHeight:"590px"}}/>
// }
// export default Sensorchart;



import React from 'react';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';
import url from '../configuration/url.json'


class Sensorchart extends React.Component {
  constructor(props) {
    super(props);
    this.state={x:[],y:[]};
    this.options = {
    
      tooltip: {
                  trigger: 'axis'
                },
                    yAxis: {
                      show:true,
                      type: 'value',
                      splitLine: {
                        show: true
                     },
                    },
                    
                    xAxis: {
                        show:true,
                        type: 'category',
                        data:  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        showGrid:true,
                        splitLine: {
                          show: true
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
                        data: [15, 20, 24, 28, 35, 47, 60],
                        type: 'line',
                        smooth: true,
                        showSymbol: false,
                        animation:false,
                        lineStyle: {
                          normal: {
                            width: 2,
                          }
                        },
                        markLine:{
                            data:[
                                {
                                 name:"LSL",
                                 yAxis:20, 
                                 lineStyle: {color: 'Green',width:2}
                              },
                              {
                                name:"HSL",
                                 yAxis:40,
                                 lineStyle: {color: 'red',width:2}
                               }
                            ]
                        }
                      }
                    ]
    };
  }
   
  
  render() {
    return (
    <div>
      <ReactECharts
        option={this.options}
        style={{width:'100%', height:"100%", minHeight:"400px"}}
      />
     
      </div>
    );
  }
}
export default Sensorchart;