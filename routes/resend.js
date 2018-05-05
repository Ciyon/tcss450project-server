//express is the framework we're going to use to handle requests
const express = require('express');

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

const bodyParser = require("body-parser");

let getCode = require('../utilities/utils').getCode;

let sendVerificationEmail = require('../utilities/utils').sendVerificationEmail;

var router = express.Router();
router.use(bodyParser.json());

router.post('/', (req, res) => {
    res.type("application/json");
    var email = req.body['email'].toLowerCase();
    if (email && email.includes("@")) {
        db.result("SELECT * FROM MEMBERS WHERE EMAIL = '" + email + "'")
            .then(result => {
                if (result.rowCount == 0) {
                    res.send({
                        success: false,
                        message: "Email doesn't belong to any account registered."
                    })
                }
                else if (result.rowCount == 1) {
                    var verify = result.rows[0]["verification"];
                    if (!verify) {
                        var expire = new Date();
                        var confirm = getCode().toString();
                        expire.setHours(expire.getHours() + 24);
                        db.none("UPDATE MEMBERS SET CONFIRM = $1, EXPIRE = $2 WHERE EMAIL = $3", [confirm, expire, email])
                        var URL = "localhost:5000/verify?confirm=" + confirm
                        //var URL = "tcss450group4.herokuapp.com/verify?confirm=" + confirm
                        sendVerificationEmail(email, URL);
                        res.send({
                            success: true,
                            message: "Email sent."
                        })
                    }
                    else {
                        res.send({
                            success: false,
                            message: "Email already verified."
                        })
                    }

                }
            })
            .catch(error => {
                console.log("ERROR", error);
            })
    }
    else {
        res.send({
            success: false,
            input: req.body,
            error: "Missing required user information"
        });
    }

});

module.exports = router;