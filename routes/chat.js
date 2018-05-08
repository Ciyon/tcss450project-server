//express is the framework we're going to use to handle requests 
const express = require('express');
//Create a new instance of express 
const app = express();
//Create connection to Heroku Database 
let db = require('../utilities/utils').db;
var router = express.Router();
const bodyParser = require("body-parser");
router.use(bodyParser.json());
router.post("/createChat", (req, res) => {
    let username = req.body['username'];
    if (!username) {
        res.send({ success: false, error: "Username not supplied" });
        return;
    }
    let insert = `INSERT INTO Chats(Name)                   
                  SELECT $1`
    
    db.none(insert, [username])
        .then(() => { res.send({ success: true }); })
        .catch((err) => {
            res.send({
                success: false, error: err,
            });
        });
});

//TODO: Determine if we need a get for chats, and what it should return
/*
router.get("/getChat", (req, res) => {
    let chatId = req.query['chatId']; 
    let query = `SELECT ChatId, Name,                                  
    FROM Chats                 
    WHERE ChatId=$1`
    db.one(query, [after, chatId]).then((rows) => {
        res.send({ messages: rows })
    }).catch((err) => {
        res.send({
            success: false, error: err
        })
    });
});
*/
module.exports = router; 