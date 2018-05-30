//express is the framework we're going to use to handle requests 
const express = require('express');
//Create a new instance of express 
const app = express();
//Create connection to Heroku Database 
let db = require('../utilities/utils').db;
var router = express.Router();
const bodyParser = require("body-parser");
router.use(bodyParser.json());

//createChat creates a new chat session / inserts it into the Chats table
router.post("/createChat", (req, res) => {
    // TODO: determine what name should be?
    let username = req.body['username'];
    if (!username) {
        res.send({ success: false, error: "name not supplied" });
        return;
    }
    let insert = `INSERT INTO Chats(MemberId)
                  SELECT MemberId FROM Members                   
                  WHERE Username=$1`

    db.none(insert, [username])
        .then(() => {
            let select = `SELECT ChatId From Chats 
                          WHERE MemberId = (SELECT MemberId FROM Members WHERE Username=$1) 
                          ORDER BY ChatId DESC LIMIT 1;`
            db.one(select, [username])
                .then((rows) => {
                    let chatid = rows['chatid'];
                    res.send({ success: true, chatid });
                })
                .catch((err) => {
                    res.send({
                        success: false, error: err,
                    });
                });

        })
        .catch((err) => {
            res.send({
                success: false, error: err,
            });
        });
});


// /joinChat inserts a tuple into ChatMembers
router.post("/joinChat", (req, res) => {
    let username = req.body['username'];
    let chatId = req.body['chatId'];
    if (!username || !chatId) {
        res.send({ success: false, error: "Username or chatId not supplied" });
        return;
    }
    // Do we need to check if they are already in the chat?
    let insert = `INSERT INTO ChatMembers(ChatId, MemberId)                   
                  SELECT $1, MemberId FROM Members                   
                  WHERE Username=$2`

    db.none(insert, [chatId, username])
        .then(() => { res.send({ success: true }); })
        .catch((err) => {
            res.send({
                success: false, error: err,
            });
        });
});

// Adds all memberids given to the chatid given
router.post("/addAllToChat", (req, res) => {
    let select = 'INSERT INTO ChatMembers(chatId, memberId) VALUES ';
    //build a string of values to insert of format ((chatid, memberid), ...)
    let chatId = req.body["chatId"];
    let count = 1;

    let obj = "memberId" + count;
    count++;
    let id = req.body[obj];
    //append first value in format "(chatId, memberId)""
    if (id != null) {
        select += '(' + chatId + ', ';
        select += id + ')';
    }

    //append the other values in format ", (chatId, memberId)"
    for (var key in req) {
        obj = "memberId" + count;
        count++;
        id = req.body[obj];

        if (id != null) {
            select += ', (' + chatId + ', ';
            select += id + ')';
        }
    }

    db.none(select)
        .then((rows) => {
            res.send({ success: true })
        }).catch((err) => {
            res.send({
                success: false,
                error: err
            })
        })
});


// Get the chatIds of chats sessions a user is part of

router.post("/getChatId", (req, res) => {
    let username = req.body['username'];
    let query = `SELECT ChatId                                  
                    FROM ChatMembers                 
                    WHERE MemberId=(SELECT MemberId FROM Members WHERE Username=$1)`
    // if(!username) {
    //     res.send({success: false, error: "Username or chatId not supplied"});
    // }

    db.manyOrNone(query, [username]).then((rows) => {
        res.send({ success: true, chats: rows })
    }).catch((err) => {
        res.send({
            success: false, error: err
        })
    });
});

//Returns all members in a chat aside from the user who made the request
router.post("/getChatMembers", (req, res) => {
    let username = req.body['username'];
    let chatId = req.body['chatId'];
    let query = 'SELECT Members.Username FROM Members JOIN ChatMembers ON Members.MemberId = ChatMembers.MemberId WHERE chatId = $1 AND NOT(Members.Username = $2)'
    db.manyOrNone(query, [chatId, username]).then((rows) => {
        res.send({ success: true, members: rows })
    }).catch((err) => {
        res.send({
            success: false, error: err
        })
    });
});

// Removes the username from the given chatid
router.post("/leaveChat", (req, res) => {
    let username = req.body['username'];
    let chatId = req.body['chatId'];
    if (username && chatId) {

        let del = `DELETE FROM ChatMembers
                        WHERE ChatId = $1 AND MemberId = 
                        (SELECT MemberId FROM Members WHERE Username=$2)`

        db.none(del, [chatId, username])
            .then(() => { res.send({ success: true }); })
            .catch((err) => {
                res.send({
                    success: false, error: err,
                })
            });

    } else {
        if (!username) {
            res.send({ success: false, error: "Username not supplied" });
            return;
        }
        if (!chatId) {
            res.send({ success: false, error: "chatId not supplied" });
            return;
        }
    }

});

// Retrieves all chat information for the given user
router.post("/getChatInformation", (req, res) => {
    let username = req.body['username'];
    if (username) {
        let select = `SELECT ChatId, Username FROM ChatMembers
                      JOIN Members ON Members.MemberId = ChatMembers.MemberId
                      WHERE ChatId IN (SELECT ChatId FROM ChatMembers WHERE MemberId = (SELECT MemberId FROM Members WHERE Username= $1))
                      Group by ChatId, Username;`

        db.result(select, [username]).then((result) =>
        {
        if (result.rowCount == 0)
        {
            res.send({ success: false, error: "ChatInformation not found for given username"})
        }
        else
        {
            res.send({success: true, chatInformation: result.rows})
        }
    })
    }

});
module.exports = router; 