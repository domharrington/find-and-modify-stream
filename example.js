var MongoStream = require('./index')
var MongoClient = require('mongodb').MongoClient

MongoClient.connect('mongodb://localhost:27017/database-name', function (err, db) {
  var stream = new MongoStream({ connection: db, collection: 'collection-name' })

  stream.on('finish', function () {
    process.exit(0)
  })

  stream.write({ a: 1 })
  stream.write({ b: 2 })
  stream.end()

})
