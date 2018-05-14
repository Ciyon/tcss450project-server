//express is the framework we're going to use to handle requests
const express = require('express');

const bodyParser = require("body-parser");

//We use this create the SHA256 hash
const crypto = require("crypto");

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

let getHash = require('../utilities/utils').getHash;

let sendEmail = require('../utilities/utils').sendEmail;

var router = express.Router();
router.use(bodyParser.json());

router.post('/', (req, res) => {
    res.type("application/json");
    var email = req.body['email'].toLowerCase();
    var password = req.body['password'];
    if (email && password) {
        if (!email.includes("@")) {
            res.send({
                success: false,
                error: "Email is invalid."
            })
        }
        else
        {
            let salt = crypto.randomBytes(32).toString("hex");
            let salted_hash = getHash(password, salt);

            if (password.length < 5) {
                res.send({
                    success: false,
                    error: "Password must be at least 5 characters long."
                });
            }
            else {
                var params = [email, salted_hash, salt];
                db.none("UPDATE MEMBERS SET Password = $2, Salt = $3 WHERE EMAIL = $1", params)
                .then(() => {
                    res.send({
                        success: true
                    });
                    var message = "Your password has been updated.";
                    sendEmail(email, "Password Reset Confirmation", message);
                })
            }

        }
    } else {
        res.send({
            success: false,
            input: req.body,
            error: "Missing required user information."
        });
    }
});

module.exports = router;
