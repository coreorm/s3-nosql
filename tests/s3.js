'use strict';

require('mocha');
const expect = require('chai').expect;
const database = new require('../s3-nosql');
const db = new database('s3-nosql-test');
const table = db.table('tests');

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
    table.save('1.json', {a:1}, function (err, data) {
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
