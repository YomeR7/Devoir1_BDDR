var MongoClient = require('mongodb').MongoClient;
var sqlite3 = require('sqlite3').verbose();

//fonction d'insertion des JSON dans la base de donnees MongoDB
 
    
    function insertSpellMongo(doc, dataBase, collection) {
        var promise= new Promise(function(resolve, result){
            const urlM = 'mongodb://localhost:27017';

            MongoClient.connect(urlM, { useUnifiedTopology: true, useNewUrlParser: true }, (err, client) => {
    
                if (err) throw err;
    
                const db = client.db(dataBase);
    
                //db.collection(collection).deleteMany();
                db.collection(collection).insertOne(doc).then((doc) => {
    
                    console.log('inserted')
    
                }).catch((err) => {
    
                    console.log(err);
                }).finally(() => {
    
                    client.close();
                });
            });
            resolve();
        }); 
    return promise;
}


function createTableSQL() {
    let db = new sqlite3.Database('./db/TP1.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the TP1 database.');
    });

    db.serialize(function () {
        db.run("DROP TABLE IF EXISTS spells");

        db.run("CREATE TABLE spells (name TEXT, level INTEGER, components TEXT, spell_resistance TEXT, class TEXT)");


    });
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Close the database connection.');
    });

}



//fonction d'insertion des JSON dans la base de donnees SQLite
function insertSpellSQL(doc) {
    let db = new sqlite3.Database('./db/TP1.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the TP1 database.');
    });
    //avoid sqlite_busy error
    db.configure("busyTimeout", 30000);

    
            db.run(`INSERT INTO spells VALUES (?,?,?,?,?)`,[doc.name,doc.level, doc.components,doc.spell_resistance,doc.class]); 


        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Close the database connection.');
        });

}

module.exports = {
    insertSpellMongo,
    createTableSQL,
    insertSpellSQL
}