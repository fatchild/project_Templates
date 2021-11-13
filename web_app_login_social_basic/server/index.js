const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const csurf = require('csurf');
const helmet = require('helmet');

const PORT = process.env.PORT || 3001;
const app = express();


// Instead of body-parser
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000'
}));

// Database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'hangtrack_db'
});

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Hello, World"
  });
});

app.post("/forgotpassword", (req, res) => {
  let selector = crypto.randomBytes(20).toString('hex');
  let token = crypto.randomBytes(32).toString('hex');
  let hash_token = bcrypt.hashSync(token, 14);

  let url = `http://localhost:3000/createnewpassword?selector=${selector}&validator=${token}`;

  let expires = new Date();
  let expiry = 600000; // 10 minutes
  expires.setTime(expires.getTime() + expiry);
  expires = expires.toISOString().slice(0, 19).replace('T', ' ');

  // Check the database to see if the user is real
  connection.query(
    'SELECT * FROM user WHERE username = ? or email = ?;',
    [req.body.name, req.body.name],
    function (err, results) {
      console.log("Login Results...", results);
      if (err || results.length === 0) {
        // Database error
        res.json({
          db_err: err,
          user_err: "No user or password. They should not be aware of this though. They will receive an email if they have an account."
        });
      } else {
        // Access db and delete any existing tokens from this user
        connection.query(
          'DELETE FROM user_resetPwd WHERE pwdReseteMail = ?;',
          [req.body.name],
          function (err) {
            if (err) {
              res.json({
                db_err: err,
                user_err: "Something went wrong when deleting old auth keys."
              });
            }
            console.log("deleted all other tokens for this user")
          }
        );

        // Access db and put a new token in
        connection.query(
          'INSERT INTO user_resetPwd (pwdReseteMail, pwdResetSelector, pwdResetToken, pwdResetExpires) VALUES (?, ?, ?, ?);',
          [req.body.name, selector, hash_token, expires],
          function (err) {
            if (err) {
              res.json({
                db_err: err,
                user_err: "Something went wrong when generating your password link."
              });
            } else {
              // This is the point at which you would send the email
              console.log("url ", url);
              res.json({
                link: url,
              })
            }
          }
        );
      }
    }
  );
});

// Create new password
app.post("/createnewpassword", (req, res) => {
  console.log(req.body)

  // Check the validator is equal to the one in the database
  connection.query(
    'SELECT * FROM user_resetPwd WHERE pwdReseteMail = ?;',
    [req.body.email_user],
    function (err, results) {
      console.log("1")
      if (err || results.length === 0 || !bcrypt.compareSync(req.body.validator, results[0].pwdResetToken)) {
        console.log("2")
        res.json({
          db_err: err,
          user_err: "The validator is not equal to the token. Something is fishy here."
        });
      } else if (results[0].pwdResetExpires.replace(' ', 'T'), "/" > new Date()) {
        console.log("3")
        res.json({
          user_err: "The token has expired, they need to try again."
        });
      } else {
        console.log("4")
        // Check the user actually exists in the database by checking the incoming user vs a user is the database
        connection.query(
          'SELECT * FROM user WHERE username = ? or email = ?;',
          [req.body.email_user, req.body.email_user],
          function (err, resultsUser) {
            console.log("5")
            if (err || resultsUser.length === 0) {
              console.log("6")
              res.json({
                db_err: err,
                user_err: "There is no user of the name in the database. Something is afoot."
              });
            } else if (resultsUser[0].email !== req.body.email_user && resultsUser[0].username !== req.body.email_user) {
              console.log("7")
              res.json({
                db_err: err,
                user_err: "The user in the form is not equal to the one in the token table. Something is afoot."
              });
            } else {
              // Change the password
              console.log("8")
              connection.query(
                'UPDATE user SET password = ? WHERE username = ? or email = ?;',
                [bcrypt.hashSync(req.body.password, 14), resultsUser[0].email, resultsUser[0].email],
                function (err) {
                  if (err) {
                    console.log("END")
                    res.json({
                      db_err: err,
                      user_err: "Did not update the password. Something is afoot."
                    });
                  } else {
                    connection.query(
                      'DELETE FROM user_resetPwd WHERE pwdReseteMail = ?;',
                      [req.body.email_user],
                      function (err) {
                        console.log(req.body.email_user)
                        if (err) {
                          res.json({
                            db_err: err,
                            user_err: "Something went wrong when deleting old auth keys after changing the password."
                          });
                        }
                      }
                    );
                    res.json({
                      user_msg: "COMPLETE",
                    });
                  }
                }
              );
            }
          }
        );
      }
    }
  );
});

// Register new users
app.post("/register", (req, res) => {
  console.log("Hello")

  // Crypt that password
  let hash = bcrypt.hashSync(req.body.password, 14);

  connection.query(
    'INSERT INTO user (email, username, password) VALUES (?, ?, ?);',
    [req.body.email, req.body.username, hash],
    function (err) {
      if (err) {
        console.log("err", err)
        let user_error = "Something went wrong, please report the issue or refresh and try again...";

        if (err.errno == 1062) {
          user_error = "Duplicate user please use another email or username...";
        }

        res.json({
          db_err: err,
          user_err: user_error
        });
      } else {
        console.log("2")
        // Login the new user and return an auth key, first get their userid
        connection.query(
          'SELECT * FROM user WHERE username = ? or email = ?;',
          [req.body.username, req.body.email],
          function (err, results) {
            if (err) {
              res.json({
                db_err: err,
                user_err: "Could not find your user id."
              });
            } else {
              // Set the user auth key with the user id
              let userid = results[0].userid;
              let expires = new Date();
              let expiry = 60000; // 1 minute
              expires.setTime(expires.getTime() + expiry);
              expires = expires.toISOString().slice(0, 19).replace('T', ' ');
              let authkey = crypto.randomBytes(20).toString('hex');

              connection.query(
                'INSERT INTO user_auth (userid, authkey, expires) VALUES (?, ?, ?);',
                [userid, authkey, expires],
                function (err) {
                  if (err) {
                    res.json({
                      db_err: err,
                      user_err: "Something went wrong with your auth key."
                    });
                  } else {
                    res.json({
                      authkey: authkey,
                      expires: expires,
                    })
                  }
                }
              );
            }
          }
        );
      }
    }
  );
});

// Login users
app.post("/login", (req, res) => {
  console.log(req.body)

  connection.query(
    'SELECT * FROM user WHERE username = ? or email = ?;',
    [req.body.name, req.body.name],
    function (err, results) {
      console.log("Login Results...", results);
      if (err || results.length === 0 || !bcrypt.compareSync(req.body.password, results[0].password)) {
        // Database error
        res.json({
          db_err: err,
          user_err: "Incorrect username / Password."
        });
      } else {
        // Success so send a unique identifier and create a login auth token in user_auth
        let userid = results[0].userid;
        let expires = new Date();
        let expiry = 60000; // 1 minute
        expires.setTime(expires.getTime() + expiry);
        expires = expires.toISOString().slice(0, 19).replace('T', ' ');
        let authkey = crypto.randomBytes(20).toString('hex');

        // Delete any auth keys associated with this user
        connection.query(
          'DELETE FROM user_auth WHERE userid = ?;',
          [userid],
          function (err) {
            if (err) {
              res.json({
                db_err: err,
                user_err: "Something went wrong when deleting old auth keys."
              });
            }
          }
        );

        // Generate Auth key
        connection.query(
          'INSERT INTO user_auth (userid, authkey, expires) VALUES (?, ?, ?);',
          [userid, authkey, expires],
          function (err) {
            if (err) {
              res.json({
                db_err: err,
                user_err: "Something went wrong with your auth key."
              });
            } else {
              res.json({
                authkey: authkey,
                expires: expires,
              })
            }
          }
        );
      }
    }
  );
});

// Logout Users
app.post("/logout", (req, res) => {
  let authkey = req.body.authkey;

  // Delete any auth keys associated with this user
  connection.query(
    'DELETE FROM user_auth WHERE authkey = ?;',
    [authkey],
    function (err) {
      if (err) {
        res.json({
          db_err: err,
          user_err: "Something went wrong when deleting old auth keys."
        });
      } else {
        res.json({
          user_info: "Logged out!"
        })
      }
    }
  );
});

app.post("/isloggedin", (req, res) => {
  console.log(req.body);

  // Using the authkey, check if there is a corresponding user in the user_auth table
  // Return a boolean true if logged in
  connection.query(
    'SELECT * FROM user_auth WHERE authkey = ?;',
    [req.body.authkey],
    function (err, results) {

      if (err || results.length === 0 || results[0].password !== req.body.password) {
        // Database error
        res.json({
          isloggedin: false
        })
      } else {
        console.log("RESULTS.USERID", results)
        res.json({
          isloggedin: true,
          userid: results[0].userid
        })
      }
    }
  );
});

// Get profile information
app.post("/getuser", (req, res) => {
  console.log("authkey...", req.body.session);

  // Get the userid from the session info and send back their info
  connection.query(
    'SELECT * FROM user_auth WHERE authkey = ?;',
    [req.body.session],
    function (err, results) {
      if (err) {
        res.json({
          db_err: err
        });
      } else if (results.length === 0) {
        console.log(results);
        console.log("RESULTS!");
        res.json({
          err: "Incorrect user auth.h"
        })
      } else {
        let userid = results[0].userid;
        connection.query(
          'SELECT userid, username, email FROM user WHERE userid = ?;',
          [userid],
          function (err, results_user) {
            if (err) {
              res.json({
                db_err: err
              });
            } else if (results.length === 0) {
              res.json({
                err: "No user exists with this ID."
              })
            } else {
              res.json(results_user[0]);
            }
          }
        );
      }
    });
  // res.json({message: "User info..."})
});

// Save a post nothing else
app.post("/savepost", (req, res) => {
  console.log("post...", req.body.post, " userid...", req.body.userid);

  let date_posted = new Date();
  date_posted = date_posted.toISOString().slice(0, 19).replace('T', ' ');

  connection.query(
    'INSERT INTO user_posts (userid, post, date_posted) VALUES (?, ?, ?) ;',
    [req.body.userid, req.body.post, date_posted],
    function (err) {
      if (err) {
        res.json({
          db_err: err
        });
      } else {
        res.json({
          messages: "COMPLETE"
        })
      }
    });
});

// get the users posts
app.post("/getuserposts", (req, res) => {
  console.log("body...", req.body);

  connection.query(
    'SELECT post, date_posted FROM user_posts WHERE userid = ? ORDER BY date_posted DESC LIMIT 8;',
    [req.body.userid],
    function (err, results) {
      if (err) {
        res.json({
          db_err: err
        });
      } else if (results.length === 0) {
        res.json({
          err: "No posts for this user."
        });
      } else {
        // console.log(results)
        res.json({
          posts: results
        });
      }
    }
  );

  // res.json({message: "Got the posts."})
});

// get the posts that this user follows
app.post("/getuserfollowedposts", (req, res) => {
  console.log("body...", req.body);

  connection.query(
    'SELECT user.username, user_posts.post, user_posts.date_posted FROM user_posts INNER JOIN user ON user_posts.userid=user.userid ORDER BY date_posted DESC LIMIT 40;',
    [req.body.userid],
    function (err, results) {
      if (err) {
        res.json({
          db_err: err
        });
      } else if (results.length === 0) {
        res.json({
          err: "No posts for this user."
        });
      } else {
        console.log(results)
        res.json({
          posts: results
        });
      }
    }
  );

  // res.json({message: "Got the posts."})
});

// General Search - Initially for users
app.post("/search", (req, res) => {
  console.log(req.body)

  let searchVal = "%" + req.body.searchVal + "%";

  connection.query(
    "SELECT username FROM user WHERE username like ?;",
    [searchVal],
    function (err, results) {
      if (err) {
        console.log("err", err)
        res.json({
          err: err
        })
      } else {
        console.log("results", results)
        res.json({
          results: results
        })
      }
    }
  );
});

// Get Public User
app.post("/getpublicuser", (req, res) => {
  console.log("Getpubuser...", req.body)

  connection.query(
    'SELECT userid, username, email FROM user WHERE username = ?;',
    [req.body.username],
    function (err, results_user) {
      if (err) {
        res.json({
          db_err: err
        });
      } else if (results_user.length === 0) {
        res.json({
          err: "No user exists with this ID."
        })
      } else {
        res.json(results_user[0]);
      }
    }
  );
});

// Check if we are following this user
app.post("/arewefollowing", (req, res) => {
  console.log("Are we following...", req.body)

  connection.query(
    'SELECT follow_state FROM user_followList WHERE userid = ? and following_userid = ?;',
    [req.body.myuserid, req.body.theiruserid],
    function (err, results) {
      if (err) {
        console.log("err", err)
        res.json({
          following: false
        });
      } else if (results.length === 0) {
        console.log("no results")
        // Likely not following, so respond saying no
        console.log("not following")
        res.json({
          following: false
        });
      } else if (results[0].follow_state == 0) {
        // Make sure the follow state is correct, they may have followed then unfollowed
        console.log("Once following, not unfollowed")
        res.json({
          following: false
        });
      } else {
        // They are following and their follow state is true
        console.log(results, "You are following this user")
        res.json({
          following: true
        });
      }
    });
});

// Follow this person if you are not already, unfollow if you are return follow state
app.post("/togglefollow", (req, res) => {
  console.log("toggle follow", req.body)

  // See if they are following them
  connection.query(
    'SELECT follow_state FROM user_followList WHERE userid = ? and following_userid = ?;',
    [req.body.myuserid, req.body.theiruserid],
    function (err, results) {
      if (err) {
        console.log(err);
        res.json({
          follow_state: "UNKNOWN"
        })
      } else if (results.length === 0) {
        console.log("no results")
        // Likely not following, so create the following
        console.log("not following... creating follow")
        let date_followed = new Date();
        date_followed = date_followed.toISOString().slice(0, 19).replace('T', ' ');
        connection.query(
          'INSERT INTO user_followList (userid, following_userid, date_followed, follow_state) VALUES (?, ?, ?, ?);',
          [req.body.myuserid, req.body.theiruserid, date_followed, 1],
          function (err) {
            if (err) {
              res.json({
                follow_state: "UNKNOWN ERRNO2"
              })
            } else {
              res.json({
                follow_state: true
              })
            }
          }
        );
      } else if (results[0].follow_state == 0) {
        // 'UPDATE user SET password = ? WHERE username = ? or email = ?;'
        connection.query(
          'UPDATE user_followList SET follow_state = ? WHERE userid = ? and following_userid = ?;',
          [1, req.body.myuserid, req.body.theiruserid],
          function (err) {
            if (err) {
              res.json({
                follow_state: "UNKNOWN ERRNO3"
              })
            } else {
              res.json({
                follow_state: true
              })
            }
          }
        );
      } else if (results[0].follow_state == 1) {
        // 'UPDATE user SET password = ? WHERE username = ? or email = ?;'
        connection.query(
          'UPDATE user_followList SET follow_state = ? WHERE userid = ? and following_userid = ?;',
          [0, req.body.myuserid, req.body.theiruserid],
          function (err) {
            if (err) {
              res.json({
                follow_state: "UNKNOWN ERRNO4"
              })
            } else {
              res.json({
                follow_state: false
              })
            }
          }
        );
      }
    });

  // res.json({follow_state: true})
});

// Get users following you
app.post("/getfollowers", (req, res) => {
  console.log(req.body);

  connection.query(
    // SELECT user.username, user.userid FROM user_followList INNER JOIN user ON user_followList.following_userid=user.userid;
    'SELECT user.username, user.userid FROM user_followList INNER JOIN user ON user_followList.userid=user.userid WHERE user_followList.following_userid = ? and user_followList.follow_state = 1;',
    [req.body.userid],
    function (err, results) {
      if (err) {
        res.json({
          err: err
        })
      } else {
        console.log("Followers", results)
        res.json(results)
      }
    }
  );

  // res.json({followers: "POEOPL"})
});

// get users you follow 
app.post("/getfollowing", (req, res) => {
  console.log(req.body);

  connection.query(
    // SELECT user.username, user.userid FROM user_followList INNER JOIN user ON user_followList.following_userid=user.userid;
    'SELECT user.username, user.userid FROM user_followList INNER JOIN user ON user_followList.following_userid=user.userid WHERE user_followList.userid = ? and user_followList.follow_state = 1;',
    [req.body.userid],
    function (err, results) {
      if (err) {
        res.json({
          err: err
        })
      } else {
        console.log("Following", results)
        res.json(results)
      }
    }
  );

  // res.json({following: "POEOPL"})
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});