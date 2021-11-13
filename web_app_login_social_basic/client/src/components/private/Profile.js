import React, { useState, useEffect } from "react";
import Nav from '../Nav';
import ClipLoader from "react-spinners/ClipLoader";
// import { useHistory } from "react-router-dom";
import Cookies from 'js-cookie';

async function getUser(credentials) {
    return fetch('http://localhost:3001/getuser', {
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

async function getFollowers(credentials) {
    return fetch('http://localhost:3001/getfollowers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
    .then(data => data.json())
  }

async function getFollowing(credentials) {
  return fetch('http://localhost:3001/getfollowing', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  })
  .then(data => data.json())
}

function Profile() {
    const [ loading, setLoading ] = useState(false);
    const [ user, setUser ] = useState("");
    // const [ post, setPost ] = useState("");
    const [ posts, setPosts ] = useState("");
    const [ justPosted, setJustPosted ] = useState(false);
    const [ followers, setFollowers ] = useState("");
    const [ following, setFollowing ] = useState("");

    const getTheUser = async e => {
    
        setLoading(true);
    
        let session = Cookies.get('session');
        const user_info = await getUser({
            session
        })
    
        if (user_info) {
            setLoading(false);
            setUser(user_info);
        } else {
            setLoading(false);
        }
    }

    useEffect(() => {
        getTheUser();
    }, []);

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
        }
    }

    useEffect(() => {
        getTheUsersPosts();
        setJustPosted(false);
    }, [user]);

    useEffect(() => {
        if (justPosted === true) {
            getTheUsersPosts();
            setJustPosted(false);
        }
    }, [justPosted])

    const handle_getFollowers = async e => {

        let userid = user.userid;

        const followersList = await getFollowers({
            userid
        })
    
        if (followersList) {
            setFollowers(followersList)
        } else {

        }
    }

    // useEffect(() => {
    //     console.log(followers.followers);
    // }, [followers]);

    const handle_getFollowing = async e => {

        let userid = user.userid;

        const followingList = await getFollowing({
            userid
        })
    
        if (followingList) {
            setFollowing(followingList);
        } else {

        }
    }

    useEffect(() => {
        handle_getFollowers();
        handle_getFollowing();
    }, [user]);

    return (
        <div className="App">
            <Nav />
            <h1>{ user && user.username}'s Profile</h1>
            <h2>This should be private</h2>

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
            <h2>{ user && user.username}'s Followers</h2>
            { followers &&
                <ul>
                    {followers.map(function(name, index){
                        return <li key={ index }>
                            <a href={"/user/"+name.username}>{name.username}</a>
                        </li>;
                    })}
                </ul>
            }
            <h2>{ user && user.username}'s Following</h2>

            { following &&
                <ul>
                    {following.map(function(name, index){
                        return <li key={ index }>
                            <a href={"/user/"+name.username}>{name.username}</a>
                        </li>;
                    })}
                </ul>
            }
        </div>
    );
}

export default Profile;
