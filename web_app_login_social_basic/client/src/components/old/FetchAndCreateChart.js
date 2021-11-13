import React, { useEffect, useState } from "react";
import { Bar } from 'react-chartjs-2';

// Chart stuff
const graphData = {
    // labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    labels: [],
    datasets: [
      {
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

const options = {
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
        },
      },
    ],
  },
};

// How to write a useEffect fetch
function FetchAndCreateChart() {
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

                data.results.forEach(function (item, index) {
                    console.log(item.test_field, index);

                    graphData.labels.push(item.test_field)
                    console.log(graphData.labels)
                });

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
                <p>{!data ? "Loading..." : <Bar data={graphData} options={options} />}</p>
            </header>
            {/* <Bar data={graphData} options={options} /> */}
        </div>
    )
}

export default FetchAndCreateChart;
