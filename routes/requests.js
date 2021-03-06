//express is the framework we're going to use to handle requests 
const express = require('express');
//Create a new instance of express 
const app = express();
//Create connection to Heroku Database 
let db = require('../utilities/utils').db;
var router = express.Router();
const bodyParser = require("body-parser");
router.use(bodyParser.json());

// Retrieve all requests that have been sent by the user
router.post("/getSentRequests", (req, res) => {
    let username = req.body['username'];
    let query = `SELECT Username
    FROM Members JOIN Contacts ON Members.MemberId=Contacts.MemberID_B
    WHERE Verified=0 AND MemberID_A=(SELECT MemberId FROM Members WHERE Username=$1)`
    db.manyOrNone(query, [username]).then((rows) => {
        res.send({ success: true, requests: rows })
    }).catch((err) => {
        res.send({
            success: false, error: err
        })
    });
});

// Retrieve all requests that have been sent to the user
router.post("/getReceivedRequests", (req, res) => {
    let username = req.body['username'];
    let query = `SELECT Username
    FROM Members JOIN Contacts ON Members.MemberId=Contacts.MemberID_A
    WHERE Verified=0 AND MemberID_B=(SELECT MemberId FROM Members WHERE Username=$1)`
    db.manyOrNone(query, [username, 0]).then((rows) => {
        res.send({ success:true, requests: rows })
    }).catch((err) => {
        res.send({
            success: false, error: err
        })
    });
});

// Given a username and contactname, establishes a connection
router.post("/acceptRequest", (req, res) => {
    let username = req.body['username'];
    let contactname = req.body['contactname'];

    if (!username || !contactname) {
        res.send({ success: false, error: "username or contactname not supplied" });
        return;
    }
    let select = `SELECT * FROM CONTACTS
                  WHERE MemberId_B = (SELECT MemberId FROM Members WHERE Username = $1) 
                  AND MemberId_A = (SELECT MemberId FROM Members WHERE Username = $2)
                  AND Verified = 0`

    db.result(select, [username, contactname])
        .then((result) => {
            if (result.rowCount == 0) {
                res.send({
                    success: false, error: "Connection doesn't exist.",
                });
            }
            
            else {
                let update = `UPDATE CONTACTS
                              SET Verified = 1
                              WHERE MemberId_B = (SELECT MemberId FROM Members WHERE Username = $1) 
                              AND MemberId_A = (SELECT MemberId FROM Members WHERE Username = $2)`

                db.none(update, [username, contactname])
                    .then(() => { res.send({ success: true }); })
                    .catch((err) => {
                        res.send({
                            success: false, error: err,
                        });
                    });
            }
        })
        .catch((err) => {
            res.send({
                success: false, error: err,
            });
        });

});


module.exports = router;