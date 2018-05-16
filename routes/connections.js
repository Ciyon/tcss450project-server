//express is the framework we're going to use to handle requests 
const express = require('express');
//Create a new instance of express 
const app = express();
//Create connection to Heroku Database 
let db = require('../utilities/utils').db;
var router = express.Router();
const bodyParser = require("body-parser");
router.use(bodyParser.json());


router.post("/addConnection", (req, res) => {
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
