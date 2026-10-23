// @ontology
// system: fallen-memorial
// description: The village's memorial roll — v.fallen as readable fiction. Every ordinary death becomes a permanent, knowledge-gated Codex line: name (as known at death), day, cause, plus the journal epitaph when the dead held the mantle. (Roguelike Celebration 2026, Talk 7 P0-3.)
// provides:
//   - fallenName(vid)
//   - fallenEpitaph(vid)
//   - memorialRoll()
//   - fallenMemorialHTML()
// rules:
//   - KIN.md: the Taken are NEVER memorialized as dead. v.fallen only ever receives real roster deaths through the death pipeline — the Taken are never villager records, so the write sites are the enforcement point. (code: fallen-memorial.js memorialRoll)
//   - Memorials knowledge-gate names ("if you don't know, it doesn't show"): the name is frozen via firstRef at death time — known to first name, unknown to a distinguishing descriptor, never the unrevealed true name. The dead bearer is the exception: the village knew its scholar, so the true first name is stored (never the dialogue token 'you'). (code: fallen-memorial.js fallenName)
//   - In-run only: the roll lives on state.village and dies with the run. No cross-run saga (metaProgression law). (code: fallen-memorial.js memorialRoll)
//   - No silent actions: the empty roll says so aloud; epitaphs are opt-in taps, never auto-shown walls of text. (code: fallen-memorial.js fallenMemorialHTML)
// consumes:
//   - village.fallen
//   - state.scholar.day
//   - state.codex.mantle.marginalia (journal epitaphs)
// ============ THE FALLEN ============
// v.fallen was our best-kept data secret: six-plus write sites, a name-less
// {villagerId, day, cause} shape, zero UI reads. Now the write sites store
// the knowledge-gated name at death, and the Codex renders the roll.

(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  const methods = {
    // fallenName(vid): the name the memorial roll stores — knowledge-gated
    // at the moment of death via firstRef (the mourning-line convention):
    // known → first name; unknown → distinguishing descriptor
    // ("the woman in her 30s"). Never the true name unrevealed. Total:
    // never throws, always returns a string.
    // BEARER RULE: 'you' is a living dialogue token (whoTag) — the dead
    // bearer is named as the village knew them: their true first name.
    // The death liturgy and the lineage roll both use the true name; the
    // village knew its scholar. Never knowledge-gated, never 'you'.
    fallenName(vid) {
      try {
        if (typeof this.isPlayer === 'function' && this.isPlayer(vid)) {
          const v = (this.data.villagers || []).find(x => x.id === vid) || {};
          const first = String(v.name || '').split(' ')[0];
          if (first) return first;
        }
        if (typeof this.firstRef === 'function') {
          const n = this.firstRef(vid);
          if (n) return String(n);
        }
      } catch (e) {}
      return 'someone';
    },

    // fallenEpitaph(vid): the journal epitaph, when the dead held the
    // mantle — written in the dying life's own voice by
    // journal.writeEpitaph, keyed life === villagerId. Reused, not reinvented.
    fallenEpitaph(vid) {
      try {
        const m = this.mantleRecord ? this.mantleRecord() : null;
        const marg = (m && m.marginalia) || [];
        for (let i = marg.length - 1; i >= 0; i--) {
          const e = marg[i];
          if (e && e.kind === 'epitaph' && e.life === vid) return e.text || null;
        }
      } catch (e) {}
      return null;
    },

    // memorialRoll(): the memorial roll as readable data, oldest first.
    // name is stored knowledge-gated at death; legacy entries (pre-name
    // shape) fall back to a live gated lookup — the person record and the
    // name-knowledge both survive death, so the gate reads the same.
    memorialRoll() {
      let list = [];
      try { list = ((this.state.village || {}).fallen || []).slice(); } catch (e) {}
      const out = list.map(function (f) {
        const vid = (f && (f.villagerId || f.id)) || null;
        let name = f && f.name;
        if (!name) {
          try { name = this.fallenName(vid); } catch (e) { name = 'someone'; }
        }
        return {
          villagerId: vid,
          name: name || 'someone',
          day: (f && f.day) || 0,
          cause: (f && f.cause) || 'the wild',
          epitaph: this.fallenEpitaph(vid),
        };
      }, this);
      out.sort(function (a, b) { return a.day - b.day; });
      return out;
    },

    // fallenMemorialHTML(): the Codex THE FALLEN section. A name with an
    // epitaph is a tap target; app.js toggles the last line on tap.
    fallenMemorialHTML() {
      let roll = [];
      try { roll = this.memorialRoll(); } catch (e) {}
      const rows = roll.map(function (e, i) {
        const nameHtml = e.epitaph
          ? '<button class="btn ghost sm" data-fallen-epitaph="' + i + '" style="padding:1px 6px"><b>' + esc(e.name) + '</b></button>'
          : '<b>' + esc(e.name) + '</b>';
        const epi = e.epitaph
          ? '<p class="small hand note" data-fallen-epitaph-text="' + i + '" style="display:none"><i>&ldquo;' + esc(e.epitaph) + '&rdquo;</i></p>'
          : '';
        return '<p class="small">🕯️ ' + nameHtml + ' — day ' + e.day + ', ' + esc(e.cause) + '</p>' + epi;
      }).join('');
      return '<h1 class="title" style="font-size:18px">THE FALLEN</h1>' +
        '<p class="small"><i>the village remembers who fell. every name here was earned — if you didn\'t know them, neither does this page.</i></p>' +
        (rows || '<p class="small" style="opacity:.7">No one has fallen. The village holds its breath.</p>');
    },
  };

  Object.assign(Game, methods);
})();
