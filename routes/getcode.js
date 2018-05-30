//express is the framework we're going to use to handle requests
const express = require('express');

const crypto = require("crypto");

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

let sendEmail = require('../utilities/utils').sendEmail;

const bodyParser = require("body-parser");

var router = express.Router();
router.use(bodyParser.json());
router.post('/', (req, res) => {
    var email = req.body['email'];
    if (email) {
        if (!email.includes("@")) {
            res.send({
                success: false,
                error: "Email is invalid."
            })

        }
        else {
            db.result("SELECT * FROM MEMBERS WHERE EMAIL= $1", [email])
                .then(result => {
                    if (result.rowCount == 0) {
                        res.send({
                            success: false,
                            error: "Email doesn't belong to any account registered."
                        })
                    }
                    else if (result.rowCount == 1) {
                        var verify = result.rows[0]["verification"];
                        if (!verify) {
                            res.send({
                                success: false,
                                error: "Email must be confirmed in order to reset password."
                            })
                        }
                        else
                        {
                            var code = crypto.randomBytes(3).toString("hex");
                            var expire = new Date();
                            expire.setDate(expire.getDate() + 1);
                            db.none("UPDATE MEMBERS SET RESETCODE = $1, EXPIRE = $2 WHERE EMAIL = $3", [code, expire, email])
                            var message = "Please enter this code in the app within 24 hours to reset your password:\n" + code
                            sendEmail(email, "Code for Password Reset", message);
                            res.send({
                                success: true,
                                message: "Email sent."
                            })
                        }
                    }
                })
        }
    } else {
        res.send({
            success: false,
            input: req.body,
            error: "Missing required user information."
        });
    }
})

module.exports = router;