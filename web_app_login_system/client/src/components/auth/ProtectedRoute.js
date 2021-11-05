import React, { useState } from 'react';
import { Route } from 'react-router-dom';
import Login from "./login";
import isLoggedIn from "./isLoggedIn";

const ProtectedRoute = ({component: Component, ...rest}) => {
    const [loggedInStatus, setLoggedInStatus] = useState();

    isLoggedIn().then((response) => {
        setLoggedInStatus(response.isloggedin)
    });

    return (
        <Route {...rest} render={ (props) => {
            if (loggedInStatus) {
                return <Component {...props} />;
            } else {
                return <Login />;
            }
            }} 
        />
    );
};

export default ProtectedRoute;