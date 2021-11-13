import React, { useState, useEffect } from "react";
import Nav from './Nav';
import ClipLoader from "react-spinners/ClipLoader";
import { useHistory } from "react-router-dom";
// import Cookies from 'js-cookie';
import isLoggedIn from "./auth/isLoggedIn";

async function getPublicUser(credentials) {
    return fetch('http://localhost:3001/getpublicuser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
    .then(data => data.json())
  }

async function getUsersPosts(credentials) {
  return fetch('http://localhost:3001/getuserposts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  })
  .then(data => data.json())
}

async function checkAreWeFollowing(credentials) {
    return fetch('http://localhost:3001/arewefollowing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
    .then(data => data.json())
  }

async function toggleFollow(credentials) {
    return fetch('http://localhost:3001/togglefollow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
    .then(data => data.json())
  }

function PublicUserPage({ match }) {
    let username = match.params.username;

    const [ loading, setLoading ] = useState(false);
    const [ user, setUser ] = useState("");
    // const [ username, setUsername ] = useState("");
    const [ posts, setPosts ] = useState("");
    const [ isFollowing, setIsFollowing ] = useState(false);
    const [loggedInStatus, setLoggedInStatus] = useState();
    const [ myUserID, setMyUserID ] = useState("");

    const history = useHistory();

    // setUsername(match.params.username);

    const getThePublicUser = async e => {

        isLoggedIn().then((response) => {
            setLoggedInStatus(response.isloggedin)
            setMyUserID(response.userid)
        });
    
        setLoading(true);

        const user_info = await getPublicUser({
            username
        })
    
        if (user_info.userid) {
            setLoading(false);
            setUser(user_info);
        } else {
            setLoading(false);
        }
    }
    
    useEffect(() => {
        getThePublicUser();
    }, [username]);

    useEffect(() => {
        if (user.userid === myUserID) {
            history.push("/profile");
        }

    }, [user, myUserID]);

    // get user posts
    const getTheUsersPosts = async e => {

        setLoading(true);

        let userid = user.userid;

        const users_posts = await getUsersPosts({
            userid
        })
    
        if (users_posts.posts) {
            setLoading(false);
            setPosts(users_posts.posts)
        } else {
            setLoading(false);
            setPosts("")
        }
    }

    useEffect(() => {
        getTheUsersPosts();
    }, [user]);

    // Are we following this user
    const areWeFollowing = async e => {

        let myuserid = myUserID;
        let theiruserid = user.userid;

        const user_follows = await checkAreWeFollowing({
            theiruserid,
            myuserid
        })
    
        if (user_follows.following) {
            setIsFollowing(user_follows.following);
        } else {
            setIsFollowing(false);
        }
    }

    useEffect(() => {
        areWeFollowing();
    }, [user]);

    // Follow them
    const handle_toggleFollow = async e => {

        let myuserid = myUserID;
        let theiruserid = user.userid;

        const user_follows = await toggleFollow({
            theiruserid,
            myuserid
        })
    
        if (user_follows.follow_state) {
            setIsFollowing(user_follows.follow_state);
        } else {
            setIsFollowing(false);
        }
    }


    return (
        <div className="App">
            <Nav />
            { user ?
            <h1>{user.username}'s Public Profile</h1>
                :
            <h1>No such user exists</h1>
            }
            <h2>This should be public</h2>
            {
                loggedInStatus && 
                <div>
                {
                    !isFollowing ?
                        <button onClick={handle_toggleFollow}>Follow</button>
                    :
                        <button onClick={handle_toggleFollow}>Unfollow</button>
                }
                </div>
            }


            <div>{ loading === true && <ClipLoader size={100} /> }</div>

            {posts &&
            <div>
            <h2>{ user && user.username}'s Posts</h2>
            <ul>
                {posts.map(function(name, index){
                    return <li key={ index }>
                        <h3>{name.post}</h3>
                        <p>{name.date_posted.replace('T', ' ').slice(0, 19)}</p>
                    </li>;
                  })}
            </ul>
            </div>
            }
        </div>
    );
}

export default PublicUserPage;
