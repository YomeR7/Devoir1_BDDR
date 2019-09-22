const MongoClient = require('mongodb').MongoClient;


const url = 'mongodb://localhost:27017';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {

    if (err) throw err;
    console.log("Connected successfully to server");
   
    const db = client.db("DB");

    var map = function () {
        var key = this.name

        var mapped = {
            spellLevel: this.level,
            spellComponent: this.components
        }
        emit (key, mapped)
    }

    var reduce = function (values){
        return values
    }
    db.collection("spells").mapReduce(map, 
        reduce,
        {
            out:    {replace:"testSpell"},
            query:  {   
                        level: { $lt: 5 },
                        components: ["V"]
                    }
        })
      console.log("End");
      client.close();
  });

