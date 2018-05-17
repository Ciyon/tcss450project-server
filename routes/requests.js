//express is the framework we're going to use to handle requests 
const express = require('express');
//Create a new instance of express 
const app = express();
//Create connection to Heroku Database 
let db = require('../utilities/utils').db;
var router = express.Router();
const bodyParser = require("body-parser");
router.use(bodyParser.json());

router.get("/getSentRequests", (req, res) => {
    let username = req.query['username']; 
    let query = `SELECT Username
    FROM Members JOIN Contacts ON Members.MemberId=Contacts.MemberID_A
    WHERE Verified=0 AND MemberID_A=(SELECT MemberId FROM Contacts WHERE Username=$1)`
    db.manyOrNone(query, [username]).then((rows) => {
        res.send({ messages: rows })
    }).catch((err) => {
        res.send({
            success: false, error: err
        })
    });
});

router.get("/getReceivedRequests", (req, res) => {
    let username = req.query['username']; 
    let query = `SELECT Username
    FROM Members JOIN Contacts ON Members.MemberId=Contacts.MemberID_B
    WHERE Verified=0 AND MemberID_B=(SELECT MemberId FROM Contacts WHERE Username=$1)`
    db.manyOrNone(query, [username, 0]).then((rows) => {
        res.send({ messages: rows })
    }).catch((err) => {
        res.send({
            success: false, error: err
        })
    });
});

module.exports = router;