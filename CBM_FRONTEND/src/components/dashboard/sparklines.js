import React, { useEffect, useState } from 'react';
import { Sparklines, SparklinesLine, SparklinesSpots} from 'react-sparklines';

  export default function Sparkline(props){
    // sparkline chart variable
    const [series,setSeries]=useState([])
    // Assigning data to Sparkline
    useEffect(()=>{
      const d  = props?.series.map(e => parseFloat(e) || 0)
      setSeries(d)
    },[props?.trigger])

    return(
          <div>
           <Sparklines data={series} width={200} height={30} margin={5}>
             <SparklinesLine color="#00BCD4" style={{ fill: "none",strokeWidth: 3}} />
           </Sparklines>
         </div>
    )
  }

