// @ontology
// system: text
// description: Shared player-facing grammar module: article selection, pronoun bundles, slot filling with leak guard, and present-tense verb conjugation. Grammar only — word choice stays with the calling pools (no voice homogenization per Steve canon).
// provides:
//   - Text (article, anPhrase, lowerLead, proBundle, fill, conjVerbSlots, conj, conj3s)
// rules:
//   - grammar_computed_at_render: article/pronoun/verb forms are computed from context at render time; pools choose the words (code: article, proBundle, conj3s — never a word list)
//   - no_raw_slot_leaks: unfilled {slots} are stripped with a deduped console warning — braces never render verbatim (code: fill)
//   - conjugation_fails_loud: conj3s warns (not silent) on malformed input and passes it through unchanged, so the game never hard-breaks on a bad verb (code: conj3s)
//   - acronyms_keep_case: "ESL teacher" stays "ESL teacher" — lowerLead only lowercases standard Capitalized words, fixing the live "an eSL teacher" bug (code: lowerLead)
// consumes:
//   - console
/* TEXT — shared grammar for player-facing lines.
 *
 * Talk 5 (Bucklew & Frang, Qud localization): never concatenate generated
 * text with `+`; compute grammar from context at render time through one
 * modular text system. This file is that system for articles, pronouns,
 * slots, and present-tense verbs. It does NOT choose words — the pools do.
 *
 * VERB-POOL AUDIT (2026-10-22, P0-7 data pass): 63 distinct words follow
 * {They}/{they} across src/data/*.json + src/js template literals. Present-
 * base verbs (know, have, talk, keep, bed, sleep, listen, ...) conjugate via
 * conj3s. The rest pass through by class, encoded below so the old fixed
 * allowlist's safe behavior is preserved:
 *   - irregular 3s: are->is, were->was, have->has, do->does, go->goes
 *   - irregular pasts (24, from the audit): learned, said, got, covered,
 *     noticed, went, checked, did, left, laughed, shrugged, stopped, set,
 *     bent, drank, dismantled, asked, believed, kept, built, grew, spent,
 *     gave, studied — regular -ed pasts pass via the /ed$/ guard
 *   - modals/adverbs (never conjugate): can, could, will, would, shall, may,
 *     might, must, should, ought, never, always, still, just, not, ...
 *     ("couldn" is the regex's slice of "couldn't" — it must pass through)
 * Authoring contract: {They}/{they} slots take BASE present-tense verbs.
 */
(function (root) {
  'use strict';

  // Deduped authoring warnings: loud at authoring time, quiet in steady state.
  var _warned = {};
  function warnOnce(key, msg) {
    if (_warned[key]) return;
    _warned[key] = true;
    try { console.warn('[text] ' + msg); } catch (e) { /* consoleless env */ }
  }

  // --- articles -----------------------------------------------------------
  // Silent-h exceptions and the "you"-onset words a naive vowel test gets
  // wrong ("an hour", "a unicorn", "a one-time offer").
  var AN_WORDS = { hour: 1, honest: 1, honor: 1, honour: 1, heir: 1, herb: 1 };
  // First letters pronounced with a vowel onset ("an FBI agent", "an MBA").
  var AN_LETTERS = 'AEFHILMNORSX';

  function article(word) {
    var w = String(word == null ? '' : word).trim();
    if (!w) return 'a';
    var first = w.split(/\s+/)[0].replace(/\./g, '');
    // Acronyms/initialisms: decide by the spoken letter ("ESL" -> "an").
    if (/^[A-Z]+$/.test(first)) {
      return AN_LETTERS.indexOf(first.charAt(0)) !== -1 ? 'an' : 'a';
    }
    var low = first.toLowerCase();
    if (AN_WORDS[low]) return 'an';
    if (/^(one|once)$/.test(low)) return 'a';
    if (/^union/.test(low)) return 'a';
    if (/^uni[^n]/.test(low)) return 'a';     // unicorn, universe ("yoo" onset)
    // unin-/une-/uno- are un+vowel ("an uninterested", "an uneasy")
    if (/^(use|us|eu|ewe)/.test(low)) return 'a'; // user, usual, european
    return 'aeiou'.indexOf(low.charAt(0)) !== -1 ? 'an' : 'a';
  }

  function anPhrase(word) {
    var w = String(word == null ? '' : word).trim();
    return w ? article(w) + ' ' + w : '';
  }

  // Lowercase a leading capital ONLY for standard Capitalized words.
  // "Fisherman" -> "fisherman"; "ESL teacher"/"ER nurse" keep their case.
  // (The old charAt(0).toLowerCase() produced the live "eSL teacher".)
  function lowerLead(word) {
    var w = String(word == null ? '' : word);
    if (/^[A-Z][a-z]/.test(w)) return w.charAt(0).toLowerCase() + w.slice(1);
    return w;
  }

  // --- pronouns -----------------------------------------------------------
  // Unknown pronouns fall back to they/them: strangers' pronouns aren't
  // assumed (existing canon from fillPronouns).
  function proBundle(pro) {
    var p = String(pro || '').toLowerCase();
    if (p === 'she') return { sub: 'she', Sub: 'She', obj: 'her', poss: 'her', Poss: 'Her', refl: 'herself', plural: false };
    if (p === 'he') return { sub: 'he', Sub: 'He', obj: 'him', poss: 'his', Poss: 'His', refl: 'himself', plural: false };
    return { sub: 'they', Sub: 'They', obj: 'them', poss: 'their', Poss: 'Their', refl: 'themselves', plural: true };
  }

  // --- slot filling -------------------------------------------------------
  var SLOT_RE = /\{([A-Za-z_][A-Za-z0-9_]*)\}/g;
  // Slots owned by downstream fillers (t2fill runs after fillTalkLine) —
  // fill() leaves these in place instead of stripping them.
  var T2_SLOTS = ['fear', 'Fear', 'hope', 'quirk', 'Quirk', 'quirkI',
    'habit', 'habitI', 'They', 'they', 'them', 'their', 'Their'];

  function fill(template, slots, opts) {
    var map = slots || {};
    var deferred = {};
    var dlist = (opts && opts.deferred) || [];
    for (var i = 0; i < dlist.length; i++) deferred[dlist[i]] = true;
    var out = String(template == null ? '' : template);
    // Longest keys first so {an_occ} can never be disturbed by {occ}.
    var keys = Object.keys(map).sort(function (a, b) { return b.length - a.length; });
    for (var k = 0; k < keys.length; k++) {
      var v = map[keys[k]];
      out = out.split('{' + keys[k] + '}').join(String(v == null ? '' : v));
    }
    // Leak guard: an unfilled {slot} is an authoring bug — strip it and say
    // so loudly (once per slot name), never render braces verbatim.
    out = out.replace(SLOT_RE, function (m, name) {
      if (deferred[name]) return m;
      warnOnce('slot:' + name, 'unfilled slot {' + name + '} stripped from: ' +
        String(template).slice(0, 90));
      return '';
    });
    return out.replace(/ {2,}/g, ' ');
  }

  // --- verb conjugation ---------------------------------------------------
  var IRREG_3S = { be: 'is', are: 'is', were: 'was', have: 'has', do: 'does', go: 'goes' };
  // Already-conjugated 3s forms pass through (never "hases").
  var PRECONJ_3S = { is: 1, has: 1, does: 1, goes: 1, was: 1 };
  // Irregular pasts from the 2026-10-22 verb-pool audit (63 distinct
  // {They}/{they}-followers): pass through, never conjugated.
  var PAST = {
    learned: 1, said: 1, got: 1, covered: 1, noticed: 1, went: 1,
    checked: 1, did: 1, left: 1, laughed: 1, shrugged: 1, stopped: 1,
    set: 1, bent: 1, drank: 1, dismantled: 1, asked: 1, believed: 1,
    kept: 1, built: 1, grew: 1, spent: 1, gave: 1, studied: 1
  };
  // Modals + adverbs never conjugate ("couldn" is the regex slice of
  // "couldn't" — it must pass through intact).
  var NOCONJ = {
    can: 1, could: 1, couldn: 1, will: 1, would: 1, shall: 1, may: 1,
    might: 1, must: 1, should: 1, ought: 1, never: 1, always: 1, still: 1,
    just: 1, not: 1, also: 1, even: 1, for: 1, quite: 1, really: 1
  };

  // Present-tense verbs ending in -ed/-eed ("bed down", "feed the fire"):
  // morphology handles them; the audit found 'bed' live in data.
  var PRESENT_ED = { bed: 1, need: 1, feed: 1, seed: 1, breed: 1, bleed: 1, speed: 1, weed: 1 };
  // Present-tense 3rd-person-singular. Expects a clean lowercase base verb;
  // anything else warns LOUD and passes through so the game never breaks.
  function conj3s(verb) {
    if (typeof verb !== 'string' || !/^[a-z]+('[a-z]+)?$/.test(verb)) {
      warnOnce('verb:' + String(verb),
        'conj3s got a non-base verb — passing through: ' + JSON.stringify(verb));
      return verb;
    }
    if (NOCONJ[verb] || PAST[verb] || PRECONJ_3S[verb]) return verb;
    if (IRREG_3S[verb]) return IRREG_3S[verb];
    if (/ed$/.test(verb) && !PRESENT_ED[verb]) {
      // Likely a past tense the audit hasn't seen: pass through (correct for
      // past) but say so loudly — {They} slots take base present verbs.
      warnOnce('past:' + verb, 'conj3s got a possible past tense — passing through: ' + verb);
      return verb;
    }
    if (/[^aeiou]y$/.test(verb)) return verb.slice(0, -1) + 'ies'; // try->tries
    if (/(s|x|z|ch|sh)$/.test(verb)) return verb + 'es';           // watch->watches
    if (/[^aeiou]o$/.test(verb)) return verb + 'es';              // veto->vetoes
    return verb + 's';                              // sleep->sleeps
  }

  // Conjugate a base verb for a pronoun subject: they-form is the base,
  // she/he take 3rd singular. The copula is special: they->are, she/he->is
  // (templates write the "are" form, matching the old conj map's are:'is').
  function conj(verb, pro) {
    var p = String(pro || '').toLowerCase();
    if (verb === 'be' || verb === 'are') return p === 'they' ? 'are' : 'is';
    return p === 'they' ? verb : conj3s(verb);
  }

  // Shared "{They} <verb>" / "{they} <verb>" step: replaces the fixed
  // allowlist that used to live (twice) in game.js. Run BEFORE the plain
  // {They}/{they} slot fill, as before.
  function conjVerbSlots(str, pro) {
    var p = String(pro || '').toLowerCase();
    var Sub = p === 'she' ? 'She' : p === 'he' ? 'He' : 'They';
    var sub = p === 'she' ? 'she' : p === 'he' ? 'he' : 'they';
    return String(str == null ? '' : str)
      .replace(/\{They\} ([A-Za-z]+)/g, function (m, vb) {
        return Sub + ' ' + (p === 'they' ? vb : conj3s(vb));
      })
      .replace(/\{they\} ([A-Za-z]+)/g, function (m, vb) {
        return sub + ' ' + (p === 'they' ? vb : conj3s(vb));
      });
  }

  var Text = {
    article: article,
    anPhrase: anPhrase,
    lowerLead: lowerLead,
    proBundle: proBundle,
    fill: fill,
    T2_SLOTS: T2_SLOTS,
    conjVerbSlots: conjVerbSlots,
    conj: conj,
    conj3s: conj3s
  };

  // Explicit global attach: top-level `const` does not cross the node
  // harness's per-file eval boundary, so bare `Text` in game code needs a
  // real global property in both browser and node.
  root.Text = Text;
  if (root.Scattering) root.Scattering.Text = Text;
})(typeof window !== 'undefined' ? window : globalThis);
