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
    FROM Members JOIN Contacts ON Members.MemberId=Contacts.MemberID_B
    WHERE Verified=0 AND MemberID_A=(SELECT MemberId FROM Members WHERE Username=$1)`
    db.manyOrNone(query, [username]).then((rows) => {
        res.send({ requests: rows })
    }).catch((err) => {
        res.send({
            success: false, error: err
        })
    });
});

router.get("/getReceivedRequests", (req, res) => {
    let username = req.query['username']; 
    let query = `SELECT Username
    FROM Members JOIN Contacts ON Members.MemberId=Contacts.MemberID_A
    WHERE Verified=0 AND MemberID_B=(SELECT MemberId FROM Members WHERE Username=$1)`
    db.manyOrNone(query, [username, 0]).then((rows) => {
        res.send({ requests: rows })
    }).catch((err) => {
        res.send({
            success: false, error: err
        })
    });
});

router.post("/acceptRequest", (req, res) => {
    let username = req.body['username'];
    let contactname = req.body['contactname'];

    if (!username || !contactname) {
        res.send({ success: false, error: "username or contactname not supplied" });
        return;
    }

    let update = `UPDATE CONTACTS
                  SET Verified = 1
                  WHERE (MemberId_B = (SELECT MemberId FROM Members WHERE Username = $1) 
                  AND MemberId_A = (SELECT MemberId FROM Members WHERE Username = $2))`

    db.none(update, [username, contactname])
        .then(() => { res.send({ success: true }); })
        .catch((err) => {
            res.send({
                success: false, error: err,
            });
        });
});


module.exports = router;