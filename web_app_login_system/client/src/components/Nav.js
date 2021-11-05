import React, {useState, useEffect } from 'react';
import {Link, useHistory} from 'react-router-dom'
import Logout from "./auth/logout";
import isLoggedIn from "./auth/isLoggedIn";

function Nav(){
    const [loggedInStatus, setLoggedInStatus] = useState();

    const history = useHistory();

    useEffect(() => {
        isLoggedIn().then((response) => {
            setLoggedInStatus(response.isloggedin)
        });
    }, []);

    function handleLogout() {
        Logout();

        history.push("/dashboard");
    }

    return(
        <div>
            <nav>
            <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                {loggedInStatus ?
                <>
                    <li>
                        <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li>
                        <button onClick={() => handleLogout()}>Logout</button>
                    </li>
                </>
                 : 
                <>
                    <li>
                        <Link to="/login">Login</Link>
                    </li>
                    <li>
                        <Link to="/register">Register</Link>
                    </li>
                </>
                }
                </ul>
            </nav>
        </div>
    );
}

export default Nav;