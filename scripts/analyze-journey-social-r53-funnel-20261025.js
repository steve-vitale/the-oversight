#!/usr/bin/env node
// analyze-journey-social-r53-funnel-20261025.js -- FINER FUNNEL SPLIT (r53).
// r53 item 3: the per-seed JSON now persists the full t2picks list, so the
// funnel split can go finer than r52's menu-vs-pick split. For each saved
// subject-no-offer probe turn (menuProblem cases: a pick EXISTS right now
// but page 1 of the subject menu lacks 'ask:others'), classify WHY the
// menu lacks it, using the speaker's serving history from t2picksList:
//   - never-served: the speaker never had an 'others' serving before this
//     day -> 'others' was FRESH (never said) yet still not on page 1:
//     the freshCap exemption + pagination did not surface it.
//   - served-same-pick: last served pick == probe pick (same person+why)
//     -> 'others' was DISCUSSED and UNCHANGED: the subject menu excludes
//     discussed topics by design, so no menu fix scoped to fresh topics
//     can surface it. This is the discussed-exclusion blocker.
//   - served-changed-pick: last served pick != probe pick -> 'others' was
//     FRESH (re-offer gate: changed since served) yet still not on page 1:
//     pagination rank (topics sort last, page 1 holds ~5-6) buried it, or
//     the convo never paged. The menuMore flag separates those two:
//     menuMore=true means page 1 was full (pagination suspect);
//     menuMore=false means the menu was short and others still absent
//     (a genuine menu-construction gap, not pagination).
// Probe turns are capped at 200/seed in the per-seed JSON (driver slice),
// so counts here are a sample, not the full probe population — the split
// shares are the finding, not the absolute counts.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || '/home/hatch/workspace/worktrees/journey2-social';
const EVIDIR = path.join(REPO, 'evidence', '2026-10-25', 'r53');

function main() {
  const out = { seeds: {}, pooled: {} };
  const cats = ['never-served', 'served-same-pick', 'served-changed-pick', 'no-pick', 'unknown-speaker'];
  for (const s of [4901, 4902, 4903, 4904]) {
    const r = JSON.parse(fs.readFileSync(path.join(EVIDIR, `journey-social-r53-s${s}.json`), 'utf8'));
    const picks = r.t2picksList || [];
    // servings by speaker name, in day order
    const bySpeaker = {};
    for (const tp of picks) {
      (bySpeaker[tp.vidName] = bySpeaker[tp.vidName] || []).push(tp);
    }
    const probes = (r.funnelProbe && r.funnelProbe.probes) || [];
    const counts = Object.fromEntries(cats.map(c => [c, 0]));
    const changedMenuMore = { true: 0, false: 0 };
    const freshMenuMore = { true: 0, false: 0 };
    const examples = [];
    for (const pr of probes) {
      const pick = pr.pick;
      if (!pick || !pick.id || pick.why === 'neutral') { counts['no-pick']++; continue; }
      const hist = bySpeaker[pr.name] || [];
      const prior = hist.filter(tp => (tp.day || 0) < (pr.day || 0));
      if (!prior.length) {
        counts['never-served']++;
        freshMenuMore[String(!!pr.menuMore)]++;
        if (examples.filter(e => e.cat === 'never-served').length < 3)
          examples.push({ cat: 'never-served', seed: s, day: pr.day, speaker: pr.name, pick: pick.id + '/' + pick.why, menuMore: !!pr.menuMore, freshTopics: pr.freshTopics });
        continue;
      }
      const last = prior[prior.length - 1];
      // probe pick id is a villager id; last.id is also an id — compare raw ids.
      if (String(last.id) === String(pick.id) && String(last.why) === String(pick.why)) {
        counts['served-same-pick']++;
      } else {
        counts['served-changed-pick']++;
        changedMenuMore[String(!!pr.menuMore)]++;
        if (examples.filter(e => e.cat === 'served-changed-pick').length < 3)
          examples.push({ cat: 'served-changed-pick', seed: s, day: pr.day, speaker: pr.name, lastServed: last.idName + '/' + last.why + ' d' + last.day, probePick: pick.id + '/' + pick.why, menuMore: !!pr.menuMore, freshTopics: pr.freshTopics });
      }
    }
    out.seeds[s] = { probes: probes.length, counts, changedMenuMore, freshMenuMore, examples };
  }
  const pooled = Object.fromEntries(cats.map(c => [c, 0]));
  for (const s of Object.keys(out.seeds)) for (const c of cats) pooled[c] += out.seeds[s].counts[c];
  out.pooled = pooled;
  const menuProblem = pooled['never-served'] + pooled['served-same-pick'] + pooled['served-changed-pick'];
  out.pooledMenuProblem = menuProblem;
  out.pooledShares = Object.fromEntries(Object.entries(pooled).map(([k, v]) => [k, menuProblem ? (v / menuProblem) : null]));
  console.log(JSON.stringify(out, null, 1));
}
main();
