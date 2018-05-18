//express is the framework we're going to use to handle requests 
const express = require('express');
//Create a new instance of express 
const app = express();
//Create connection to Heroku Database 
let db = require('../utilities/utils').db;
var router = express.Router();
const bodyParser = require("body-parser");
router.use(bodyParser.json());

// /createChat creates a new chat session / inserts it into the Chats table
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
        .then(() => { res.send({ success: true }); })
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
        res.send({ success:true, chats: rows })
    }).catch((err) => {
        res.send({
            success: false, error: err
        })
    });
});

router.post("/getChatMembers", (req, res) => {
    let chatId = req.body['chatId'];
    let username = req.body['username']; 
    let query = `SELECT Username                                   
                    FROM Members                 
                    WHERE MemberId=(SELECT MemberId FROM ChatMembers WHERE ChatId=$1) 
                          AND NOT MemberId = (SELECT MemberId FROM Members WHERE Username=$2)`
    
        db.manyOrNone(query, [chatId, username]).then((rows) => {
            res.send({ success:true, chats: rows })
        }).catch((err) => {
            res.send({
                success: false, error: err
            })
        });
});


router.post("/leaveChat", (req, res) => {
    let username = req.body['username']; 
    let chatId = req.body['chatId'];
    if(username && chatId) {
        
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
module.exports = router; 