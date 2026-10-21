'use strict';
const fs=require('fs'),Module=require('module');
const source=fs.readFileSync('evidence/2026-10-20/caregiver-terminal-original-harness-prepare-r1.cjs','utf8').replaceAll('caregiver-terminal-original-harness','overnight-save-baseline').replace('Unmodified current Game, controller and harness frozen before the public Wait correction.','Released d09f47ea2 Game/controller/harness frozen before time-settlement persistence changes.');
const m=new Module(__filename,module);m.filename=__filename;m.paths=module.paths;m._compile(source,__filename);
