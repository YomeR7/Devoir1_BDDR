var MongoClient = require('mongodb').MongoClient;

//url mongo
const urlM = 'mongodb://localhost:27017';

//le graph initial
var graph = [
    { _id: "PageA", value: { pageRank: 1.0, outlinks: ["PageC", "PageB"] } },
    { _id: "PageB", value: { pageRank: 1.0, outlinks: ["PageC"] } },
    { _id: "PageC", value: { pageRank: 1.0, outlinks: ["PageA"] } },
    { _id: "PageD", value: { pageRank: 1.0, outlinks: ["PageC"] } }]

//connection a MongoDB
MongoClient.connect(urlM, { useUnifiedTopology: true, useNewUrlParser: true }, (err, client) => {
    //gestion des erreurs
    if (err) throw err;
    //connection OK
    console.log("Connected successfully to server");

    //notre Base de donnees
    const db = client.db("DB");

    //on clear la table avant d'inserer
    db.collection("pageRank").deleteMany();

    //on insere le graph initial
    db.collection("pageRank").insertMany(graph).then(function () {

        //la fonction map
        function map() {
            for (let i = 0; i < this.value.outlinks.length; i++) {
                emit(this.value.outlinks[i], this.value.pageRank / this.value.outlinks.length);
            }
            emit(this._id, 0);
            emit(this._id, this.value.outlinks);
        }

        //la fonction reduce
        function reduce(url, list_pr_or_urls) {
            var outlink_list = [];
            var pagerank = 0.0;
            const DAMPING_FACTOR = 0.85;
            for (var i = 0; i < list_pr_or_urls.length; i++) {
                if (list_pr_or_urls[i] instanceof Array) {
                    outlink_list = list_pr_or_urls[i];
                } else {
                    pagerank += list_pr_or_urls[i];
                }
            }
            pagerank = 1.0 - DAMPING_FACTOR + (DAMPING_FACTOR * pagerank);
            return { pageRank: pagerank, outlinks: outlink_list };

        }

        //la fonction d iteration du pagerank
        function pageRankIt(i, max) {

            db.collection("pageRank").mapReduce(map,
                reduce,
                {
                    out: { replace: "pageRank" }
                })
                .then(function (collection) {
                    collection.find().toArray().then(function (data) {
                        //on visualise en console le resultat
                        console.log(data);
                        console.log("it ", i);
                        if (i < max) {
                            pageRankIt(i + 1, max);
                        } else {
                            console.log("c'est fini!");
                            client.close();
                        }

                    });
                });
        };

        //on test avec 20 iterations
        pageRankIt(0, 20);
    });
});


