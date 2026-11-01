'use strict';
// Test gate only. One shared-runtime harness per disposable process; never
// build speculative menus or advance randomness in an observed live game.
const path = require('path');
const {spawnSync} = require('child_process');
const ROOT = path.resolve(__dirname, '../..');
const MARKER = '@@ASK_CONTRACT@@';
function validateAskContract(Game, vid, options = {}) {
  const payload = {vid, seed: options.seed ?? 20261008,
    state: Game.state, data: Game.data, map: Game.map,
    villagerId: Game.villagerId, homeRegion: Game.homeRegion,
    day: Game.day, dayPart: Game.dayPart,
    control: options.control || null};
  const child = spawnSync(process.execPath, [__filename, '--worker'], {
    cwd: ROOT, input: JSON.stringify(payload), encoding: 'utf8',
    timeout: 60000, maxBuffer: 32 * 1024 * 1024,
  });
  if (child.error || child.status !== 0) return {ok:false, failures:[
    'isolated audit failed: ' + (child.error?.message || child.stderr || 'exit ' + child.status)], error:true};
  const results = child.stdout.split(/\r?\n/).filter(line => line.startsWith(MARKER));
  if (results.length !== 1) return {ok:false, failures:['isolated audit returned no unique result'], error:true};
  try { return JSON.parse(results[0].slice(MARKER.length)); }
  catch (e) { return {ok:false, failures:['isolated audit returned invalid JSON: ' + e.message], error:true}; }
}
async function auditSnapshot(payload) {
  const K = require('../godpath/lib');
  const P = require('./conversation-playtest');
  const G = await K.load({seed: payload.seed, narration: true});
  if (!payload.state?.village?.roster?.includes(payload.vid) || !payload.data?.characterGen?.convo) {
    throw Error('A canonical resident and initialized snapshot are required');
  }
  Object.assign(G, {state:payload.state, data:payload.data, map:payload.map,
    villagerId:payload.villagerId, homeRegion:payload.homeRegion});
  if (payload.day !== undefined) G.day = payload.day;
  if (payload.dayPart !== undefined) G.dayPart = payload.dayPart;
  const original = JSON.parse(JSON.stringify(G.convoGet(payload.vid)));
  const cg = G.data.characterGen.convo;
  const definitions = [
    ...(cg.questions || []).map(q => ({family:'bespoke', id:q.id, prompt:q.q, answers:q.answers || [], pendingQ:q})),
    ...Object.entries(G.REACTIVE_DEFS || {}).map(([id,q]) => ({family:'reactive', id, prompt:q.followUp || q.match, answers:q.answers || [], reactiveQ:{id}})),
    ...Object.entries({yn:'"Are you ready?"', howru:'"How are you?"', greet:'"What\'s up?"',
      open:'"What are you thinking about?"', reason:'"Why do you ask?"', day:'"What day is it?"'})
      .map(([id,prompt]) => ({family:'generic', id, prompt, genericQ:{kind:id,q:prompt}})),
  ];
  const failures = [], cases = [];
  if (!(cg.questions || []).length) failures.push('bespoke question catalogue is empty');
  if (!Object.keys(G.REACTIVE_DEFS || {}).length) failures.push('reactive question catalogue is empty');
  const publicMenu = G.convoChoices;
  const control = payload.control;
  if (control && !['real','boundary','silence','empty','throw'].includes(control)) throw Error('Unknown audit control');
  const prefix = d => d.family === 'bespoke' ? 'ans:' + d.id + ':' : d.family === 'reactive' ? 'react:' + d.id + ':' : 'gq:' + d.id + ':';
  const boundary = (ch,d) => ch.id === prefix(d) + 'honest_pass' || d.answers?.some(a => a.honest_opt_out && ch.id === prefix(d) + a.id);
  const real = (ch,d) => ch.id.startsWith(prefix(d)) && !boundary(ch,d);
  for (const d of definitions) {
    const key = d.family + ':' + d.id;
    if (d.family !== 'generic') {
      if (d.answers.length < 2) failures.push(key + ': fewer than 2 answers');
      const ids = new Set();
      for (const a of d.answers) {
        if (!a.id || ids.has(a.id)) failures.push(key + ': missing or duplicate answer ID');
        ids.add(a.id);
        if (!a.label || !String(a.label).trim()) failures.push(key + ':' + (a.id || '?') + ': empty label');
      }
    }
    if (!d.id || !d.prompt) failures.push(key + ': missing ID or question');
    // Explicit prepared posed-question scene, never an existing closing,
    // ambush, party decision or queued invitation passed off as that scene.
    G.state.village.conv[payload.vid] = Object.assign(JSON.parse(JSON.stringify(original)), {
      active:true, over:false, thread:null, depth:0, windingDown:false, winddownQueued:false,
      choosingSubject:false, pendingQ:null, reactiveQ:null, genericQ:null,
      pendingTrade:null, pendingHawk:null, partyDecision:null, heldBeats:[], heldAsk:false,
      invitePending:null, traderIntroPending:null, spent:{}, replyMenu:null,
      menuPage:0, menuPages:1, transcript:[], said:{}, saidLines:[], saidLinesConvo:[],
    });
    G.sayLine(payload.vid, d.prompt, {structural:true, tag:'question', topic:'self'});
    const c = G.convoGet(payload.vid);
    c.spokenBeat = {tag:'question', topic:'self', line:d.prompt};
    c.pendingQ = d.pendingQ || null; c.reactiveQ = d.reactiveQ || null; c.genericQ = d.genericQ || null;
    // Negative controls remove options AFTER the actual outermost public
    // menu. A data-only scan cannot pass if the live menu loses its answers.
    G.convoChoices = function (id) {
      if (control === 'throw') throw Error('injected public-menu failure');
      const menu = publicMenu.call(this,id);
      return menu.map((ch,n) => control === 'empty' && n === 0 ? {...ch,label:''} : ch).filter(ch => !(control === 'real' && real(ch,d)) &&
        !(control === 'boundary' && boundary(ch,d)) && !(control === 'silence' && ch.id === 'silence'));
    };
    const menu = P.offers(G,payload.vid);
    if (menu.some(ch => !ch.label || !String(ch.label).trim())) failures.push(key + ': empty offered label');
    if (new Set(menu.map(ch => ch.id)).size !== menu.length) failures.push(key + ': duplicate offered ID');
    if (!menu.some(ch => real(ch,d))) failures.push(key + ': no real answer offered');
    if (!menu.some(ch => boundary(ch,d))) failures.push(key + ': missing honest opt-out');
    if (!menu.some(ch => ch.id === 'silence' || ch.id === 'nv:listen')) failures.push(key + ': missing silence');
    for (const a of d.answers || []) if (a.temper === 'honest-hard' && !menu.some(ch => ch.id === prefix(d) + a.id)) failures.push(key + ': honest-hard answer not offered');
    cases.push({family:d.family, id:d.id, prompt:d.prompt,
      choices:menu.map(ch => ({id:ch.id,label:ch.label})), prepared:true});
  }
  return {ok:failures.length === 0, failures, prepared:true, surface:'Game.convoChoices',
    seed:payload.seed, vid:payload.vid, cases,
    coverage:Object.fromEntries(['bespoke','reactive','generic'].map(f => [f,cases.filter(c => c.family === f).length]))};
}
module.exports = {validateAskContract};
if (require.main === module) {
  if (process.argv[2] !== '--worker') throw Error('Use validateAskContract(Game, vid) from test tooling');
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { input += chunk; });
  process.stdin.on('end', () => auditSnapshot(JSON.parse(input)).then(result => {
    process.stdout.write(MARKER + JSON.stringify(result) + '\n');
  }).catch(e => { console.error(e.stack); process.exitCode = 1; }));
}
