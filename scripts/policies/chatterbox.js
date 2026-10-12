// policies/chatterbox.js — a social-play variant that holds conversations to
// their NATURAL end (socialite opens convos and walks out: endConvo('left')).
// Purpose: measure the conversation trust channel (endConvo:talk stipend,
// +1/+3 by exchanges, 40 words-cap) in long sims, and produce real
// conversation transcripts for sense-testing. Measurement only: no game
// changes. Built on competent (survives).
'use strict';
const { competent } = require('./competent');

function chatterDaily(Game, ctx) {
  try {
    const vv = Game.state.village || {};
    const roster = (vv.roster || []).filter(id => id !== Game.villagerId);
    if (Game.talkTo && roster.length) {
      const n = Math.min(roster.length, 3);
      for (let i = 0; i < n; i++) {
        const vid = roster[Math.floor(Math.random() * roster.length)];
        try {
          Game.talkTo(vid);
          // hold the conversation: keep taking non-leave choices until it
          // ends on its own (energy budget / winddown -> natural end) or
          // we hit the safety cap.
          for (let turn = 0; turn < 14; turn++) {
            let c = null;
            try { c = Game.convoGet ? Game.convoGet(vid) : null; } catch (e) {}
            if (!c || !c.active) break;
            let choices = [];
            try { choices = Game.convoChoices(vid) || []; } catch (e) {}
            const live = choices.filter(x => x && x.id && String(x.id) !== 'leave');
            if (!live.length) break;
            // prefer an agency/ask choice first (teaching paths), else the
            // first substantive choice; never 'leave'.
            const agency = live.find(x => String(x.id).indexOf('agency:') === 0);
            const pick = agency || live[0];
            try { Game.convoTurn(vid, pick.id); } catch (e) { break; }
            ctx.chatterTurns = (ctx.chatterTurns || 0) + 1;
          }
          // if it's still active after the cap, walk out honestly
          try {
            const c2 = Game.convoGet ? Game.convoGet(vid) : null;
            if (c2 && c2.active && Game.endConvo) Game.endConvo(vid, 'left');
          } catch (e) {}
        } catch (e) {}
        ctx.chatterConvos = (ctx.chatterConvos || 0) + 1;
      }
    }
  } catch (e) {}
}

const chatterbox = Object.assign({}, competent, {
  id: 'chatterbox',
  daily: (G, c) => {
    chatterDaily(G, c);
    if (competent.daily) { try { return competent.daily(G, c); } catch (e) {} }
  },
});

module.exports = { chatterbox };
