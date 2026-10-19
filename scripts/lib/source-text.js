'use strict';
// Text fingerprints and legacy source-parser fixtures must agree on LF/CRLF.
// Preserve every assertion, binary read and non-source file byte. This is a
// source reader; it never edits or evaluates the Game modules it reads.
const fs=require('fs'),api=Object.create(fs);
api.normalizeSource=value=>value.replace(/\r\n/g,'\n');
api.readFileSync=function(...args){const value=fs.readFileSync(...args);return typeof value==='string'&&/\.(?:js|html|css)$/i.test(String(args[0]))?api.normalizeSource(value):value;};
module.exports=api;
