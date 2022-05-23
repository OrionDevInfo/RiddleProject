const mysql = require('mysql');

module.exports = {
    con: mysql.createConnection({
        host: "",
        user: "",
        password: "",
        database: ""
    })
};
