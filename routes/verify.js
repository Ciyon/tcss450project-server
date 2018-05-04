//express is the framework we're going to use to handle requests
const express = require('express');
var router = express.Router();

router.get("/", (req, res) => {
    res.send({
        //req.query is a reference to arguments in the url
        message: "Account has been confirmed with confirmation code " + req.query['confirm'] + ".",
        
    });
    var query = "UPDATE MEMBERS SET VERIFICATION = 1 WHERE CONFIRM = '" + req.query['confirm'] + "'";

    db.result(query)
    db.none("UPDATE MEMBERS SET Confirm = NULL, Expire = NULL WHERE Verification = 1")
});

module.exports = router;