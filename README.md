# s3-nosql
use s3 as a nosql storage (with limited support of queries)

## install
`npm install s3-nosql`

## setup
Make sure you have the s3 bucket setup properly and all the credentials setup; 

## Usage 
Let's say you want to connect to bucket 'my-db':

```$javascript
const database = require('../s3-nosql');
const myDb = new database('my-db');
```

And now, if you want to create a new table called 'new-table', simply do
```$javascript
const newTable = myDb.table('new-table');
```

### save one item

And if you want to save a new item, just do
```
save(<string: item id>, <data>, callback); 
```
e.g.
```
newTable.save('user', {
    name: 'John Doe',
    address: 'Somewhere over the rainbow'
}, function(err, data) {...})
```

### delete one item
And if you want to delete it:
```
newTable.delete('user', function(err, data) {...})
```

### find all under the table
Note: since this is a document store, it's not feasible to search by content, so it accepts only document name matchings.
e.g.
```
newTable.find('u', function(err, data) {...})
```

### find and load content to all the objects
This one works like find, but also loads the data to each object.
```$javascript
newTable.findWithContent('u', function(err, data) {...})
```

