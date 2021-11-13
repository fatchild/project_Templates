import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Cookies from 'js-cookie';
import Nav from '../Nav';
import ClipLoader from "react-spinners/ClipLoader";

async function loginUser(credentials) {
  return fetch('http://localhost:3001/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  })
  .then(data => data.json())
}

function Login() {
  const [ name, setName ] = useState("");
  const [ password, setPassword ] = useState("");
  const [ wrongCreds, setWrongCreds ] = useState(false);
  const [ loading, setLoading ] = useState(false);
  
  const history = useHistory();

  const handleSubmit = async e => {
    e.preventDefault();

    setLoading(true);

    const token = await loginUser({
      name,
      password
    })

    if (token.authkey) {
      Cookies.set('session', token.authkey, { expires: 1 });
      history.push("/dashboard");
    } else {
      setWrongCreds(true);
      setLoading(false);
    }
  }

  return (
    <div className="App">
        <Nav />
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
            <label> Email or Username:  <input type="text" name="email_user" onChange={e => {
              setName(e.target.value)
              setWrongCreds(false);
            }} required /> </label> <br/>
            <label> Password:           <input type="password" name="password" onChange={e => {
              setWrongCreds(false);
              setPassword(e.target.value)
            }} required /> </label> <br/>
            <button type="submit">Submit</button>
            { wrongCreds === true && <p>Either the username or password is incorrect. Please try again!</p>}
        </form>
        <a href="./forgotpassword">Forgotten password</a>
        <div>{ loading === true && <ClipLoader size={100} /> }</div>
    </div>
  );
}

export default Login;
