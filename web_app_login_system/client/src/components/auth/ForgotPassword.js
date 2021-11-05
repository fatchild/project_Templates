import React, { useState } from "react";
import Nav from '../Nav';
import ClipLoader from "react-spinners/ClipLoader";

async function forgottenPassword(credentials) {
    return fetch('http://localhost:3001/forgotpassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
    .then(data => data.json())
  }

function ForgotPassword() {

    const [ name, setName ] = useState("");
    const [ finished, setFinished ] = useState("");
    const [ loading, setLoading ] = useState(false);
  
    const handleSubmit = async e => {
      e.preventDefault();

      setLoading(true);
  
      const reset = await forgottenPassword({
        name
      })
  
      if (reset.link) {
        console.log(reset.link)
        // history.push("/login");
      } else {
        
      }
      setLoading(false);
      setFinished(true);
    }

  return (
    <div className="App">
        <Nav />
        <h1>Forgotten Password</h1>
        <p>An email will be sent to you with instructions on how to reset your password.</p>
        <form onSubmit={handleSubmit}>
            <label> Email or Username:  <input type="text" name="email_user" onChange={e => setName(e.target.value)} required /> </label> <br/>
            <button type="submit">Submit</button>
            { finished === true && <p>If you have an account with us you will receive an email shortly.</p>}
        </form>
        <div>{ loading === true && <ClipLoader size={100} /> }</div>
    </div>
  );
}

export default ForgotPassword;
