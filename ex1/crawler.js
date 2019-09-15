var request = require('request');
var cheerio = require('cheerio');

var url = "http://www.dxcontent.com/SDB_SpellBlock.asp?SDBID=";
//scrolling de toute les pages de sort
var JSONobject = new Object;
for (let i = 1; i < 1601; i++) {
    request(url + i, function (error, response, body) {
        if (!error) {
            var $ = cheerio.load(body);
            //nom du sort
            var name = $('.heading').map(function (i, el) {
                // this === el
                return $(this).text();
            }).get().join(', ');
            console.log(i);
            var spellCarac = $('p').map(function (i, el) {
                // this === el
                return $(this).text();
            }).get().join('\n');
            var level = spellCarac.match(/Level.*/g).toString().slice(6);
            //on récupère seulement les lettres des components : V,S,M,F,DF
            var components = spellCarac.match(/Components.*/g).toString().slice(11).match(/(M\/DF)|(F\/DF)|[VSMF]|(DF)/g);
            var spellRes;
            //in some case Spell res is not defined, 
            if (spellRes = spellCarac.match(/Spell Resistance.*/g)) {
                spellRes = spellRes.toString().slice(17).match(/(yes)|(no)|(none)/gi); //match yes/no/none en n'étant pas sensible a la casse
            }
            else {
                spellRes = 'undefined';
            }
            console.log("spell : " + name);
            console.log("level : " + level);
            console.log("components : " + components);
            console.log("spell resistance : " + spellRes);
            //creation de l'objet Json
            JSONobject = {
                name: name,
                level: level,
                components: components,
                spell_resistance: spellRes
            };
        }
        else {
            console.log("We’ve encountered an error: " + error);
        }
    });
}