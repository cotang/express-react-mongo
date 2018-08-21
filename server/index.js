var createError = require('http-errors');
var express = require('express');
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');
var app = express();
var {renderLayout} = require('../templates/index.js');
var PORT = process.env.PORT || 3000;

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
// Connection URL
const dbName = process.env.MONGODB_URI ? (process.env.MONGODB_URI).slice().split('/').pop() : 'todos';
const collectionName = 'todos';
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/'+dbName;


app.use(bodyParser.json())

app.use('/public', express.static(path.resolve(__dirname, '../public')));



// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;
// Connect to the database before starting the application server.
MongoClient.connect(url, function (err, client) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  // Save database object from the callback for reuse.
  db = client.db();
  console.log("Database connection ready");
  // Initialize the app.
  var server = app.listen(PORT, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});



app.get('/api/todos', function(req, res) {
  db.collection(collectionName).find({}).toArray(function(err, list){
    res.send(list);
    // client.close();
  });
  console.log(dbName)
});


app.post('/api/todos', 
  (req, res, next) => {
    if (req.body.title != ''){
      next();
    } else {
      res.status(404).send('Validation error'); 
    }
  },
  (req, res, next) => {
    const todoItem = {
      "key": Date.now(),
      "title": req.body.title,
      "completed": false
    }
     
    db.collection(collectionName).insertOne(todoItem, function(err, result){
      if(err) return res.status(400).send();

      db.collection(collectionName).find({}).toArray(function(err, list){
        res.send(list);
      });
      // client.close();
    });

  }
);


app.put('/api/todos/:todoID', function(req, res) {
  const requestID = Number(req.params.todoID);
  let newStatus = !req.body.completed;

  db.collection(collectionName).findOneAndUpdate({key: requestID}, { $set: { completed: newStatus}}, {returnOriginal: false },function(err, result){
    if(err) return res.status(400).send();
      
    db.collection(collectionName).find({}).toArray(function(err, list){
      res.send(list);
    });
    // client.close();
  });

});


app.delete('/api/todos/:todoID', function(req, res) {
  const requestID = Number(req.params.todoID);

  db.collection(collectionName).findOneAndDelete({key: requestID}, function(err, result){
    if(err) return res.status(400).send();

    db.collection(collectionName).find({}).toArray(function(err, list){
      res.send(list);
    });
    // client.close();
  });

});


app.get('*', function(req, res) {
  res.status(200).send(renderLayout());
});


// errors
app.use(function(req, res, next) {
  res.status(404).send('not found'); 
});
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');  
});

// app.listen(PORT);





