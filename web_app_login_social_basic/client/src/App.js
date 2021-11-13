import React from "react";
import './App.css';

// Adds the ability to deal with routing and navbars
import {BrowserRouter, Switch, Route } from 'react-router-dom';

// Component Imports
import Nav from './components/Nav';
import Login from "./components/auth/login";
import Register from "./components/auth/register";
import Dashboard from "./components/private/Dashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ForgotPassword from "./components/auth/ForgotPassword";
import CreateNewPassword from "./components/auth/CreateNewPassword";
import Profile from "./components/private/Profile";
import Feed from "./components/private/Feed";
import PublicUserPage from "./components/PublicUserPage"
import Settings from "./components/private/Settings";


function App() {

  return (

    // Router is how we manage link
    <BrowserRouter>
      <div className="App">
        {/* Organise my routes */}
        <Switch>
          <Route path="/" exact component={Home}/>
          <Route path="/login" exact component={Login}/>
          <Route path="/register" exact component={Register} />
          <ProtectedRoute path="/dashboard" exact component={Dashboard} />
          <Route path="/forgotpassword" exact component={ForgotPassword} />
          <Route path="/createnewpassword" exact component={CreateNewPassword} />
          <ProtectedRoute path="/profile" exact component={Profile} />
          <ProtectedRoute path="/feed" exact component={Feed} />
          <Route path="/user/:username" exact component={PublicUserPage} />
          <ProtectedRoute path="/settings" exact component={Settings} />
        </Switch>
        
      </div>
    </BrowserRouter>
  );
}

function Home(){
  return(
    <>
    <Nav />
    <div>
      <h1>Home</h1>
      <h2>This is the home page</h2>
    </div>
    </>
  );
}

export default App;
