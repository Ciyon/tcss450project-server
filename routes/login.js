//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express

const FormData = require("form-data");

const bodyParser = require("body-parser");

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

let getHash = require('../utilities/utils').getHash;

var router = express.Router();
router.use(bodyParser.json());

router.post('/', (req, res) => {
    res.type("application/json");
    let user = req.body['username'].toLowerCase();
    let theirPw = req.body['password'];
    let wasSuccessful = false;
    if (user && theirPw) {
        //Using the 'one' method means that only one row should be returned
        db.one(`SELECT Password, Salt, Verification, MemberId FROM Members
                WHERE Username=$1`, [user])
            //If successful, run function passed into .then()
            .then(row => {
                let salt = row['salt'];
                let ourSaltedHash = row['password']; //Retrieve our copy of the password
                let verify = row['verification'];
                let theirSaltedHash = getHash(theirPw, salt); //Combined their password with our salt, then hash
                let wasCorrectPw = ourSaltedHash === theirSaltedHash; //Did our salted hash match their salted hash?
                //Send whether they had the correct password or not
                if (!verify)
                {
                    res.send({
                        success : false,
                        error: "User hasn't confirmed email."
                    })
                }
                else
                {
                    if (wasCorrectPw)
                    {
                        res.send({
                            success : true,
                            memberid: row['memberid']
                        })
                    }
                    else
                    {
                        res.send({
                            success : false,
                            error: "Incorrect password."
                        })
                    }
                    
                }
                
            })
            //More than one row shouldn't be found, since table has constraint on it
            .catch((err) => {
                //If anything happened, it wasn't successful
                res.send({
                    success: false,
                    error: "Username not found."
                });
            });
    } else {
        res.send({
            success: false,
            error: 'Missing credentials.'
        });
    }
});

module.exports = router;
