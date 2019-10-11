var cheerio = require('cheerio');
var MongoClient = require('mongodb').MongoClient;

function dropCollection(dataBase,collection){
    const urlM = 'mongodb://localhost:27017';

    MongoClient.connect(urlM, { useUnifiedTopology: true, useNewUrlParser: true }, (err, client) => {

        if (err) throw err;

        const db = client.db(dataBase);
        db.dropCollection(collection).catch((err) => {
            console.log(err);
        }).finally(() => {
            client.close();
        });
    })
}

function insertSpellMongo(doc, dataBase, collection) {
    const urlM = 'mongodb://localhost:27017';

    MongoClient.connect(urlM, { useUnifiedTopology: true, useNewUrlParser: true }, (err, client) => {

        if (err) throw err;

        const db = client.db(dataBase);
        db.collection(collection).insertOne(doc).then((doc) => {

            console.log('inserted')

        }).catch((err) => {

            console.log(err);
        }).finally(() => {

            client.close();
        });
    });
}

function PageRank(){
    var graph =[
        {id:"PageA", value: {pageRank:1, link:["PageC","PageB"]}},
        {id:"PageB", value: {pageRank:1, link:"PageC"}},
        {id:"PageC", value: {pageRank:1, link:"PageA"}},
        {id:"PageD", value: {pageRank:1, link:"PageC"}},
    ]
    dropCollection("DB","pageRank");
    for(var i = 0; i<graph.length; i++){
        insertSpellMongo(graph[i], "DB", "pageRank");
    }

}

var map = function() {
    var id = this.id;
    
    var value = {
        pageRank:this.pageRank/this.value.link.length
    }
    
}



function PgIteration(i,max,cb){

}

PageRank()