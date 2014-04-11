var FindAndModifyMongoStream = require('../')
  , MongoClient = require('mongodb').MongoClient
  , assert = require('assert')
  , omit = require('lodash.omit')
  , dbname = Math.round(Math.random() * 1000000).toString(36)
  , collectionName = 'test'

describe('find and modify mongo stream', function () {
  var connection, collection

  beforeEach(function (done) {
    MongoClient.connect('mongodb://localhost:27017/' + dbname, function (err, db) {
      connection = db
      collection = db.collection(collectionName)
      collection.insert({ _id: 'existing-item', a: 1 }, done)
    })
  })

  afterEach(function (done) {
    connection.dropDatabase(done)
  })

  it('should throw if no connection provided', function () {
    assert.throws(function () {
      var test = new FindAndModifyMongoStream()
      test.end()
    }, /`options.connection` is required/)
  })

  it('should throw if no collection provided', function () {
    assert.throws(function () {
      var test = new FindAndModifyMongoStream({ connection: {} })
      test.end()
    }, /`options.collection` is required/)
  })

  it('should update a document', function (done) {
    var stream = new FindAndModifyMongoStream({ connection: connection, collection: collectionName })
      , updateObject = { _id: 'existing-item', b: 2 }

    stream.on('finish', function () {
      collection.findOne({ _id: 'existing-item' }, function (err, doc) {
        assert.deepEqual(doc, updateObject)
        done()
      })
    })

    stream.write(updateObject)
    stream.end()
  })

  it('should insert a document that does not exist', function (done) {
    var stream = new FindAndModifyMongoStream({ connection: connection, collection: collectionName })
      , newObject = { _id: 'new-id', c: 3 }

    stream.on('finish', function () {
      collection.findOne({ _id: 'new-id' }, function (err, doc) {
        assert.deepEqual(doc, newObject)
        done()
      })
    })

    stream.write(newObject)
    stream.end()
  })

  it('should emit an `insert` for each row', function (done) {
    var stream = new FindAndModifyMongoStream({ connection: connection, collection: collectionName })
      , n = 5
      , seen = 0

    stream.on('insert', function () {
      seen += 1
    })

    stream.on('finish', function () {
      assert.equal(seen, n)
      done()
    })

    for (var i = 0; i < n; i += 1) {
      stream.write({ _id: n })
    }

    stream.end()
  })

  it('should allow overriding of query construction function', function (done) {
    var query = function (obj) { return { postcode: obj.postcode }}
      , stream = new FindAndModifyMongoStream({ connection: connection, collection: collectionName, query: query })
      , object = { postcode: 'RG21 3BW', a: 1 }
      , newObject = { postcode: 'RG21 3BW', b: 2 }

    stream.on('finish', function () {
      collection.find({ postcode: 'RG21 3BW' }).toArray(function (err, docs) {
        assert.equal(docs.length, 1)
        assert.deepEqual(omit(docs[0], '_id'), newObject)
        done()
      })
    })

    stream.write(object)
    stream.write(newObject)

    stream.end()
  })

})
