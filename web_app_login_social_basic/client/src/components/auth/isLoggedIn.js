import Cookies from 'js-cookie';

function isLoggedIn() {
    return fetch('http://localhost:3001/isloggedin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({authkey: Cookies.get('session')})
    })
      .then(data => data.json())
}

export default isLoggedIn;
