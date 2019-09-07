var request = require('request');
var cheerio = require('cheerio');

var url = "http://www.dxcontent.com/SDB_SpellBlock.asp?SDBID=";

//for(let i=1;i<1601;i++){
    JSONobject= new Object();
    request(url+'1281', function (error, response, body) {
    if (!error) {
        var $ = cheerio.load(body);
        var name = $('.heading').map(function(i, el) {
            // this === el
            return $(this).text();
          }).get();

     //  console.log("spell "+i+": " +name) ;
     console.log("spell : " +name) ;
    }
    else {
        console.log("We’ve encountered an error: " + error);
    }
    });
//}