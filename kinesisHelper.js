'use strict';

const parseRecord = record => {
  const json = Buffer.from(record.kinesis.data, 'base64').toString('utf8');
  return JSON.parse(json);
}

module.exports = {
  parseRecord: parseRecord,
  getRecords: event => event.Records.map(parseRecord)
}
