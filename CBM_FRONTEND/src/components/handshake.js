import {MDBRow, MDBCol, MDBSpinner, MDBTypography} from 'mdb-react-ui-kit';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faRss, faTowerBroadcast} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useState } from 'react';
import { useContext } from "react";
import { UserContext } from "./context"; 

import url from '../configuration/url.json'

let timer;

export default function Handshake(){
    const {Handshake,setHandshake}=useContext(UserContext)
    const [active,setactive]=useState(false)

    async function Pulse() {
        try {
          const signal = await axios.get(url?.baseurl2+"handshake");
        //   console.log(signal?.data?.result);
            const conn=signal?.data?.result;
            // console.log(conn,Handshake);
            if(conn!==Handshake){
                setactive(true)
            }
            setHandshake(conn);
        } catch (error) {
          console.error(error);
          setactive(false);
        }
      }

    // clearInterval(timer);
    // timer=setInterval(()=>{
    //     // Pulse()
    // },2000)

    return(
        <div>
            <MDBRow className="mt-1">
                <MDBCol lg="12" className="d-flex justify-content-center pt-2 px-3">
                    <MDBTypography tag={'h6'} className="fw-bold px-3"><FontAwesomeIcon icon={faTowerBroadcast} className="text-info fs-6"/>  PLC Service</MDBTypography>
                    <MDBSpinner grow color='danger'style={{ width: '1rem', height: '1rem' }}>
                        <span className='visually-hidden'>Loading...</span>
                    </MDBSpinner>      
                        <MDBTypography tag={'h6'} className="fw-bold px-3"><FontAwesomeIcon icon={faRss} className="text-info fs-6"/>  Back-end Service</MDBTypography>
                        <MDBSpinner grow color={active? 'success' : 'danger'} style={{ width: '1rem', height: '1rem' }}>
                            <span className='visually-hidden'>Loading...</span>
                        </MDBSpinner>                     
                </MDBCol>
                {/* <MDBCol lg="6" className="d-flex justify-content-center pt-2 px-3">
                <MDBTypography tag={'h6'} className="fw-bold px-3" style={{fontSize:"12px"}}><FontAwesomeIcon icon={faRss} className="text-info fs-6"/>  Back-end Service</MDBTypography>
                    <MDBSpinner grow color={active? 'success' : 'danger'} style={{ width: '1rem', height: '1rem' }}>
                        <span className='visually-hidden'>Loading...</span>
                    </MDBSpinner>
                </MDBCol> */}
            </MDBRow>
        </div>
    )
}