var sqlite3 = require('sqlite3').verbose();


function selectSQL(){
 
    let db = new sqlite3.Database('./db/TP1.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the TP1 database.');
});
//avoid sqlite_busy error
db.configure("busyTimeout", 30000);
db.serialize(function () {
    db.run("DROP TABLE IF EXISTS findSpells");

    db.run("CREATE TABLE findSpells (name TEXT, level INTEGER, components TEXT, spell_resistance TEXT)");
    db.run(`INSERT INTO findSpells SELECT * FROM spells WHERE components ='V' AND level <=4` ); 


});
db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Close the database connection.');
});


}


selectSQL();