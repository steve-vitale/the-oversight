// dutyfirst-instrument-20261111.js — duties first-numbers recorder
// (arm sim-dutyfirst-b, run fleshout-loop-b-20261111T1131Z, adoption of the
// stranded 0835Z prereg). Scripts only, zero src/js.
//
// Records, per seed:
//   (1) STAFFING (assignTask wrap — ALL 15 tasks): every call with return
//       class (ok / refused / null), reason class (trust-gate / reluctant /
//       wounded / remote / not-at-haven / null-task / rest / self / other,
//       from the return value + state.village.lastRefusal), trust-before,
//       HP-before, competence, caller frame, via, buddy, part. The
//       walk-down order (assignAnother) is recoverable from the call
//       sequence: same task + same day-part + assignAnother caller frame.
//       offerDeal / appealToGoal: every task, same shape (expected 0).
//   (2) RESOLUTIONS (resolveAssignments wrap): pre/post assignment +
//       taskLeads snapshots per call, so skipped assignments are classified
//       from the diff (sheltered-kept / fitness-rest / dead-or-left), not
//       guessed. (resolveOneAssignment wrap): every resolution with vid,
//       task (pre + post, so throttle/cistern redirects are visible),
//       caller path (assignment / taskLead / redirect-recursion), outcome
//       class (completed / redirected / skipped-early / exception-thrown).
//       Completion is proven, not assumed: the villagerPractice wrap
//       marks the open resolution frame (practice runs ONLY at the
//       resolveOneAssignment tail), so a frame with no practice and no
//       re-entry is a silent early return (garden guard / favor hold).
//   (3) HUNT OUTCOMES (villagerHuntResolve wrap): kills / stalk-fails by
//       species + kcal + injury-roll inputs (temperament, competence).
//   (4) HARM (hurtVillager wrap): every hurt with vid, dmg, cause, HP
//       before/after, died? Duty attribution from the assignment held at
//       the time (+ task-lead domain, recorded in the same row).
//   (5) YIELD (stockPantry wrap): every pantry deposit by name + kcal +
//       caller frame — the duty-yield backstop.
//   (6) PATROL (resolvePatrol wrap + recordWaveKill wrap): every patrol
//       resolution (vid, day) + every wave-kill record (monster, killer,
//       channel) — patrol outcomes are classified in the analyzer from
//       these + the hurtVillager rows + deaths, never from say lines.
//   (7) MEDIC DUTY (medicDutyTick / medicDutyCureAttempt /
//       villagerCareTick wraps): holder before/after + eligible-pool size
//       + sick count per tick; cure attempts with holder/patient/disease/
//       result + which counter moved (ability vs medicine); care ticks
//       with cure-counter deltas.
//   (8) VILLAGER-INITIATIVE TRAPS (tele wrap): npc_trap / npc_pit
//       returns only (the trapfirst-a channel, counted here as
//       villager-chosen work, not assigned duty).
//   (9) DEEDS (noteDeed + creditDeed wraps): duty deeds (foraging /
//       hunting / fishing / gardening / cooking / preserving / crafting /
//       teaching / discovery / patrol), who. Same dedup suppression flag
//       as trapfirst-a (noteDeed IS creditDeed('player', ...)).
//   (10) PRACTICE (villagerPractice wrap): one rep per resolved
//       assignment, reps + steps before/after — the competence-movement
//       record. Also the resolution-completion detector (see (2)).
//   (11) DAILY SNAPSHOT: assignments map, taskLeads map, medicDuty
//       holder + eligible count + cure counters, sick map, roster HP map,
//       objective kinds per villager (v.objectives — read-only, never
//       created), practice reps + foodXp per villager-task, pantry roll by
//       name, village water/wood/stone/materials, cistern ledgers,
//       throttle ledgers, deadfall ledgers (Game._deadfall*), haulcount
//       tap (Game._haulcount), gives/havenToday, garden plots live/ripe.
//
// All wraps are record-only: call the original, return its value
// unchanged, never alter state, never consume RNG. Any failure in the
// RECORDING path is logged to instrumentErrors, never thrown into the
// game.
//
// KNOWN WRAP RISK (secondlink-a / diplo-a lesson): a wrap records
// nothing if the engine calls the closure instead of the Game method.
// The proof (scripts/test-dutyfirst-b.js) verifies EACH wrapped
// method's call path is live on a fixture or live miniature; a wrap
// with no live call observed is marked dead in the evidence and its
// zero is never treated as evidence. stockPantry + hurtVillager are
// the backstops: if the resolution wraps are dead, the kcal and the
// harm are still counted from the deposit/hurt records.
//
// Usage: const DI = require('./dutyfirst-instrument-20261111');
//   const di = DI.install(Game); di.snapshot(); ... di.uninstall();
'use strict';

var TASKS = ['forage', 'garden', 'fish', 'hunt', 'wood', 'stone',
  'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach',
  'mend', 'rest'];
var DUTY_DEEDS = ['foraging', 'hunting', 'fishing', 'gardening',
  'cooking', 'preserving', 'crafting', 'teaching', 'discovery',
  'patrol'];

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function stackText(skip) {
  try { return (new Error().stack || '').split('\n').slice(skip || 0).join(' | '); } catch (e) { return ''; }
}

// First engine frame in the stack (after the wrap + this helper).
function firstFrame(stack) {
  try {
    const lines = String(stack || '').split(' | ');
    for (const ln of lines) {
      if (ln.indexOf('dutyfirst-instrument') !== -1) continue;
      const m = ln.match(/at (\S+)/);
      if (m && m[1] !== 'Object.<anonymous>') return m[1];
    }
    return null;
  } catch (e) { return null; }
}

function nameRoll(inv) {
  const roll = {};
  try {
    for (const it of (inv || [])) {
      if (!it) continue;
      const nm = it.name || '(unnamed)';
      const k = (it.kcalEach || 0) * (it.units || 0);
      const e = roll[nm] || (roll[nm] = { count: 0, units: 0, kcal: 0 });
      e.count++; e.units += (it.units || 0); e.kcal += k;
    }
  } catch (e) {}
  return roll;
}

function install(Game) {
  const t = {
    assignCalls: [], // {day, part, verb, task, vid, occ, ret, reason, reasonClass, trustBefore, hpBefore, comp, via, buddy, havenBefore, caller, seq}
    resolveCalls: [], // {day, part, resolveId, vid, task, outcome, preHp} — one row per pre-assignment per resolveAssignments call
    resolutions: [], // {day, part, resolveId, vid, taskPre, taskPost, callerPath, outcome, threw}
    hunts: [],       // {day, vid, comp, temp, kcal, aid, killed, threw}
    hurts: [],       // {day, vid, dmg, cause, hpBefore, hpAfter, died, dutyTask, leadTask, threw}
    deposits: [],    // {day, name, kcal, caller}
    patrols: [],     // {day, vid, threw}
    waveKills: [],   // {day, monsterId, vid, channel, tricks}
    medicTicks: [],  // {day, holderBefore, holderAfter, eligibleCount, sickCount, noMedic, threw}
    cureAttempts: [],// {day, holder, pid, disease, result, via, curesBefore, curesAfter, threw}
    careTicks: [],   // {day, sickBefore, sickAfter, curesBefore, curesAfter, threw}
    teleTrap: [],    // {day, type, vid, caught, kcal, species}
    deeds: [],       // {day, deed, who}
    practiceReps: [],// {day, vid, task, repsBefore, repsAfter, stepsBefore, stepsAfter}
    daily: [],       // snapshots
    instrumentErrors: [],
    wrapLive: {},
  };
  const wrapped = {};
  let _assignSeq = 0;
  let _resolveId = 0;
  let _currentResolveId = null;
  const roaStack = []; // open resolveOneAssignment frames

  function err(site, e) {
    try { t.instrumentErrors.push(site + ': ' + String((e && e.message) || e).slice(0, 120)); } catch (e2) {}
  }

  function wrapMethod(name, record) {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { t.instrumentErrors.push(name + '-missing: not a function'); return; }
      wrapped[name] = orig;
      const selfGame = Game;
      Game[name] = function () {
        let r, threw = null;
        let pre = null;
        try { pre = record.pre ? record.pre(Array.prototype.slice.call(arguments)) : null; } catch (e) { err(name + '-pre', e); }
        try { r = orig.apply(selfGame, arguments); } catch (e) { threw = e; }
        try {
          t.wrapLive[name] = true;
          if (record.post) record.post(Array.prototype.slice.call(arguments), r, threw, pre);
        } catch (e) { err(name + '-record', e); }
        if (threw) throw threw;
        return r;
      };
    } catch (e) { err(name + '-wrap', e); }
  }

  function trustOf(vid) {
    try { const tr = ((Game.state || {}).village || {}).trust || {}; return tr[vid] === undefined ? 10 : tr[vid]; } catch (e) { return null; }
  }
  function hpOf(vid) {
    try { const h = ((Game.state || {}).village || {}).health || {}; return h[vid] === undefined ? 100 : h[vid]; } catch (e) { return null; }
  }
  function personFor(vid) {
    try { if (typeof Game.getPerson === 'function') { const p = Game.getPerson(vid); if (p) return p; } } catch (e) {}
    try { return ((Game.data || {}).villagers || []).find(function (x) { return x && x.id === vid; }) || {}; } catch (e) { return {}; }
  }
  function atHaven() {
    try { return !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) { return null; }
  }
  function partNow() { try { return Game.dayPart; } catch (e) { return null; } }
  function compOf(vid, task) {
    try { return (typeof Game.villagerCompetence === 'function') ? Game.villagerCompetence(vid, task) : null; } catch (e) { return null; }
  }
  function curesNow() {
    try { const c = ((Game.state || {}).village || {}).medicDutyCures || {}; return { ability: c.ability || 0, medicine: c.medicine || 0 }; } catch (e) { return { ability: null, medicine: null }; }
  }
  function sickCount() {
    try { return Object.keys(((Game.state || {}).village || {}).sick || {}).length; } catch (e) { return null; }
  }
  function eligibleCount() {
    try {
      const v = (Game.state || {}).village || {};
      let n = 0;
      for (const id of (v.roster || [])) { try { if (Game.isMedicDutyEligible && Game.isMedicDutyEligible(id)) n++; } catch (e) {} }
      return n;
    } catch (e) { return null; }
  }
  function holderNow() {
    try { return (typeof Game.medicDutyHolder === 'function') ? Game.medicDutyHolder() : null; } catch (e) { return null; }
  }
  function diseaseOf(rec) {
    try { return (typeof Game.villagerDiseaseId === 'function') ? Game.villagerDiseaseId(rec) : null; } catch (e) { return null; }
  }
  function assignmentsCopy() {
    const out = {};
    try {
      const asg = ((Game.state || {}).village || {}).assignments || {};
      for (const vid of Object.keys(asg)) {
        const a = asg[vid] || {};
        out[vid] = { task: a.task || null, assignedDay: (typeof a.assignedDay === 'number' ? a.assignedDay : null), assignedPart: (a.assignedPart !== undefined ? a.assignedPart : null), via: a.via || null, buddy: a.buddy || null };
      }
    } catch (e) { err('asg-copy', e); }
    return out;
  }
  function taskLeadsCopy() {
    try { return Object.assign({}, ((Game.state || {}).village || {}).taskLeads || {}); } catch (e) { return {}; }
  }

  function classifyRet(ret) {
    if (ret === null || ret === undefined) return 'null';
    if (typeof ret === 'object') { if (ret.ok) return 'ok'; if (ret.refused) return 'refused'; return 'other-obj'; }
    return typeof ret;
  }
  function classifyReason(retClass, ret, pre) {
    if (retClass === 'ok') return { reason: null, reasonClass: 'ok' };
    if (retClass === 'refused') {
      const raw = (ret && ret.reason) || null;
      if (raw === 'wounded') return { reason: raw, reasonClass: 'wounded' };
      let lr = null;
      try { lr = ((Game.state || {}).village || {}).lastRefusal; } catch (e) {}
      const text = raw || ((lr && lr.vid === pre.vid && lr.task === pre.task) ? String(lr.reason || '') : null);
      if (!text) return { reason: null, reasonClass: 'other' };
      if (/Trust too low/.test(text)) return { reason: text.slice(0, 120), reasonClass: 'trust-gate' };
      if (/reluctant/i.test(text)) return { reason: text.slice(0, 120), reasonClass: 'reluctant' };
      return { reason: text.slice(0, 120), reasonClass: 'other' };
    }
    // null return: distinguish the engine's null paths from the pre flags.
    if (pre.isRest) return { reason: 'rest', reasonClass: 'rest' };
    if (pre.isSelf) return { reason: 'self', reasonClass: 'self' };
    if (!pre.taskKnown) return { reason: 'null-task', reasonClass: 'null-task' };
    if (pre.via !== 'in-person') return { reason: 'remote', reasonClass: 'remote' };
    if (pre.havenBefore === false) return { reason: 'not-at-haven', reasonClass: 'not-at-haven' };
    return { reason: null, reasonClass: 'null-other' };
  }

  // (1) Staffing — assignTask, ALL 15 tasks. offerDeal / appealToGoal, all tasks.
  wrapMethod('assignTask', {
    pre: function (args) {
      let taskKnown = null;
      try { const tasks = (typeof Game.delegateTasks === 'function') ? Game.delegateTasks() : {}; taskKnown = !!(tasks && tasks[args[1]]); } catch (e) {}
      return {
        day: dayOf(Game), part: partNow(), vid: args[0], task: args[1],
        trustBefore: trustOf(args[0]), hpBefore: hpOf(args[0]),
        comp: compOf(args[0], args[1]),
        havenBefore: atHaven(), stack: stackText(3),
        via: (args[2] && args[2].via) || 'in-person',
        taskKnown: taskKnown,
        isRest: args[1] === 'rest',
        isSelf: (function () { try { return args[0] === Game.villagerId; } catch (e) { return false; } })(),
      };
    },
    post: function (args, r, threw, pre) {
      const rc = classifyRet(r);
      const cls = classifyReason(rc, r, pre);
      let buddy = null;
      try { if (rc === 'ok') { const a = (((Game.state || {}).village || {}).assignments || {})[args[0]] || {}; buddy = a.buddy || null; } } catch (e) {}
      t.assignCalls.push({
        day: (pre && pre.day) || dayOf(Game), part: (pre && pre.part) || null,
        verb: 'assignTask', task: args[1], vid: args[0] || null,
        occ: String((personFor(args[0]).formerOccupation || '')),
        ret: rc, reason: cls.reason, reasonClass: cls.reasonClass,
        trustBefore: (pre && pre.trustBefore !== undefined ? pre.trustBefore : null),
        hpBefore: (pre && pre.hpBefore !== undefined ? pre.hpBefore : null),
        comp: (pre && pre.comp !== undefined ? pre.comp : null),
        via: (pre && pre.via) || 'in-person', buddy: buddy,
        havenBefore: (pre && pre.havenBefore !== undefined ? pre.havenBefore : null),
        caller: firstFrame((pre && pre.stack) || ''),
        seq: (++_assignSeq), threw: !!threw,
      });
    },
  });
  ['offerDeal', 'appealToGoal'].forEach(function (verb) {
    wrapMethod(verb, {
      pre: function (args) {
        return { day: dayOf(Game), part: partNow(), trustBefore: trustOf(args[0]), hpBefore: hpOf(args[0]), comp: compOf(args[0], args[1]), havenBefore: atHaven() };
      },
      post: function (args, r, threw, pre) {
        const rc = classifyRet(r);
        t.assignCalls.push({
          day: (pre && pre.day) || dayOf(Game), part: (pre && pre.part) || null,
          verb: verb, task: args[1], vid: args[0] || null,
          occ: String((personFor(args[0]).formerOccupation || '')),
          ret: rc, reason: (r && r.reason) || null,
          reasonClass: (rc === 'ok' ? 'ok' : (rc === 'refused' ? 'refused-unclassified' : 'null')),
          trustBefore: (pre && pre.trustBefore !== undefined ? pre.trustBefore : null),
          hpBefore: (pre && pre.hpBefore !== undefined ? pre.hpBefore : null),
          comp: (pre && pre.comp !== undefined ? pre.comp : null),
          via: null, buddy: null,
          havenBefore: (pre && pre.havenBefore !== undefined ? pre.havenBefore : null),
          caller: verb, seq: (++_assignSeq), threw: !!threw,
        });
      },
    });
  });

  // (2a) resolveAssignments — pre/post diff classification.
  wrapMethod('resolveAssignments', {
    pre: function (args) {
      _resolveId++;
      _currentResolveId = _resolveId;
      const v = (Game.state || {}).village || {};
      const hp = {};
      try { for (const vid of Object.keys(((Game.state || {}).village || {}).health || {})) hp[vid] = ((Game.state || {}).village || {}).health[vid]; } catch (e) {}
      return {
        day: dayOf(Game), part: partNow(), resolveId: _resolveId,
        asg: assignmentsCopy(), leads: taskLeadsCopy(), hp: hp,
        roster: (((Game.state || {}).village || {}).roster || []).slice(),
      };
    },
    post: function (args, r, threw, pre) {
      const id = (pre && pre.resolveId) || null;
      try {
        const postAsg = assignmentsCopy();
        const roster = ((Game.state || {}).village || {}).roster || [];
        const resFor = {};
        for (const rec of t.resolutions) {
          if (rec.resolveId === id && rec.callerPath === 'assignment') resFor[rec.vid] = rec;
        }
        for (const vid of Object.keys((pre && pre.asg) || {})) {
          const a = pre.asg[vid] || {};
          let outcome;
          if (postAsg[vid]) outcome = 'sheltered-kept';
          else if (roster.indexOf(vid) === -1) outcome = 'dead-or-left';
          else if (resFor[vid]) outcome = resFor[vid].outcome;
          else if (((pre.hp || {})[vid] !== undefined ? pre.hp[vid] : 100) < 40 && ['patrol', 'scout', 'hunt', 'forage'].indexOf(a.task) >= 0) outcome = 'fitness-rest';
          else outcome = 'unclassified';
          t.resolveCalls.push({
            day: (pre && pre.day) || dayOf(Game), part: (pre && pre.part) || null,
            resolveId: id, vid: vid, task: a.task || null, outcome: outcome,
            preHp: ((pre.hp || {})[vid] !== undefined ? pre.hp[vid] : null),
            threw: !!threw,
          });
        }
      } catch (e) { err('resolveAssignments-post', e); }
      _currentResolveId = null;
    },
  });

  // (2b) resolveOneAssignment — caller path + outcome via the practice marker.
  wrapMethod('resolveOneAssignment', {
    pre: function (args) {
      const a = args[1] || {};
      let callerPath;
      if (roaStack.length > 0) {
        callerPath = 'redirect-recursion';
        try { roaStack[roaStack.length - 1].redirected = true; } catch (e) {}
      } else if (a.assignedDay === undefined) callerPath = 'taskLead';
      else callerPath = 'assignment';
      const frame = {
        vid: args[0], taskPre: a.task || null, callerPath: callerPath,
        practiceSeen: false, redirected: false,
      };
      roaStack.push(frame);
      return { day: dayOf(Game), part: partNow(), resolveId: _currentResolveId, frame: frame, taskPre: a.task || null };
    },
    post: function (args, r, threw, pre) {
      const frame = (pre && pre.frame) || null;
      try {
        // Pop this frame (it should be the top; if a nested frame is still
        // open the stack is corrupt — pop by identity, never by index).
        const ix = roaStack.indexOf(frame);
        if (ix >= 0) roaStack.splice(ix, 1);
      } catch (e) { err('roa-pop', e); }
      const a = args[1] || {};
      let outcome;
      if (threw) outcome = 'exception-thrown';
      else if (frame && frame.redirected) outcome = 'redirected';
      else if (frame && frame.practiceSeen) outcome = 'completed';
      else outcome = 'skipped-early';
      t.resolutions.push({
        day: (pre && pre.day) || dayOf(Game), part: (pre && pre.part) || null,
        resolveId: (pre && pre.resolveId !== undefined ? pre.resolveId : null),
        vid: args[0] || null, taskPre: (pre && pre.taskPre) || null,
        taskPost: a.task || null,
        callerPath: (frame && frame.callerPath) || null,
        outcome: outcome, threw: !!threw,
      });
    },
  });

  // (10) villagerPractice — the completion detector + the practice record.
  wrapMethod('villagerPractice', {
    pre: function (args) {
      let repsBefore = null, stepsBefore = null;
      try {
        const vp = personFor(args[0]);
        repsBefore = ((vp.practice || {})[args[1]]) || 0;
        stepsBefore = (typeof Game.villagerPracticeSteps === 'function') ? Game.villagerPracticeSteps(vp, args[1]) : null;
      } catch (e) {}
      return { day: dayOf(Game), repsBefore: repsBefore, stepsBefore: stepsBefore };
    },
    post: function (args, r, threw, pre) {
      try {
        const vp = personFor(args[0]);
        const repsAfter = ((vp.practice || {})[args[1]]) || 0;
        const stepsAfter = (typeof Game.villagerPracticeSteps === 'function') ? Game.villagerPracticeSteps(vp, args[1]) : null;
        t.practiceReps.push({
          day: (pre && pre.day) || dayOf(Game), vid: args[0] || null, task: args[1] || null,
          repsBefore: (pre && pre.repsBefore !== undefined ? pre.repsBefore : null),
          repsAfter: repsAfter,
          stepsBefore: (pre && pre.stepsBefore !== undefined ? pre.stepsBefore : null),
          stepsAfter: stepsAfter, threw: !!threw,
        });
        // Mark the innermost open resolution frame for this villager:
        // practice runs ONLY at the resolveOneAssignment tail.
        for (let i = roaStack.length - 1; i >= 0; i--) {
          if (roaStack[i].vid === args[0]) { roaStack[i].practiceSeen = true; break; }
        }
      } catch (e) { err('practice-record', e); }
    },
  });

  // (3) villagerHuntResolve — kills / stalk-fails by species + kcal.
  wrapMethod('villagerHuntResolve', {
    pre: function (args) {
      let temp = null;
      try { const vp = personFor(args[0]); temp = (vp.personality && vp.personality.temperament) || null; } catch (e) {}
      return { day: dayOf(Game), comp: compOf(args[0], 'hunt'), temp: temp };
    },
    post: function (args, r, threw, pre) {
      t.hunts.push({
        day: (pre && pre.day) || dayOf(Game), vid: args[0] || null,
        comp: (pre && pre.comp !== undefined ? pre.comp : null),
        temp: (pre && pre.temp) || null,
        kcal: (r && typeof r.kcal === 'number' ? r.kcal : null),
        aid: (r && r.aid) || null,
        killed: !!(r && r.kcal > 0 && r.aid),
        threw: !!threw,
      });
    },
  });

  // (4) hurtVillager — the duty-harm backstop.
  wrapMethod('hurtVillager', {
    pre: function (args) {
      let dutyTask = null, leadTask = null;
      try {
        const asg = (((Game.state || {}).village || {}).assignments || {})[args[0]];
        dutyTask = (asg && asg.task) || null;
        const leads = ((Game.state || {}).village || {}).taskLeads || {};
        for (const tk of Object.keys(leads)) { if (leads[tk] === args[0]) { leadTask = tk; break; } }
      } catch (e) {}
      return { day: dayOf(Game), hpBefore: hpOf(args[0]), dutyTask: dutyTask, leadTask: leadTask };
    },
    post: function (args, r, threw, pre) {
      let died = null;
      try {
        const p = personFor(args[0]);
        died = !!(p && p.dead) || (hpOf(args[0]) !== null && hpOf(args[0]) <= 0);
      } catch (e) {}
      t.hurts.push({
        day: (pre && pre.day) || dayOf(Game), vid: args[0] || null,
        dmg: (typeof args[1] === 'number' ? args[1] : null),
        cause: args[2] || null,
        hpBefore: (pre && pre.hpBefore !== undefined ? pre.hpBefore : null),
        hpAfter: hpOf(args[0]),
        died: died,
        dutyTask: (pre && pre.dutyTask) || null,
        leadTask: (pre && pre.leadTask) || null,
        threw: !!threw,
      });
    },
  });

  // (5) stockPantry — the duty-yield backstop.
  wrapMethod('stockPantry', {
    pre: function (args) { return { day: dayOf(Game), stack: stackText(3) }; },
    post: function (args, r, threw, pre) {
      t.deposits.push({
        day: (pre && pre.day) || dayOf(Game),
        name: args[1] || null,
        kcal: (typeof args[0] === 'number' ? args[0] : null),
        caller: firstFrame((pre && pre.stack) || ''),
        threw: !!threw,
      });
    },
  });

  // (6a) resolvePatrol — every patrol resolution.
  wrapMethod('resolvePatrol', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      t.patrols.push({ day: (pre && pre.day) || dayOf(Game), vid: args[0] || null, threw: !!threw });
    },
  });

  // (6b) recordWaveKill — patrol kill attribution (channel 'patrol').
  wrapMethod('recordWaveKill', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      t.waveKills.push({
        day: (pre && pre.day) || dayOf(Game),
        monsterId: args[0] || null, vid: args[1] || null,
        channel: args[2] || null, tricks: args[3] || null,
        threw: !!threw,
      });
    },
  });

  // (7a) medicDutyTick — holder before/after + pool + sick count.
  wrapMethod('medicDutyTick', {
    pre: function (args) {
      return { day: dayOf(Game), holderBefore: holderNow(), eligible: eligibleCount(), sick: sickCount(), curesBefore: curesNow() };
    },
    post: function (args, r, threw, pre) {
      t.medicTicks.push({
        day: (pre && pre.day) || dayOf(Game),
        holderBefore: (pre && pre.holderBefore !== undefined ? pre.holderBefore : null),
        holderAfter: holderNow(),
        eligibleCount: (pre && pre.eligible !== undefined ? pre.eligible : null),
        sickCount: (pre && pre.sick !== undefined ? pre.sick : null),
        noMedic: (pre && pre.eligible === 0),
        curesBefore: (pre && pre.curesBefore) || null,
        curesAfter: curesNow(),
        threw: !!threw,
      });
    },
  });

  // (7b) medicDutyCureAttempt — holder/patient/disease/result/channel.
  wrapMethod('medicDutyCureAttempt', {
    pre: function (args) {
      let disease = null;
      try { const rec = (((Game.state || {}).village || {}).sick || {})[args[1]] || null; disease = diseaseOf(rec); } catch (e) {}
      return { day: dayOf(Game), disease: disease, curesBefore: curesNow() };
    },
    post: function (args, r, threw, pre) {
      const cb = (pre && pre.curesBefore) || { ability: 0, medicine: 0 };
      const ca = curesNow();
      let via = null;
      if (ca.ability > cb.ability) via = 'ability';
      else if (ca.medicine > cb.medicine) via = 'medicine';
      t.cureAttempts.push({
        day: (pre && pre.day) || dayOf(Game),
        holder: args[0] || null, pid: args[1] || null,
        disease: (pre && pre.disease) || null,
        result: (r === true ? 'cured' : 'no'),
        via: via, curesBefore: cb, curesAfter: ca,
        threw: !!threw,
      });
    },
  });

  // (7c) villagerCareTick — calls per day + cure-counter delta.
  wrapMethod('villagerCareTick', {
    pre: function (args) { return { day: dayOf(Game), sickBefore: sickCount(), curesBefore: curesNow() }; },
    post: function (args, r, threw, pre) {
      t.careTicks.push({
        day: (pre && pre.day) || dayOf(Game),
        sickBefore: (pre && pre.sickBefore !== undefined ? pre.sickBefore : null),
        sickAfter: sickCount(),
        curesBefore: (pre && pre.curesBefore) || null,
        curesAfter: curesNow(),
        threw: !!threw,
      });
    },
  });

  // (8) tele — villager-initiative TRAPS returns only.
  wrapMethod('tele', {
    pre: function (args) { return { type: args[0] }; },
    post: function (args, r, threw, pre) {
      try {
        const ty = args[0];
        if (ty === 'npc_trap' || ty === 'npc_pit') {
          const d = args[1] || {};
          t.teleTrap.push({
            day: dayOf(Game), type: ty, vid: d.vid || null,
            caught: !!d.caught, kcal: (typeof d.kcal === 'number' ? d.kcal : null),
            species: d.species || null,
          });
        }
      } catch (e) { err('tele-record', e); }
    },
  });

  // (9) Deeds. noteDeed IS creditDeed('player', ...) internally
  // (tracks.js): same suppression flag as trapfirst-a / fishfirst-a.
  let _inNoteDeed = false;
  wrapMethod('noteDeed', {
    pre: function (args) { _inNoteDeed = true; return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      try {
        if (DUTY_DEEDS.indexOf(args[0]) !== -1) t.deeds.push({ day: (pre && pre.day) || dayOf(Game), deed: args[0], who: 'player' });
      } finally { _inNoteDeed = false; }
    },
  });
  wrapMethod('creditDeed', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      if (_inNoteDeed) return; // internal delegation of noteDeed — already recorded
      if (DUTY_DEEDS.indexOf(args[1]) !== -1) t.deeds.push({ day: (pre && pre.day) || dayOf(Game), deed: args[1], who: args[0] || null });
    },
  });

  // (11) Daily snapshot.
  function snapshot() {
    const snap = { day: dayOf(Game) };
    try {
      const v = (Game.state || {}).village || {};
      snap.assignments = assignmentsCopy();
      snap.taskLeads = taskLeadsCopy();
      snap.roster = (v.roster || []).slice();
      snap.rosterLen = (v.roster || []).length;
    } catch (e) { snap.assignments = null; err('snap-asg', e); }
    try {
      const v = (Game.state || {}).village || {};
      snap.medicDutyRaw = v.medicDuty || null;
      snap.medicDutyHolder = holderNow();
      snap.medicEligible = eligibleCount();
      snap.medicCures = curesNow();
      snap.medicDutyBlocked = v.medicDutyBlocked || 0;
    } catch (e) { snap.medicDutyHolder = null; err('snap-medic', e); }
    try {
      const v = (Game.state || {}).village || {};
      snap.sick = {};
      for (const vid of Object.keys(v.sick || {})) {
        const rec = v.sick[vid] || {};
        snap.sick[vid] = {
          severity: (typeof rec.severity === 'number' ? rec.severity : null),
          daysLeft: (typeof rec.daysLeft === 'number' ? rec.daysLeft : null),
          disease: diseaseOf(rec),
        };
      }
      snap.sickCount = Object.keys(snap.sick).length;
    } catch (e) { snap.sick = null; err('snap-sick', e); }
    try {
      const v = (Game.state || {}).village || {};
      snap.rosterHP = {};
      for (const vid of (v.roster || [])) snap.rosterHP[vid] = hpOf(vid);
    } catch (e) { snap.rosterHP = null; err('snap-hp', e); }
    try {
      const v = (Game.state || {}).village || {};
      snap.objectives = {};
      const objs = v.objectives || {};
      for (const vid of (v.roster || [])) {
        const o = objs[vid];
        snap.objectives[vid] = (o && o.kind) || 'none';
      }
    } catch (e) { snap.objectives = null; err('snap-obj', e); }
    try {
      snap.practice = {};
      snap.foodXp = {};
      snap.competence = {};
      const roster = (((Game.state || {}).village || {}).roster || []);
      for (const vid of roster) {
        try {
          const person = personFor(vid);
          if (person && person.practice && Object.keys(person.practice).length) snap.practice[vid] = Object.assign({}, person.practice);
          if (person && person.foodXp && Object.keys(person.foodXp).length) snap.foodXp[vid] = Object.assign({}, person.foodXp);
          snap.competence[vid] = {};
          for (const tk of TASKS) { if (tk !== 'rest') snap.competence[vid][tk] = compOf(vid, tk); }
        } catch (e) {}
      }
    } catch (e) { snap.practice = null; err('snap-practice', e); }
    try {
      const v = (Game.state || {}).village || {};
      snap.pantryByName = nameRoll(v.pantry || []);
      snap.pantryKcal = Object.keys(snap.pantryByName).reduce(function (a, k) { return a + (snap.pantryByName[k].kcal || 0); }, 0);
      snap.water = { clean: ((v.water || {}).clean || 0), dirty: ((v.water || {}).dirty || 0) };
      snap.wood = v.wood || 0;
    } catch (e) { snap.pantryByName = null; err('snap-pantry', e); }
    try {
      const st = (typeof Game.stashState === 'function') ? Game.stashState() : null;
      snap.materials = st ? Object.assign({}, (st.materials || {})) : null;
      snap.medicine = st ? (st.medicine || []).map(function (m) { return { medType: m.medType || null, doses: m.doses || 0 }; }) : null;
    } catch (e) { snap.materials = null; err('snap-stash', e); }
    try {
      const v = (Game.state || {}).village || {};
      snap.cistern = {
        waterHauls: v.waterHauls || 0,
        cisternRedirects: v.cisternRedirects || 0,
        cisternOverflowHauls: v.cisternOverflowHauls || 0,
        cisternOverflowL: v.cisternOverflowL || 0,
      };
      snap.throttle = {
        throttleRedirects: v.throttleRedirects || 0,
        throttleExemptDepth: v.throttleExemptDepth || 0,
      };
      snap.deadfall = {
        hauls: Game._deadfallHauls || 0,
        sticks: Game._deadfallSticks || 0,
        fiber: Game._deadfallFiber || 0,
      };
      snap.haulcount = Game._haulcount ? { villagerPreserveBatches: Game._haulcount.villagerPreserveBatches || 0, villagerPreserveKcal: Game._haulcount.villagerPreserveKcal || 0 } : { villagerPreserveBatches: 0, villagerPreserveKcal: 0 };
      snap.gives = Object.assign({}, (v.gives || {}));
      snap.havenToday = Object.assign({}, (v.havenToday || {}));
    } catch (e) { snap.cistern = null; err('snap-ledgers', e); }
    try {
      const plots = (typeof Game.gardenPlots === 'function') ? Game.gardenPlots() : [];
      const live = (plots || []).filter(function (p) { return p && p.pid && !p.dead; });
      const gday = dayOf(Game);
      let ripe = 0;
      try { for (const p of live) { if (typeof Game.plotRipe === 'function' && Game.plotRipe(p, gday)) ripe++; } } catch (e) {}
      snap.garden = { plots: (plots || []).length, live: live.length, ripe: ripe };
    } catch (e) { snap.garden = null; err('snap-garden', e); }
    t.daily.push(snap);
    return snap;
  }

  function uninstall() {
    Object.keys(wrapped).forEach(function (name) {
      try { Game[name] = wrapped[name]; } catch (e) { err('uninstall-' + name, e); }
    });
  }

  return { t: t, snapshot: snapshot, uninstall: uninstall };
}

module.exports = {
  install: install,
  TASKS: TASKS,
  DUTY_DEEDS: DUTY_DEEDS,
};
