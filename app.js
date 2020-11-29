// Okta Javascript App#1
//Using all Javascript (Node.js, Express, and MongoDB)
//node app.js
//ctrl+c to stop running
//EJS Templates - npm install ejs

//API Token - 005wdSBml5qo0MLOUiJAAwmihZcz2215_TrUXHPEUe (stored as a hash after creation)

const express = require("express");
const app = express();
var bodyParser = require('body-parser');

var ejs = require('ejs');

app.use(express.urlencoded({
    extended: true
  }))
app.use(express.json());

//npm install --save body-parser multer
var multer = require('multer');
var upload = multer();

//Need body parser to grab form data
//npm i body-parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

// for parsing multipart/form-data
app.use(upload.array()); 
app.use(express.static('public'));


//Okta Javascript Auth SDK !!!!!!!!!!!!!!!!!!!!!!
//npm install --save @okta/okta-auth-js (Already Ran that)
// also had to run this npm add @babel/runtime
// and run polyfill require('@okta/okta-auth-js/polyfill'); var polyfill = require('@okta/okta-auth-js/polyfill');
var OktaAuth = require('@okta/okta-auth-js').OktaAuth;

  var authClient = new OktaAuth({
    url: 'https://dev-330389.okta.com',
    issuer: 'https://dev-330389.okta.com/oauth2/default',
    clientId: '0oa19viiksCLoYDZy4x7',
    redirectUri: 'http://localhost:3000'  //http://localhost:3000/authorization-code/callback
  });
  //console.log(authClient);


//Okta Node.JS SDK !!!!!!!!!!!!!!!!!!!!!!
//npm install --save @okta/okta-sdk-nodejs
//Okta Node JS OIDC Middleware in your project is simple: npm install --save @okta/oidc-middleware
//OIDC Middleware also depends on Express Session to work - npm install --save express-session
const okta = require('@okta/okta-sdk-nodejs');
var session = require('express-session');
const { ExpressOIDC } = require('@okta/oidc-middleware');
const apiKey = '005wdSBml5qo0MLOUiJAAwmihZcz2215_TrUXHPEUe';

const client = new okta.Client({
  orgUrl: 'https://dev-330389.okta.com',
  token: '005wdSBml5qo0MLOUiJAAwmihZcz2215_TrUXHPEUe' ,  // Obtained from Developer Dashboard - NEED THIS LINE
  client: {
    authorizationMode: 'PrivateKey',
    clientId: '0oa19viiksCLoYDZy4x7',
    scopes: ['okta.users.manage'],
    privateKey: '{JWK}' // <-- see notes below
}
});

//OIDC Middleware - Authorization Code Flow
const oidc = new ExpressOIDC({
    issuer: 'https://dev-330389.okta.com/oauth2/default',
    //client_id: '0oa19viiksCLoYDZy4x7',
    client_id: '0oaorshy1uzEjivYO4x6',
    client_secret: 'vMMXoZIW8qnEETj69Nf-8nwdxNfG8OsoeZ7tc7bi',
    appBaseUrl: '. http://localhost:3000',
    scope: 'openid profile'
  });

  //Node.js JWT Verifier
  //npm install --save @okta/jwt-verifier
  const OktaJwtVerifier = require('@okta/jwt-verifier');
const { EVENT_EXPIRED } = require("@okta/okta-auth-js");

  const oktaJwtVerifier = new OktaJwtVerifier({
    issuer: 'https://dev-330389.okta.com/oauth2/default', // required
    clientId: '0oa19viiksCLoYDZy4x7'
  });

//ROUTES ----------------------------------------------------------------------------------------
/* app.post("/home", function(req, res) {	
    console.log("POSTED TO /HOME. ");	
    //Log Access Token - console.log(req.body.aT);
    var request  = req;
    var expectedAud = "api://default";
    var accessToken = req.body.aT;
    //var accessToken = "invalid token";

    //Verify JWT
    oktaJwtVerifier.verifyAccessToken(accessToken, "api://default")
    .then(jwt => {
        // the token is valid (per definition of 'valid' above), 
        console.log(jwt.claims);
        //res.sendFile("home.ejs");
        res.render("home.ejs");
    })
    .catch(err => {
        // token validation failed, log the error & redirect to login
        console.log(err);
        res.send("Bad Request");
    });
}); */



app.get("/login"  , function(req, res) {	
    console.log('Login Page');
    res.render("loginWidget.ejs");
});


//Login via Widget)
app.get("/loginWidget"  , function(req, res) {		
    console.log('Login Widget Page');
    res.render("loginWidget.ejs");

});

//Login via API (Custom Sign-In)
app.get("/loginCustom"  , function(req, res) {		
    console.log('Custom Sign-In Page');
    res.render("loginCustom.ejs");
});

app.post("/loginRaw", function(req, res) {		
    //res.send(req.body.InputUsername);
    console.log('Posted to LoginRaw');
    //console.log(req);
    var response = req.body;
    var username = req.body.username;
    var password = req.body.password;
    //console.log(response);
    console.log(username);
    console.log(password);
    res.send("POSTED to LOGINRAW");
});


//LOGOUT ROUTE
app.post("/logout"  , function(req, res) {	
    // print userID - console.log(req.body.logoutForm);

    //.clearUserSession - Only removing Okta session cookie, access token is still valid though
    /* client.clearUserSessions(req.body.logoutForm)
        .then(() => {
        console.log('All user sessions have ended');
        res.redirect('/login');
    })
    .catch(err => {
        // token validation failed, log the error & redirect to login
        console.log(err);
        res.send("Unable to sign out user");
    }); */


    //LogOUT 2 - Clear User Sessions w/ OauthTokens query param - Remove Okta session and all OAuth tokens (weird behavior, need another revoke call)
    const url = 'https://dev-330389.okta.com/api/v1/users/' + req.body.logoutForm + '/sessions?oauthTokens=true';
    var aT = req.body.aT;

    const request = {
    method: 'delete',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
    };

    const requestTwo = {
        method: 'post',
        body: {
            'token_type_hint': 'access_token',
            'token': req.body.aT,
            //'Authorization': 'SSWS 005wdSBml5qo0MLOUiJAAwmihZcz2215_TrUXHPEUe',
            //'Authorization': Basic " + base64_encode(client_id + “:” + client_secret),
        },
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        }
        };


    client.http.http(url, request)
    .then(() => {
        console.log('All user sessions have ended');
        res.redirect('/login');

        /* //Revoke Token POST
        client.http.http('https://dev-330389.okta.com/oauth2/v1/revoke/', requestTwo)
        .then(() => {
            console.log('Token revoked now too');
            res.redirect('/login');
        })
        .catch(err => {
            // failed to clear session, log the error & redirect to login
            console.log(err);
            res.send("Unable to revoke token");
        }); */
    })
    .catch(err => {
        // failed to clear session, log the error & redirect to login
        console.log(err);
        res.send("Unable to sign out user");
    });

});



app.get("/home"  , function(req, res) {	
    //console.log(authClient);
    console.log(" Get to /HOME");
    res.render("homeGate.ejs");
});
app.post("/home", function(req, res) {	
    console.log("POSTED TO /HOME. ");	
    //Log Access Token - console.log(req.body.aT);
    var request  = req;
    var expectedAud = "api://default";
    var accessToken = req.body.aT;
    //var accessToken = "invalid token";

    //Verify JWT
    oktaJwtVerifier.verifyAccessToken(accessToken, "api://default")
    .then(jwt => {
        // the token is valid (per definition of 'valid' above), 
        //console.log(jwt.claims.uid);
        //res.sendFile("home.ejs");
        res.render("home.ejs", {uid: jwt.claims.uid, aT: accessToken});
    })
    .catch(err => {
        // token validation failed, log the error & redirect to login
        console.log(err);
        res.send("Bad Request");
    });
});


app.get("/student"  , function(req, res) {	
    console.log(" Get to /STUDENT");
    res.render("studentGate.ejs");
});
app.post("/student", function(req, res) {	
    console.log("POSTED TO /STUDENT. ");	
    //Log Access Token - console.log(req.body.aT);
    var request  = req;
    var expectedAud = "api://default";
    var accessToken = req.body.aT;
    //var accessToken = "invalid token";

    //Verify JWT
    oktaJwtVerifier.verifyAccessToken(accessToken, "api://default")
    .then(jwt => {
        // the token is valid (per definition of 'valid' above), 
        //Check that user belongs to Student group
        if (jwt.claims.Student == true){
            res.render("student.ejs");
        }
        else{
            res.send("Student Claim False");
        }
    })
    .catch(err => {
        // token validation failed, log the error & redirect to login
        console.log(err);
        res.send("Bad Request");
    });
});


app.get("/admin"  , function(req, res) {	
    console.log(" Get to /ADMIN");
    res.render("adminGate.ejs", {message: ""});
});
app.post("/adminData", function(req, res) {	
    console.log("POSTED TO /ADMIN. ");	
    //Log Access Token - console.log(req.body.aT);
    var request  = req;
    var expectedAud = "api://default";
    var accessToken = req.body.aT;
    var eventList  = [];
    var ev  = [];

    var adminUserList  = [];
    var studentUserList  = [];
    var teacherUserList  = [];
    var allUserList  = [];
    //var accessToken = "invalid token";

    //Verify JWT
    oktaJwtVerifier.verifyAccessToken(accessToken, "api://default")
    .then(jwt => {
        // the token is valid (per definition of 'valid' above), 

        if (jwt.claims.Admin == true){

        client.getLogs({since: '2020-11-25T00:00:00Z' }).each(event => {
        //client.getLogs({ since: '2020-11-18T00:00:00Z' , filter: "eventType eq user.authentication.sso"}).each(event => {

            //LOGIC TO FILTER THE EVENTS STORED
            //if(event.eventType == "user.authentication.sso"){
                //console.log(event.eventType);
                //ev.push(event.eventType);
                eventList.push(event);
            //}
          })

          .then(() => {
            console.log('All events have been printed');
            //console.log(ev);
            //console.log(eventList);
            console.log(eventList.length);

            //CALL Groups APIs
            var requestUsers = {
                method: 'get',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                }};
                

              //Admin Group
              client.http.http(`https://dev-330389.okta.com/api/v1/groups/00g1fu9uim1AN40IR4x7/users`, requestUsers)
                .then(res => res.text())
                .then(text => {
                  var adminUserList = JSON.parse(text);
                  console.log("Number of Admin users: " + adminUserList.length);

                        //Student Group
                    client.http.http(`https://dev-330389.okta.com/api/v1/groups/00g1fy50da9wxKCse4x7/users`, requestUsers)
                    .then(res => res.text())
                    .then(text => {
                        var studentUserList = JSON.parse(text);
                        console.log("Number of Student users: " + studentUserList.length);

                            //Teacher Group
                            client.http.http(`https://dev-330389.okta.com/api/v1/groups/00g1fy69s3DqrUFlx4x7/users`, requestUsers)
                            .then(res => res.text())
                            .then(text => {
                                var teacherUserList = JSON.parse(text);
                                console.log("Number of Teacher users: " + teacherUserList.length);

                                //Everyone Group
                                    client.http.http(`https://dev-330389.okta.com/api/v1/groups/00gf7pxjs1AG7hgi34x6/users`, requestUsers)
                                    .then(res => res.text())
                                    .then(text => {
                                        var allUserList = JSON.parse(text);
                                        console.log("Number of total users: " + allUserList.length);
                                        console.log(allUserList);
                                        res.render("admin.ejs", {allUsers: allUserList, events: eventList, admins: adminUserList, students: studentUserList, 
                                            teachers: teacherUserList, aT: accessToken});

                                    })
                                    .catch(err => {
                                        console.error(err);
                                    });
                            })
                            .catch(err => {
                                console.error(err);
                            });
                    })
                    .catch(err => {
                        console.error(err);
                    });
                })
                .catch(err => {
                  console.error(err);
                });
          });
          
        //
    }
    else{
        res.send("Admin Claim False");
    }

    })
    .catch(err => {
        // token validation failed, log the error & redirect to login
        console.log(err);
        res.send("Bad Request");
    });
});

//Route for Admin page to call - add/remove users from group
app.post("/admin", function(req, res) {	
    console.log("Group change route hit ");	
    console.log(req.body);	

    var expectedAud = "api://default";
    var accessToken = req.body.aT;

    var groupID;
    if (req.body.group == "Admin"){
        groupID = "00g1fu9uim1AN40IR4x7";
    }
    else if(req.body.group == "Student"){
        groupID = "00g1fy50da9wxKCse4x7";
    }
    else{
        groupID = "00g1fy69s3DqrUFlx4x7";
    }

    //Two different API calls - Either Add or Remove

    //Verify JWT

     oktaJwtVerifier.verifyAccessToken(accessToken, "api://default")
    .then(jwt => {
            client.getUser(req.body.username)
                    .then(user => {

                        if(req.body.action == "Add"){
                            console.log("adding user to group");

                                user.addToGroup(groupID)
                                .then(() => {
                                    console.log('User has been added to group');
                                    res.render("adminGate.ejs", {message: "User has been added to group"});
                                })
                                .catch(err => {
                                    // token validation failed, log the error & redirect to login
                                    console.log(err);
                                    res.render("adminGate.ejs", {message: "Unable to add user to group"});
                                });
                        }

                        else{
                            console.log("removing user from group");
                            const request = {
                                method: 'delete',
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json',
                                    'Authorization': 'SSWS ' + apiKey
                                }
                                };
                            const uid = user.id;
                            const url = 'https://dev-330389.okta.com/api/v1/groups/' + groupID + '/users/' + uid;
                            console.log(apiKey);
                            console.log(url);
                            
                                client.http.http(url, request)
                                .then(() => {
                                    console.log('User has been removed from group');
                                    res.render("adminGate.ejs", {message: "User has been removed from group"});
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.render("adminGate.ejs", {message: "Unable to remove user from group"});
                                });
                        }
                    })
                    .catch(err => {
                        // token validation failed, log the error & redirect to login
                        console.log(err);
                        res.render("adminGate.ejs", {message: "Username/Login does not exist"});
                    });
    })
    .catch(err => {
        // token validation failed, log the error & redirect to login
        console.log(err);
        res.render("adminGate.ejs", {message: "Invalid access token"});
    }); 
});





app.get("/teacher"  , function(req, res) {	
    console.log(" Get to /TEACHER");
    res.render("teacherGate.ejs");
});
app.post("/teacher", function(req, res) {	
    console.log("POSTED TO /TEACHER. ");	
    //Log Access Token - console.log(req.body.aT);
    var request  = req;
    var expectedAud = "api://default";
    var accessToken = req.body.aT;
    //var accessToken = "invalid token";

    //Verify JWT
    oktaJwtVerifier.verifyAccessToken(accessToken, "api://default")
    .then(jwt => {
        // the token is valid (per definition of 'valid' above), 
        //Check user belongs to Teacher group
        if (jwt.claims.Teacher == true){
            res.render("teacher.ejs");
        }
        else{
            res.send("Teacher Claim False");
        }
    })
    .catch(err => {
        // token validation failed, log the error & redirect to login
        console.log(err);
        res.send("Bad Request");
    });
});


app.get("/profileUpdated"  , function(req, res) {	
    console.log(" Profile has been updated and redirect back");
    res.render("profileGate.ejs", {message: "Profile changes saved!"});
});
app.get("/profile"  , function(req, res) {	
    console.log(" Get to /PROFILE");
    res.render("profileGate.ejs", {message: ""});
});
app.post("/profile", function(req, res) {	
    console.log("POSTED TO /PROFILE. ");	
    //Log Access Token - console.log(req.body.aT);
    var request  = req;
    var expectedAud = "api://default";
    var accessToken = req.body.aT;
    var userProfile;
    //var accessToken = "invalid token";

    //Verify JWT
    oktaJwtVerifier.verifyAccessToken(accessToken, "api://default")
    .then(jwt => {
                    client.getUser(jwt.claims.uid)
                    .then(user => {
                        // the token is valid (per definition of 'valid' above), 
                        userProfile = user;
                        console.log(user.profile);

                        //res.sendFile("home.ejs");
                        res.render("profile.ejs", {username: user.profile.login, phone: user.profile.mobilePhone,
                        secondEmail: user.profile.secondEmail, nickName: user.profile.nickName, userID: jwt.claims.uid, city: user.profile.city,
                    state: user.profile.state, address: user.profile.streetAddress, zip: user.profile.zipCode, aT: accessToken});
                    })
                    .catch(err => {
                        // token validation failed, log the error & redirect to login
                        console.log(err);
                        res.send("Bad Request");
                    });
    })
    .catch(err => {
        // token validation failed, log the error & redirect to login
        console.log(err);
        res.send("Bad Request");
    });

});
app.post("/profileUpdate", function(req, res) {	
    console.log("Updating Profile route ");	
    var expectedAud = "api://default";
    var accessToken = req.body.aT;
    var uid = req.body.userID;
    var userProfile;
    //var accessToken = "invalid token";

    //Verify JWT

    oktaJwtVerifier.verifyAccessToken(accessToken, "api://default")
    .then(jwt => {
        // the token is valid (per definition of 'valid' above), 
        //console.log(jwt.claims);
        //res.sendFile("home.ejs");
        //res.render("profile.ejs");

                    client.getUser(uid)
                    .then(user => {
                        // the token is valid (per definition of 'valid' above), 
                        //Update user profile from request
                        console.log(user.profile);
                        user.profile.secondEmail = req.body.secondEmail;
                        user.profile.zipCode = req.body.zip;
                        user.profile.mobilePhone = req.body.phone;
                        user.profile.streetAddress = req.body.address;
                        user.profile.city = req.body.city;
                        user.profile.state = req.body.state;

                        user.update()
                            .then(() => {
                                console.log('User profile change has been saved');
                                //res.set({'testheader': "thisisatest"});
                                //res.statusCode = 200;
                                res.redirect('/profileUpdated');})
                            .catch(err => {
                                // token validation failed, log the error & redirect to login
                                console.log(err);
                                res.send("Profile update failed");
                            })

                    }
                    )
                    .catch(err => {
                        // token validation failed, log the error & redirect to login
                        console.log(err);
                        res.send("Profile update failed");
                    });
    })
    .catch(err => {
        // token validation failed, log the error & redirect to login
        console.log(err);
        res.send("Profile update failed");
    });

});




app.get("/tokens"  , function(req, res) {	
    console.log(" Get to /TOKENS");
    res.render("tokensGate.ejs");
});
app.post("/tokens", function(req, res) {	
    console.log("POSTED TO /TOKENS. ");	
    //Log Access Token - console.log(req.body.aT);
    var request  = req;
    var expectedAud = "api://default";
    var accessToken = req.body.aT;
    //var accessToken = "invalid token";

    //Verify JWT
    oktaJwtVerifier.verifyAccessToken(accessToken, "api://default")
    .then(jwt => {
        // the token is valid (per definition of 'valid' above), 
        console.log(jwt.claims);
        //res.sendFile("home.ejs");
        res.render("tokens.ejs");
    })
    .catch(err => {
        // token validation failed, log the error & redirect to login
        console.log(err);
        res.send("Bad Request");
    });
});


app.get("/apps"  , function(req, res) {	
    console.log(" Get to /APPS");
    res.render("appsGate.ejs");
});
app.post("/apps", function(req, res) {	
    console.log("POSTED TO /APPS. ");	
    //Log Access Token - console.log(req.body.aT);
    var request  = req;
    var expectedAud = "api://default";
    var accessToken = req.body.aT;
    //var accessToken = "invalid token";

    //Verify JWT
    oktaJwtVerifier.verifyAccessToken(accessToken, "api://default")
    .then(jwt => {
        // the token is valid (per definition of 'valid' above), 
        console.log(jwt.claims);
        //res.sendFile("home.ejs");
        res.render("apps.ejs");
    })
    .catch(err => {
        // token validation failed, log the error & redirect to login
        console.log(err);
        res.send("Bad Request");
    });
});


app.get("*"  , function(req, res) {			
res.send("Page not found, this route doesn't exist. ");
});

app.listen(3000, function() { 
	console.log('Server listening on port 3000'); 
});

