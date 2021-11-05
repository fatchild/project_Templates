import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Nav from "../Nav";
import { passwordStrength } from 'check-password-strength';
import ClipLoader from "react-spinners/ClipLoader";

// Cookies
import Cookies from 'js-cookie';

async function registerUser(credentials) {
  return fetch('http://localhost:3001/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  })
    .then(data => data.json())
}

function Register() {
  const [ username, setUsername ] = useState("");
  const [ email, setEmail ]       = useState("");
  const [ password, setPassword ] = useState("");
  const [ passwordStrengthValue, setPasswordStrengthValue ] = useState("");

  const [ chooseAnother, setChooseAnother ] = useState(false);
  const [ loading, setLoading ] = useState(false);

  const history = useHistory();

  const handleSubmit = async e => {
    e.preventDefault();

    setLoading(true);

    if (passwordStrengthValue.id !== 0 && passwordStrengthValue.id !== undefined) {

      const token = await registerUser({
        username,
        email,
        password
      });

      if (token.authkey) {
        Cookies.set('session', token.authkey, { expires: 1 });
        history.push("/dashboard");
      } else {
        // The user already exists or there was some catastrophic error in the db
        setChooseAnother(true);
        setLoading(false);
      }

    }
  }

  return (
    <div className="App">
        <Nav />
        <h1>Create an Account</h1>

        {/* Register Form */}
        <form onSubmit={handleSubmit}>
            <label> Username:   <input type="text" name="username" onChange={e => setUsername(e.target.value)} required /> </label> <br/>
            <label> Email:      <input type="email" name="email" onChange={e => setEmail(e.target.value)} required /> </label> <br/>
            <label> Password:   <input type="password" name="password" onChange={e => {
              setPassword(e.target.value)
              setPasswordStrengthValue(passwordStrength(e.target.value))
              }} required /> { passwordStrengthValue && <p>{passwordStrengthValue.value}</p>} </label> <br/>
            <button type="submit">Register</button>
            <p>We do not accept "Too weak" passwords, select a password with a minimum length of 8 characters including lowercase, uppercase, symbols and numbers.</p>
            { chooseAnother === true && <p>Please choose another username or email!</p>}
        </form>
        <div>{ loading === true && <ClipLoader size={100} /> }</div>
    </div>
  );
}

export default Register;
