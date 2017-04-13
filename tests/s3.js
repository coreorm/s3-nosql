'use strict';

require('mocha');
const expect = require('chai').expect;
const database = require('../s3-nosql');
const db = new database('s3-nosql-test-o');
const table = db.table('tests');
const table2 = db.table('no-existent');

describe('database: list', function () {
  this.timeout(5000);
  it('list items under a table', (done) => {
    table.find('', (err, data) => {
      expect(err).to.be.null;
      expect(data).to.be.instanceOf(Array);
      done(err);
    });
  });
});

describe('database: save', function () {
  it('save item under a table', (done) => {
    table.save('1.json', {a: 1}, (err, data) => {
      expect(err).to.be.null;
      done(err);
    });
  });
});

describe('database: read', function () {
  it('read item under a table', (done) => {
    table.fetchOne('1.json', (err, data) => {
      expect(err).to.be.null;
      expect(data.a).to.be.equal(1);
      done(err);
    });
  });
});

describe('database: delete', function () {
  it('remove item under a table', (done) => {
    table.deleteOne('1.json', (err, data) => {
      expect(err).to.be.null;
      done(err);
    });
  });
});

const async = require('async');

describe('database: multi insert', function () {
  it('lets insert a few', (done) => {
    async.parallel([
      (cb) => {
        table.save('test1', {name: 'test 1'}, cb);
      },
      (cb) => {
        table.save('test2', {name: 'test 2'}, cb);
      },
      (cb) => {
        table.save('test3', {name: 'test 3'}, cb);
      }
    ], (err, data) => {
      done(err);
    });
  });
});

describe('database: find', function () {
  it('fine multiple', (done) => {
    table.find('test', (err, data) => {
      done(err);
    })
  });
});

describe('database: fetch', function () {
  it('select by id', (done) => {
    table.fetchOne('test1', (err, data) => {
      console.log(data);
      done(err);
    })
  });
});

describe('database: fetch multiple', function () {
  this.timeout(5000);
  it('fetch multiple', (done) => {
    table.fetchAll(['test1', 'test2', 'test3'], (err, data) => {
      done(err);
    })
  });
});

describe('database: delete many', function () {
  it('delete multiple', (done) => {
    table.deleteMany(['test1', 'test2', 'test3'], (err, data) => {
      done(err);
    })
  });
});

describe('database: save many', function () {
  this.timeout(5000);
  it('save multiple', (done) => {
    let items = {};
    for (let i = 0; i <= 100; i++) {
      items[`item-${i}`] = {
        date: Date.now(),
        count: i,
        text: 'Test content for item ' + i
      }
    }
    table.saveMany(items, (err, data) => {
      done(err);
    });
  });
});
