//express is the framework we're going to use to handle requests
const express = require('express');
var router = express.Router();

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

router.get("/", (req, res) => {
    if (req.url.includes("?confirm=")) {
        db.result(`SELECT * FROM MEMBERS
                   WHERE CONFIRM= $1`, [req.query['confirm']])
            .then(result => {
                if (result.rowCount == 0) {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.write("<h1>Confirmation code doesn't match to any account.</h1>")
                    res.end();
                }
                else if (result.rowCount == 1) {
                        var today = new Date();
                        var expire = result.rows[0]["expire"];
                        if (expire >= today)
                        {
                            res.writeHead(200, {'Content-Type': 'text/html'});
                            res.write("<h1>Account has been confirmed.</h1>")
                            res.end();
                        }

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
        db.none(`UPDATE MEMBERS 
                SET VERIFICATION = 1, CONFIRM = NULL, EXPIRE = NULL 
                WHERE CONFIRM = $1`, [req.query['confirm']])
    }
    else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write("<h1>Invalid URL.</h1>")
        res.end();
    }

});

module.exports = router;