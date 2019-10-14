const MongoClient = require('mongodb').MongoClient;


const url = 'mongodb://localhost:27017';

// Use connect method to connect to the server

function map() {
    var key = this.name

    var mapped = {
        spellLevel: this.level,
        spellComponent: this.components,
        class: this.class
    }
    emit (key, mapped);
}

function reduce(key, values){
    return values
}

function FindSpellMongo(){

        MongoClient.connect(url, { useUnifiedTopology: true, useNewUrlParser: true }, (err, client) => {
            if (err) throw err;
            console.log("Connected successfully to server");
           
            const db = client.db("DB");
        db.collection("spells").mapReduce(map, 
            reduce,
            {
                out:    {replace:"findSpell"},
                query:  {   
                            level: { $lt: 5 },
                            components: ["V"],
                            class: "sorcerer/wizard"
                        }
            })
          console.log("Fin du Map Reduce");
          client.close();
      });
}

FindSpellMongo();