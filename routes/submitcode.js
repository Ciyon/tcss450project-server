//express is the framework we're going to use to handle requests
const express = require('express');

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

const bodyParser = require("body-parser");

var router = express.Router();
router.use(bodyParser.json());

router.post('/', (req, res) => {
    res.type("application/json");
    var code = req.body['code'];
    if (code) {
            db.result("SELECT * FROM MEMBERS WHERE RESETCODE= $1", [code])
                .then(result => {
                    if (result.rowCount == 0) {
                        res.send({
                            success: false,
                            error: "Reset Code doesn't belong to any account registered."
                        })
                    }
                    else if (result.rowCount == 1) {
                        var today = new Date();
                        var expire = result.rows[0]["expire"];
                        if (expire >= today)
                        {
                            res.send({
                                success: true
                            })
                        }
                        else
                        {

                            res.send({
                                success: false,
                                error: "Code has expired."
                            })
                        }
                    }
                })
    } else {
        res.send({
            success: false,
            input: req.body,
            error: "Missing required code information"
        });
    }
})

module.exports = router;