# find-and-modify-stream

MongoDB find and modify object write stream

[![build status](https://secure.travis-ci.org/domharrington/find-and-modify-stream.png)](http://travis-ci.org/domharrington/find-and-modify-stream)

## Installation

```
npm install find-and-modify-stream --save
```

## Usage

```js
var MongoStream = require('find-and-modify-stream')
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

```

### `var writeStream = MongoStream(options)`

Options must include:

- `connection` - a database connection returned from `MongoClient.connect`
- `collection` - the collection name to perform the operation on

Optional options:

- `query` - a function used to construct the query for the `findAndModify` operation. Defaults to: `function (obj) { return { _id: obj._id }}`
- `queryOptions` - an object of options passed to the `findAndModify` operation. Can be used to modify write concerns and upsert preferences.
Defaults to: `{ upsert: true, w: 1, fsync: true }`

## Credits
[Dom Harrington](https://github.com/domharrington/) follow me on twitter [@domharrington](http://twitter.com/domharrington)
