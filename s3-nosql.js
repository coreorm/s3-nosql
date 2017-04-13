'use strict';

const AWS = require('aws\-sdk');
const s3 = new AWS.S3();
const parallel = require('async').parallel;

/**
 * list items in bucket
 * @param {string} bucket - name of the bucket
 * @param {string} keyword - to match the object name
 * @param {string} prefix - prefix of the bucket
 * @param {function} cb - callback function(err, data, NextContinuationToken)
 * @param {int} limit - items count of each batch
 * @param {string} ContinuationToken - token for next batch
 */
const find = (bucket, keyword, prefix, cb, limit, ContinuationToken) => {
  try {
    let params = {
      Bucket: bucket
    };
    if (prefix) {
      params.Prefix = prefix;
    }
    if (limit > 0) {
      params.MaxKeys = limit;
    }
    if (typeof ContinuationToken === 'string') {
      params.ContinuationToken = ContinuationToken;
    }

    s3.listObjectsV2(params, (err, data) => {
      let list = [];
      // console.log(data);
      if (data != null && typeof data === 'object' && data.hasOwnProperty('Contents') && typeof data.Contents === 'object') {

        if (keyword.length > 0) {
          for (let k in data.Contents) {
            if (data.Contents[k].Key.indexOf(keyword) >= 0) {
              list.push(data.Contents[k]);
            }
          }
        } else {
          list = data.Contents;
        }

        let nextToken = null;
        if (data.NextContinuationToken) {
          nextToken = data.NextContinuationToken;
        }

        return cb(null, list, nextToken);
      } else {
        cb(new Error('invalid data', null));
      }

      cb(err, list);
    });
  } catch (e) {
    cb(e, null);
  }
};

/**
 * save one object
 * @param {string} bucket - key of the bucket
 * @param {string} key - the key of the object
 * @param {object} value - the value of object (it will be converted to string automatically
 * @param {function} cb - callback function(err, data)
 */
const save = (bucket, key, value, cb) => {
  try {
    s3.putObject({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify(value)
    }, (err, data) => {
      cb(err, data);
    });
  } catch (e) {
    cb(e, null);
  }
};

/**
 * fetch single one
 * @param {string} bucket - key of the bucket
 * @param {string} key - the key of the object
 * @param {function} cb - callback function(err, data)
 */
const fetchOne = (bucket, key, cb) => {
  try {
    s3.getObject({
      Bucket: bucket,
      Key: key
    }, (err, data) => {
      // verify data
      let src = null;
      if (data != null && typeof data === 'object' && data.hasOwnProperty('Body')) {
        const resp = data.Body.toString();
        if (resp.length > 0) {
          src = JSON.parse(resp);
        }
      }
      cb(err, src);
    });
  } catch (e) {
    cb(e, null);
  }
};

/**
 * fetch all objects by keys
 * @param {string} bucket - name of the bucket
 * @param {object} keys - multiple keys to delete, e.g. ['key1', 'key2']
 * @param {function} cb - callback function(err, data)
 * @param {string} nextToken - when present, send it back
 */
const fetchAll = (bucket, keys, cb, nextToken) => {
  try {
    if (keys.length === 0 || !keys) {
      cb(new Error('please provide array of object keys to fetch'));
    }

    let funcs = [];
    let objects = {};

    for (let k in keys) {
      funcs.push(function (cb2) {
        fetchOne(bucket, keys[k], (err, data) => {
          if (!err) {
            // so we only add when valid, but ignore erros
            objects[keys[k]] = data;
          }
          cb2();
        });
      });
    }
    parallel(funcs, (err, data) => {
      cb(err, objects, nextToken);
    });
  } catch (e) {
    cb(e, null);
  }
};

/**
 * delete one item
 * @param {string} bucket - name of the bucket
 * @param {string} key - key of the object
 * @param {function} cb - callback function(err, data)
 */
const deleteOne = (bucket, key, cb) => {
  try {
    s3.deleteObject({
      Bucket: bucket,
      Key: key
    }, (err, data) => {
      cb(err, data);
    });
  } catch (e) {
    cb(e, null);
  }
};

/**
 * delete multiple items
 * @param {string} bucket - name of the bucket
 * @param {object} keys - multiple keys to delete, e.g. ['key1', 'key2']
 * @param {function} cb - callback function(err, data)
 */
const deleteMany = (bucket, keys, cb) => {
  let items = [];
  keys.map((item) => {
    items.push({
      Key: item
    });
  });
  try {
    s3.deleteObjects({
      Bucket: bucket,
      Delete: {
        Objects: items,
        Quiet: false
      }
    }, (err, data) => {
      cb(err, data);
    });
  } catch (e) {
    cb(e, null);
  }
};

/**
 * list items based on criteria and also retrieve data at the same time (async)
 * @param {string} bucket - name of the bucket
 * @param {string} keyword - to match the object name
 * @param {string} prefix - prefix of the bucket
 * @param {function} cb - callback function(err, data, NextContinuationToken)
 * @param {int} limit - items count of each batch
 * @param {string} ContinuationToken - token for next batch
 */
const findWithContent = (bucket, keyword, prefix, cb, limit, ContinuationToken) => {
  try {
    find(bucket, keyword, prefix, (err, data, nextToken) => {
      let keys = [];
      if (data != null && typeof data === 'object') {
        for (let k in data) {
          keys.push(data[k].Key);
        }
      }

      if (keys.length === 0) {
        return cb(null, {});
      }

      fetchAll(bucket, keys, cb, nextToken);
    }, limit, ContinuationToken);
  } catch (e) {
    cb(e, null);
  }
};

// advanced modules
class database {
  constructor(bucket) {
    this.bucket = bucket;
  }

  table(prefix) {
    return new table(this.bucket, prefix);
  }
}

class table {
  constructor(bucket, prefix) {
    this.bucket = bucket;
    let tmp = prefix.split('/');
    let prefixWithSlash = '';
    tmp.forEach((item) => {
      if (item.length > 0) {
        prefixWithSlash += item + '/';
      }
    });
    this.limit = 1000; // limit to 1000 items per page for fetching
    this.prefix = prefixWithSlash;
  }

  setLimit(intLimit) {
    this.limit = parseInt(intLimit);
  }

  find(keyword, cb, ContinuationToken) {
    let prefix = this.prefix;
    find(this.bucket, keyword, this.prefix, (err, data, nextToken) => {
      if (err) {
        return cb(err);
      }
      // remove prefix from keys
      data.forEach((item) => {
        item.Key = item.Key.substring(prefix.length);
      });
      cb(err, data, nextToken);
    }, this.limit, ContinuationToken);
  }

  findWithContent(keyword, cb, ContinuationToken) {
    let prefix = this.prefix;
    findWithContent(this.bucket, keyword, this.prefix, (err, data, nextToken) => {
      if (err) {
        return cb(err);
      }
      // remove prefix from keys
      let newData = {};
      for (let k in data) {
        newData[k.substring(prefix.length)] = data[k];
      }
      cb(err, newData, nextToken);
    }, this.limit, ContinuationToken);
  }

  save(key, data, cb) {
    key = this.prefix + key;
    save(this.bucket, key, data, cb);
  }

  saveMany(data, cb) {
    const drops = [];
    const responses = [];
    const self = this;
    for (let key in data) {
      let item = data[key];
      drops.push((callback) => {
        self.save(key, item, (err, data) => {
          responses.push(data);
          callback(err, data);
        });
      });
    }
    parallel(drops, (err, data) => {
      cb(err, responses);
    });
  }

  fetchOne(key, cb) {
    key = this.prefix + key;
    fetchOne(this.bucket, key, cb);
  }

  fetchAll(keys, cb) {
    let prefix = this.prefix;
    let keysWithPrefix = [];
    keys.forEach((item) => {
      keysWithPrefix.push(this.prefix + item);
    });
    fetchAll(this.bucket, keysWithPrefix, (err, data) => {
      if (err) {
        return cb(err);
      }
      // remove prefix from keys
      let newData = {};
      for (let k in data) {
        newData[k.substring(prefix.length)] = data[k];
      }
      cb(err, newData)
    });
  }

  deleteOne(key, cb) {
    key = this.prefix + key;
    deleteOne(this.bucket, key, cb);
  }

  deleteMany(keys, cb) {
    let keysWithPrefix = [];
    let prefix = this.prefix;
    keys.forEach((item) => {
      keysWithPrefix.push(prefix + item);
    });
    deleteMany(this.bucket, keysWithPrefix, cb);
  }
}

module.exports = database;
