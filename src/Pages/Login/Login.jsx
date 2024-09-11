import React, { useState } from "react";
import "./Login.css";
import assets from "./../../assets/assets";
import { signup,login,reset } from "../../config/firebase";
const Login = () => {
  const [currState,setCurrState]=useState('Sign up')
  const [username,setUserName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");

  const onSubmitHandler=(event)=>{
     event.preventDefault();
     if(currState==="Sign up"){
      signup(username,email,password);
     }
     else{
      login(email,password)
     }

  }
  return (
    <div className="login">
      <img src={assets.logo_big} alt="" className="logo" />
      <form onSubmit={onSubmitHandler} className="login-form">
        <h2>{currState}</h2>
        {currState==='Sign up'? <input
          onChange={(e)=>setUserName(e.target.value)}
          value={username}
          type="text"
          className="form-input"
          required
          placeholder="username"
        />:null}
       
        <input
        onChange={(e)=>setEmail(e.target.value)}
        value={email}
          type="email"
          className="form-input"
          placeholder="Email address"
          required
        />
        <input
        onChange={(e)=>setPassword(e.target.value)}
        value={password}
          type="password"
          className="form-input"
          required
          placeholder="password"
        />
        <button type="submit">{currState==='Sign up'?'Create Account':'Login now'}</button>
        <div className="login-term">
          <input type="checkbox" />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>
        <div className="login-forgot">
          {currState==='Sign up'?<p className="login-toggle">Already have an account? <span onClick={()=>setCurrState("Login")}>Login here</span></p>:<p className="login-toggle">Create an Account?<span onClick={()=>setCurrState("Sign up")}>Click here</span></p>}
          {currState ==="Login"?<p className="login-toggle">Forgot Password<span onClick={()=>reset(email)}> Reset here</span></p>:null}
        </div>
      </form>
    </div>
  );
};

export default Login;
