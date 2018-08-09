var createError = require('http-errors');
var express = require('express');
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');
var app = express();
var {renderLayout} = require('../templates/index.js');
var PORT = process.env.PORT || 3000

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
// Connection URL
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/todos';
// Database Name
const dbName = 'todos';


app.use(bodyParser.json())

app.use('/public', express.static(path.resolve(__dirname, '../public')));

app.get('/api/todos', function(req, res) {

  MongoClient.connect(url, function(err, client){
    client.db('todos').collection('todos').find({}).toArray(function(err, list){
      res.send(list);
      client.close();
    });
  });

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
     
    MongoClient.connect(url, function(err, client){
      var collection = client.db('todos').collection('todos');
      collection.insertOne(todoItem, function(err, result){
        if(err) return res.status(400).send();

        collection.find({}).toArray(function(err, list){
          res.send(list);
        });

        client.close();
      });
    });

  }
);


app.put('/api/todos/:todoID', function(req, res) {
  const requestID = Number(req.params.todoID);
  let newStatus = !req.body.completed;

  MongoClient.connect(url, function(err, client){
    var collection = client.db('todos').collection('todos');
    collection.findOneAndUpdate({key: requestID}, { $set: { completed: newStatus}}, {returnOriginal: false },function(err, result){
      if(err) return res.status(400).send();
        
      collection.find({}).toArray(function(err, list){
        res.send(list);
      });

      client.close();
    });
  });

});


app.delete('/api/todos/:todoID', function(req, res) {
  const requestID = Number(req.params.todoID);

  MongoClient.connect(url, function(err, client){
    var collection = client.db('todos').collection('todos');
    collection.findOneAndDelete({key: requestID}, function(err, result){
      if(err) return res.status(400).send();

      collection.find({}).toArray(function(err, list){
        res.send(list);
      });

      client.close();
    });
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

app.listen(PORT);





