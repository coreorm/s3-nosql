'use strict';

require('mocha');
const expect = require('chai').expect;
const database = require('../s3-nosql');
const db = new database('s3-nosql-test');
const table = db.table('tests');
const table2 = db.table('no-existent');

describe('database: list', function () {
  it('list items under a table', function (done) {
    table.find('', function (err, data) {
      expect(err).to.be.null;
      expect(data).to.be.instanceOf(Array);
      done(err);
    });
  });
});

describe('database: save', function () {
  it('save item under a table', function (done) {
    table.save('1.json', {a: 1}, function (err, data) {
      expect(err).to.be.null;
      done(err);
    });
  });
});

describe('database: read', function () {
  it('read item under a table', function (done) {
    table.fetchOne('1.json', function (err, data) {
      expect(err).to.be.null;
      expect(data.a).to.be.equal(1);
      done(err);
    });
  });
});

describe('database: delete', function () {
  it('remove item under a table', function (done) {
    table.deleteOne('1.json', function (err, data) {
      expect(err).to.be.null;
      done(err);
    });
  });
});

const async = require('async');

describe('database: multi insert', function () {
  it('lets insert a few', function (done) {
    async.waterfall([
      function (cb) {
        table.save('test1', {name: 'test 1'}, cb);
      },
      function (err, cb) {
        table.save('test2', {name: 'test 2'}, cb);
      },
      function (err, cb) {
        table.save('test3', {name: 'test 3'}, cb);
      }
    ], function (err, data) {
      done(err);
    });
  });
});

describe('database: find', function () {
  it('fine multiple', function (done) {
    table.find('test', function (err, data) {
      done(err);
    })
  });
});

describe('database: find with content', function () {
  it('fine multiple', function (done) {
    table.findWithContent('test', function (err, data) {
      console.log(data);
      done(err);
    })
  });
});
