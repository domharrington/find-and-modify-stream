module.exports = FindAndModifyMongoStream

var Writable = require('stream').Writable

function FindAndModifyMongoStream(options) {
  options = options || {}
  if (!options.connection) throw new Error('`options.connection` is required')
  if (!options.collection) throw new Error('`options.collection` is required')

  Writable.call(this, { objectMode: true })

  this.collection = options.connection.collection(options.collection)

  this.query = options.query || function (obj) { return { _id: obj._id }}
  this.queryOptions = options.queryOptions || { upsert: true, w: 1, fsync: true }
}

FindAndModifyMongoStream.prototype = Object.create(Writable.prototype)

FindAndModifyMongoStream.prototype._write = function (obj, encoding, cb) {

  function done(err, result) {
    this.emit('insert', obj)
    cb(err, result)
  }

  this.collection.findAndModify(
    this.query(obj), [], obj, this.queryOptions, done.bind(this))

}
