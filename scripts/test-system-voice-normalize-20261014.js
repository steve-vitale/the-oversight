// test-system-voice-normalize-20261014.js — systemVoiceIdFor matched game
// text to the recorded manifest lines EXACTLY, so any drift (emoji prefix,
// curly vs straight quotes, brackets, dashes, spacing, case) silently left a
// recorded line unvoiced. Both sides are now normalized.
'use strict';
const K = require('./godpath/lib');
(async () => {
  const T = K.reporter('system-voice-normalize');
  const Game = await K.load({ seed: 7 });
  T.ok('systemVoiceIdFor attached', typeof Game.systemVoiceIdFor === 'function');
  const man = K.readJSON('src/audio/system/manifest.json');
  // the harness fetch has no .ok; serve the manifest the way a browser would
  const origFetch = globalThis.fetch;
  globalThis.fetch = (u) => /manifest\.json$/.test(String(u))
    ? Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(man) })
    : origFetch(u);
  await Game.systemAudioManifest();
  globalThis.fetch = origFetch;
  const e = man.find(x => /'/.test(x.text) && x.text.length > 30) || man[0];
  T.ok('exact text still matches', Game.systemVoiceIdFor(e.text) === e.id, e.id);
  const drifted = '📺  ' + e.text.replace(/'/g, '’').toUpperCase().replace(/ /g, '  ') + ' ';
  T.ok('drifted text (emoji, curly quotes, case, spacing) matches', Game.systemVoiceIdFor(drifted) === e.id, drifted.slice(0, 60));
  const quoted = '"' + e.text + '"';
  T.ok('quoted text matches', Game.systemVoiceIdFor(quoted) === e.id);
  const dash = man.find(x => /—/.test(x.text));
  if (dash) T.ok('em dash vs hyphen matches', Game.systemVoiceIdFor(dash.text.replace(/—/g, '-')) === dash.id, dash.id);
  T.ok('unknown text -> null', Game.systemVoiceIdFor('no such line anywhere') === null);
  T.done();
})();
