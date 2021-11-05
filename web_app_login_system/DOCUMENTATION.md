DOCUMENTATION for hangTrack

File contains nothing about what needs to be done.
Contains only what has been implemented and needs description, comment or justification for existence.  

# Table of Contents

1. Timeline
1. Technology Stack & Justifications
2. Structure
3. File by file description
4. HowTos
5. Database Schema

# Timeline

## Releases  
> v0.0 **Title of release**  
> Release Notes:
> - blah blah Fixed a main thing
> - blah blah Here's a feature

> v0.1 **Title of release**  
> Release Notes:
> - blah blah Fixed a main thing
> - blah blah Here's a feature

# Technology Stack & Justification

![System Architecture](./system_architecture.jpeg)

| Technology | Description | Justification |
| ----------- | ----------- | ----------- |
| **BACKEND** |  |  |
| *Hosting* |  |  |
| GreenGeeks | Environmentally Friendly Hosting | The Polar Bears |
| *Containerization* |  |  |
| Docker | Containers that will run on Dev machines and Production servers | I know how it works & it integrates well with Github actions CI/CD environments |
| *Runtime* |  |  |
| node.js | v8 engine runtime environment | it is well supported with loads of resources |
| *Database* |  |  |
| mySQL | The most widely used database | is it the gold standard and I know how to use it. mysql  Ver 8.0.27 for macos11.6 on arm64 (Homebrew) |
| *Web Framework* |  |  |
| express | web framework which site nicely on the node.js runtime | well supported, easy to add middleware |
| **MIDDLEWARE** |  |  |
| *Graphing* |  |  |
| Chart.js | Simple yet flexible JavaScript charting for designers & developers | For producing the pretty graphs of user data and collective community data |
| D3 | Data Driven Documents. Processes data into SVGs and tracks changes to the data. | Probably better for producing more rich graphics. |
| mysql2 | MySQL client for Node.js | This solves the problem that mysqljs has with supporting caching_sha2_password and only mysql_native_password so with the focus being on security, i don't want to make an insecure app, then this is the only solution short of fixing mysql |
| **FRONTEND** |  |  |
| *Frontend Framework* |  |  |
| react.js | A JavaScript library for building user interfaces | It is the most popular. But I am using this over the interoperability benefits of flutter because it is in a language and framework I want to learn and is context with the language of the web. This will be extendible by using react-native. |
| react-router-dom | DOM bindings for React Router. | This should take care of normal browser things for the SPA like back button history. |
| **PLATFORM SUPPORT** |  |  |
| *Cross Platform Framework* |  |  |
| react native | A framework for building native applications using React | This will be how I eventually make this service available on IOS and Android |
| ionic | Progressive Web Apps use modern web capabilities to deliver fast, native-app experiences with no app stores or downloads, and all the goodness of the web. | Using web view on the phones I should be able to deliver a pretty good experience relatively quickly for IOS and Android without incurring too much extra development or time. |
| Cordova | Cordova wraps your HTML/JavaScript app into a native container which can access the device functions of several platforms. | so use the native features of a web app, if needed. This will be in tandem or just after starting the ionic stage |


# Structure

Front-end (react /client) -> API (server/index.js) -> Back-end (server/index.js)

Running tree ./ in the project root...  

## 1 Level

```
./
├── AUTHORS
├── COPYING
├── DOCUMENTATION.md
├── README.md
├── TODO
├── client
├── node_modules
├── package-lock.json
├── package.json
└── server

3 directories, 7 files
```

## 3 Levels

```
./
├── AUTHORS
├── COPYING
├── DOCUMENTATION.md
├── README.md
├── TODO
├── client
│   ├── README.md
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   ├── public
│   │   ├── favicon.ico
│   │   ├── index.html
│   │   ├── logo192.png
│   │   ├── logo512.png
│   │   ├── manifest.json
│   │   └── robots.txt
│   └── src
│       ├── App.css
│       ├── App.js
│       ├── App.test.js
│       ├── components
│       ├── index.css
│       ├── index.js
│       ├── logo.svg
│       ├── reportWebVitals.js
│       └── setupTests.js
├── node_modules
├── package-lock.json
├── package.json
├── server
│   └── index.js
└── tree.log

1310 directories, 751 files
```


# File by file description

>In here you will find a description about the reason any file exists and its purpose. If it a file that means something. Not all files including those in node_modules or background react things will be in here.

### **AUTHORS**
>List of the creators and contributors to the project.

### **COPYING**
>Copyright information.

### **DOCUMENTATION**
>You are here.

### **README.md**
>The front page on GH. An overview of the project and how to find it's key parts.

### **TODO**
>Instructions on how to complete various tasks.

### **client/**
>This is the client of the server AKA the frontend. Within this directory is the react project.

>This is where the front-end is constructed using react components. Then the components are styled using another technology.

>The client talks to the front end using the API created on the server side (./server/...).

### **client/README.md**
> How to use the react scripts

### **client/package.json**
> This is the package configuration for the front-end portion of the project.

### **client/public/**
> This is more like the traditional part of a web project with the basic framework for a page.
> If you wanted to add a page title you would do it here.
> favicons
> index.html (template wrapper) with root for react to latch onto. 
> Robots.txt worry about crawlers & SEO when I get that far

### **client/src/**
> Where you find the javascript entry point

### **client/src/App.js**
> Where the main actions goes down.  
> This is where you create components.

### **client/src/components**
> This is where I will create reusable react components  
> For example the Nav.js component includes a the links to parts of the website

### ****

# HowTos

**Start the project for production**

1. Setup the back-end
2. Setup the front-end

Terminal 1 - Back-end  
```
npm start
```

Terminal 2 - Front-end  
```
cd client
npm start  
```

**Start the project for development**

1. Setup the back-end
2. Setup the front-end

Terminal 1 - Back-end  
This starts the node project with nodemon  
```
npm run start-dev
```

Terminal 2 - Front-end  
React gets automatically recompiled on a save, so start at per normal
```
cd client
npm start  
```

**How to get data from the back-end api and display it on the react front-end**

This goes inside the `function App() {}` within App.js  
```JS
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    fetch("/api")
      .then((res) => res.json())
      .then((data) => setData(data.message));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>{!data ? "Loading..." : data}</p>
      </header>
    </div>
  );
```

**How to import a logo or another svg file**

Into App.js at the top  
```JS
import logo from './logo.svg';
```

**Create a react component**

Create a file in src/components  
`Thing.js`  

```JS
import React from "react";


function Thing(){
    return(
        <p>
            This is a thing. A thing that exists inside a file called Thing. Really, this is a Thing.
        </p>
    );
}

export default Thing;
```

You can also create React.components but function components are easier to read  

In the main App.js file, you use this...  
```JS
// Component Imports
import Thing from './components/Thing';
```

**Manipulate mySQL**  

Start MySQL – sudo mysql.server start  
Stop MySQL – sudo mysql.server stop  
Restart MySQL – sudo mysql.server restart  
Check status – sudo mysql.server status  

brew services start mysql  

**How to fetch data from an API in react**

Source: https://www.freecodecamp.org/news/how-to-create-a-react-app-with-a-node-backend-the-complete-guide/  

```JS
import React, { useEffect, useState } from "react";

// How to write a useEffect fetch
function FetchFromAPI() {
    // State variables
    const[data, setData] = useState(null);

    // Lets fetch the data
    useEffect(() => {
        // Get the url data
        fetch("/api/database")
            .then((res) => {
                if (res.ok) {
                    console.log(res.ok)
                    // If we get a good response then make it a json
                    return res.json()
                } else {
                    // This is to catch 404s and 500s
                    console.error("API ERROR:", res)
                }
            })
            .then((data) => {
                console.log(data.results)
                // Update the state variable
                setData(data.results)
            })
            // This catch is for network errors nor 404s or 500s
            .catch((err) => console.error(err));


            // The simple way
            // .then((res) => res.json())
            // .then((data) => {
            //     console.log(data.results)
            //     setData(data.results)
            // });
    }, [])

    // The Rendering we send back as the output of the component
    return (
        <div>
            <h1>fetch data from api</h1>
            <header className="App-header">
                <p>{!data ? "Loading..." : JSON.stringify(data)}</p>
            </header>
        </div>
    )
}

export default FetchFromAPI;
```

fetch()

We use fetch to get information from an API  
If the response is ok then we allow the front-end to do something with it  
When there is an error we want to catch that error and console.log it.  

1. Fetch returns a promise  
```JS
console.log(fetch("/api/database"))
// Promise {<pending>}
```

2. We then access the promise using then and we can see if the response was successful or not 
```JS
fetch("/api/database")
    // fetch returns the response object and we call that res and do something with it
    .then(res => console.log(res))
// Response {type: 'basic', url: 'http://127.0.0.1:3000/api/database', redirected: false, status: 200, ok: true, …}
```

3. We need to call .json() method on the response to we can use it
```JS
fetch("/api/database")
    .then(res => res.json())
// This returns a promise
```

4. We are now expecting a promise from the first then method which will contain a json object with all of the data in the request  
we can call this data and do something with it
```JS
fetch("/api/database")
    .then(res => res.json())
    .then(data => console.log(data))
// {results: Array(0), fields: Array(1)}
```

5. We need to deal with a bad response from and log errors if we need to
```JS
fetch("/api/database")
    .then(res => {
        if (res.ok) {
            console.log("SUCCESS")
        } else {
            console.error("NOT SUCCESS")
        }
        res.json()
    })
    .then(data => console.log(data))
```

6. Taking it up a notch with use state for state management 
```JS

```

Remember to deal with json data correctly you only want the data or strings


**Test Suite to make sure the functionality of the Login Systems and Password reset works**

1. Create a user
2. Login with user
3. Logout user
4. Try to get to protected pages
5. Forgot password
6. Enter a user that doesn't exist
    - currently no email is sent, you will get a long in the console
7. Enter your user and get the url
8. Access the url in one tab
9. See what happens if you screw with the url and try to Enter a new password
10. Try to enter a new password for another user

# Database Schema

All of the schema for the database, so I can rebuild and redesign as and when I need to.

A description of each table and field. Or just an overview, each field is described by the schema.

A description of the database engine and any setup done.  

mysql  Ver 8.0.27 for macos11.6 on arm64 (Homebrew)  

CREATE USER 'foo'@'localhost' IDENTIFIED WITH mysql_native_password BY 'bar';  

Database Schema File is found in the DATABASE_SCHEMA directory.

`mysqldump --xml --no-data --single-transaction=true -h localhost -u root -pPassword hangtrack_db > ./DATABASE_SCHEMA/hangtrack_db_041121`

Import the file using 

`mysql -u root -p hangtrack_db < ./DATABASE_SCHEMA/hangtrack_db_041121`