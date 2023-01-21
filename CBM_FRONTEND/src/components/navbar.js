import React, { useState } from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {useNavigate} from "react-router-dom";
import {faBars,faGauge,faFileContract,faScrewdriverWrench,faCircleUser, faAngleLeft, faRightFromBracket, faTriangleExclamation,  faClock} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import url from '../configuration/url.json';
// import url from '../index'
import { useContext, useEffect } from "react";
import { UserContext } from "./context"; 
import moment from 'moment';
import {
  MDBNavbar,
  MDBContainer,
  MDBNavbarBrand,
  MDBNavbarToggler,
  MDBCol,
  MDBRow,
  MDBCollapse,
  MDBBtn,
  MDBTypography,
  MDBNavbarNav,
  MDBTooltip,
  MDBBadge
} from 'mdb-react-ui-kit';
import Logo from '../assets/Teal_logo.png'
import User from '../assets/user.png'
import { Link } from 'react-router-dom';
import { Dropdown, Menu, message, Popconfirm } from 'antd';

 function Navbar(props) {
    const { groupSensorList,setGroupSensorList} =useContext(UserContext)
    const navigate = useNavigate();
    const [showBasic, setShowBasic] = useState(false);
    const [name, setName] = useState(false);  
    const [basicActive, setBasicActive] = useState();   
    
    const confirm = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        // message.success("Logged out successfully!",1) ;
        navigate('/')      
      };

    async function getGroupSensor() {
        try {
            const groupSensor = await axios.get(url?.baseurl2+'configuration/getGroupingsensor')
            if(groupSensor?.data?.status===true){
                // setListOfStation(groupSensor?.data?.data);
                // setTrigger((p)=>!p)
                setGroupSensorList(groupSensor?.data?.Result);
            }
            else if(groupSensor?.data?.status===false){
                message.error("Something went to wrong!")
            }
        } catch (error) {
            console.error(error);
        }
    }

    const menu = (
        <Menu
          items={[
            {
                key: '0',
                label:(
                    <MDBTypography tag={"h6"} className='text-center fw-bold pt-2 text-primary text-capitalize'>{localStorage.getItem("username")}
                        {/* <FontAwesomeIcon icon={faUser} className="text-primary fs-5 pr-2 "/><span className='px-1'>Username</span> */}
                    </MDBTypography>
                )
            },
            {
                key:"1",
                type:"divider"
            },
            {
              key: '2',
              label: (
                <Popconfirm title="Are you want to Logout？" placement='leftBottom' onConfirm={confirm} okText="Yes" cancelText="No">
                    <MDBTypography tag={'h6'} className='fs-6 fw-bold text-start pt-1 px-2 d-flex'>
                       <FontAwesomeIcon icon={faRightFromBracket} className="text-danger fs-5 pr-1 "/><span className='px-1'>Logout</span>
                    </MDBTypography>
                    {/* <MDBBadge pill className='mx-2' color='danger' light>
                        <FontAwesomeIcon icon={faRightFromBracket} className="text-danger fs-6 px-1"/><span className='fs-6 fw-bold px-2'> Logout</span>
                    </MDBBadge> */}
                </Popconfirm> 
              ),
            }
          ]}
        />
      );
     


      return (
         <MDBNavbar expand="lg" light className="shadow border sticky" style={{borderRadius:'50px',backgroundColor:"#fff"}}>
                
            <MDBContainer fluid>
            <MDBNavbarBrand href='#'>
                <FontAwesomeIcon icon={faAngleLeft} className="text-info fs-4" onClick={() => {navigate(-1)}}/>
                <Link to="/dashboard">
                    <img src={Logo} height="40" />
                </Link>
            </MDBNavbarBrand>
                
            <MDBNavbarToggler 
                data-target="#navbarToggleExternalContent"
                aria-controls='navbarToggleExternalContent'
                aria-expanded='false'
                aria-label='Toggle navigation'
                onClick={() => setShowBasic(!showBasic)}
            >
                <FontAwesomeIcon icon={faBars} />
            </MDBNavbarToggler>
            <MDBCollapse navbar className='' show={showBasic}>  
                <div className='w-100 pt-2'>
                    <MDBTypography tag={'h3'} className="d-inline-flex fw-bold text-muted"> Conditional Based Monitoring System</MDBTypography>
                </div>         
                <MDBNavbarNav id="nav" className='d-flex justify-content-end'>
                    <div className='text-center mx-2 pt-2'>
                        <MDBBadge pill className='text-dark border fs-6 fw-light mt-1 shadow-inner' color='light' light>
                                <FontAwesomeIcon icon={faClock} className="text-info fs-6 px-1"/>
                                {moment().format('YYYY-MMM-DD  HH:mm:ss')}
                        </MDBBadge> 
                    </div>     
                    <div className='text-center mx-2 py-2'>
                        <MDBTooltip tag='span' title='Alarm'>
                            <Link to="/alarm">
                                <MDBBtn floating className='bg-light shadow-inner border'> 
                                    <FontAwesomeIcon icon={faTriangleExclamation} className="text-info fs-5"/>
                                </MDBBtn>      
                            </Link>  
                        </MDBTooltip>
                    </div>               
                    <div className='text-center mx-2 py-2'>
                        <MDBTooltip tag='span' title='Report'>
                            <Link to="/report">
                                <MDBBtn floating className='bg-light shadow-inner border'> 
                                    <FontAwesomeIcon icon={faFileContract} className="text-info fs-5"/>
                                </MDBBtn>      
                            </Link>  
                        </MDBTooltip>
                    </div>
                    <div className='text-center mx-2 py-2 '>
                        <MDBTooltip tag='span' title='Settings'>
                            <Link to="/settings">
                                <MDBBtn floating className='bg-light shadow-inner border' onClick={getGroupSensor}> 
                                    <FontAwesomeIcon icon={faScrewdriverWrench} className="text-info fs-5"/>
                                </MDBBtn>        
                            </Link>
                        </MDBTooltip>
                    </div>
                    
                    <div className='text-center pt-2 px-2'>
                        <Dropdown overlay={menu} placement="bottom" trigger={['click']} arrow>
                            {/* <FontAwesomeIcon icon={faBars}  className="pt-0 px-3 fs-4"/> */}
                            <img src={User} className="rounded-circle border border-info hover-shadow" id='profilepic' height="40"/>
                        </Dropdown>
                    </div>    
                </MDBNavbarNav>  
                            
            </MDBCollapse>            
            </MDBContainer>
        </MDBNavbar>)
}
export default Navbar;