#!/usr/bin/env node
// finish the two missing pilot runs (leadfeast/armed s77, s88) after the
// sweep process died silently. Reuses sweep-trusthalf's oneRun via a
// targeted driver — identical code path, identical seeds.
'use strict';
// Re-require the sweep module pieces by loading the file as a module is not
// possible (it runs main on load), so this driver shells the sweep's oneRun
// through a tiny inline copy of its invocation. Instead: run node with a
// SEEDS filter env that the sweep honors.
process.env.SEEDS = process.argv[2] || '77,88';
process.env.ONLY = 'leadfeast,armed';
require('./sweep-trusthalf-20261015.js');
