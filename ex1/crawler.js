var request = require('request');
var cheerio = require('cheerio');
var insert = require('./insertDB.js');


//scrolling de toutes les pages de sort
function crawl() {
    console.log('CRAWLING...');
    //url du site a scroller
    var url = "http://www.dxcontent.com/SDB_SpellBlock.asp?SDBID=";
    var crawlResult = new Array();

    //on parcourt les pages entre 1 et 1600 
    for (let i = 1; i < 1976; i++) {
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

                //level du sort
                var level = spellCarac.match(/\<b\>Level\<\/b\>.*/g);
                //classe de personnage pouvant faire le sort
                var dndClass = null;
                var dndClassSQL = null; // en sql il faut que ce soit un String et non un tableau
                var levelint = null;
                if (level) {
                    level = level[0].slice(13);
                    dndClass = level;
                    dndClass = dndClass.slice(0, -1);
                    dndClass = dndClass.trim().split(/\s[0-9],*\s*/g); //on enleve les chiffres des levels pour ne garder que les classes (wizard etc..)
                    dndClassSQL = dndClass.toString();
                    var wizard = level.match(/wizard.*/g);
                    if (wizard) { //on prend le level du wizard s,il existe
                        level = wizard.toString().match(/[0-9]/g)[0];
                    }
                    else {//sinon on prend n'importe quel level
                        level = level.match(/[0-9]/g)[0];
                    }
                    levelint = parseInt(level); //on veut l'inserer en tant qu'integer dans la bdd
                }

                //components du sort
                var components = spellCarac.match(/\<b\>Components\<\/b\>.*/g);
                var componentsSQL = null; // en sql il faut que ce soit un String et non un tableau

                if (components) {
                    components = components[0].slice(18).match(/(M\/DF)|(F\/DF)|[VSMF]|(DF)/g); //on récupère seulement les lettres des components : V,S,M,F,DF


                    if (components) {
                        componentsSQL = components.toString();
                    }
                }


                var description = $('.SPDesc p').map(function (i, el) {
                    // this === el
                    return $(this).text();
                }).get().join('\n');

                //spell resistance du sort
                var spellRes = spellCarac.match(/\<b\>Spell Resistance\<\/b\>.*/g);
                //in some case Spell res is not defined, 
                if (spellRes) {
                    spellRes = spellRes[0].slice(24).match(/(yes)|(no)|(none)/gi); //match yes/no/none en n'étant pas sensible a la casse
                    if (spellRes) {
                        spellRes = spellRes[0];
                    } else {
                        spellRes = false;
                    }
                }
                else {
                    spellRes = false;
                }

                if (myArgs[0] == "sql") {
                    //objectSQL
                    var SQL = {
                        name: name,
                        class: dndClassSQL,
                        level: levelint,
                        components: componentsSQL,
                        spell_resistance: spellRes
                    };
                    console.log(SQL);

                    crawlResult.push(SQL);
                } else {
                    //creation de l'objet Json
                    var JSONobj = {
                        name: name,
                        class: dndClass,
                        level: levelint,
                        components: components,
                        spell_resistance: spellRes,
                        description :description
                    };
                    console.log(JSONobj);
                    crawlResult.push(JSONobj);


                }



            }
            else {
                console.log("We’ve encountered an error: " + error);
            }
        });

    }

    return crawlResult; //on retourne le tableau

}



var myArgs = process.argv.slice(2);
console.log('myArgs: ', myArgs);

switch (myArgs[0]) {
    case 'mongo':
        var result = crawl();
        setTimeout(function () {
            insert.insertSpellMongo(result); //on insere dans Mongo
        }, 15000); //on laisse un delai de 15 secondes avant d'inserer pour que le crawler ait fini son execution

        break;
    case 'sql':
        insert.createTableSQL();
        var result = crawl();
        setTimeout(function () {
            insert.insertSpellSQL(result); //on insere en sql
        }, 15000); //on laisse un delai de 15 secondes avant d'inserer pour que le crawler ait fini son execution
        break;
    default:
        console.log('Il manque un parametre : entrez \'node crawler sql\' pour une insertion en sqlite, et \'node crawler mongo\' pour une insertion en mongoDB');
}

