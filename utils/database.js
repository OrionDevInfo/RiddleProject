const mysql = require('mysql');

module.exports = {
    con: mysql.createConnection({
        host: "164.132.108.164",
        user: "orion",
        password: "mdporion",
        database: "RiddleProject"
    })
};
