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

async function savePost(credentials) {
  return fetch('http://localhost:3001/savepost', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  })
  .then(data => data.json())
}

async function getUsersFollowedPosts(credentials) {
  return fetch('http://localhost:3001/getuserfollowedposts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  })
  .then(data => data.json())
}



function Feed() {
    const [ loading, setLoading ] = useState(false);
    const [ user, setUser ] = useState("");
    const [ post, setPost ] = useState("");
    const [ posts, setPosts ] = useState("");
    const [ justPosted, setJustPosted ] = useState(false);

    const getTheUser = async e => {
        // e.preventDefault();
    
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

    // Save post
    const saveThePost = async e => {
        e.preventDefault();
    
        setLoading(true);

        let userid = user.userid;

        const user_post = await savePost({
            userid,
            post
        })
    
        if (user_post) {
            setLoading(false);
            setJustPosted(true);
        } else {
            setLoading(false);
        }
    }

    // get user posts
    const getTheUsersFollowedPosts = async e => {
    
        setLoading(true);

        let userid = user.userid;

        const users_posts = await getUsersFollowedPosts({
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
        getTheUsersFollowedPosts();
        setJustPosted(false);
    }, [user]);

    useEffect(() => {
        if (justPosted === true) {
            getTheUsersFollowedPosts();
            setJustPosted(false);
        }
    }, [justPosted])

    return (
        <div className="App">
            <Nav />
            <h1>{ user && user.username}'s Feed</h1>

            <div>{ loading === true && <ClipLoader size={100} /> }</div>
            <div>
            { user && 
            <form onSubmit={saveThePost}>
                <label> What's on your mind  <input type="text" name="message" onChange={e => {
                setPost(e.target.value)
                }} required /> </label> <br/>
                <button type="submit">Submit</button>
            </form>
            }
            </div>
            {posts &&
            <div>

            <h2>Global Feed</h2>

            <ul>
                {posts.map(function(name, index){
                    return <li key={ index }>
                        <h3>{name.post}</h3>
                        <p><b><a href={"/user/"+name.username}>{name.username}</a></b> {name.date_posted.replace('T', ' ').slice(0, 19)}</p>
                    </li>;
                  })}
            </ul>
            </div>
            }
        </div>
    );
}

export default Feed;
