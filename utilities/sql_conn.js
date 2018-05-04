const pgp = require('pg-promise')();
//We have to set ssl usage to true for Heroku to accept our connection
pgp.pg.defaults.ssl = true;

//Create connection to Heroku Database
db = pgp('postgres://yvmhuybalvutev:c34bd4875d76a3c00098a97f4aa782a9a576d242c8075567aaf8c26a8ed9b0d5@ec2-23-23-142-5.compute-1.amazonaws.com:5432/d8ej04d1ilccq3');
if (!db) {
    console.log("SHAME! Follow the intructions and set your DATABASE_URL correctly");
    process.exit(1);
}

module.exports = db;
