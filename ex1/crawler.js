var request = require('request');
var cheerio = require('cheerio');

var url = "http://www.dxcontent.com/SDB_SpellBlock.asp?SDBID=";



for(i=1;i<=1600;i++){
JSONobject= new Object();
request(url+i, function (error, response, body) {
  if (!error) {
    var $ = cheerio.load(body)

    var title = $('title').text();
    var content = $('body').text();

    console.log('URL: ' + url);
    console.log('Title: ' + title);
  }
  else {
    console.log("We’ve encountered an error: " + error);
  }
});}