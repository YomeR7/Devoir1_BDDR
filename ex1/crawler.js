var request = require('request');
var cheerio = require('cheerio');
var MongoClient = require('mongodb').MongoClient;
var sqlite3 = require('sqlite3').verbose();

var JSONobject = new Object;

//fonction d'insertion des JSON dans la base de donnees MongoDB
function insertSpellMongo(doc) {
    const urlM = 'mongodb://localhost:27017';

    MongoClient.connect(urlM, { useUnifiedTopology: true, useNewUrlParser: true }, (err, client) => {

        if (err) throw err;

        const db = client.db("DB");


        db.collection('spells').insertOne(doc).then((doc) => {

            console.log('inserted')

        }).catch((err) => {

            console.log(err);
        }).finally(() => {

            client.close();
        });
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

    db.serialize(function () {
        // a faire : INSERT en SQL du sort 

    });
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Close the database connection.');
    });
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

        db.run("CREATE TABLE spells (name TEXT, level INTEGER, components TEXT, spell_resistance TEXT)");


    });
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Close the database connection.');
    });

}



//scrolling de toutes les pages de sort
function crawl() {

    //creation de la table pour la bd SQLite
    createTableSQL();
    //url du site a scroller
    var url = "http://www.dxcontent.com/SDB_SpellBlock.asp?SDBID=";

    //on parcourt les pages entre 1 et 1600 
    for (let i = 1; i < 1601; i++) {
        request(url + i, function (error, response, body) {
            if (!error) {
                var $ = cheerio.load(body); //on recupere le body de la page html

                //nom du sort
                var name = $('.heading').map(function (i, el) {
                    // this === el
                    return $(this).text();
                }).get().join(', ');
                console.log(i);
                var spellCarac = $('.SpellDiv p.SPDet').map(function (i, el) {
                    // this === el
                    return $(this).html();
                }).get().join('\n');
                var level = spellCarac.match(/\<b\>Level\<\/b\>.*/g);
                var levelint = null;
                if (level) {
                    level = level[0].slice(13);
                    var wizard = level.match(/wizard.*/g);
                    if (wizard) { //on prend le level du wizard s,il existe
                        level = wizard.toString().match(/[0-9]/g)[0]
                    }
                    else {//sinon on prend n'importe quel level
                        level = level.match(/[0-9]/g)[0];
                    }
                    levelint = parseInt(level); //on veut l'inserer en tant qu'integer dans la bdd

                }
                //on récupère seulement les lettres des components : V,S,M,F,DF
                var components = spellCarac.match(/\<b\>Components\<\/b\>.*/g)
                if (components) {
                    components = components[0].slice(18).match(/(M\/DF)|(F\/DF)|[VSMF]|(DF)/g);
                }

                var spellRes = spellCarac.match(/\<b\>Spell Resistance\<\/b\>.*/g);
                //in some case Spell res is not defined, 
                if (spellRes) {
                    spellRes = spellRes[0].slice(24).match(/(yes)|(no)|(none)/gi); //match yes/no/none en n'étant pas sensible a la casse
                }
                else {
                    spellRes = false;
                }

                //creation de l'objet Json
                JSONobject = {
                    name: name,
                    level: levelint,
                    components: components,
                    spell_resistance: spellRes
                };
                //insertion dans la base de donnees
                insertSpellMongo(JSONobject);
                insertSpellSQL(JSONobject);

            }
            else {
                console.log("We’ve encountered an error: " + error);
            }
        });

    }
}

crawl();
