//express is the framework we're going to use to handle requests
const express = require('express');
var router = express.Router();

router.get("/", (req, res) => {
    if (req.url.includes("?confirm=")) {
        console.log("Confirm: " + req.query['confirm']);
        db.result("SELECT 1 FROM MEMBERS WHERE CONFIRM= '" + req.query['confirm'] + "'")
            .then(result => {
                console.log("RESULT", result);
                if (result.rowCount == 0) {
                    res.send({
                        message: "Confirmation code doesn't match to any account."
                    })
                }
                else if (result.rowCount == 1) {
                        res.send({
                            message: "Account has been confirmed."
                        })
                }

            })
            .catch(error => {
                console.log("ERROR", error);
            })
        db.result("UPDATE MEMBERS SET VERIFICATION = 1 WHERE CONFIRM = '" + req.query['confirm'] + "'")
        db.none("UPDATE MEMBERS SET CONFIRM = NULL, EXPIRE = NULL WHERE Verification = 1")
    }
    else {
        res.send({
            message: "Invalid URL."
        })
    }

});

module.exports = router;