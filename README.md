# s3-nosql
use s3 as a nosql storage (with limited support of queries)

## install
`npm install s3-nosql`

## setup
Make sure you have the s3 bucket setup properly and all the credentials setup; 

## Usage 
Let's say you want to connect to bucket 'my-db':

```javascript
const database = require('../s3-nosql');
const myDb = new database('my-db');
```

And now, if you want to create a new table called 'new-table', simply do
```javascript
const newTable = myDb.table('new-table');
```

### save one item
```
save(<string: item id>, <data>, callback); 
```

e.g.
```
newTable.save('user1', {
    name: 'John Doe',
    address: 'Somewhere over the rainbow'
}, (err, data) => {...})
```

### delete one item
```javascript
delete(key, callback)
```
e.g.

```
newTable.delete('user', (err, data) => {...})
```

### fetch one item by id
```javascript
fetchOne(key, callback)
```
e.g.
```javascript
newTable.fetchOne('user1', (err, data) => {...})
```

### fetch many items by ids
This one loads multiple data in parallel
```javascript
fetchAll(keys, callback)
```
e.g.
```javascript
newTable.fetchAll(['user1', 'user2', 'user3'], (err, data) => {...})
```

### find all under the table
Note: since this is a document store, it's not feasible to search by content, so it accepts only document name matching.
```javascript
find(keyword, callback)
```
e.g.
```
newTable.find('u', (err, data) => {...})
```

### find and load content to all the objects
This one works like find, but also loads the data to each object.
```javascript
findWithContent(keyword, callback)
```
e.g.
```javascript
newTable.findWithContent('u', (err, data) => {...})
```

