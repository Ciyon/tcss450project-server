//express is the framework we're going to use to handle requests
const express = require('express');

const crypto = require("crypto");

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

const bodyParser = require("body-parser");

let sendEmail = require('../utilities/utils').sendEmail;

var router = express.Router();
router.use(bodyParser.json());

// Resends a confirmation email to the given email if it isn't already verified.
router.post('/', (req, res) => {
    res.type("application/json");
    var email = req.body['email'];
    if (email) {
        // If the email doesn't include an "@" sign
        if (!email.includes("@")) {
            res.send({
                success: false,
                error: "Email is invalid."
            })
        }
        else {
            // Select the member with the given email
            db.result("SELECT * FROM MEMBERS WHERE EMAIL = $1", [email])
                .then(result => {
                    // If the email doesnt match to any account
                    if (result.rowCount == 0) {
                        res.send({
                            success: false,
                            error: "Email doesn't exist."
                        })
                    }
                    
                    else if (result.rowCount == 1) {
                        // Grab the users verification code
                        var verify = result.rows[0]["verification"];
                        if (!verify) {
                            // Create a new expiration date (24h)
                            var expire = new Date();
                            // Create a confirmation code
                            var confirm = crypto.randomBytes(20).toString("hex");
                            expire.setDate(expire.getDate() + 1);
                            // Set the members confirmation code and expiration to the ones generated
                            db.none(`UPDATE MEMBERS 
                            SET CONFIRM = $1, EXPIRE = $2 
                            WHERE EMAIL = $3`, [confirm, expire, email])
                            var message = "Please click the following link within 24 hours to confirm your email: tcss450group4.herokuapp.com/verify?confirm=" + confirm
                            // Sends the confirmation email.
                            sendEmail(email, "Email Confirmation", message);
                            res.send({
                                success: true,
                                message: "Email sent."
                            })
                        }
                        // If the user is already verified.
                        else {
                            res.send({
                                success: false,
                                error: "Email already verified."
                            })
                        }

                    }
                })
                .catch(error => {
                    console.log("ERROR", error);
                })
        }
    }
    // If the email is not given
    else {
        res.send({
            success: false,
            error: "Missing required user information."
        });
    }

});

module.exports = router;
