// @ontology
// system: table
// description: The galactic table — integrated endgame. Prices the run (never gates on godhood), offers the seven earned paths (feared, indispensable, beloved, witness, defiant, assimilated, relay), each a played failable challenge with light/dark branches earned from real behavior. Failure resolves the story (lesser frames, tribute, people) — never deletes the run. Grounding (humanity) is the two-way cost of integration. NPC ascension + facilitation credited honestly.
// provides:
//   - tableSeat()
//   - tableEarnedPaths()
//   - tableBranch(pathId)
//   - tableRegisterPath(def)
//   - tableScene()
//   - tableAnnounce(), tablePreview(), tableTakeSeat() — the seat is taken from Haven; relative until then (Steve 2026-10-14)
//   - tableSeatTaker()
//   - tableSeatTakerOptions()
//   - tableChooseSeatTaker(id)
//   - tableOfferSeatTaker()
//   - tableActive()
//   - tableEntryBlock()
//   - chooseTableOption(id)
//   - tableStartPath(pathId)
//   - tableChoose(choiceId)
//   - tableFail(reason)
//   - tableDowngradePick(pathId)
//   - tableResolveFinal(choiceId)
//   - tablePrompt(html, options, frame)
//   - grounding(who), groundingTier(who), groundingMult(who) (person-owned humanity; current bearer or canonical villager)
//   - addGrounding(n, why, who, opts)
//   - groundingReactionBeats(oldTier, newTier, who)
//   - sysBond()
//   - addSysBond(n, why)
//   - villagerAscensionScore(vid)
//   - tableFacilitate(kind, vid)
//   - tableTheme()
//   - tableEpilogue(frame, branch, choiceId)
//   - tableLiveWrap(text)
//   - tableHostsLines(pathId, branch) / tableResolveHosts(def, branch) — THE HOSTS, the key's ending (pg.networkFallen adds it to every path's finals)
//   - tableBeatChoices(beat, T) -> a beat's own choices plus the build-aware option on the beat that plays the build
//   - tableEndingLines(fid, outcome) -> the path's final plus one build coda (or a bespoke path entry) for the locked key
//   - tablePathName(id) -> the path's display name (the {path} token in endings)
// consumes:
//   - state.scholar, state.village, progState()
//   - ledger(), deedGateReady(), deedState(), scaleRank(), integrationStage(), havenViewership()
//   - say, sysSay, recordMoment, recordLegend, wipe, save
//   - metaNoteTable(), metaNoteTableChoice() (called directly — metaProgression's wraps bound at ITS load time to ledger.js's versions, so the wraps don't see these overrides)
//   - switchboard() (comms.js) for the light/dark axis
// Self-attaching module: Object.assign(Game, methods). Load AFTER comms.js
// (needs switchboard) and AFTER ledger.js (overrides tableScene /
// chooseTableOption via later assignment — dynamic dispatch picks these up).
// Path content lives in table-<path>.js, registered via tableRegisterPath.

(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;
  const R = Math.random;

  // Path registry — filled by table-<path>.js modules.
  const PATHS = {};
  function pathDef(id) { return PATHS[id] || null; }

  const methods = {
    // tableRegisterPath: path content modules call this at load.
    tableRegisterPath(def) {
      if (!def || !def.id) return;
      PATHS[def.id] = def;
    },
    // tablePathName: a path's display name ('the Beloved'); the {path}
    // token in the ending codas (endingKey.js).
    tablePathName(id) {
      const d = pathDef(id);
      return (d && d.name) || null;
    },

    // ============ THE SEAT: full / lesser / none ============
    // Steve 2026-10-11: the table PRICES the run, never gates on godhood.
    // deedGateReady() is the FULL seat (all wave bars 5/5/4/3/2, 3 contests,
    // 3 crises, stage>=2, food-thesis deeds, national/global scale per the
    // Steve 2026-10-27 ruling — the lesser seat still needs regional+,
    // so the full seat is no longer easier on scale than the lesser one).
    // The LESSER seat is the reachable bar for competent non-god play — priced
    // honestly, fewer paths open, weaker terms. Below it the table does
    // not come (ledger.js's withdrawal beat handles that case).
    tableSeat() {
      try {
        const full = (typeof this.deedGateReady === 'function') ? this.deedGateReady() : { ok: false };
        if (full && full.ok) return { seat: 'full', detail: full };
        const d = (typeof this.deedState === 'function') ? this.deedState() : {};
        const faced = (d && d.wavesFaced) || {};
        let w1 = 0, w2 = 0, w3 = 0, w4 = 0, w5 = 0;
        for (const mid of Object.keys(faced)) {
          const w = faced[mid] | 0;
          if (w === 1) w1++; else if (w === 2) w2++; else if (w === 3) w3++;
          else if (w === 4) w4++; else if (w === 5) w5++;
        }
        const contestsN = (d && d.contestsSurvived) | 0;
        const pg = this.progState();
        const crisesN = Object.keys((pg && pg.crises) || {}).length;
        let rank = 'village';
        try { rank = (typeof this.scaleRank === 'function') ? this.scaleRank() : 'village'; } catch (e) {}
        const scaleOk = rank === 'regional' || rank === 'national' || rank === 'global';
        let stage = 0;
        try { stage = (typeof this.integrationStage === 'function') ? this.integrationStage() : 0; } catch (e) {}
        const s = this.state.scholar || {};
        const foodDeeds = !!(pg.sentimentTaught && s.prog && s.prog.feastSurgeUsed);
        const lesser = w1 >= 4 && w2 >= 4 && w3 >= 3 && contestsN >= 2 && crisesN >= 2 && scaleOk && stage >= 2 && foodDeeds;
        const detail = { w1, w2, w3, w4, w5, contestsN, crisesN, rank, stage, foodDeeds };
        if (lesser) return { seat: 'lesser', detail };
        return { seat: 'none', detail };
      } catch (e) { return { seat: 'none', detail: {} }; }
    },

    // tableSeatLine: the audit's seat line, extracted so the voicing is
    // proof-testable without running the full tableScene modal flow.
    // journey-endgame r35 (lane B, 2026-10-21): the lesser line used to
    // hardcode "waves 1–3 faced" — villages that bled for wave-4/5 deeds
    // heard an audit that pretended those deeds didn't exist. It now names
    // nonzero w4/w5 counts (voicing only — pricing unchanged). With no
    // w4/w5 deeds the line is byte-identical to the old voicing.
    tableSeatLine(seat) {
      const d = (seat && seat.detail) || {};
      if (seat && seat.seat === 'full') {
        return `A full seat. ${d.rank || 'National'} standing, every wave faced, the deeds complete. The table rises when you enter.`;
      }
      let extra = '';
      try {
        const parts = [];
        if ((d.w4 | 0) > 0) parts.push(`${d.w4 | 0} wave-4`);
        if ((d.w5 | 0) > 0) parts.push(`${d.w5 | 0} wave-5`);
        if (parts.length) extra = `, with ${parts.join(' and ')} fought`;
      } catch (e) {}
      return `A lesser seat — ${d.rank || 'regional'} standing, waves 1–3 faced (${d.w1 || 0}/${d.w2 || 0}/${d.w3 || 0})${extra}, ${d.contestsN || 0} contests survived, ${d.crisesN || 0} crises weathered. The table does not rise. It prices.`;
    },

    // tableWithdrawLine: the withdrawal beat names the failing bar aloud,
    // extracted so the voicing is proof-testable without running the dawn flow.
    // journey-scale r20 (2026-10-22): the old copy always blamed the deeds —
    // but a seat can slip on integration stage while every deed stands (the
    // r19 withdrawn-seat sim proved it live). The beat must name the real
    // loss, never a stock excuse — the System knows exactly what slipped.
    // With no readable detail it falls back to the old generic line.
    tableWithdrawLine(seat) {
      const d = (seat && seat.detail) || {};
      const missing = [];
      try {
        const w1 = d.w1 | 0, w2 = d.w2 | 0, w3 = d.w3 | 0;
        if (w1 < 4 || w2 < 4 || w3 < 3)
          missing.push(`wave-blood unpaid (${w1}/4, ${w2}/4, ${w3}/3)`);
        if ((d.contestsN | 0) < 2)
          missing.push(`fewer than two contests survived (${d.contestsN | 0})`);
        if ((d.crisesN | 0) < 2)
          missing.push(`fewer than two crises weathered (${d.crisesN | 0})`);
        const rank = d.rank || 'village';
        if (rank !== 'regional' && rank !== 'national' && rank !== 'global')
          missing.push(`standing too low (${rank})`);
        if ((d.stage | 0) < 2)
          missing.push(`integration too shallow (stage ${d.stage | 0})`);
        if (!d.foodDeeds)
          missing.push('the food-thesis unproven');
      } catch (e) {}
      const named = missing.length ? missing.join('; ') : 'the deeds are not all done';
      return `◈ THE TABLE — the ring of pale light flickers... and does not come. The System is embarrassed. "YOUR CASE IS NOT COMPLETE. ${named}. WE WILL... RESCHEDULE." The table is withdrawn — for now. It will be set again when the case is complete.`;
    },

    // TABLE-DEED VOICE (2026-10-21, backlog #738): the audit never voiced
    // the village's wave-4+ deeds — villages reached the table and the
    // fiction said nothing about the war path either way. The audit now
    // names the real deeds from the village's own logs:
    //   - wave-4+ kills (monster, killer, day) from state.waveKillLog
    //   - herald/titan encounters (faced, slain) from Game.state.titans
    //   - engagements (fought but not killed) from deeds.wavesFaced
    //   - the readiness bars as they stand at audit time
    // KNOWLEDGE GATE (hard): every voiced deed is JOINED to a log record.
    // Unknown monster ids are never named and never counted — silence is
    // always legal, invention never is. Kills land the codex 'slain' stage
    // in recordWaveKill, so the true monsterNoun is earned, never leaked.
    // Cosmetic selection (variant framing) never consumes Math.random —
    // a dedicated mulberry32 seeded from stable run inputs, so the block
    // is byte-identical with the layer on vs off except the audit beats.
    // Test-only: Game._tableDeedVoiceOff skips the whole block.
    tableDeedRecords() {
      const out = { kills: [], engagements: [], titans: [], bars: [] };
      try {
        const mdefs = (this.data && this.data.monsters) || [];
        const mdefOf = (mid) => { try { return mdefs.find(m => m && m.id === mid) || null; } catch (e) { return null; } };
        // 1. kills from the kill log (def-wave is authoritative; the log's
        // w is a fallback only — a forged w never promotes a deed).
        const log = (this.state && this.state.waveKillLog) || [];
        const killed = {};
        for (const e of log) {
          try {
            if (!e || !e.mid) continue;
            const md = mdefOf(e.mid);
            if (!md) continue; // unknown mid: never voiced, never counted
            const w = (md.wave | 0) || (e.w | 0) || 0;
            if (w < 4) continue;
            killed[e.mid] = true;
            out.kills.push({ mid: e.mid, day: (e.d | 0) || 0, by: e.by || null, via: e.via || null, wave: w });
          } catch (e2) {}
        }
        // 2. engagements: fought blow-by-blow (recordDeedFight) but no
        // recorded kill — the village stood against them and lived.
        // Pure read: deedState() would CREATE pg.deeds (a state write).
        // Titan mids are skipped here — the titan block below already
        // names the encounter (naming it twice reads as padding).
        try {
          const sch = (this.state && this.state.scholar) || {};
          const pgr = sch.prog || {};
          const ds = (pgr.deeds && typeof pgr.deeds.wavesFaced === 'object') ? pgr.deeds.wavesFaced : {};
          const titanMids = {};
          try {
            const ts = (this.state && this.state.titans) || {};
            const cast = (ts && typeof ts.cast === 'object') ? ts.cast : null;
            const tids = ['herald'];
            if (cast && cast.apocalypse) tids.push(cast.apocalypse);
            for (const tid of tids) {
              const def = (typeof this.titanDef === 'function') ? this.titanDef(tid) : null;
              if (def && def.monster) titanMids[def.monster] = true;
            }
          } catch (e3) {}
          for (const mid of Object.keys(ds)) {
            try {
              if (killed[mid]) continue;
              if (titanMids[mid]) continue;
              const md = mdefOf(mid);
              if (!md) continue;
              const w = (md.wave | 0) || (ds[mid] | 0) || 0;
              if (w < 4) continue;
              out.engagements.push({ mid, wave: w });
            } catch (e2) {}
          }
        } catch (e2) {}
        // 3. titans: cast omens + slain flags are the encounter record.
        // Omen stage 1 = named, 2 = located. Pure read of state.titans —
        // titanCast() would WRITE st.cast when null. No log records a titan
        // retreat, so "fled" is not voiced (documented blank, not a gap
        // papered over).
        try {
          const ts = (this.state && this.state.titans) || {};
          const cast = (ts && typeof ts.cast === 'object') ? ts.cast : null;
          const omens = ts.omens || {}, slain = ts.slain || {};
          const tids = ['herald'];
          if (cast && cast.apocalypse) tids.push(cast.apocalypse);
          for (const tid of tids) {
            try {
              const def = (typeof this.titanDef === 'function') ? this.titanDef(tid) : null;
              if (!def) continue;
              const o = omens[tid] || { stage: 0, day: 0 };
              const st = (o.stage | 0) || 0;
              if (slain[tid]) out.titans.push({ tid, title: def.title || tid, state: 'slain', day: (o.day | 0) || 0 });
              else if (st >= 1) out.titans.push({ tid, title: def.title || tid, state: 'faced', day: (o.day | 0) || 0, located: st >= 2 });
            } catch (e2) {}
          }
        } catch (e2) {}
        // 4. readiness bars as they stand at audit time — voiced only when
        // unready. A ready bar is nothing to say aloud; the bar line names
        // exactly what the village lacks, in the village's own terms.
        try {
          for (const w of [4, 5]) {
            const rd = (typeof this.waveUnlockReady === 'function') ? this.waveUnlockReady(w) : null;
            if (rd && !rd.ready && typeof this._readinessBarLine === 'function') {
              out.bars.push({ wave: w, line: String(this._readinessBarLine(rd) || '') });
            }
          }
        } catch (e2) {}
      } catch (e) {}
      return out;
    },

    // tableDeedLines: the voiced audit block — pure render of
    // tableDeedRecords. [] when there is nothing war-shaped to say
    // (silence, never padding). 4 variant framings; the pick is a
    // dedicated stream (mulberry32 over a hash of stable inputs), never
    // Math.random, so the pick cannot perturb the sim downstream.
    tableDeedLines() {
      if (this._tableDeedVoiceOff) return [];
      let rec;
      try { rec = this.tableDeedRecords(); } catch (e) { return []; }
      const has = (rec.kills && rec.kills.length) || (rec.engagements && rec.engagements.length)
        || (rec.titans && rec.titans.length) || (rec.bars && rec.bars.length);
      if (!has) return [];
      let R = null;
      try {
        const digest = (rec.kills || []).map(k => k.mid + ':' + k.day).join(',') + '|'
          + (rec.engagements || []).map(x => x.mid).join(',') + '|'
          + (rec.titans || []).map(t => t.tid + ':' + t.state).join(',');
        const sch0 = (this.state && this.state.scholar) || {};
        const sit = ((((sch0.prog || {}).tableSittingId) | 0) || 0);
        R = this.mulberry32(this._hashStr('tabledeed|' + sit + '|' + digest));
      } catch (e) { R = null; }
      const framings = [
        'The System pauses — actually pausing. It keeps a list of every tooth pulled, and for once it reads the list instead of the press release.',
        'Footage plays. The galaxy has already watched these fights twice. The System narrates anyway — it likes the sound of its own broadcast voice.',
        'The body count, itemized. The System is not making this up — it was filming.',
        'A moment of respect, from something that rarely respects.',
      ];
      const frame = (R ? Math.floor(R() * framings.length) : 0) % framings.length;
      const lines = [];
      // kills: name up to 2 (most recent), then the honest remainder.
      try {
        const kills = (rec.kills || []).slice().sort((a, b) => (b.day - a.day) || (b.wave - a.wave));
        if (kills.length) {
          const nameOf = (k) => {
            let mname = 'something';
            try { mname = (this.monsterNoun ? this.monsterNoun(k.mid) : 'something') || 'something'; } catch (e2) {}
            const art = (typeof this.articlePhrase === 'function') ? this.articlePhrase(mname, false) : mname;
            let who = 'Haven'; // the log always attributes to the village; a person only when the log names one
            try {
              if (k.by === 'p' || k.by === 'player') who = 'you';
              else if (k.by && typeof this.disp === 'function') who = this.disp(k.by) || 'Haven';
            } catch (e2) { who = 'Haven'; }
            return `On day ${k.day}, ${who} put down ${art}`;
          };
          // The same tooth twice back-to-back (two kills, same day/killer/
          // monster — e.g. two Big Louds in one fight) names ONCE with a
          // count — never the same sentence twice (the r39 engagements rule;
          // journey-endgame r43: "On day 108, Roman put down Big Loud. On day
          // 108, Roman put down Big Loud — and 3 more tooths after.").
          const n0 = nameOf(kills[0]);
          let ks;
          if (kills.length >= 2 && nameOf(kills[1]) === n0) {
            ks = `◈ THE WAR PATH — ${framings[frame]} ${n0} twice.`;
            if (kills.length > 2) ks += ` ${kills.length - 2} more tooth${kills.length - 2 === 1 ? '' : 's'} after that.`;
          } else {
            ks = `◈ THE WAR PATH — ${framings[frame]} ${n0}.`;
            if (kills.length === 2) ks += ` ${nameOf(kills[1])}.`;
            else if (kills.length > 2) ks += ` ${nameOf(kills[1])} — and ${kills.length - 2} more tooth${kills.length - 2 === 1 ? '' : 's'} after.`;
          }
          lines.push(ks);
        }
      } catch (e) {}
      // titans + engagements + bars: one System aside.
      try {
        const bits = [];
        for (const t of (rec.titans || [])) {
          if (t.state === 'slain') bits.push(`${t.title} fell — the coalition's work, and the System had a camera on it.`);
          else bits.push(`${t.title} came. ${t.located ? 'Named and located — the war council knew its face.' : 'Named, not yet located.'}`);
        }
        // engagements: name up to 2. The same noun twice names ONCE with a count
        // — never the same sentence back-to-back (journey-endgame r39
        // sense-read: "They faced Big Loud and lived to sit here. They faced
        // Big Loud and lived to sit here.").
        const engArts = [];
        for (const g of (rec.engagements || []).slice(0, 2)) {
          let mname = 'something';
          try { mname = (this.monsterNoun ? this.monsterNoun(g.mid) : 'something') || 'something'; } catch (e2) {}
          engArts.push((typeof this.articlePhrase === 'function') ? this.articlePhrase(mname, false) : mname);
        }
        if (engArts.length === 2 && engArts[0] === engArts[1]) {
          bits.push(`They faced ${engArts[0]} twice and lived to sit here.`);
        } else {
          for (const art of engArts) bits.push(`They faced ${art} and lived to sit here.`);
        }
        const nEng = (rec.engagements || []).length;
        if (nEng > 2) bits.push(`${nEng - 2} more of the later drafts faced besides.`);
        for (const b of (rec.bars || [])) {
          if (b.line) bits.push(`Even now the wave-${b.wave} bar reads: ${b.line}.`);
        }
        if (bits.length) {
          // With kills voiced above, this is the continuing aside; with no
          // kills it opens the beat itself (header + framing intact).
          if (lines.length) lines.push(`"${bits.join(' ')}" — the System is still reading the list.`);
          else lines.push(`◈ THE WAR PATH — ${framings[frame]} ${bits.join(' ')}`);
        }
      } catch (e) {}
      if (!lines.length && has) {
        // Records exist but every name failed (never happens in prod —
        // kills earn the codex 'slain' stage). Fall back to the frame only.
        lines.push(`◈ THE WAR PATH — ${framings[frame]}`);
      }
      return lines;
    },

    // ============ EARNED PATHS ============
    // Each path def provides prereq() -> {earned, strength 0-100, why}.
    // Unearned paths are named and priced, never silently hidden.
    tableEarnedPaths() {
      const out = [];
      try {
        const seat = this.tableSeat();
        // NPC ASCENSION PRICING (journey-endgame r7 2026-10-13): TABLE.md
        // canon — "each ascended villager adds bargaining power (+path
        // strength)". The epilogue used to only say it aloud; now the
        // audit's standing numbers move too (+10 per ascension, cap 100),
        // and the audit voices it (see tableScene).
        let ascBonus = 0;
        try { ascBonus = (this.tableAscended ? this.tableAscended().length : 0) * 10; } catch (e) {}
        // OVERTIME (Steve 2026-10-14: "waiting should have a cost"): the
        // table docks standing per overtime tier and per Haven loss while
        // it waited (overtime.js overtimeStanding). Priced, said aloud.
        let otPen = 0;
        try { otPen = this.overtimeStanding ? this.overtimeStanding().penalty : 0; } catch (e) { console.warn('table overtime price', e); }
        for (const id of Object.keys(PATHS)) {
          const def = PATHS[id];
          let pr = { earned: false, strength: 0, why: 'The table has not priced this seat yet.' };
          try { pr = def.prereq.call(this, seat) || pr; } catch (e) {}
          // Seat floor: paths declare minSeat; the audit is honest about it.
          const order = { none: 0, lesser: 1, full: 2 };
          if ((order[seat.seat] || 0) < (order[def.minSeat || 'lesser'] || 0)) {
            pr = { earned: false, strength: 0, why: def.seatWhy || 'This seat needs a stronger table.' };
          }
          out.push({ id, name: def.name, earned: !!pr.earned, strength: Math.max(0, Math.min(100, (pr.strength | 0) + ascBonus) - (pr.earned ? otPen : 0)), why: pr.why, showGenre: def.showGenre });
        }
      } catch (e) {}
      return out;
    },

    // ============ LIGHT/DARK AXIS ============
    // Earned through play — never a menu choice. Reads: moral ledger,
    // switchboard routed/delayed/edited/skimmed, food truth shared/hoarded,
    // promises kept/broken. Each path weights the signals its own way.
    tablePromiseTally() {
      let kept = 0, broken = 0;
      try {
        const v = this.state.village || {};
        const pr = v.promises || {};
        for (const k of Object.keys(pr)) {
          const p = pr[k];
          if (!p) continue;
          if (p.kept === true) kept++;
          else if (p.kept === 'broken') broken++;
        }
        const fl = v.favorLedger || {};
        for (const k of Object.keys(fl)) {
          const f = fl[k];
          if (!f || !f.state) continue;
          if (f.state === 'fulfilled' || f.state === 'thanked') kept++;
          else if (f.state === 'broken') broken++;
        }
      } catch (e) {}
      return { kept, broken };
    },
    tableSwitchTally() {
      try {
        const sw = (typeof this.switchboard === 'function') ? this.switchboard() : null;
        if (!sw) return { routed: 0, delayed: 0, edited: 0, skimmed: 0 };
        return { routed: sw.routed | 0, delayed: sw.delayed | 0, edited: sw.edited | 0, skimmed: sw.skimmed | 0 };
      } catch (e) { return { routed: 0, delayed: 0, edited: 0, skimmed: 0 }; }
    },
    tableBranch(pathId) {
      const signals = { branch: 'light', light: 0, dark: 0, notes: [] };
      try {
        const L = (typeof this.ledger === 'function') ? this.ledger() : {};
        const pt = this.tablePromiseTally();
        const sw = this.tableSwitchTally();
        const g = (v) => (L && L[v]) | 0;
        // Shared dark signals.
        if (g('killed') > g('protected')) { signals.dark += 2; signals.notes.push('the ledger counts more killed than protected'); }
        if (g('betrayed') > 0) { signals.dark += 2; signals.notes.push('betrayals on the record'); }
        if (g('foodHoarded') > g('foodShared')) { signals.dark += 1; signals.notes.push('the food truth was hoarded'); }
        if (pt.broken > pt.kept) { signals.dark += 2; signals.notes.push('more promises broken than kept'); }
        if (sw.edited + sw.skimmed > sw.routed) { signals.dark += 2; signals.notes.push('the relay edited more than it carried'); }
        // Shared light signals.
        if (g('protected') >= g('killed') && g('protected') > 0) { signals.light += 2; signals.notes.push('the protected outnumber the killed'); }
        if (g('foodShared') > g('foodHoarded')) { signals.light += 1; signals.notes.push('the food truth was shared'); }
        if (pt.kept > pt.broken) { signals.light += 2; signals.notes.push('promises kept'); }
        if (sw.routed > sw.edited + sw.skimmed + sw.delayed) { signals.light += 1; signals.notes.push('the relay carried faithfully'); }
        // Path-specific weights.
        const W = {
          feared: (s) => { if (g('might') > 0 && g('protected') >= g('killed')) s.light += 1; if (g('killed') > g('protected') * 2) s.dark += 2; },
          indispensable: (s) => { if (g('foodShared') > g('foodHoarded') * 2) s.light += 2; if (g('foodHoarded') >= g('foodShared')) s.dark += 2; },
          beloved: (s) => { if (g('showmanship') > g('protected') * 2) s.dark += 2; if (g('betrayed') > 0) s.dark += 1; },
          witness: (s) => { if (g('exposed') >= 3 && g('protected') >= g('killed')) s.light += 2; if (g('killed') > g('protected')) s.dark += 2; },
          assimilated: (s) => { if (g('embrace') > g('defiance') * 3) s.dark += 2; if (g('foodShared') > 0 && g('protected') > 0) s.light += 1; },
          defiant: (s) => { if (g('killed') > 3 && g('defiance') > g('might') + g('brokerage')) s.dark += 2; if (pt.kept >= pt.broken) s.light += 1; },
          relay: (s) => {
            const ra = ((this.state.scholar || {}).relayAbils) || {};
            // 2026-10-11: uses live at ra.<id>.uses (the relayGrant shape) —
            // the old read (ra.rewriteUses etc.) was always 0, so ability
            // use never counted. Fixed.
            const darkUses = ((ra.rewrite || {}).uses | 0) + ((ra.skim || {}).uses | 0) + ((ra.omnipresence || {}).uses | 0);
            const lightUses = ((ra.translate || {}).uses | 0) + ((ra.sanctuary || {}).uses | 0) + ((ra.advocate || {}).uses | 0);
            if (darkUses > lightUses) s.dark += 3;
            if (lightUses > darkUses) s.light += 3;
            if (this.grounding() < 50) s.dark += 2; else s.light += 1;
            // GRADIENT (2026-10-11, Steve): the relay path resolves on the
            // leaning meter, not a binary branch. band 'light' (>=40,
            // tender) / 'dark' (<=-40, total) / 'grey' (the pragmatist
            // middle). The middle is honest, not a coin flip: grey takes
            // neither side's +3. No single choice can set the band — lean
            // moves in nudges of <=10 against the 40 threshold (see
            // relay-dialogue.js GRADIENT LAW).
            let lean = 0;
            try { lean = (typeof this.relayLean === 'function') ? this.relayLean() : 0; } catch (e) {}
            s.lean = lean;
            s.band = lean >= 40 ? 'light' : lean <= -40 ? 'dark' : 'grey';
            if (s.band === 'light') s.light += 3; else if (s.band === 'dark') s.dark += 3;
          },
        };
        if (W[pathId]) W[pathId](signals);
        signals.branch = signals.dark > signals.light ? 'dark' : 'light';
      } catch (e) {}
      return signals;
    },

    // ============ GROUNDING (humanity) — the two-way cost ============
    // scholar.grounding 0-100, starts 100. Deepening integration + dark
    // relay ability use erodes it; human verbs restore it: shared meals,
    // comforted grief, KEPT favor obligations (the favor system is the
    // humanity anchor), teaching. Tiered mechanical effects — not flavor:
    // food conversions weaken as you become what forgot food.
    grounding(who) {
      try {
        if (typeof who === 'string' && who !== 'player' && who !== this.villagerId) {
          const n = (this.state.groundingByPerson || {})[who];
          return Number.isFinite(n) ? Math.max(0, Math.min(100, n | 0)) : 100;
        }
        const s = this.state.scholar || {};
        if (s.grounding == null) s.grounding = 100;
        return Math.max(0, Math.min(100, s.grounding | 0));
      } catch (e) { return 100; }
    },
    groundingTier(who) {
      const g = this.grounding(who);
      if (g >= 75) return 'grounded';
      if (g >= 50) return 'fraying';
      if (g >= 25) return 'estranged';
      return 'hollow';
    },
    // groundingMult: the food-conversion factor. The dark relay becomes
    // what forgot food — conversions weaken. Read by feastedMult() and any
    // food→power conversion. Always telegraphed where it's applied.
    groundingMult(who) {
      const t = this.groundingTier(who);
      return t === 'grounded' ? 1 : t === 'fraying' ? 0.9 : t === 'estranged' ? 0.75 : 0.6;
    },
    addGrounding(n, why, who, opts) {
      try {
        const s = this.state.scholar || {};
        const npc = typeof who === 'string' && who !== 'player' && who !== this.villagerId;
        const old = this.grounding(who), before = this.groundingTier(who);
        const value = Math.max(0, Math.min(100, old + (n | 0)));
        if (value === old) return value;
        if (npc) {
          (this.state.groundingByPerson || (this.state.groundingByPerson = {}))[who] = value;
        } else s.grounding = value;
        const after = this.groundingTier(who);
        if (before !== after) this.groundingReactionBeats(before, after, why, who, opts);
        // Receipt timestamps reuse the last recorded instant. Reading the
        // clock here would perturb seeded generated IDs in the sim harness.
        const previous = (this.state.telemetry || []).at(-1);
        if (this.tele) this.tele('grounding_changed', { t: Number.isFinite(previous && previous.t) ? previous.t : 0, who: npc ? who : 'player', person: npc ? who : this.villagerId, before: old, after: value, why });
        if (!opts || opts.save !== false) this.save();
        return value;
      } catch (e) { console.warn('[grounding] change', e); return false; }
    },
    // groundingReactionBeats: the village's view of your humanity is a
    // LIVE readout — dialogue, gossip, fear, grief — never a hidden stat
    // revealed at the end. Villagers do not always approve.
    groundingReactionBeats(from, to, why, who, opts) {
      try {
        if (typeof who === 'string' && who !== 'player' && who !== this.villagerId) {
          const name = this.displayName ? this.displayName(who) : 'Someone';
          const order = { grounded: 0, fraying: 1, estranged: 2, hollow: 3 };
          this.say((order[to] | 0) > (order[from] | 0)
            ? `${name}'s words come out cleaner, colder, more like a signal than a person. Someone at the fire notices.`
            : `${name} sounds like someone sitting at the fire again. A person, with people. The climb back is possible.`);
          return;
        }
        const order = { grounded: 0, fraying: 1, estranged: 2, hollow: 3 };
        const falling = (order[to] | 0) > (order[from] | 0);
        const v = this.state.village || {};
        const names = (this.data.villagers || []).filter(x => x.id !== this.villagerId && !x.dead).slice(0, 3).map(x => (x.name || 'someone').split(' ')[0]);
        const n1 = names[0] || 'Mara', n2 = names[1] || 'the old ones';
        if (falling && to === 'fraying') {
          this.say(`${n1} keeps a half-step of distance at the fire now. Not fear — not yet. Just... distance. "You've been up at the relay late," they say, and don't ask what you found.`);
          // This is each living resident's reaction to the bearer. Null is
          // not a global recipient: it creates a phantom trust-map entry.
          for (const id of new Set(v.roster || [])) {
            if (id === this.villagerId) continue;
            const person = this.getPerson(id);
            if (person && !person.dead) this.bumpTrust(id, -2, 'grounding fraying');
          }
        } else if (falling && to === 'estranged') {
          this.say(`The gossip has changed its grammar around you. ${n2} talk about you the way they talk about weather — something that happens, not someone who chooses. A child asked what your laugh sounds like. Nobody could quite remember.`);
          this.say(`Your small-talk comes out in the System's register now — clean, total, wrong. You hear yourself do it. You don't stop.`);
          try { this.recordMoment('The village started talking about the Bearer like weather.'); } catch (e) { console.warn('[grounding] recovery', e); }
        } else if (falling && to === 'hollow') {
          this.say(`They grieve you while you're alive. That's the thing nobody warned you about. ${n1} set a place for you at the feast and then quietly took it away — "for whoever you were," they said, and the fire was very kind about it, which was worse.`);
          try { this.recordMoment('The village grieved the Bearer while they lived.'); } catch (e) { console.warn('[grounding] recovery', e); }
        } else if (!falling) {
          this.say(`${n1} sat close at the fire again, shoulder to shoulder, like before. Human verbs. They work. The climb back is the story.`);
        }
        if (!opts || opts.save !== false) this.save();
      } catch (e) { console.warn('[grounding] reaction', e); }
    },

    // ============ SYSBOND — the System relationship arc ============
    // pg.sysBond 0-5: static, curious, listening, comprehending, champion, kin.
    // The System wants something: to understand caretaking (food, grief,
    // joy). Endings resolve, plant threads, or create obligations — some
    // the System owes YOU.
    sysBond() {
      try { const pg = this.progState(); pg.sysBond = pg.sysBond | 0; return pg.sysBond; } catch (e) { return 0; }
    },
    addSysBond(n, why) {
      try {
        const pg = this.progState();
        const before = this.sysBond();
        pg.sysBond = Math.max(0, Math.min(5, before + (n | 0)));
        if (pg.sysBond !== before) {
          // Six levels, six names (2026-10-11): the old list had five, so the
          // capped level 5 read "here" — flat after "champion". The arc ends
          // where TABLE.md says it does: the machine recognizing humans as
          // fellow strugglers — kin.
          const names = ['static', 'curious', 'listening', 'comprehending', 'champion', 'kin'];
          this.say(`◈ THE SYSTEM — something shifts in the overlay's weather. It is ${names[pg.sysBond] || 'here'} now.${why ? ' ' + why : ''}`);
        }
        try { this.save(); } catch (e) {}
      } catch (e) {}
    },

    // ============ TABLE STATE ============
    tableState() {
      try {
        const pg = this.progState();
        pg.table = pg.table || {};
        return pg.table;
      } catch (e) { return {}; }
    },

    // WIN DAY FLOOR (2026-10-13, Steve): no win before day 90 — hard floor,
    // engine-enforced in the win check (never in the seat logic). A table
    // path that resolves early is DEFERRED, not denied: the table waits,
    // the game continues, the win can land on/after day 90. Every wave must
    // have had its impact before the win — the floor plus the full seat's
    // distinct-fought bars enforce it.
    winDayFloorOk() {
      try { return ((this.state.scholar || {}).day || 0) >= 90; } catch (e) { return false; }
    },
    winDayFloorDefer(T) {
      this.say('◈ THE TABLE WAITS — "Ninety days. We do not price a life half-lived. Come back when the village has seen ninety dawns — the table will still be here."');
      T.phase = 'paths';
      // DEFERRAL RE-OFFER (2026-10-14, sim-findings #131-T2): the beat promises
      // the table will still be here — so it must be. Record the pending
      // re-offer and re-arm the dawn driver: tableScene re-fires via
      // tableWaiting (tableDone is cleared so the ledger gate lets it through;
      // sanctity is preserved — tableActive() treats winDeferred as sitting).
      // tableScene re-opens the 7-door modal via tableOfferPaths once
      // winDayFloorOk() passes — exactly once (the flag clears on fire).
      T.winDeferred = true;
      try { this.progState().tableWaiting = true; } catch (e) {}
      try { this.progState().tableDone = false; } catch (e) {}
      try { this.save(); } catch (e) {}
    },

    // TABLE SANCTITY (2026-10-12, Steve): while the table sits, the world
    // holds its breath. Ambient monster pressure against villagers is
    // suspended — no random field fights, no wild encounters, no patrol
    // contact, no new raids (lingering raiders hold the treeline without
    // gorging). ALL stakes during the finale come from the table itself
    // (pricing, light/dark branches, trial by combat — the one opt-in
    // existential risk). Ambient routers gate on this flag; the table's
    // own stakes never check it. Derived from run state (no new persisted
    // fields): active from tableScene until any resolve sets phase 'done'.
    tableActive() {
      try {
        const pg = this.progState ? this.progState() : null;
        const T = this.tableState();
        // WIN-DAY-FLOOR DEFERRAL (2026-10-14, sim-findings #131-T2): the table
        // is still sitting during the deferral window — the beat promised it
        // would still be here — so sanctity holds even though tableDone was
        // cleared to re-arm the dawn driver. The flag clears when the modal
        // re-opens (the sequence sits again, tableDone true).
        if (T && T.winDeferred) return true;
        if (!pg || !pg.tableDone) return false;
        return !!(T && T.phase && T.phase !== 'done');
      } catch (e) { return false; }
    },

    // tableLiveWrap: every path's finale is televised in its genre — but
    // only when the show is actually watching (viewership >= 12, the
    // ledger's own threshold-beat rule). Otherwise the beat plays
    // untelevised, honestly.
    tableLiveWrap(genreLine) {
      try {
        // The Assimilated is never televised — the footage leaks anyway.
        // Contraband is its own genre.
        if (this.tableState && this.tableState().path === 'assimilated') {
          this.say('◈ CONTRABAND — the assimilation isn\'t televised. It doesn\'t matter. Somewhere, a camera that shouldn\'t exist is rolling, and the footage will leak. It always leaks.');
          return;
        }
        const vw = (typeof this.havenViewership === 'function') ? this.havenViewership() : 0;
        if (vw >= 12 && genreLine) this.sysSay('🔴 LIVE! ' + genreLine);
      } catch (e) {}
    },

    // tablePrompt: the modal driver. Extends the tableChoices pattern with
    // an optional prompt (multi-beat challenges need their own text).
    // app.js tableSheet honors tc.prompt.
    tablePrompt(promptHtml, options, frame) {
      try {
        const s = this.state.scholar || {};
        s.tableChoices = { frame: frame || 'the Table', prompt: promptHtml, options: options || [] };
        try { this.save(); } catch (e) {}
      } catch (e) {}
    },

    // ============ THE TABLE SCENE (overrides ledger.js) ============
    // Arc IV sets tableWaiting. The scene fires the next dawn. The audit:
    // the table reads your run aloud, prices the seat, names the earned
    // paths AND the unearned ones (priced, never hidden). Then you choose
    // — the choice is which risk you take, not which ending you get.
    tableScene() {
      const s = this.state.scholar, pg = this.progState();
      const T = this.tableState();
      // WIN-DAY-FLOOR DEFERRAL RE-OFFER (2026-10-14, sim-findings #131-T2): a
      // win deferred before day 90 kept the table's promise — "the table will
      // still be here". While the floor is unmet the table waits silently
      // (the deferral beat already spoke); once winDayFloorOk() passes, the
      // 7-door modal re-opens via tableOfferPaths — exactly once. The sequence
      // sits again (tableDone), so sanctity holds and the driver does not
      // re-fire. Paths re-price live at re-offer time (tableEarnedPaths).
      if (T.winDeferred) {
        if (!this.winDayFloorOk()) return;
        T.winDeferred = false;
        pg.tableDone = true;
        pg.tableWaiting = false;
        this.say('◈ THE TABLE RETURNS — "Ninety dawns. The life you priced is lived now — not half-lived. The table kept its word. It is still here. Choose your door."');
        this.tableOfferPaths('The ring waits. Seven doors — some open, some priced beyond you. The choice is which risk you take.');
        return;
      }
      if (pg.tableDone || T.phase === 'done') return;
      // No seat: withdraw aloud, never silently (ledger.js's law).
      const seat = this.tableSeat();
      if (seat.seat === 'none') {
        pg.tableWaiting = false;
        this.say(this.tableWithdrawLine(seat));
        try { this.save(); } catch (e) {}
        return;
      }
      pg.tableDone = true;
      T.seat = seat.seat; T.phase = 'paths'; T.path = null;
      // SEAT-TAKER DEFAULT (Steve 2026-10-26, item 495): a sitting that
      // starts without a choice (an older flow, a debug scene, a direct
      // tableScene call) sits as the player character — the unchanged
      // default. A chosen sitter survives here untouched: this block
      // never overwrites T.seatTaker, and the sitter locks for the
      // sitting (tableChooseSeatTaker refuses changes from here on).
      if (!T.seatTaker || !T.seatTaker.id) {
        const bearer = (this.data.villagers || []).find(v => v.id === this.villagerId) || {};
        T.seatTaker = { id: this.villagerId, name: bearer.name || 'the Bearer', self: true };
      }
      // A new sitting: no door has failed yet (the downgrade cycle-breaker
      // in tableFail tracks per-sitting failures here).
      T.failedDoors = [];

      // ENDINGS BY BUILD (Steve 2026-10-14): "The ending you can win is set
      // as you enter the table." The build half of the ending key locks
      // here; each door entered fills the path and its moral.
      try { if (this.endingKeyLock) this.endingKeyLock(); } catch (e) { console.warn('table ending key lock', e); }

      // TABLE SITTING (journey-endgame r11 2026-10-14): conversations need to
      // know the table has sat — villagers remark on it once per sitting.
      // A new sitting starts here; the win-day-floor re-offer is the SAME
      // sitting (the table never left), so it does not bump.
      pg.tableSittingId = (pg.tableSittingId | 0) + 1;

      const d = seat.detail || {};
      // MUSIC (Steve 2026-10-12): the table gets its ceremonial bed.
      try { this.music('scenario', 'table'); } catch (e) {}
      this.say('◈ THE TABLE — it is not a table. It\'s a ring of pale light, and around it, things with too many angles to be faces. Above it all — the audience. Trillions of eyes, and every one of them knows your name. The System speaks, and for once it isn\'t performing: "HUMANITY PRESENTS ITS CASE."');
      // THE AUDIT — the table prices the run aloud.
      // (journey-endgame r35: the seat line is built by tableSeatLine so
      // the voicing is proof-testable; wave-4/5 deeds are named when nonzero.)
      const seatLine = this.tableSeatLine(seat);
      this.say(`◈ THE AUDIT — the System reads your run back to you, and the galaxy listens. ${seatLine}`);
      // SEAT-TAKER VOICE: a villager sitter is named aloud at the sitting,
      // once. A self-sitter adds no line — the self flow's transcript is
      // unchanged. (The sitter's scenario beats vary in the path modules;
      // the audit itself still prices the village's run, not the sitter.)
      try {
        const st = T.seatTaker;
        if (st && !st.self && st.id !== this.villagerId) {
          const nm = (st.name || 'someone').split(' ')[0];
          this.say(`◈ THE SEAT — ${nm} sits at the ring, not the Bearer. The case is the village's; the voice the galaxy hears is ${nm}'s.`);
        }
      } catch (e) {}
      // TABLE-DEED VOICE (2026-10-21, backlog #738): the audit names the
      // village's real wave-4+ deeds from its own logs (kills by name,
      // killer and day; titan encounters; readiness bars as they stood).
      // Silence when there is nothing war-shaped to say — never padding.
      try {
        if (!this._tableDeedVoiceOff && typeof this.tableDeedLines === 'function') {
          for (const _dl of this.tableDeedLines()) this.say(_dl);
        }
      } catch (e) { console.warn('table deed voice', e); }
      // NPC ASCENSION PRICING (journey-endgame r7 2026-10-13): the audit
      // voices the ascension bonus that tableEarnedPaths prices into each
      // path's standing — TABLE.md canon, "said aloud, priced in".
      try {
        const _ascN = this.tableAscended ? this.tableAscended().length : 0;
        if (_ascN) this.say(`The table notes ${_ascN} ascension${_ascN > 1 ? 's' : ''} from one village — its terms improve accordingly. Nobody has ever seen that before.`);
      } catch (e) {}
      try {
        const _ot = this.overtimeStanding ? this.overtimeStanding() : null;
        if (_ot && _ot.penalty) this.say(`The table notes the overtime: ${_ot.tier} week${_ot.tier === 1 ? '' : 's'} kept waiting${_ot.losses ? `, ${_ot.losses} of Haven lost meanwhile` : ''}. Every door's standing −${_ot.penalty}.`);
        if (pg.networkFallen) this.say('The table notes something it has never priced: the Network is off the air. Nobody is watching this. The faces around the ring look, for the first time, unsure who is judging whom.');
      } catch (e) { console.warn('table overtime audit', e); }
      // TABLE SANCTITY (2026-10-12, Steve): the System clears the stage.
      // One line, producer-unhinged — the world holds its breath while the
      // table sits. Ambient monster pressure is suspended for the sequence
      // (see the tableActive predicate); every stake from here is the table's own.
      this.sysSay('EVERYONE. SIT. WATCH. The teeth and the weather can WAIT — nothing out there matters until this is done. ...Did I stutter? SIT.');
      try { this.recordMoment(`Haven reached the table (${seat.seat} seat).`); } catch (e) {}
      try { this.metaNoteTable && this.metaNoteTable('table'); } catch (e) {}
      this.tableOfferPaths('The ring waits. Seven doors — some open, some priced beyond you. The choice is which risk you take.');
    },

    // TABLE SEAT AT HAVEN (Steve 2026-10-14): the table stays RELATIVE until
    // the player sits ("relative until actually entering it when it locks"),
    // and is NOT asked every morning ("It will get annoying if we ask them
    // about the table every morning after it's available. Make it an option
    // in haven once unlocked."). Qualifying announces it once; the Haven
    // panel shows tablePreview() and calls tableTakeSeat().
    tableAnnounce() {
      try {
        const pg = this.progState();
        if (pg.tableDone) return;
        const seat = this.tableSeat();
        // lost the seat: the existing withdrawal beat, and a fresh
        // announcement if the run qualifies again later
        if (seat.seat === 'none') { pg.tableAnnounced = false; this.tableScene(); return; }
        if (pg.tableAnnounced) return;
        // NO SPOILERS (Steve 2026-10-14: "Not just greyed out before 90,
        // nonexistent. Don't spoil the game for them."): before the seat can
        // be taken, the table does not exist for the player.
        if (!this.winDayFloorOk()) return;
        pg.tableAnnounced = true;
        this.say('◈ THE TABLE IS SET. A ring of pale light waits — take your seat from Haven when you are ready. Nothing is final until you sit.');
        try { this.save(); } catch (e) {}
      } catch (e) { console.warn('tableAnnounce', e); }
    },
    // Match the native Haven access rule and preserve the current activity.
    tableEntryBlock() {
      if (this.over || this.won) return 'This expedition has ended.';
      if (this.state.activeContest) return 'Finish the current contest before taking your seat.';
      if (this.inCombat() || this.state.scholar.monster) return 'Finish the current encounter before taking your seat.';
      if (this.havenStoresAccess() === 'none') return 'Return to Haven to take your seat.';
      return '';
    },
    // tablePreview(): the run as priced TODAY (recomputed live). null when
    // the table isn't available. ready = the seat can be taken now.
    tablePreview() {
      try {
        const pg = this.progState();
        if (!pg.tableWaiting || pg.tableDone) return null;
        const seat = this.tableSeat();
        if (seat.seat === 'none') return null;
        const doors = this.tableEarnedPaths().filter(p => p.earned).map(p => p.name);
        const day = ((this.state || {}).scholar || {}).day || 0;
        // nonexistent before day 90 — no preview, no button (no spoilers)
        if (!this.winDayFloorOk()) return null;
        // OVERTIME (2026-10-14): the live price shows the waiting cost.
        let ot = null;
        try { ot = this.overtimeStanding ? this.overtimeStanding() : null; } catch (e) { console.warn('tablePreview overtime', e); }
        const why = this.tableEntryBlock();
        return { seat: seat.seat, doors, day, ready: !why, why, overtime: ot ? ot.tier : 0, standingCost: ot ? ot.penalty : 0, losses: ot ? ot.losses : 0, key: !!pg.networkFallen };
      } catch (e) { console.warn('tablePreview', e); return null; }
    },
    // ============ THE SEAT-TAKER CHOICE (Steve 2026-10-26, item 495) ============
    // The player chooses WHO takes the seat — their own character, or
    // another villager — and plays the scenario out as that villager.
    // The choice point is the Haven seat button (tableOfferSeatTaker,
    // wired in app.js): it asks before anything locks. tableTakeSeat
    // keeps its old contract (sit at once, as the player character
    // unless a sitter was already chosen or is passed in), so debug
    // scenes, bot policies, and existing seat tests keep working.
    // What the choice does NOT do: it never picks a path, never starts
    // a challenge, never changes an earned path or a meter, and never
    // waives the seat's price. The seat still has to be earned
    // (tablePreview gates it, as before), and the challenge still has
    // to be played and can still be lost. A different sitter changes
    // whose story the beats tell — never whether the table is earned.
    // Eligibility: a living villager, present (not away), other than
    // the player character. Dead villagers never sit — the same
    // liveness rule as ascension (tableAscended). The player character
    // is always an option, and is the default when a sitting starts
    // without a choice (older flows, debug scenes, direct tableScene).
    // The choice locks for the sitting: once the doors are offered or
    // a challenge runs, the sitter cannot be swapped mid-sitting.
    tableSeatTaker() {
      try {
        const T = this.tableState();
        const st = T && T.seatTaker;
        if (st && st.id) return { id: st.id, name: st.name || 'someone', self: !!st.self };
      } catch (e) {}
      try {
        const me = (this.data.villagers || []).find(v => v.id === this.villagerId) || {};
        return { id: this.villagerId, name: me.name || 'the Bearer', self: true };
      } catch (e) { return { id: this.villagerId, name: 'the Bearer', self: true }; }
    },
    tableSeatTakerOptions() {
      const out = [];
      try {
        // The self option is always the player character — build it
        // directly so the list is stable while a choice is being made,
        // even when a sitter was already recorded for this sitting.
        const bearer = (this.data.villagers || []).find(v => v.id === this.villagerId) || {};
        out.push({ id: 'self', name: bearer.name || 'the Bearer', self: true, score: null, notes: [] });
        const away = ((this.state.village || {}).away) || {};
        for (const v of (this.data.villagers || [])) {
          if (!v || !v.id || v.id === this.villagerId || v.dead || away[v.id]) continue;
          let sc = { score: 0, notes: [], name: v.name || 'someone' };
          try { if (typeof this.villagerAscensionScore === 'function') sc = this.villagerAscensionScore(v.id); } catch (e) {}
          out.push({ id: v.id, name: sc.name || v.name || 'someone', self: false, score: sc.score | 0, notes: sc.notes || [] });
        }
      } catch (e) {}
      return out;
    },
    tableChooseSeatTaker(id) {
      try {
        const T = this.tableState();
        const pg = this.progState();
        const lockedPhases = ['paths', 'challenge', 'finals', 'downgrade', 'conscript', 'demand-price'];
        if ((pg && pg.tableDone) || (T && lockedPhases.indexOf(T.phase) >= 0)) {
          return { ok: false, msg: 'The seat is already taken — the sitter cannot be changed mid-sitting.' };
        }
        if (!id || id === 'self' || id === this.villagerId) {
          const bearer = (this.data.villagers || []).find(v => v.id === this.villagerId) || {};
          T.seatTaker = { id: this.villagerId, name: bearer.name || 'the Bearer', self: true };
          try { this.save(); } catch (e) {}
          return { ok: true, msg: '' };
        }
        const opt = this.tableSeatTakerOptions().find(o => o.id === id && !o.self);
        if (!opt) return { ok: false, msg: 'That villager cannot take the seat.' };
        T.seatTaker = { id: opt.id, name: opt.name, self: false };
        try { this.save(); } catch (e) {}
        return { ok: true, msg: '' };
      } catch (e) { return { ok: false, msg: 'The seat-taker choice could not be recorded.' }; }
    },
    // tableOfferSeatTaker(): the Haven seat button's entry. Same gates
    // as tableTakeSeat (preview + entry block), then the choice sheet
    // instead of the sitting. Returns choosingSeat when the sheet is up.
    tableOfferSeatTaker() {
      const pv = this.tablePreview();
      if (!pv) return { ok: false, msg: '' };
      const why = this.tableEntryBlock();
      if (why) return { ok: false, msg: why };
      if (!pv.ready) return { ok: false, msg: pv.why };
      const T = this.tableState();
      T.phase = 'seat-taker';
      const opts = this.tableSeatTakerOptions();
      const lines = opts.map(o => {
        if (o.self) return `<p><b>${this.escHtml(o.name)}</b> — sit yourself, as today.</p>`;
        const standing = (o.notes && o.notes.length) ? this.escHtml(o.notes.join('; ')) : 'a villager, unascended';
        return `<p><b>${this.escHtml(o.name)}</b> — ${standing}.</p>`;
      }).join('');
      const prompt = `<p>The ring of pale light. The too-many-angled faces. The trillions of eyes.</p>` +
        `<p>Before the table sits, one choice is yours alone: <b>who takes the seat?</b> The case is the village's either way — but the voice at the ring, and the story the beats tell, will be theirs.</p>` + lines;
      const options = opts.map(o => ({ id: 'seat:' + o.id, label: o.self ? 'Sit yourself.' : `Send ${o.name} to the seat.` }));
      this.tablePrompt(prompt, options, 'the Table');
      try { this.save(); } catch (e) {}
      return { ok: true, choosingSeat: true, msg: '' };
    },
    // tableTakeSeat(): the player sits — this locks the seat (tableScene);
    // tableStartPath locks the branch. With a sitter id passed (or one
    // already chosen through the seat-taker sheet), the sitting plays
    // as that sitter; without one it sits as the player character, as
    // it always has.
    tableTakeSeat(sitterId) {
      const pv = this.tablePreview();
      if (!pv) return { ok: false, msg: '' };
      const why = this.tableEntryBlock();
      if (why) return { ok: false, msg: why };
      if (!pv.ready) return { ok: false, msg: pv.why };
      if (sitterId != null) {
        const r = this.tableChooseSeatTaker(sitterId);
        if (!r.ok) return r;
      }
      this.tableScene();
      const committed = !!this.progState().tableDone;
      return { ok: committed, msg: committed ? '' : 'Your seat could not be taken. Your case is still being priced.' };
    },

    // tableOfferPaths: path selection modal. Earned paths are choices;
    // unearned paths are shown priced (never hidden).
    tableOfferPaths(promptLine) {
      const T = this.tableState();
      T.phase = 'paths';
      const paths = this.tableEarnedPaths();
      const earned = paths.filter(p => p.earned);
      const lines = paths.map(p => `<p><b>${p.earned ? '◈' : '◇'} ${this.escHtml(p.name)}</b> — ${this.escHtml(p.why)}${p.earned && p.strength ? ` <i>(standing: ${p.strength})</i>` : ''}</p>`).join('');
      const prompt = `<p>The ring of pale light. The too-many-angled faces. The trillions of eyes.</p>` +
        `<p>${this.escHtml(promptLine || 'Choose your door.')}</p>` + lines;
      const options = earned.map(p => ({ id: 'path:' + p.id, label: `Walk the path of ${p.name}` }));
      this.tablePrompt(prompt, options, 'the Table');
      try { this.save(); } catch (e) {}
    },
    escHtml(t) {
      return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },

    // ============ CHALLENGE RUNNER ============
    // chooseTableOption stays the single UI entry point (app.js calls it).
    // It routes by table phase: paths → start path; challenge → beat
    // choice; finals → resolve; downgrade → pick a lesser path.
    chooseTableOption(id) {
      const T = this.tableState();
      try {
        if (!id) return null;
        // SEAT-TAKER CHOICE (Steve 2026-10-26, item 495): choosing a
        // sitter sets WHO sits and nothing else — the table is still in
        // its no-path-chosen state afterwards, and only the player's
        // door pick below can start a path. A villager can never start
        // a path through this entry point: seat ids are not path ids,
        // and no code path here maps a sitter to a path.
        if (id.indexOf('seat:') === 0 && T.phase === 'seat-taker') {
          const r = this.tableChooseSeatTaker(id.slice(5));
          if (r && r.ok) { this.tableScene(); return null; }
          if (r && r.msg) this.say(r.msg);
          this.tableOfferSeatTaker();
          return null;
        }
        if (id.indexOf('path:') === 0 && T.phase === 'paths') { this.tableStartPath(id.slice(5)); return null; }
        if (id.indexOf('downgrade:') === 0 && T.phase === 'downgrade') { this.tableDowngradePick(id.slice(10)); return null; }
        if (T.phase === 'challenge') { this.tableChoose(id); return null; }
        if (T.phase === 'finals') { this.tableResolveFinal(id); return null; }
        // PODS WEIGHT: the demand's price choice.
        if (T.phase === 'demand-price' && id.indexOf('demandprice:') === 0) { this.tableResolveDemandPrice(id.slice(12)); return null; }
        // PODS WEIGHT: dark conscript answer — then the challenge resumes.
        if (T.phase === 'conscript' && id.indexOf('conscript:') === 0) {
          try { if (typeof this.podConscriptAnswer === 'function') this.podConscriptAnswer(id === 'conscript:yes'); } catch (e) {}
          T.phase = 'challenge'; T.beat = 0;
          const def2 = pathDef(T.path);
          if (def2) this.tableRunBeat(0);
          try { this.save(); } catch (e) {}
          return null;
        }
      } catch (e) {}
      return null;
    },

    tableStartPath(pathId) {
      const def = pathDef(pathId);
      if (!def) return;
      const T = this.tableState();
      const branch = this.tableBranch(pathId);
      T.path = pathId; T.phase = 'challenge'; T.beat = 0;
      T.meters = {}; T.branch = branch.branch; T.branchNotes = branch.notes;
      T.weakened = T.weakened | 0;
      T.abils = []; T.abilMods = {};
      // GRADIENT (2026-10-11): the relay path runs on its leaning band —
      // light / grey / dark — instead of the binary signals.branch. The
      // grey middle is an honest ending color, not a coin flip.
      if (pathId === 'relay' && branch.band) { T.branch = branch.band; T.band = branch.band; }
      try { if (this.endingKeyEnter) this.endingKeyEnter(pathId, T.branch); } catch (e) { console.warn('table ending key door', e); }
      // Path abilities: mostly shared + several branch-unique. Granted
      // aloud at the door; grant effects are immediate and honest.
      const ab = def.abilities || {};
      const grantList = (list) => (list || []).forEach(a => {
        T.abils.push(a.id);
        // Don't re-announce what the bearer's hands already hold (2026-10-11):
        // a relay-path walker claimed the office to qualify, so the door
        // grants echo. Check BEFORE granting (the grant itself sets unlocked).
        // Still registered in T.abils — just said once.
        let already = false;
        try { already = !!(a.id && typeof this.relayHas === 'function' && this.relayHas(a.id)); } catch (e3) {}
        try {
          const e = (typeof a.grant === 'function') ? a.grant.call(this, T) : a.grant;
          for (const k of Object.keys(e || {})) {
            if (k === 'abilMods') Object.assign(T.abilMods, e.abilMods);
            else if (k !== 'grounding' && k !== 'sysBond') T.meters[k] = (T.meters[k] | 0) + (e[k] | 0);
          }
        } catch (e2) {}
        this.say(already ? `◈ ABILITY — ${a.name}: already in your hands.` : `◈ ABILITY — ${a.name}: ${a.desc}`);
      });
      // The pragmatist's door gift (2026-10-11): a grey-band relay walker
      // gets whichever hand is forward — a gradient read at the door, not
      // a lock. Acts can still open the other track through the gradient
      // gates in relayUnlockCheck.
      let branchAbils = ab[T.branch] || ab.light;
      if (T.path === 'relay' && T.branch === 'grey') {
        const rl = (typeof this.relayLean === 'function') ? this.relayLean() : 0;
        branchAbils = rl > 0 ? ab.light : rl < 0 ? ab.dark : [];
      }
      grantList(ab.shared); grantList(branchAbils);
      const seat = this.tableSeat();
      // The show component: televised in the path's genre.
      this.tableLiveWrap(def.showLive);
      this.say(`◈ ${def.name.toUpperCase()} — ${def.openLine}`);
      if (branch.notes.length) {
        const noteStr = branch.notes.join('; ');
        // GREY (journey-endgame r5 2026-10-12): the relay path resolves on
        // the leaning band, not the binary ledger branch — a grey-band walker
        // hearing "the light road is open" / "the dark road is open" is
        // misvoiced. The middle gets its own road.
        // DARK (journey-endgame r43 2026-10-23): the r5 patch only covered
        // grey — a dark-band relay walker with a light ledger (protected >
        // killed, food shared, promises kept) still heard "the light road is
        // open" while walking the dark merge (seed 85012). The GRADIENT law
        // says the ledger-read line voices the BAND for relay: middle for
        // grey, the band itself otherwise.
        let road = branch.branch;
        try { if (pathId === 'relay') road = T.band === 'grey' ? 'middle' : (T.band || branch.branch); } catch (e) {}
        this.say(`The table has read your ledger. ${noteStr.charAt(0).toUpperCase() + noteStr.slice(1)}. The ${road} road is open.`);
      }
      try { this.metaNoteTable && this.metaNoteTable(pathId); } catch (e) {}
      // PODS WEIGHT — DARK CONSCRIPT (2026-10-11, KIN canon): feared-dark
      // (domination) and relay-dark (the instrument) get the offer before
      // the challenge beats. A standalone beat; the challenge waits.
      try {
        const darkConscriptPaths = { feared: 1, relay: 1 };
        const isDark = (T.branch === 'dark') || (pathId === 'relay' && (T.band === 'dark' || (typeof this.relayLean === 'function' && this.relayLean() < 0)));
        if (darkConscriptPaths[pathId] && isDark && typeof this.podConscriptOffer === 'function') {
          const already = (typeof this.podHistory === 'function') ? this.podHistory().some(h => h.kind === 'conscript-offered' || h.kind === 'conscript-accepted') : false;
          const kidsHome = (typeof this.podKidsReturned === 'function') ? this.podKidsReturned() : false;
          if (!already && !kidsHome && (Game.state.scholar || {}).day > 7) {
            T.phase = 'conscript';
            this.podConscriptOffer(pathId);
            this.tablePrompt(
              `<p>The System waits. The pods wait. The mourners — somewhere below the light — have gone very still.</p>`,
              [
                { id: 'conscript:yes', label: 'Take them. (An army. Instruments. Say it plainly.)' },
                { id: 'conscript:no', label: 'Refuse. (Even here. Even now.)' },
              ],
              'the Table'
            );
            try { this.save(); } catch (e) {}
            return;
          }
        }
      } catch (e) {}
      this.tableRunBeat();
      try { this.save(); } catch (e) {}
    },

    // tableRunBeat: render the current beat as a modal choice.
    tableRunBeat() {
      const T = this.tableState();
      const def = pathDef(T.path);
      if (!def || !def.beats || !def.beats[T.beat]) { this.tableFail('the challenge lost its thread'); return; }
      const beat = def.beats[T.beat];
      let lines = [];
      try { lines = (typeof beat.say === 'function' ? beat.say.call(this, T) : beat.say) || []; } catch (e) {}
      // THE TABLE PLAYS THE BUILD (Steve 2026-10-14, "Both, linked"): one
      // beat per path reads the ending key — its line names what you are.
      let build = null;
      try { build = this.tableBuildBeat ? this.tableBuildBeat(T) : null; } catch (e) { console.warn('table build line', e); }
      const prompt = lines.map(l => `<p>${this.escHtml(l)}</p>`).join('') +
        (build && build.line ? `<p><b>◈ YOUR BUILD</b> — ${this.escHtml(build.line)}</p>` : '') +
        (beat.meterLine ? `<p><i>${this.escHtml(typeof beat.meterLine === 'function' ? beat.meterLine.call(this, T) : beat.meterLine)}</i></p>` : '');
      const chList = this.tableBeatChoices(beat, T);
      const options = chList.map(c => ({ id: 'beat:' + c.id, label: c.label }));
      this.tablePrompt(prompt, options, def.name);
    },
    // tableBeatChoices: the beat's own choices, plus the build-aware option
    // on the beat that plays the build (data: src/data/table-beats.json).
    // The build option always carries the path's stake: losable for every
    // build, light or dark (Steve 2026-10-14).
    tableBeatChoices(beat, T) {
      let list = (typeof beat.choices === 'function') ? beat.choices.call(this, T) : (beat.choices || []);
      try {
        const b = this.tableBuildBeat ? this.tableBuildBeat(T) : null;
        if (b && b.choices && b.choices.length) list = list.concat(b.choices);
      } catch (e) { console.warn('table build choices', e); }
      return list;
    },

    tableChoose(id) {
      const T = this.tableState();
      const def = pathDef(T.path);
      if (!def) return;
      const beatId = (id.indexOf('beat:') === 0) ? id.slice(5) : id;
      const beat = (def.beats || [])[T.beat];
      if (!beat) return;
      const chList = this.tableBeatChoices(beat, T);
      const choice = chList.find(c => c.id === beatId);
      if (!choice) return;
      // Apply meter/effect deltas. Ability mods (e.g. oathbound halves
      // horror gains) apply to positive gains only. Copy first: choice
      // effects may be the path def's SHARED objects (plain literals, or
      // wrappers like curdleCheck/turnCheck that return their `extra`) —
      // mutating them corrupts the def for every later walk in the session
      // (2026-10-11: oathbound permanently rewrote kill's horror 2->1).
      T.meters = T.meters || {};
      let eff = (typeof choice.effects === 'function' ? choice.effects.call(this, T) : choice.effects) || {};
      eff = Object.assign({}, eff);
      if (T.abilMods) {
        for (const k of Object.keys(eff)) {
          if (eff[k] > 0 && T.abilMods[k + 'Mult']) eff[k] = Math.max(0, Math.floor(eff[k] * T.abilMods[k + 'Mult']));
        }
      }
      for (const k of Object.keys(eff)) {
        if (k === 'grounding') { this.addGrounding(eff[k], 'the table'); continue; }
        if (k === 'sysBond') { this.addSysBond(eff[k]); continue; }
        T.meters[k] = (T.meters[k] | 0) + (eff[k] | 0);
      }
      // Meter floors (e.g. standing-o: genuine love can't crater).
      if (T.meterFloors) for (const k of Object.keys(T.meterFloors)) {
        if ((T.meters[k] | 0) < T.meterFloors[k]) T.meters[k] = T.meterFloors[k];
      }
      // A failed choice narrates its failure, not its success (2026-10-11):
      // the fail check runs BEFORE the choice's say, so a stalled price
      // never claims "you name someone" and then "there is no one to name".
      if (eff.fail) { this.tableFail(eff.fail); return; }
      if (choice.say) {
        const ls = typeof choice.say === 'function' ? choice.say.call(this, T) : choice.say;
        (Array.isArray(ls) ? ls : [ls]).forEach(l => this.say(l));
      }
      // Trial by combat (feared path): the challenge pauses — the fight is
      // real, on the grid, right now. tbEnd resumes the table.
      if (eff.trial && typeof this.tableTrialByCombat === 'function') { this.tableTrialByCombat(); return; }
      if (eff.goto != null) { T.beat = eff.goto; }
      else T.beat = (T.beat | 0) + 1;
      if (T.beat >= (def.beats || []).length) { this.tableFinals(); return; }
      this.tableRunBeat();
      try { this.save(); } catch (e) {}
    },

    // ============ FAILURE: downgrade, never wipe ============
    // A failed challenge resolves the story — a lesser frame, tribute
    // paid, people lost — never a run deletion. The table offers the
    // remaining earned paths, weakened. The player picks.
    tableFail(reason) {
      const T = this.tableState();
      const def = pathDef(T.path);
      const failDef = (def && def.failure) || {};
      T.phase = 'downgrade';
      T.weakened = (T.weakened | 0) + 1;
      // DOWNGRADE CYCLE-BREAKER (journey-endgame r15 2026-10-17): a failed
      // door is spent — the table never re-offers a door you already failed,
      // so a run that fails every door resolves at rock-bottom instead of
      // cycling the same doors forever. (TABLE.md law 4: failure RESOLVES
      // the story, never deletes the run.) Failed doors reset per sitting
      // (tableScene).
      const failed = T.failedDoors || (T.failedDoors = []);
      if (T.path && failed.indexOf(T.path) < 0) failed.push(T.path);
      this.say(`◈ THE TABLE FALTERS — ${reason}. ${(failDef.beat) || 'The ring dims. The faces confer. The offer changes.'}`);
      const remaining = this.tableEarnedPaths().filter(p => p.earned && failed.indexOf(p.id) < 0);
      if (!remaining.length) {
        // No path left: the honest rock-bottom — Assimilated on the
        // table's terms, or the walk with nothing. The story still ends.
        // (Guarded: in production all seven paths register, so a missing
        // assimilated def means the test rig is thin — end plainly rather
        // than stranding the challenge.)
        this.say('No doors remain open. The table makes its final offer: comfort, on its terms — or the long walk with empty hands.');
        // A failed Assimilated walk is already the rock bottom (losable since
        // 2026-10-14, Steve: "they can't lose their scenario no matter what
        // path" was a defect): it ends plainly instead of looping back in.
        // (Cycle-breaker: an already-failed Assimilated is not re-offered.)
        const ad = (T.path === 'assimilated' || failed.indexOf('assimilated') >= 0) ? null : pathDef('assimilated');
        if (ad) {
          T.path = 'assimilated'; T.phase = 'challenge'; T.beat = 0; T.meters = {};
          try { if (this.endingKeyEnter) this.endingKeyEnter('assimilated', T.branch); } catch (e) { console.warn('table ending key rock-bottom', e); }
          this.say(`◈ ${ad.name.toUpperCase()} — ${ad.openLine}`);
          this.tableRunBeat();
        } else {
          this.say('You take the comfort. It is gentle. It is a trap. It is an ending — the story resolves, which is more than the void offered.');
          if (!this.winDayFloorOk()) { this.winDayFloorDefer(T); return; }
          T.phase = 'done';
          // RESOLVED (journey-endgame r13 2026-10-15): the table is gone —
          // clear the waiting flag so post-win readers (convoTableSitting,
          // the table opener) don't treat a finished table as still sitting.
          try { this.progState().tableWaiting = false; } catch (e) {}
          this.over = true; this.won = true;
          try { this.wipe(); } catch (e) {}
        }
        try { this.save(); } catch (e) {}
        return;
      }
      const lines = remaining.map(p => `<p><b>◇ ${this.escHtml(p.name)}</b> — weakened terms (standing ${Math.max(5, (p.strength | 0) - 25 * T.weakened)})</p>`).join('');
      this.tablePrompt(
        `<p>The ring dims. The faces confer. The offer changes.</p><p>${this.escHtml(failDef.offerLine || 'The table does not punish failure with death. It punishes it with smaller doors.')}</p>` + lines,
        remaining.map(p => ({ id: 'downgrade:' + p.id, label: `Take the weakened path of ${p.name}` })),
        'the Table'
      );
      try { this.save(); } catch (e) {}
    },
    tableDowngradePick(pathId) {
      const def = pathDef(pathId);
      if (!def) return;
      const T = this.tableState();
      this.say(`You take the smaller door. It is still a door.`);
      this.tableStartPath(pathId);
      try { this.save(); } catch (e) {}
    },

    // ============ FINALS ============
    tableFinals() {
      const T = this.tableState();
      const def = pathDef(T.path);
      if (!def) return;
      T.phase = 'finals';
      const branch = T.branch || 'light';
      const finals = (def.finals && (def.finals[branch] || def.finals.light)) || [];
      this.say(`◈ ${def.name.toUpperCase()} — the last choice is yours, and it's live.`);
      const finalOpts = finals.map(f => ({ id: 'final:' + f.id, label: f.label }));
      // PODS WEIGHT (2026-10-11, KIN canon "a weight, not a meter"): the prize
      // of the good path is replaced by a DEMAND — history determines what
      // is possible. A championed run can demand the pods opened, but the
      // table always charges. Never on dark branches.
      try {
        if (branch === 'light' && typeof this.podDemandAvailable === 'function' && this.podDemandAvailable()) {
          finalOpts.push({ id: 'final:poddemand', label: 'Demand the pods opened. (The table will charge.)' });
        }
      } catch (e) {}
      // THE HOSTS (the key, 2026-10-14): with the Network off the air,
      // every path — light or dark — gets the best human ending as its
      // last choice. The path's own challenge already ran (still losable).
      try {
        if (this.progState().networkFallen) finalOpts.push({ id: 'final:hosts', label: branch === 'dark' ? 'THE HOSTS — take the broadcaster\'s chair. Bring the Taken home.' : 'THE HOSTS — set the table. Bring the Taken home.' });
      } catch (e) { console.warn('table hosts option', e); }
      this.tablePrompt(
        `<p>The ring holds its light. Trillions of eyes. Now — the last choice is yours, and it's live:</p>`,
        finalOpts,
        def.name
      );
      try { this.save(); } catch (e) {}
    },
    tableResolveFinal(id) {
      const T = this.tableState();
      const def = pathDef(T.path);
      if (!def) return;
      const fid = (id.indexOf('final:') === 0) ? id.slice(6) : id;
      const branch = T.branch || 'light';
      const finals = (def.finals && (def.finals[branch] || def.finals.light)) || [];
      let fin = finals.find(f => f.id === fid);
      // PODS WEIGHT: the demand is a synthetic final with a price choice —
      // the table always charges. Route to the price prompt, not the outcome.
      if (!fin && fid === 'poddemand' && typeof this.podDemandAvailable === 'function' && this.podDemandAvailable()) {
        T.phase = 'demand-price';
        this.say('◈ THE DEMAND — you name it aloud: the pods. Opened. Every one. The ring goes very still. Then the System, almost respectful: "Ooh. The BIG ask. ...Alright. Everything costs. PICK your price."');
        this.tablePrompt(
          `<p>The table will open the pods. But the table always charges. Pick your price:</p>`,
          [
            { id: 'demandprice:tribute', label: 'Pay in food — 12,000 kcal off the village\'s plate.' },
            { id: 'demandprice:favor', label: 'Pay in debt — two favors owed to the System, terms unspecified.' },
            { id: 'demandprice:standing', label: 'Pay in leverage — your bargaining strength, spent openly.' },
          ],
          'the Table'
        );
        try { this.save(); } catch (e) {}
        return;
      }
      if (!fin && fid === 'hosts' && this.progState().networkFallen) { this.tableResolveHosts(def, branch); return; }
      fin = fin || finals[0];
      if (!fin) return;
      const s = this.state.scholar, pg = this.progState();
      this.say(`◈ ${def.name.toUpperCase()} — "${fin.label}"`);
      const outcome = typeof fin.outcome === 'function' ? fin.outcome.call(this, T) : fin.outcome;
      const endingLines = this.tableEndingLines(fin.id, outcome);
      // Retain exactly what resolved; the final screen must not reroll or
      // reconstruct the outcome from a later build or a truncated log.
      T.resolution = { title: def.name, finalId: fin.id, label: fin.label, lines: endingLines.slice() };
      endingLines.forEach(l => this.say(l));
      // MUSIC (Steve 2026-10-12): endings get their bed — warm or cold.
      try { this.music('scenario', branch === 'dark' ? 'ending-dark' : 'ending-light'); } catch (e) {}
      // Epilogue: hero, facilitator, or outshone — credited honestly.
      this.tableEpilogue(def, branch, fin);
      try { this.recordMoment(`Haven's table path: ${def.name} (${branch}), choice: ${fin.label}.`); } catch (e) {}
      try { this.recordLegend({ outcome: 'table', frame: T.path, choice: fin.label }); } catch (e) {}
      try { this.metaNoteTableChoice && this.metaNoteTableChoice(T.path, fin.id); } catch (e) {}
      s.tableChoices = null;
      if (!this.winDayFloorOk()) { this.winDayFloorDefer(T); return; }
      T.phase = 'done';
      // RESOLVED (journey-endgame r13 2026-10-15): the table is gone —
      // clear the waiting flag so post-win readers (convoTableSitting,
      // the table opener) don't treat a finished table as still sitting.
      try { this.progState().tableWaiting = false; } catch (e) {}
      this.over = true; this.won = true;
      try { this.wipe(); } catch (e) {}
      try { this.save(); } catch (e) {}
    },

    // tableEndingLines(fid, outcome): ENDINGS BY BUILD (Steve 2026-10-14:
    // "Each playstyle and godhood path, moral choice version should have its
    // own ending."). The most specific authored ending for the locked key
    // (src/data/table-endings.json) may replace this final's outcome and adds
    // its closing lines; with nothing authored, the path's own light/dark
    // outcome stands. Which text resolved is noted for telemetry.
    tableEndingLines(fid, outcome) {
      const T = this.tableState();
      let lines = Array.isArray(outcome) ? outcome.slice() : (outcome ? [outcome] : []);
      try {
        const end = this.tableEndingFor ? this.tableEndingFor(T.path, T.branch || 'light', fid) : null;
        if (this.tableEndingNote) this.tableEndingNote(end);
        if (end) {
          if (end.outcome && end.outcome.length) lines = end.outcome.slice();
          if (end.title) lines.push(`◈ ${end.title}`);
          lines = lines.concat(end.lines || []);
        }
      } catch (e) { console.warn('table ending lines', e); }
      return lines;
    },

    // ============ THE HOSTS — the key's ending (2026-10-14) ============
    // evidence/2026-10-14/draft-abilities-skills-endgame-key.md "THE HOSTS":
    // every other ending is a bargain inside the System's frame; here the
    // pricer is dead. Humanity hosts a dinner at the Table (food is
    // humanity's superpower; the galaxy forgot food), and the Taken come
    // home to it: the adults taken on day zero and the pod children.
    // Light = "An Open Table", dark = "The New Network". Each path flavors
    // the dinner with one line.
    tableHostsLines(pathId, branch) {
      const flavor = {
        feared: 'They eat because they don\'t dare refuse.',
        indispensable: 'No contract. You hand them a recipe.',
        beloved: 'The most-watched dinner in history, and nobody broadcasts it.',
        witness: 'The judges sit as guests at your table.',
        defiant: 'You paid nothing. They came anyway.',
        assimilated: 'The ones who absorbed you get absorbed back, through the stomach.',
        relay: 'The switchboard goes silent. You speak in person.',
      };
      const lines = [];
      lines.push('◈ THE HOSTS — the ring of pale light has no cameras left. You don\'t arrive as a contestant. You arrive as the one who ended the show, and you set the table.');
      lines.push('You cook. Haven carries the pots in. Things with too many angles lift a spoon for the first time in their history, and eat. ' + (flavor[pathId] || ''));
      const cast = this.castTakingMourners ? this.castTakingMourners(2) : [];
      const first = (id) => { try { return this.displayName(id).split(' ')[0]; } catch (e) { return 'someone'; } };
      lines.push('Then the doors at the edge of the light open. The Taken walk in: the half of the adults gone since day zero, and the children out of the pods, blinking. The show was the only thing holding them. The show is over.');
      for (const m of cast) {
        const kin = ((m.kin && m.kin.name) || 'them').split(' ')[0];
        lines.push(`${first(m.id)} sees ${kin} across the table, and the dinner stops, and nobody minds.`);
      }
      if (branch === 'dark') {
        lines.push('THE NEW NETWORK — you take the broadcaster\'s chair. The Taken come home, but the cameras turn around: the galaxy is your audience now, and it eats what humans feed it. You became the thing you killed. You like the view.');
      } else {
        lines.push('AN OPEN TABLE — you feed them, and teach them that hunger is a gift. The Taken walk home through a galaxy that has started to cook. Humanity isn\'t on the menu or the schedule. It sits at the head of the table.');
      }
      return lines;
    },
    tableResolveHosts(def, branch) {
      const T = this.tableState();
      const s = this.state.scholar;
      const endingLines = this.tableHostsLines(T.path, branch).concat(this.tableEndingLines('hosts', []));
      T.resolution = { title: 'THE HOSTS', finalId: 'hosts', label: branch === 'dark' ? 'The New Network' : 'An Open Table', lines: endingLines.slice() };
      endingLines.forEach(l => this.say(l));
      try { this.music('scenario', branch === 'dark' ? 'ending-dark' : 'ending-light'); } catch (e) { console.warn('hosts music', e); }
      try { const v = this.state.village || {}; v.kidsReturned = true; v.takenReturned = true; } catch (e) { console.warn('hosts village', e); }
      try { if (this.podRemember) this.podRemember('taken-home', { via: 'network' }); } catch (e) { console.warn('hosts pods', e); }
      const label = branch === 'dark' ? 'THE HOSTS: The New Network' : 'THE HOSTS: An Open Table';
      this.tableEpilogue(def, branch, { id: 'hosts', label });
      try { this.recordMoment(`Haven's table path: ${def.name} (${branch}), choice: ${label}. The Taken came home.`); } catch (e) { console.warn('hosts moment', e); }
      try { this.recordLegend({ outcome: 'table', frame: T.path, choice: label, key: 'network' }); } catch (e) { console.warn('hosts legend', e); }
      try { this.metaNoteTableChoice && this.metaNoteTableChoice(T.path, 'hosts'); } catch (e) { console.warn('hosts meta', e); }
      T.final = 'hosts';
      s.tableChoices = null;
      if (!this.winDayFloorOk()) { this.winDayFloorDefer(T); return; }
      T.phase = 'done';
      // RESOLVED (journey-endgame r13 2026-10-15): the table is gone —
      // clear the waiting flag so post-win readers (convoTableSitting,
      // the table opener) don't treat a finished table as still sitting.
      try { this.progState().tableWaiting = false; } catch (e) {}
      this.over = true; this.won = true;
      try { this.wipe(); } catch (e) { console.warn('hosts wipe', e); }
      try { this.save(); } catch (e) { console.warn('hosts save', e); }
    },

    // tableResolveDemandPrice: the table charges, the pods open, then the
    // normal epilogue (which will NOT sting — you paid).
    tableResolveDemandPrice(price) {
      const T = this.tableState();
      const def = pathDef(T.path);
      const priceLine = `◈ THE PRICE — "${price}." The table nods. The System rubs its hands.`;
      this.say(priceLine);
      const lines = (typeof this.podDemandCost === 'function') ? this.podDemandCost(price) : [];
      const costLines = Array.isArray(lines) ? lines : [lines];
      costLines.forEach(l => this.say(l));
      const closingLines = this.tableEndingLines('poddemand', []);
      closingLines.forEach(l => this.say(l));
      T.resolution = { title: 'THE PODS OPEN', finalId: 'poddemand', label: 'Demanded the pods opened.', lines: [priceLine].concat(costLines, closingLines) };
      if (def) this.tableEpilogue(def, T.branch || 'light', { id: 'poddemand', label: 'Demanded the pods opened.' });
      try { this.recordMoment(`Haven's table path: ${(def || {}).name} (${T.branch}), choice: demanded the pods opened (paid ${price}).`); } catch (e) {}
      try { this.recordLegend({ outcome: 'table', frame: T.path, choice: 'demanded the pods opened' }); } catch (e) {}
      const s = this.state.scholar;
      s.tableChoices = null;
      if (!this.winDayFloorOk()) { this.winDayFloorDefer(T); return; }
      T.phase = 'done';
      // RESOLVED (journey-endgame r13 2026-10-15): the table is gone —
      // clear the waiting flag so post-win readers (convoTableSitting,
      // the table opener) don't treat a finished table as still sitting.
      try { this.progState().tableWaiting = false; } catch (e) {}
      this.over = true; this.won = true;
      try { this.wipe(); } catch (e) {}
      try { this.save(); } catch (e) {}
    },

    // ============ KIDS IN STASIS (2026-10-11, KIN canon) ============
    // The Taking took half the adults at the Scattering, day zero, plus
    // their children into stasis pods. The pods are a WEIGHT, not a prize
    // ("a weight, not a meter", Steve 2026-10-11): history determines what
    // is possible at the table. kidsBackEligible (ledger gate) is RETIRED —
    // see pods.js podDemandAvailable() / podOversightEpilogue().
    // castTakingMourners(n): real villagers with Taking-marked kin, aunts
    // and uncles of pod kids first. Never phantoms.
    castTakingMourners(n) {
      try {
        const mourners = (typeof this.villagersMourningTaken === 'function') ? this.villagersMourningTaken() : [];
        const isPodKin = (k) => /niece|nephew/i.test((k && k.relation) || '');
        const scored = mourners.map(id => {
          const kin = (typeof this.takenKinOf === 'function') ? (this.takenKinOf(id) || []) : [];
          return { id, kin: kin.find(isPodKin) || kin[0] || null };
        }).filter(s => s.kin);
        scored.sort((a, b) => (isPodKin(b.kin) ? 1 : 0) - (isPodKin(a.kin) ? 1 : 0));
        return scored.slice(0, n || 2);
      } catch (e) { return []; }
    },
    kidsBackOutcome(T) {
      const lines = [];
      const full = (T.path === 'beloved'); // centerpiece on Beloved-light; lesser elsewhere
      const cast = this.castTakingMourners(full ? 3 : 1);
      const first = (id) => { try { return this.displayName(id).split(' ')[0]; } catch (e) { return 'someone'; } };
      const promises = ((this.state.village || {}).takenPromises) || {};
      lines.push('The ring goes quiet. Even the System stops smiling — for exactly one second. Then: "OH! Oh oh oh! The REUNION episode! LIVE! PODS OPENING! CAMERAS ON THE LITTLE ONES!"');
      lines.push('Somewhere below, light spills out of rows of pods. Small figures sit up, blinking. The galaxy holds its breath — trillions of beings who never had childhoods watch children remember how.');
      for (const m of cast) {
        const name = first(m.id);
        const kinFirst = (m.kin.name || 'the little one').split(' ')[0];
        const kept = promises[m.id];
        lines.push(`${name} pushes through the crowd — and stops. "${kinFirst}?" Then the running. The crying. The kind of crying that has no sound at first.${kept ? ` You asked the System, all those weeks ago. You kept your word. ${name} looks at you over ${kinFirst}'s head, and doesn't need to say it.` : ''}`);
      }
      if (!cast.length) {
        lines.push('The village surges forward as one — every child claimed by shouting, laughing relatives. Nobody is left standing alone by an empty pod.');
      }
      lines.push('The System, bright as ever: "The grown-ups? Oh! Them! They\'re... elsewhere! Still! Don\'t worry! NEXT SEGMENT!" Nobody believes it. Everybody lets it pass. Today is not for that question.');
      if (full) {
        lines.push('The pods are empty. The village is loud. Somewhere in the control room, a producer is weeping into nutrient paste, and the ratings don\'t matter, and that\'s how you know it worked. You got all the kids back. All of them.');
      } else {
        lines.push('The pods are empty. It happened fast — a segment, not a saga. But the kids are home, and the village will tell the long version for years.');
      }
      try { this.state.village.kidsReturned = true; } catch (e) {}
      try { this.recordMoment('The stasis pods opened. All the kids came home.'); } catch (e) {}
      return lines;
    },

    // ============ NPC ASCENSION + FACILITATION ============
    // Competent villagers can ascend — even several in one village;
    // ascensions stack bargaining power. Facilitation is a chosen play
    // (teach, hand them the relay, shield them) with an architect's
    // payoff. Passive players get honestly outshone in the epilogue.
    villagerAscensionScore(vid) {
      try {
        const v = (this.data.villagers || []).find(x => x.id === vid);
        if (!v) return { score: 0, notes: [] };
        let score = 0; const notes = [];
        // System abilities held (count of the 6-slot kits).
        const abils = (v.abilities || []).length;
        if (abils > 0) { score += abils * 8; notes.push(`${abils} System abilities`); }
        // Knowledge breadth: the REAL villager knowledge model (convo rebuild
        // 2026-10-11): in-run learning (v.taught — fireside, fieldwork,
        // player-taught) + background familiarity. (journey-endgame r7
        // 2026-10-13: this used to read v.knowledgeBreadth/v.taughtPlants,
        // which no game system ever writes — the component was unreachable
        // in real play. Legacy fields kept as fallback.)
        const _vv = this.state.village || {};
        const _taught = ((_vv.taught || {})[vid] || []).length;
        const _fam = ((_vv.familiar || {})[vid] || []).length;
        let kb = _taught + _fam;
        if (!kb) kb = (v.knowledgeBreadth | 0) || (((v.taughtPlants || []).length) || 0);
        if (kb > 0) { score += Math.min(20, kb); notes.push('taught and teaching'); }
        // Fights survived / contests: notability as the honest proxy.
        const not = (typeof this.notabilityWeight === 'function') ? this.notabilityWeight(vid) : 0;
        if (not > 0) { score += Math.min(20, not | 0); notes.push('the cameras know their name'); }
        // Boldness: personality traits on the person record.
        const traits = v.traits || v.personality || {};
        const bold = /bold|daring|reckless|ambitious/i.test(JSON.stringify(traits));
        if (bold) { score += 10; notes.push('bold'); }
        // Trust standing: the village would follow them.
        const trust = ((this.state.village || {}).trust || {})[vid] | 0;
        if (trust >= 30) { score += 10; notes.push('the village trusts them'); }
        // Relay held: the instrument's current hands.
        try {
          const sw = (typeof this.switchboard === 'function') ? this.switchboard() : null;
          if (sw && sw.holderId === vid) { score += 15; notes.push('holds the relay'); }
        } catch (e) {}
        return { score, notes, name: v.name || 'someone' };
      } catch (e) { return { score: 0, notes: [] }; }
    },
    // tableFacilitate(kind, vid): the chosen facilitation play.
    // kinds: 'teach' (knowledge transfer — real, via existing teaching),
    // 'relay' (hand them the relay office), 'shield' (the village
    // prioritizes their safety). Tracked for the architect's credit.
    tableFacilitate(kind, vid) {
      try {
        if (kind === 'teach') {
          const v = this.state.village || {}, person = this.getPerson && this.getPerson(vid);
          if (vid === this.villagerId || !(v.roster || []).includes(vid) || !person || person.dead || (v.away || {})[vid]) {
            this.say('There is no living villager here to receive that lesson.'); return false;
          }
        }
        const T = this.tableState();
        T.facilitated = T.facilitated || {};
        const f = T.facilitated[vid] || { acts: [] };
        if (kind !== 'teach') {
          if (f.acts.indexOf(kind) < 0) f.acts.push(kind);
          T.facilitated[vid] = f;
        }
        const sc = this.villagerAscensionScore(vid);
        if (kind === 'relay' && typeof this.appointSwitchboard === 'function') {
          this.appointSwitchboard(vid);
        }
        if (kind === 'shield') {
          const v = this.state.village || {};
          v.shielded = v.shielded || {};
          v.shielded[vid] = true;
          this.say(`${sc.name} is shielded now — the village's fights will spend others first. Protection is a kind of authorship.`);
        }
        if (kind === 'teach') {
          // REAL knowledge transfer (journey-endgame r7 2026-10-13): the
          // villager learns the plants the Bearer actually knows — the same
          // stores the conversation teach path writes (taught + taughtByPlayer),
          // so the lesson feeds their ascension score honestly.
          let _taughtN = 0;
          try {
            const _vv = this.state.village || {};
            for (const p of (this.data.plants || [])) {
              if (_taughtN >= 12) break;
              const pid = p.id;
              if (!this.plantKnown || !this.plantKnown(pid)) continue;
              if (this.plantKnownBy && this.plantKnownBy(vid, pid, _vv)) continue;
              if (!this.villagerLearnsPlant || !this.plantKnownBy) continue;
              this.villagerLearnsPlant(vid, pid, 'player-taught');
              if (!this.plantKnownBy(vid, pid, _vv)) continue;
              _vv.taughtByPlayer = _vv.taughtByPlayer || {};
              const lst = _vv.taughtByPlayer[vid] = _vv.taughtByPlayer[vid] || [];
              if (lst.indexOf(pid) === -1) lst.push(pid);
              _taughtN++;
            }
          } catch (e) { console.warn('[grounding] Table teaching', e); }
          if (!_taughtN) { this.say(`${sc.name} already knows the lessons you can offer. No new lesson changes hands.`); return false; }
          if (f.acts.indexOf(kind) < 0) f.acts.push(kind);
          T.facilitated[vid] = f;
          this.say(`You teach ${sc.name} ${_taughtN} green thing${_taughtN > 1 ? 's' : ''}, name by name. Knowledge is the one gift that multiplies in the giving.`);
          this.addGrounding(2, 'teaching', this.villagerId, { save: false });
        }
        try { this.save(); } catch (e) { console.warn('[grounding] Table facilitation', e); }
      } catch (e) { console.warn('[grounding] Table facilitation', e); }
    },
    // tableAscended: villagers whose ascension score clears the bar at the
    // table. Each ascension stacks bargaining power (+path strength) and
    // gets one beat of pantheon politics. DEAD VILLAGERS ARE NOT ELIGIBLE
    // (sim-outshone-liveness 2026-10-20): the dead flag is set on the
    // SHARED data.villagers records at death, and the epilogue names the
    // ascendant as the present-tense god ("The god is someone else") — a
    // dead villager cannot be that, nor price the audit's standing.
    tableAscended(bar) {
      const out = [];
      try {
        const b = bar == null ? 45 : bar;
        for (const v of (this.data.villagers || [])) {
          if (!v || v.id === this.villagerId || v.dead) continue;
          const sc = this.villagerAscensionScore(v.id);
          if (sc.score >= b) out.push({ vid: v.id, name: sc.name, score: sc.score, notes: sc.notes });
        }
      } catch (e) {}
      return out;
    },

    // ============ EPILOGUE ============
    // The ending follows the village's story; the player authors it as
    // hero, facilitator, or footnote — credited honestly.
    tableEpilogue(def, branch, fin) {
      try {
        const T = this.tableState();
        const asc = this.tableAscended();
        const fac = T.facilitated || {};
        const facIds = Object.keys(fac);
        const facAscended = asc.filter(a => fac[a.vid]);
        const unbacked = asc.filter(a => !fac[a.vid]);
        const me = ((this.data.villagers || []).find(v => v.id === this.villagerId) || {}).name || 'the Bearer';
        if (facAscended.length) {
          const names = facAscended.map(a => a.name).join(' and ');
          this.say(`◈ THE ARCHITECT — ${names} ascended through doors you built: ${facAscended.map(a => (fac[a.vid].acts || []).join(', ')).join('; ')}. The galaxy will remember the god's name. The village will remember who built the door. Both are true. Neither is small.`);
        } else if (unbacked.length) {
          const names = unbacked.map(a => a.name).join(' and ');
          this.say(`◈ OUTSHONE — ${names} did what you would not: acted, boldly, while there was still time. The village thrives. The god is someone else. The record notes, kindly and accurately, that you watched. It stings exactly as much as it should.`);
        }
        // THE PANTHEON (win-path lever 2026-10-11): was dead code — the old
        // else-if chain made "asc.length > 1" unreachable here (asc partitions
        // exactly into facAscended + unbacked, so reaching the third branch
        // meant asc was empty). docs/TABLE.md: "the pantheon's politics get
        // one beat" whenever multiple villagers ascend — it fires alongside
        // the architect/outshone beat, not instead of it.
        if (asc.length > 1) {
          const names = asc.map(a => a.name).join(' and ');
          this.say(`◈ THE PANTHEON — ${names} ascended together, and gods, it turns out, have politics. They argue about you the way the living argue about weather. Mostly, they agree: the village comes first. Mostly.`);
        }
        if (!asc.length && !facIds.length) {
          // PRONOUN HONESTY (journey-endgame r5 2026-10-12): the coda names
          // the Bearer, so it should use their pronouns — not default
          // they/them. Villagers carry gender from nameGender ('m'/'f'/null;
          // null = unfamiliar, strangers' pronouns aren't assumed).
          let pro = 'they';
          try {
            const mv = (this.data.villagers || []).find(v => v.id === this.villagerId) || {};
            pro = mv.gender === 'm' ? 'he' : mv.gender === 'f' ? 'she' : 'they';
          } catch (e) {}
          // OBJECT CASE (journey-endgame r41 2026-10-22): the beloved coda
          // puts the pronoun after a preposition ("behind he") — needs the
          // object form, not the subject form.
          const proObj = pro === 'he' ? 'him' : pro === 'she' ? 'her' : 'them';
          // WIN CODAS (sim-wincoda 2026-10-19, findings backlog: verbatim
          // repetition, theater class). The win coda was IDENTICAL across all
          // five walked paths — now each walked path gets its own coda keyed
          // on the live table-state path (T.path), written in the System's
          // register: alien, twisted, genuinely trying; joyous RPG overlay.
          // The coda site sits in the shared epilogue, so it fires for ALL
          // seven paths — witness and indispensable get codas too. Unknown
          // path → the original line, preserved verbatim. Text only: zero
          // RNG draws, the RNG stream cannot move.
          const winCodas = {
            feared: `◈ ${me} walks out of the light alone, which is how ${pro} walked in — and the galaxy, which came to watch a monster, leaves afraid of the right things. The fear is a shield now, held over a village that trusts the hand that holds it.`,
            indispensable: `◈ ${me} walks out of the light alone, which is how ${pro} walked in — but the table keeps the contract ${pro} priced, because the galaxy still needs what ${pro} taught it. The village endures, and this time the table owes the village.`,
            beloved: `◈ ${me} walks out of the light alone, which is how ${pro} walked in — and the audience, which came to be entertained, leaves humming the village's name. The village endures, loved and unbeholden, and the lights stay warm behind ${proObj}.`,
            witness: `◈ ${me} walks out of the light alone, which is how ${pro} walked in — with every charge read aloud and answered, the ledger closed and clean. The village endures, and the record stands: what was hidden is hidden no more.`,
            assimilated: `◈ ${me} does not walk out of the light — ${pro} went inside carrying the truth, and the light, unsteadily, has begun to carry it back. The village endures, with a Trojan horse in the walls of heaven.`,
            defiant: `◈ ${me} walks out of the light alone, which is how ${pro} walked in — and keeps walking, because ${pro} paid every price and said no twice. The village endures, poorer, unowned, free: the long shot of small figures leaving the light is the highest-rated thing the galaxy ever saw.`,
            relay: `◈ ${me} reached into the light and the light reached back — person and machine, two caretakers, holding the channel open between them both ways. The village endures, and the conversation does not end.`,
          };
          this.say(winCodas[T.path] || `◈ ${me} walks out of the light alone, which is how ${pro} walked in. The village endures. That was always the story.`);
        }
        // Ascensions stack bargaining power — said aloud in the audit, priced
        // into every path's standing (tableEarnedPaths); the epilogue
        // confirms the terms held through the challenge.
        if (asc.length) this.say(`The terms held — the table had priced the village, ascension${asc.length > 1 ? 's' : ''} and all, and the village paid in full.`);
        // PODS WEIGHT (2026-10-11, KIN canon): the history is read here.
        // Shrugged runs curdle (the oversight); jackpot losses are carried.
        // WIN-DAY-FLOOR DEFERRAL (journey-endgame r11 2026-10-14): the finale
        // can resolve before day 90 — the epilogue then frames the ending as
        // written, not yet won, so it never claims a win the table hasn't
        // granted (the deferral beat follows with the table's own words).
        try {
          const deferred = (typeof this.winDayFloorOk === 'function') && !this.winDayFloorOk();
          if (typeof this.podJackpotLossEpilogue === 'function') this.podJackpotLossEpilogue();
          if (typeof this.podOversightEpilogue === 'function') this.podOversightEpilogue(deferred ? { deferred: true } : null);
        } catch (e) {}
      } catch (e) {}
    },

    // ============ UI THEME HOOK ============
    // tableTheme: the System UI reskins per path as integration deepens.
    // Same verbs, different games. Stored on pg.table.theme for app.js;
    // the full app.js reskin is follow-up UI work — this is the contract.
    tableTheme() {
      try {
        const T = this.tableState();
        const themes = {
          feared: 'threat-display', beloved: 'broadcast-studio', witness: 'case-file',
          indispensable: 'treaty-desk', assimilated: 'clearance', defiant: 'static', relay: 'dialogue',
        };
        const theme = {
          key: themes[T.path] || 'none',
          path: T.path || null, branch: T.branch || null,
          stage: (typeof this.integrationStage === 'function') ? this.integrationStage() : 0,
          groundingTier: this.groundingTier(),
        };
        T.theme = theme;
        return theme;
      } catch (e) { return { key: 'none' }; }
    },
  };

  Object.assign(Game, methods);
})();
