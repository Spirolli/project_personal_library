/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done) {
     chai.request(server)
      .get('/api/books/')
      .end(function (err, res) {
       assert.equal(res.status, 200);
       assert.isArray(res.body);
       var firstBookObj = res.body[0];
       assert.property(firstBookObj, '_id');
       assert.property(firstBookObj, 'title');
       assert.property(firstBookObj, 'commentcount');
       done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
         .post('/api/books/')
         .send({"title": "The Monkeys Move On"})
         .end(function (err, res) {
          console.log("\t\tres.status " + res.status + "\n\t\tres.body.title: " + res.body.title + "\n\t\tres.body.comments: " + res.body.comments);
          assert.equal(res.status, 200);
          assert.equal(res.body.title, "The Monkeys Move On");
          assert.isArray(res.body.comments);
          done();
        });
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
         .post('/api/books/')
         .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, "No title given");
          done();
        });
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done) {
        chai.request(server)
         .get('/api/books/')
         .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
         var firstBookObj = res.body[0];
         assert.property(firstBookObj, '_id');
         assert.property(firstBookObj, 'title');
         assert.property(firstBookObj, 'commentcount');
          done();
        });
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
         .get('/api/books/'+ 4)
         .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "no book exists");
            done();
        });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
         .get('/api/books/5d50614e87fb310ba5b0b568')
         .end(function (err, res) {
          assert.equal(res.status, 200);
          var returnObj = res.body;
          assert.equal(returnObj.title, 'The Monkeys Move On');
          assert.isArray(returnObj.comments);
          done();
        })
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
       chai.request(server)
        .post('/api/books/5d50614e87fb310ba5b0b568')
        .send({"comment": "This book, I feel, has too much monkey in it."})
        .end(function (err, res) {
         assert.equal(res.status, 200);
         assert.equal(res.body.title, 'The Monkeys Move On');
         assert.isArray(res.body.comments);
         assert.equal(res.body.comments[0], "This book, I feel, has too much monkey in it.");
         done();
       });
      });
      
    });

  });

});
