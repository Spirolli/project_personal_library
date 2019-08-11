/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
const MONGODB_CONNECTION_STRING = process.env.DB;
const db_name = 'books';

//HELPER FUNCTIONS

function debugStatement(statement) {
  if (process.env.DEBUG === 'yes') {console.log(statement);}
}

module.exports = function (app) {

  app.route('/api/books/')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    debugStatement('\t==> GETTING (WITHOUT ID)');
    MongoClient.connect(MONGODB_CONNECTION_STRING, {useNewUrlParser: true}, function(err, connection) {
      if (err) console.log('There was an error connecting to the database');
      else {
        debugStatement('\tConnected to database.');
        const db = connection.db();
        db.collection(db_name).find({}, function (err, cursor) {
          if (err) console.log("There was an error in querying database: " + err);
          else {
            cursor.toArray(function (err, data) {
              var returnValue = [];
              data.forEach((elem) => {
                var numComments = elem.comments.length;
                delete elem.comments;
                elem["commentcount"] = numComments;
                returnValue.push(elem);
              });
              res.json(returnValue);
            });
          }
        });
      }
    });
    })
    
    .post(function (req, res){
      var title = req.body.title;
    
    if (!title) {return res.send("No title given");}
      //response will contain new book object including atleast _id and title
    debugStatement('\t==> POSTING (WITHOUT ID)');
      MongoClient.connect(MONGODB_CONNECTION_STRING, {useNewUrlParser: true}, function(err, connection) {
        if (err) console.log("There was an error connecting to the database.");
        else {
          debugStatement('\tConnected to database.');
          const db = connection.db();
          db.collection(db_name).insertOne({"title": title, "comments": []}, function (err, data) {
            if (err) console.log("Error in posting: " + err);
            else {
              res.json(data.ops[0]);
            }
          });
        }
      });
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      debugStatement('\t==> DELETING (WITHOUT ID)');
      MongoClient.connect(MONGODB_CONNECTION_STRING, {useNewUrlParser: true}, function(err, connection) {
        if (err) console.log("There was an error connecting to the database.");
        else {
          debugStatement("\tConnected to database.");
          const db = connection.db();
          db.collection(db_name).deleteMany({}, function (err, res) {
            if (err) {console.log("Error in posting to database.");}
            else {
              res.send("complete delete successful");
            }
          });
        }
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
    if (!ObjectId.isValid(req.params.id)) {
      debugStatement("\t!Problem: Not a valid hexString for ObjectId")
      return res.send("no book exists")
    }
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      MongoClient.connect(MONGODB_CONNECTION_STRING, {useNewUrlParser: true}, function(err, connection) {
        if (err) console.log("There was an error connecting to the database.");
        else {
          debugStatement("\tConnected to database.");
          const db = connection.db();
          var bookid = ObjectId.createFromHexString(req.params.id);
          db.collection(db_name).findOne({_id: bookid}, function (err, data) {
            debugStatement("\tQuery identified");
            if (err) console.log("There was an error querying database: " + err);
            else {
              if (!data) {
                res.send("no book exists");
              } else {
                res.json(data);
              }
            }
          });
        }
      });
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
      MongoClient.connect(MONGODB_CONNECTION_STRING, {useNewUrlParser: true}, function(err, connection) {
        if (err) console.log("There was an error connecting to the database.");
        else {
          debugStatement("\tConnected to database.");
          const db = connection.db();
          var sanitizedBookId = ObjectId.createFromHexString(bookid);
          //First have to get all comments
          db.collection(db_name).updateOne(
            {_id: sanitizedBookId},
            {$push: {"comments": comment}},
            function (err, command_result) {
              if (err) console.log("There was an error in posting");
              else {
                if (command_result.result.nModified != 1) {
                  res.send("no book exists");
                } else {
                  db.collection(db_name).findOne({_id: sanitizedBookId}, function (err, data) {
                    if (err) console.log("Problem acquiring changed entry");
                    else {
                      res.json(data);
                    }
                  });
                }
              }
          });
        }
      });
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, {useNewUrlParser: true}, function(err, connection) {
        if (err) console.log("There was an error connecting to the database.");
        else {
          debugStatement("\tConnected to database.");
          const db = connection.db();
          var sanitizedBookId = ObjectId.createFromHexString(bookid);
          db.collection(db_name).deleteOne(
            {_id: sanitizedBookId},
          function (err, data) {
            if (err || data.deletedCount == 0) console.log("Unable to delete");
            else {
              res.send("delete successful");
            }
          });
        }
      });
    });
  
};
