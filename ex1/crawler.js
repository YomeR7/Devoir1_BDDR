var request = require('request');
var cheerio = require('cheerio');

var url = "http://www.dxcontent.com/SDB_SpellBlock.asp?SDBID=";

let req=0;
for(let i=1;i<1601;i++){
    JSONobject= new Object();
   
    request(url+i, function (error, response, body) {
        req++;
    if (!error) {
        var $ = cheerio.load(body);
        var title = $('.heading').text();

        console.log("spell "+i+": " +title) ;
    }
    else {
        console.log("We’ve encountered an error: " + error);
    }
    });
}