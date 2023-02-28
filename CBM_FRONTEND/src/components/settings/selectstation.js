import { useEffect, useState } from "react";
import axios from "axios";
import { message } from "antd";
import url from '../../configuration/url.json'

export default function Selectstation(){
    const [select,setSelect]=useState([])

    async function getStation() {
        try {
            const getStation = await axios.get(url?.baseurl2+'configuration/getStation')
            if(getStation?.data?.status===true){
                setSelect(getStation?.data?.data);
            }
            else if(getStation?.data?.status===false){
                message.error("Something went to wrong!")
            }
        } catch (error) {
            console.error(error);
        }
    }
    useEffect(()=>{
        getStation()
    })
    return select.map((e,i)=>{
        return <option key={i} value={e} className="text-capitalize">{e}</option>;
    })
    
}