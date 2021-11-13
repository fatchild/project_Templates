import React, {useState, useEffect } from 'react';
import { Link } from 'react-router-dom'
import ClipLoader from "react-spinners/ClipLoader";

async function search(credentials) {
    return fetch('http://localhost:3001/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
    .then(data => data.json())
  }

function Search(){
    const [ searchVal, setSearchVal ] = useState("");
    const [ searchResults, setSearchResults ] = useState("");
    const [ loading, setLoading ] = useState(false);

    const handleSearch = async e => {
        // e.preventDefault();
    
        setLoading(true);
    
        const result = await search({
          searchVal
        })
    
        if (result.results) {
            setSearchResults(result.results)
            setLoading(false);
        } else {
            setSearchResults("")
            setLoading(false);
        }
    }

    useEffect(() => {
        if (searchVal !== ""){
            handleSearch();
        }
    }, [searchVal]);

    function clearSearch() {
        setSearchResults("")
        document.getElementById('search').value = '';
    }

    return(
        <div>
            <form>
                <label> Search By Username:  <input type="text" name="email_user" onChange={e => setSearchVal(e.target.value)} required id="search" /> </label> <br/>
            </form>
            {searchResults !== "" && 
            <div>
                {/* <div>{searchResults}</div> */}
                <ul>
                {searchResults.map(function(name, index){
                    return <li key={ index }>
                        <p><Link to={`/user/${name.username}`}>{name.username}</Link></p>
                    </li>;
                  })}
            </ul>
                <button onClick={clearSearch}>Clear</button>
            </div>
            }
            <div>{ loading === true && <ClipLoader size={100} /> }</div>
        </div>
    );
}

export default Search;