//express is the framework we're going to use to handle requests
const express = require('express');
var router = express.Router();

router.get("/", (req, res) => {
    if (req.url.includes("?confirm=")) {
        db.result("SELECT * FROM MEMBERS WHERE CONFIRM= '" + req.query['confirm'] + "'")
            .then(result => {
                //console.log("RESULT", result.rows);
                if (result.rowCount == 0) {
                    res.send({
                        message: "Confirmation code doesn't match to any account."
                    })
                }
                else if (result.rowCount == 1) {
                        var today = new Date();
                        var expire = result.rows[0]["expire"];
                        if (expire >= today)
                        {
                            res.send({
                                message: "Account has been confirmed."
                            })
                        }

                        else
                        {
                            res.send({
                                message: "Link has expired. You can resend a new email on the login screen."
                            })
                        }
                            
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