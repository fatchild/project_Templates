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
