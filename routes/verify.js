//express is the framework we're going to use to handle requests
const express = require('express');
var router = express.Router();

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

/**
 * Checks whether the confirmation code given in the URL is linked to an account, if it is,
 * set the account to verified status
 **/  
router.get("/", (req, res) => {
    if (req.url.includes("?confirm=")) {

        // Selects all members where the confirmation code is the one given
        db.result(`SELECT * FROM MEMBERS WHERE CONFIRM= $1`, [req.query['confirm']])
            .then(result => {

                // If the confirmation code doesnt match to any account
                if (result.rowCount == 0) {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.write("<h1>Confirmation code doesn't match to any account.</h1>")
                    res.end();
                }
                // If the confirmation code belongs to an account
                else if (result.rowCount == 1) {
                        // Get todays date
                        var today = new Date();
                        // Get the expiration of the code
                        var expire = result.rows[0]["expire"];
                        // If the code isn't expired, set the user to verified
                        if (expire >= today)
                        {
                            res.writeHead(200, {'Content-Type': 'text/html'});
                            res.write("<h1>Account has been confirmed.</h1>")
                            res.end();
                            db.none(`UPDATE MEMBERS 
                                     SET VERIFICATION = 1, CONFIRM = NULL, EXPIRE = NULL 
                                     WHERE CONFIRM = $1`, [req.query['confirm']])
                        }
                        
                        // If it is expired
                        else
                        {
                            res.writeHead(200, {'Content-Type': 'text/html'});
                            res.write("<h1>Link has expired.</h1>")
                            res.end();
                        }
                            
                }

            })
            .catch(error => {
                console.log("ERROR", error);
            })
    }
    // If the link doesn't contain "?confirm" in it
    else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write("<h1>Invalid URL.</h1>")
        res.end();
    }

});

module.exports = router;