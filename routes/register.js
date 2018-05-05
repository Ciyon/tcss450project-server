//express is the framework we're going to use to handle requests
const express = require('express');

const bodyParser = require("body-parser");

//We use this create the SHA256 hash
const crypto = require("crypto");

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

let getHash = require('../utilities/utils').getHash;

let sendVerificationEmail = require('../utilities/utils').sendVerificationEmail;

let getCode = require('../utilities/utils').getCode;

var router = express.Router();
router.use(bodyParser.json());

router.post('/', (req, res) => {
    res.type("application/json");

    //Retrieve data from query params
    var first = req.body['first'].toLowerCase();
    var last = req.body['last'].toLowerCase();
    var username = req.body['username'].toLowerCase();
    var email = req.body['email'].toLowerCase();
    var password = req.body['password'];
    var expire = new Date();
    var confirm = getCode().toString(); 
    expire.setHours(expire.getHours() + 24);
    //Verify that the caller supplied all the parameters
    //In js, empty strings or null values evaluate to false
    if (first && last && username && email && password) {
        //We're storing salted hashes to make our application more secure
        //If you're interested as to what that is, and why we should use it
        //watch this youtube video: https://www.youtube.com/watch?v=8ZtInClXe1Q
        let salt = crypto.randomBytes(32).toString("hex");
        let salted_hash = getHash(password, salt);

        //Use .none() since no result gets returned from an INSERT in SQL
        //We're using placeholders ($1, $2, $3) in the SQL query string to avoid SQL Injection
        //If you want to read more: https://stackoverflow.com/a/8265319
        var params = [first, last, username, email, salted_hash, salt, confirm, expire];
        db.none("INSERT INTO MEMBERS(FirstName, LastName, Username, Email, Password, Salt, Confirm, Expire) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)", params)
            .then(() => {
                res.send({
                    success: true
                });
                //var URL = "localhost:5000/verify?confirm=" + confirm
                var URL = "tcss450group4.herokuapp.com/verify?confirm=" + confirm
                sendVerificationEmail(email, URL);
            }).catch((err) => {
                //log the error
                console.log(err);
                //If we get an error, it most likely means the account already exists
                //Therefore, let the requester know they tried to create an account that already exists
                res.send({
                    success: false,
                    error: "Account or Email already exists."
                });
            });
    } else {
        res.send({
            success: false,
            input: req.body,
            error: "Missing required user information"
        });
    }
});

module.exports = router;
