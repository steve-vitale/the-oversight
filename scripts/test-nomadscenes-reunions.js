// Proof: nomad-scenes reunion scenes — four fates, transcript sense, found-marking.
// SENSE-TESTING LAW: assertions read the transcripts — second person, real
// names/relations only, no fabricated shared history.
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL:', msg); }
}

// No invented past: flag common fabrication patterns.
const FABRICATED = [/remember when/i, /that summer we/i, /you used to always/i, /back in .* together/i];

async function main() {
  const seed = parseInt(process.env.SEED || '1201', 10);
  const { Game } = await loadGame({ seed, narration: true });
  await setupGame(Game, 'Columbus, Ohio');

  const kin = (Game.state.world.kin || []).filter(k => k.fate === 'scattered' && k.owner === Game.villagerId);
  ok(kin.length > 0, 'scattered kin exist');
  const name = kin[0].name, rel = kin[0].relation;
  const first = name.split(' ')[0];

  // ---- alive ----
  const a = Game.nomadScenes.reunionScene(name, 'alive');
  ok(a && a.outcome === 'joined', 'alive -> joined');
  ok(a.lines.length >= 3, 'alive scene has beats, got ' + a.lines.length);
  ok(a.lines.every(l => /you|your/i.test(l)), 'alive: every line second person');
  ok(a.lines.some(l => l.indexOf(name) !== -1), 'alive: names the kin');
  ok(a.lines.some(l => l.indexOf(rel) !== -1), 'alive: names the relation');
  ok(!FABRICATED.some(rx => a.lines.some(l => rx.test(l))), 'alive: no fabricated shared history');
  ok(Game.state.world.kin.find(k => k.name === name).found === true, 'alive: kin marked found');

  // ---- dead ----
  const name2 = kin[1] ? kin[1].name : name + '_ghost';
  let d;
  if (kin[1]) {
    d = Game.nomadScenes.reunionScene(kin[1].name, 'dead');
    ok(d && d.outcome === 'grave', 'dead -> grave');
    ok(d.lines.some(l => l.indexOf(kin[1].name) !== -1), 'dead: names the kin');
    ok(!FABRICATED.some(rx => d.lines.some(l => rx.test(l))), 'dead: no fabricated shared history');
    ok(Game.state.world.kin.find(k => k.name === kin[1].name).found === true, 'dead: kin marked found');
  } else { console.log('SKIP: only one kin, dead-scene on same kin skipped to avoid double-found'); }

  // ---- moved: trail continues, not found ----
  const name3 = kin[2] ? kin[2].name : (kin[1] ? kin[1].name : name);
  // use a fresh kin if possible so found-state doesn't confuse
  const movedKin = (kin.find(k => !Game.state.world.kin.find(x => x.name === k.name).found) || kin[0]);
  const before = Game.nomadScenes.trailFor(movedKin.name).level;
  const m = Game.nomadScenes.reunionScene(movedKin.name, 'moved');
  ok(m && m.outcome === 'trail-continues', 'moved -> trail-continues');
  ok(m.lines.some(l => /direction|sharpen|walk/i.test(l)), 'moved: gives a direction, not a person');
  const after = Game.nomadScenes.trailFor(movedKin.name).level;
  ok(after >= before, 'moved: trail sharpened or held');
  const mkEntry = Game.state.world.kin.find(k => k.name === movedKin.name);
  // moved must NOT mark found (unless it was already found by an earlier fate)
  ok(mkEntry.found === (movedKin.name === name || (kin[1] && movedKin.name === kin[1].name)), 'moved: found-state untouched by the move');

  // ---- changed: deterministic subtype, real choices ----
  const ck = kin[0].name;
  const c1 = Game.nomadScenes.reunionScene(ck, 'changed');
  const c2 = Game.nomadScenes.reunionScene(ck, 'changed');
  ok(c1 && c1.outcome === 'choice', 'changed -> choice');
  ok(c1.kind === c2.kind, 'changed subtype deterministic (' + c1.kind + ')');
  ok(['leads', 'ascended', 'hostile'].includes(c1.kind), 'changed kind in set');
  ok(Array.isArray(c1.choices) && c1.choices.length >= 2, 'changed: offers real choices');
  ok(c1.lines.every(l => /you|your/i.test(l)), 'changed: second person');
  if (c1.kind === 'hostile') {
    ok(c1.choices.some(c => c.id === 'fight'), 'hostile: fight is an explicit choice');
  }

  // ---- bad inputs ----
  ok(Game.nomadScenes.reunionScene('Nobody Here', 'alive') === null, 'unknown kin -> null');
  ok(Game.nomadScenes.reunionScene(name, 'married') === null, 'bad fate -> null');

  console.log(`nomadscenes-reunions: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
