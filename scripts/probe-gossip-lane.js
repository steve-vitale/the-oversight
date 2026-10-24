#!/usr/bin/env node
// probe-gossip-lane.js -- r46 mechanism probe: for each gossip turn, log the
// lane state: live contest entries, whether the talked-to villager heard
// them, and what the gossip branch actually served.
'use strict';
process.env.TRIBFLOOR = '1';
const REPO = '/home/hatch/workspace/the-scattering';
const { loadGame, setupGame, runDays } = require(REPO + '/scripts/sim-harness');
const { competent } = require(REPO + '/scripts/policies/competent');

function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }
function safe(fn, dflt) { try { return fn(); } catch (e) { return dflt; } }
const CONTEST_ACTIONS = new Set(['contest_won', 'contest_survived', 'contest_died']);

async function main() {
  const seed = parseInt(process.env.SEED || '4201', 10);
  const { Game } = await loadGame({ seed, mode: 'probe-gossip-lane', fullTelemetry: true });
  await setupGame(Game);
  const curDay = () => safe(() => (Game.state.scholar || {}).day || 0, 0);
  const me = () => safe(() => Game.villagerId, null);
  const playerId = me();
  const livingIds = () => {
    const vv = Game.state.village || {};
    return (vv.roster || []).filter(id => {
      if (id === playerId) return false;
      try { if ((Game.getPerson(id) || {}).dead) return false; } catch (e) {}
      return true;
    });
  };
  const talkedToday = new Set();
  const rows = [];
  const seedLog = [];
  try {
    const origCx = Game._cxGossip;
    if (typeof origCx === 'function') {
      Game._cxGossip = function (how, pid, contestName) {
        let r = null;
        try { r = origCx.apply(this, arguments); } catch (e) {}
        try { seedLog.push({ day: curDay(), how, pid: vname(Game, pid), contest: contestName || null }); } catch (e) {}
        return r;
      };
    }
  } catch (e) {}
  const base = competent;
  const pol = Object.assign({}, base, {
    id: 'probe-gossip-lane',
    daily(Game2, ctx) {
      talkedToday.clear();
      if (base.daily) base.daily(Game2, ctx);
      const day = curDay();
      if (day < 20 || day > 60) return;
      const living = livingIds();
      if (!living.length) return;
      for (let n = 0; n < 3; n++) {
        const pool = living.filter(id => !talkedToday.has(id));
        const arr = pool.length ? pool : living;
        const target = arr[(day * 7 + n * 5) % arr.length];
        if (!target || talkedToday.has(target)) continue;
        talkedToday.add(target);
        try { Game.startConvo(target); } catch (e) { continue; }
        const seenIds = [];
        for (let t = 0; t < 14; t++) {
          let c = null; try { c = Game.convoGet(target); } catch (e) {}
          if (!c || !c.active) break;
          let choices = []; try { choices = Game.convoChoices(target) || []; } catch (e) {}
          if (!choices.length) break;
          const byId = (re) => choices.find(x => x && re.test(String(x.id || '')));
          const fresh = (x) => x && !seenIds.includes(String(x.id || ''));
          let pick = null;
          const g = byId(/^ask:gossip$/);
          if (g && fresh(g)) pick = g;
          if (!pick) pick = choices.find(x => String(x.id || '') === 'more');
          const ansChoices = choices.filter(x => x && /^ans:/.test(String(x.id || '')));
          if (!pick && ansChoices.length && !seenIds.some(id => /^ans:/.test(id)))
            pick = ansChoices.find(x => !/honest_pass/.test(String(x.id || ''))) || ansChoices[0];
          if (!pick) pick = choices.find(x => fresh(x) && String(x.temper || '') === 'kind');
          if (!pick) pick = choices.find(x => fresh(x) && /^(dlg:commit|dlg:help|dlg:details|want:|ask:|gq:)/.test(String(x.id || '')));
          if (!pick) pick = choices.find(x => x && /^(dlg:commit|dlg:help|dlg:details|want:|ask:|gq:)/.test(String(x.id || '')));
          if (!pick) pick = choices.find(x => fresh(x) && /^(agree|joke|silence|react:)/.test(String(x.id || '')));
          if (!pick) pick = choices.find(x => fresh(x) && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
          if (!pick) pick = choices[0];
          if (!pick) break;
          seenIds.push(String(pick.id || ''));
          const threadBefore = safe(() => { const cc = Game.convoGet(target); return cc && cc.thread; }, null);
          // SHADOW: replicate the EXACT lane predicate from game.js askAbout.
          const gossip = ((Game.state.village || {}).gossip || []);
          const liveContest = gossip.filter(gg => CONTEST_ACTIONS.has(gg.action));
          const heardContest = liveContest.filter(gg => (gg.heard || []).includes(target));
          const cc = safe(() => Game.convoGet(target), null);
          const skip = (cc && cc.gossipServedSigs) || [];
          const gossipSig = (g) => 'gossip:' + (g.action || '') + '|' + ((((g.dims) || {}).who) || '') + '|' + (g.partKey || ('d' + (g.day || 0)));
          const gossipContentKey = (g) => 'gossip:' + (g.action || '') + '|' + ((((g.dims) || {}).who) || '') + '|';
          const servedAlready = (g) => {
            if (skip.indexOf(gossipSig(g)) !== -1) return true;
            const ck = gossipContentKey(g);
            for (const s of skip) if (s.indexOf(ck) === 0) return true;
            return false;
          };
          const isWho = (g) => g.dims && g.dims.who && g.dims.who !== Game.villagerId;
          const isContestNews = (g) => g.action === 'contest_won' || g.action === 'contest_survived' || g.action === 'contest_died';
          const heard = gossip.filter(gg => (gg.heard || []).includes(target));
          const aboutOther = heard.filter(isWho);
          const contestNews = aboutOther.filter(isContestNews);
          const lanePick = (() => { for (let i = contestNews.length - 1; i >= 0; i--) if (!servedAlready(contestNews[i])) return contestNews[i]; return null; })();
          const beforeLen = safe(() => Game.convoGet(target).transcript.length, 0);
          try { Game.convoTurn(target, String(pick.id || '')); } catch (e) { break; }
          const tr = safe(() => Game.convoGet(target).transcript || [], []);
          const newLines = tr.slice(beforeLen).map(e => String((e && (e.text || e.line)) || ''));
          const saidLine = newLines.filter(s => s.length > 0 && !/^you:/i.test(s)).join(' | ').slice(0, 200);
          const threadAfter = safe(() => { const cc = Game.convoGet(target); return cc && cc.thread; }, null);
          if (threadBefore === 'gossip' || threadAfter === 'gossip' || /^ask:gossip$/.test(String(pick.id || ''))) {
            const isContest = /on the cameras?\.|walked out of .*alive|died in .*the fire was quiet/i.test(saidLine);
            rows.push({
              day, vid: vname(Game, target), pick: String(pick.id || ''),
              liveContest: liveContest.length,
              heardContest: heardContest.map(gg => `${gg.action}:${vname(Game, gg.dims && gg.dims.who)}`).join(';'),
              laneNonEmpty: contestNews.length > 0,
              lanePick: lanePick ? `${lanePick.action}:${vname(Game, lanePick.dims && lanePick.dims.who)}` : null,
              skipCount: skip.length,
              isContest, saidLine,
            });
          }
        }
        try { Game.endConvo(target, 'probe'); } catch (e) {}
      }
    },
  });
  await runDays(Game, pol, { days: 61 });
  for (const r of rows) {
    console.log(`d${r.day} ${r.vid} [${r.pick}] live=${r.liveContest} heard=[${r.heardContest}] laneNonEmpty=${r.laneNonEmpty} lanePick=${r.lanePick} skip=${r.skipCount} contestServe=${r.isContest}`);
    console.log(`    said: ${r.saidLine.slice(0, 180)}`);
  }
  console.log(`ROWS: ${rows.length}`);
}
main().catch(e => { console.error('PROBE ERROR', e && e.stack || e); process.exit(2); });
