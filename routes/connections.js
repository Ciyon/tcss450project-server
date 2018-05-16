//express is the framework we're going to use to handle requests 
const express = require('express');
//Create a new instance of express 
const app = express();
//Create connection to Heroku Database 
let db = require('../utilities/utils').db;
var router = express.Router();
const bodyParser = require("body-parser");
router.use(bodyParser.json());

/* Insert a new connection given the requester's username and the
   username of the contact to be added. Verified is auto initialized to 0. */
router.post("/addConnection", (req, res) => {
    let username = req.body['username'];
    let contactname = req.body['contactname'];
    if (!username || !contactname) {
        res.send({ success: false, error: "username or contactname not supplied" });
        return;
    }
    let insert = `INSERT INTO Contacts(MemberId_A, MemberId_B, Verified)
                SELECT MemberId FROM Members WHERE Username= $1,
                        MemberId FROM Members WHERE Username= $2`

    db.none(insert, [username, contactname])
        .then(() => { res.send({ success: true }); })
        .catch((err) => {
            res.send({
                success: false, error: err,
            });
        });
});

router.post("/removeConnection", (req, res) => {
    let username = req.body['username'];
    let contactname = req.body['contactname'];
    if (!username || !contactname) {
        res.send({ success: false, error: "username or contactname not supplied" });
        return;
    }

    let insert = `DELETE FROM Contacts
                  WHERE (MemberId_A IN (SELECT MemberId FROM Members WHERE MemberId = $1) 
                  AND MemberId_B IN (SELECT MemberId FROM Members WHERE MemberId = $2))
                  OR (MemberId_A IN (SELECT MemberId FROM Members WHERE MemberId = $2) 
                  AND MemberId_B IN (SELECT MemberId FROM Members WHERE MemberId = $1))`

    db.none(insert, [username, contactname])
        .then(() => { res.send({ success: true }); })
        .catch((err) => {
            res.send({
                success: false, error: err,
            });
        });
});

router.post("/acceptRequest", (req, res) => {
    let username = req.body['username'];
    let contactname = req.body['contactname'];

    if (!username || !contactname) {
        res.send({ success: false, error: "username or contactname not supplied" });
        return;
    }

    let insert = `UPDATE CONTACTS
                  SET Verified = 1
                  WHERE (MemberId_A IN (SELECT MemberId FROM Members WHERE MemberId = $1) 
                  AND MemberId_B IN (SELECT MemberId FROM Members WHERE MemberId = $2))
                  OR (MemberId_A IN (SELECT MemberId FROM Members WHERE MemberId = $2) 
                  AND MemberId_B IN (SELECT MemberId FROM Members WHERE MemberId = $1))`

    db.none(insert, [username, contactname])
        .then(() => { res.send({ success: true }); })
        .catch((err) => {
            res.send({
                success: false, error: err,
            });
        });
});

module.exports = router;