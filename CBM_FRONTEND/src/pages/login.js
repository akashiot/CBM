import '../css/style.css';
import 'antd/dist/antd.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import Logo from '../assets/Teal_logo.png';
import { MDBContainer, MDBRow, MDBCol,MDBCard, MDBBtn,MDBTypography, MDBInputGroup  } from 'mdb-react-ui-kit';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faUser,faKey,faEye,faEyeSlash} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import URL from '../configuration/url.json';




function Login() {

    const changepage = useNavigate();

    const initialValues={username:"", password:""}
    const [formValues, setFormValues]=useState(initialValues)
    const [formError, setFormError]=useState({})
    const [isSubmit, setIsSubmit]=useState(false)

    const [passwordShown, setPasswordShown] = useState(false);
    const [passwordShownIcon, setPasswordShownIcon] = useState(false);
   

    const handleChange= (e) =>{
        const{ name, value}=e.target;
        setFormValues({...formValues, [name]: value});
    }
    const handleSubmit = (e) =>{
        e.preventDefault();
        setFormError( validate(formValues));
        setIsSubmit(true);
    }
    useEffect(()=>{
        if(Object.keys(formError).length ===0 && isSubmit){
        }

    },[formError])
    const validate =(values) =>{
        const errors={};
        const restrict=/^[a-z, A-Z]/;
        if(!values.username || !restrict.test(values.username)){
            errors.username = "Username is required!";
        }
        if(!values.password){
            errors.password = "Password is required!";
        }
        return errors;
    }
    const togglePasswordVisiblity = () => {
        setPasswordShown(passwordShown ? false : true);
        setPasswordShownIcon(passwordShownIcon ? false : true);
      };
    
    async function loginAuth(){
        const url=URL?.login;
        const reqParameter={UserName:formValues.username,Password:formValues.password,LastLogin:""}
        axios.post(url,reqParameter)
            .then(res=>{
                console.log(res);
                if(res?.data?.loginstatus==="Login Successfull...!"){
                    localStorage.setItem("token",res?.data?.token);
                    localStorage.setItem("username",formValues.username);
                    message.success(res?.data?.loginstatus,1);
                    changepage('/dashboard');
                }
                else{
                    message.error(res?.data?.loginstatus,1)
                }
            })
            .catch(err=>{
                message.error(err?.message,1)
                console.log(err)
            })
    }
    function login() {
        let user=formValues.username.replace(/[^a-z]/gi,'').toLowerCase();
        if(user==="admin" && formValues.password==="Admin@123"){
            localStorage.setItem("username",user)
            message.success('Logged In successfully!');
            setTimeout(() => {
                changepage('/dashboard');
            }, 1000);
        }
        else if(user!=="admin" || formValues.password!=="Admin@123"){
            message.error("Incorrect username or password!")
        }

    }
    
    return (
    <MDBContainer fluid id='rowLogin'>

        <MDBRow className='vh-100 px-5 justify-content-center' id='rowLogin'>
        <div className='mask' >
            <div className='d-flex justify-content-center align-items-center vh-100'>
                <MDBCol lg={6} className="d-flex justify-content-center align-items-center">
                </MDBCol>
                <MDBCol lg={6} className="d-flex justify-content-center align-self-center">
                    <MDBCard className='shadow-lg border rounded-6 d-flex justify-content-center' style={{width:"60%",height:"75vh",backgroundColor:'rgb(224, 247, 250)'}}>
                        <div className='text-center py-2 px-4 mt-5 hover-zoom'>
                            <img src={Logo} className='img-fl1uid' height={80} width={300} />
                            <p className='text-monospace text-muted fs-5'>Titan Engineering & Automation limited</p>
                            <h3 className='blink fw-bold te1xt-muted pt-2 text-info'>Condition Monitoring Solution</h3>
                        </div>
                        
                                <form className='px-5 py-3 text-center' onSubmit={handleSubmit}>
                                    <MDBInputGroup className='mt-5' noBorder textBefore={<FontAwesomeIcon icon={faUser} />}>
                                        <input className='form-control shadow-none border-0 border-bottom rounded-0' maxLength={35} id="username" name="username"type='text' placeholder='Username' value={formValues.username} onChange={handleChange} style={{backgroundColor:'rgb(224, 247, 250)'}} autoComplete='off'/>
                                    </MDBInputGroup>
                                    <p className='text-danger text-start px-5'>{ formError.username}</p>
                                    <MDBInputGroup className='mt-5' noBorder textBefore={<FontAwesomeIcon icon={faKey} />} textAfter={<FontAwesomeIcon id="eye" icon={passwordShownIcon? faEye:faEyeSlash} onClick={togglePasswordVisiblity}/>}>
                                        <input className='form-control shadow-none border-0 border-bottom rounded-0' id="password" name="password" type={passwordShown ? "text" : "password"} style={{backgroundColor:'rgb(224, 247, 250)'}} placeholder='Password' value={formValues.password} onChange={handleChange}/>
                                    </MDBInputGroup>
                                    <p className='text-danger text-start px-5'>{ formError.password}</p>
                                    <MDBBtn className='mt-5 btn-lg fw-bold rounded-5 mb-5' color='info' type='submit' onClick={login}>Login</MDBBtn>
                                </form>
                    </MDBCard>
                </MDBCol>
            </div>
      </div>
        </MDBRow>
    </MDBContainer>
    );
}
export default Login;


// else if(localStorage.getItem('token')===null){
                //     changepage('/')
                // }
                // if(res?.data?.status=="true"){
                //     message.success('Logged In successfully!');
                //     setTimeout(() => {
                //        changepage('/dashboard');
                //     }, 1000);
                // }
                // else if(res?.data?.status=="false" && user && formValues.password){
                //     message.error(res?.data?.loginstatus)
                // }