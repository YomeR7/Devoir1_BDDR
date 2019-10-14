var MongoClient = require('mongodb').MongoClient;
var sqlite3 = require('sqlite3').verbose();

//fonction d'insertion des JSON dans la base de donnees MongoDB


function insertSpellMongo(doc) {
    const urlM = 'mongodb://localhost:27017/DB/connectTimeoutMS=100000';

    MongoClient.connect(urlM, { useUnifiedTopology: true, useNewUrlParser: true }, (err, client) => {

        if (err) throw err;

        const db = client.db("DB");

        //on clear la table avant d'inserer
        db.collection("spells").deleteMany();

        db.collection('spells').insertMany(doc).then((doc) => {

            console.log('inserted Mongo')

        }).catch((err) => {

            console.log(err);
        }).finally(() => {

            client.close();
        });
    });
}


function createTableSQL() {
    let db = new sqlite3.Database('./db/TP1.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        //Connected to the SQL TP1 database
    });

    db.serialize(function () {
        db.run("DROP TABLE IF EXISTS spells");

        db.run("CREATE TABLE spells (name TEXT, level INTEGER, components TEXT, spell_resistance TEXT, class TEXT)");
        console.log('Table SQL created.');

    });
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        //Close the SQL database connection.
    });

}



//fonction d'insertion des JSON dans la base de donnees SQLite
function insertSpellSQL(document) {
    let db = new sqlite3.Database('./db/TP1.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
    });
    //avoid sqlite_busy error
    db.configure("busyTimeout", 50000);
    for (i = 0; i < document.length; i++) {
        var doc = document[i];
        db.run(`INSERT INTO spells VALUES (?,?,?,?,?)`, [doc.name, doc.level, doc.components, doc.spell_resistance, doc.class]);
    }
    console.log('Inserted SQL');

    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
    });

}

module.exports = {
    insertSpellMongo,
    createTableSQL,
    insertSpellSQL
}