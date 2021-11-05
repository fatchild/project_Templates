import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Nav from '../Nav';
import { passwordStrength } from 'check-password-strength';
import ClipLoader from "react-spinners/ClipLoader";

async function createNewPassword(credentials) {
    return fetch('http://localhost:3001/createnewpassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
    .then(data => data.json())
  }

function CreateNewPassword() {

    const [ password, setPassword ] = useState("");
    const [ password_repeat, setPasswordRepeat ] = useState("");
    const [ passwordSame, setPasswordSame ] = useState("");
    const [ email_user, setEmailUser ] = useState("");
    const [ passwordStrengthValue, setPasswordStrengthValue ] = useState("");
    const [ loading, setLoading ] = useState(false);
    
    const history = useHistory();
  
    const handleSubmit = async e => {
      e.preventDefault();

      setLoading(true);

      if (passwordStrengthValue.id !== 0 && passwordStrengthValue.id !== undefined) {
        
        if (password_repeat === password){
            await createNewPassword({
                email_user,
                password,
                selector,
                validator
            })
        
            history.push("/login");

        } else {
            setPasswordSame(false);
            setLoading(false);
        }
      } else {
          console.log("HERE")
          console.log(passwordStrengthValue.id)
          setLoading(false);
      }
    }

    // Get the params
    let url_qs      = window.location.search;
    let params      = new URLSearchParams(url_qs);
    let selector    = params.get('selector');
    let validator   = params.get('validator');

    // If there are no params the scoot them back to home, might be a bad actor
    if (!selector || !validator) {
        history.push("/");
    }


  return (
    <div className="App">
        <Nav />
        <h1>Create New Password</h1>
        <p>Please enter your new password.</p>
        <form onSubmit={handleSubmit}>
            <label> Email or Username:  <input type="text" name="email_user" onChange={e => setEmailUser(e.target.value)} required /> </label> <br/>
            {/* <label> New Password:  <input type="password" name="password" onChange={e => setPassword(e.target.value)} required /> </label> <br/> */}
            <label> Password:   <input type="password" name="password" onChange={e => {
              setPassword(e.target.value)
              setPasswordStrengthValue(passwordStrength(e.target.value))
              }} required /> { passwordStrengthValue && <p>{passwordStrengthValue.value}</p>} </label> <br/>
            <label> Repeat New Password:  <input type="password" name="password_repeat" onChange={e => setPasswordRepeat(e.target.value)} required /> </label> <br/>
            <button type="submit">Create new password</button>
            { passwordSame === false && <p>Password is not the same!</p>}
        </form>
        <p>We do not accept weak passwords, select a password with a minimum length of 8 characters including lowercase, uppercase, symbols and numbers.</p>
        <div>{ loading === true && <ClipLoader size={100} /> }</div>
    </div>
  );
}

export default CreateNewPassword;
