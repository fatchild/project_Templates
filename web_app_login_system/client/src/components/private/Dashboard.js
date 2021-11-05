import React from "react";
import Nav from '../Nav';

function Dashboard() {
  return (
    <div className="App">
        <Nav />
        <h1>Dashboard</h1>
        <h2>This should be private</h2>
    </div>
  );
}

export default Dashboard;
