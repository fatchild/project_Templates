const express     = require('express');
const mysql       = require('mysql2');
const cors        = require('cors');
const bcrypt      = require('bcrypt');
const crypto      = require('crypto');
const csurf       = require('csurf');
const helmet      = require('helmet');

const PORT      = process.env.PORT || 3001;
const app       = express();

// Instead of body-parser
app.use(express.urlencoded({extended: true})); 
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000'
}));
// app.use(csurf());
// app.use(helmet());

// Database
const connection = mysql.createConnection({
  host:     'localhost',
  user:     'root',
  database: 'hangtrack_db'
});

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Hello, World"});
});

app.post("/forgotpassword", (req, res) => {
  let selector    = crypto.randomBytes(20).toString('hex');
  let token       = crypto.randomBytes(32).toString('hex');
  let hash_token  = bcrypt.hashSync(token, 14);

  let url = `http://localhost:3000/createnewpassword?selector=${selector}&validator=${token}`;

  let expires   = new Date();
  let expiry    = 600000; // 10 minutes
  expires.setTime(expires.getTime() + expiry);
  expires       = expires.toISOString().slice(0, 19).replace('T', ' ');

  // Check the database to see if the user is real
  connection.query(
    'SELECT * FROM user WHERE username = ? or email = ?;',
    [req.body.name, req.body.name],
    function(err, results) {  
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
          function(err) {
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
          function(err) {
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
    function(err, results) {
      console.log("1")
      if (err || results.length === 0 || !bcrypt.compareSync(req.body.validator, results[0].pwdResetToken)) {
        console.log("2")
        res.json({ 
          db_err: err,
          user_err: "The validator is not equal to the token. Something is fishy here."
        });
      } else if (results[0].pwdResetExpires.replace(' ', 'T'),"/" > new Date() ) {
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
          function(err, resultsUser) {
            console.log("5")
            if ( err || resultsUser.length === 0 ) {
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
                function(err) {
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
                      function(err) {
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

  // Crypt that password
  let hash = bcrypt.hashSync(req.body.password, 14);

  connection.query(
    'INSERT INTO user (email, username, password) VALUES (?, ?, ?);',
    [req.body.email, req.body.username, hash],
    function(err) {
      if (err) {
        let user_error = "Something went wrong, please report the issue or refresh and try again...";

        if (err.errno == 1062) {
          user_error = "Duplicate user please use another email or username...";
        }

        res.json({ 
          db_err: err,
          user_err: user_error
        });
      } else {

        // Login the new user and return an auth key, first get their userid
        connection.query(
          'SELECT * FROM user WHERE username = ? or email = ?;',
          [req.body.username, req.body.email],
          function(err, results) {
            if (err) {
              res.json({ 
                db_err: err,
                user_err: "Could not find your user id."
              });
            } else {
              // Set the user auth key with the user id
              let userid    = results[0].userid;
              let expires   = new Date();
              let expiry    = 60000; // 1 minute
              expires.setTime(expires.getTime() + expiry);
              expires       = expires.toISOString().slice(0, 19).replace('T', ' ');
              let authkey   = crypto.randomBytes(20).toString('hex');

              connection.query(
                'INSERT INTO user_auth (userid, authkey, expires) VALUES (?, ?, ?);',
                [userid, authkey, expires],
                function(err) {
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
    function(err, results) {  
      console.log("Login Results...", results);
      if (err || results.length === 0 || !bcrypt.compareSync(req.body.password, results[0].password)) {
        // Database error
        res.json({ 
          db_err: err,
          user_err: "Incorrect username / Password."
        });
      } else {
        // Success so send a unique identifier and create a login auth token in user_auth
        let userid    = results[0].userid;
        let expires   = new Date();
        let expiry    = 60000; // 1 minute
        expires.setTime(expires.getTime() + expiry);
        expires       = expires.toISOString().slice(0, 19).replace('T', ' ');
        let authkey   = crypto.randomBytes(20).toString('hex');

        // Delete any auth keys associated with this user
        connection.query(
          'DELETE FROM user_auth WHERE userid = ?;',
          [userid],
          function(err) {
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
          function(err) {
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
  let authkey   = req.body.authkey;

  // Delete any auth keys associated with this user
  connection.query(
    'DELETE FROM user_auth WHERE authkey = ?;',
    [authkey],
    function(err) {
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
    function(err, results) {  

      if (err || results.length === 0 || results[0].password !== req.body.password) {
        // Database error
        res.json({isloggedin: false})
      } else {
        res.json({isloggedin: true})
      }
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});