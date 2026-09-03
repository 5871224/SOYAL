import assert from 'node:assert/strict';
import {parseBuffer, parseRecord, RECORD_SIZE} from '../parser.js';

const record = new Uint8Array(RECORD_SIZE);
record[0] = 0x21;
record[1] = 0x27;
record[2] = 2;
record[3] = 13;
record[4] = 39;
record[5] = 8;
record[6] = 3;
record[7] = 1;
record[8] = 9;
record[9] = 26;
record[10] = 0x11;
record[11] = 0;
record[12] = 9;
record[19] = 2;
record[79] = 54;
record[80] = 31;
record[81] = 21;
record[82] = 4;
record[83] = 2;
record[84] = 9;
record[85] = 26;
record[96] = 2;
record[98] = 1;

const parsed = parseRecord(record, 1, 'sample.msg');
assert.equal(parsed.eventTime, '2026-09-01 08:39:13');
assert.equal(parsed.node, 2);
assert.equal(parsed.door, 2);
assert.equal(parsed.userAddress, 9);
assert.equal(parsed.functionHex, 'M27');
assert.equal(parsed.recordedTime, '2026-09-02 21:31:54');

const result = parseBuffer(record, 'sample.msg');
assert.equal(result.totalBytes, 100);
assert.equal(result.records.length, 1);
assert.equal(result.errors.length, 0);

console.log('OK: SOYAL 100-byte parser fixture passed');
