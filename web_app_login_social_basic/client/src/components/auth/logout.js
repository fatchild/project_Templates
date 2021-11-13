import Cookies from 'js-cookie';

async function logoutUser(credentials) {
    return fetch('http://localhost:3001/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
    .then(data => data.json())
  }

async function Logout() {
    // Remove auth key from db
    let userSessionKey = Cookies.get('session');

    logoutUser({
      authkey: userSessionKey
    });

    // Remove cookies
    Cookies.remove('session')
}

export default Logout;
