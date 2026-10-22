// diag-trailstarve-b.js — apply the extended trailstarve taxonomy to the
// existing sim-deathcause-b meal-row corpus (OFFLINE, zero new sims) and
// write the re-run starvation-death census.
//
// Usage: node scripts/diag-trailstarve-b.js
//   corpus: evidence/2026-10-22/perseed-deathcause-b/ (16 per-seed JSONs,
//           committed by arm sim-deathcause-b; read-only here)
//   writes: evidence/2026-10-22/trailstarve-census-b.json (one-shot, on purpose)
// As a module it exports runDiag(corpusDir) -> census object (no repo writes).

'use strict';
var fs = require('fs');
var path = require('path');
var taxonomy = require('./taxonomy-trailstarve-b.js');

function defaultCorpusDir() {
  return path.join(__dirname, '..', 'evidence', '2026-10-22', 'perseed-deathcause-b');
}

function runDiag(corpusDir) {
  corpusDir = corpusDir || defaultCorpusDir();
  var files = fs.readdirSync(corpusDir).filter(function (f) { return f.indexOf('deathcause-') === 0 && f.slice(-5) === '.json'; });
  files.sort();
  var census = { runs: [], instrumentErrors: [] };
  files.forEach(function (fn) {
    var p = path.join(corpusDir, fn);
    var corpus;
    try {
      corpus = JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch (e) {
      census.instrumentErrors.push({ file: fn, error: 'read/parse: ' + e.message });
      return;
    }
    // Join the old channel from the corpus's own starv entries (the baseline).
    var oldByVid = {};
    var starv = ((corpus.starvechan || {}).starv) || [];
    starv.forEach(function (e) { oldByVid[String(e.vid)] = e.channel; });
    var deaths = [];
    try {
      var drows = corpus.deaths || [];
      for (var i = 0; i < drows.length; i++) {
        var r = drows[i];
        if (r.pclass !== 'starvation') continue;
        if (r.kind !== 'villager' && r.kind !== 'person') continue;
        var cls = taxonomy.classifyExtended(r, corpus);
        deaths.push({
          day: cls.day, who: cls.who, vid: cls.vid,
          oldChannel: oldByVid[String(r.vid)] || null,
          channel: cls.channel,
          channelFlags: cls.channelFlags,
          diagnostics: cls.diagnostics,
        });
        (cls.instrumentErrors || []).forEach(function (e) {
          census.instrumentErrors.push({ file: fn, who: r.who, error: e });
        });
      }
    } catch (e) {
      census.instrumentErrors.push({ file: fn, error: 'classify: ' + e.message });
    }
    census.runs.push({
      file: fn, seed: corpus.seed, policy: corpus.policy,
      personDeaths: corpus.personDeaths, unexplained: corpus.unexplained,
      starvationDeaths: deaths,
    });
  });
  var named = 0, unattributed = 0, woundFlags = 0;
  var byChannel = {};
  census.runs.forEach(function (r) {
    r.starvationDeaths.forEach(function (dth) {
      byChannel[dth.channel] = (byChannel[dth.channel] || 0) + 1;
      if (dth.channel === 'unattributed') unattributed++;
      else named++;
      if (dth.channelFlags.indexOf('wound-compounded') >= 0) woundFlags++;
    });
  });
  census.totals = {
    starvationDeaths: named + unattributed,
    named: named, unattributed: unattributed,
    completeness: named + unattributed ? Math.round((named / (named + unattributed)) * 1000) / 10 : null,
    woundCompoundedFlags: woundFlags,
    byChannel: byChannel,
  };
  return census;
}

function main() {
  var census = runDiag();
  census.generatedBy = 'scripts/diag-trailstarve-b.js';
  census.generatedAt = new Date().toISOString();
  census.note = 'Extended taxonomy re-run of the sim-deathcause-b starvation census (backlog #815). ' +
    'Corpus: evidence/2026-10-22/perseed-deathcause-b/ (16 per-seed JSONs). ' +
    'Bar (pre-registered): DIAG-GO at >=12/13 named with 0 instrumentErrors.';
  var outPath = path.join(__dirname, '..', 'evidence', '2026-10-22', 'trailstarve-census-b.json');
  fs.writeFileSync(outPath, JSON.stringify(census, null, 1) + '\n');
  console.log('wrote ' + outPath);
  console.log('starvation deaths: ' + census.totals.starvationDeaths +
    ', named: ' + census.totals.named +
    ', unattributed: ' + census.totals.unattributed +
    ' (' + census.totals.completeness + '%), instrumentErrors: ' + census.instrumentErrors.length);
  console.log('byChannel: ' + JSON.stringify(census.totals.byChannel));
}

if (require.main === module) main();
module.exports = { runDiag: runDiag, defaultCorpusDir: defaultCorpusDir };
