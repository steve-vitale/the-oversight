/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'ba2039f1b-20261103-172507';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=ba2039f1b-20261103-172507",
  "./src/js/engine/modifiers.js?v=ba2039f1b-20261103-172507",
  "./src/js/engine/calories.js?v=ba2039f1b-20261103-172507",
  "./src/js/engine/day.js?v=ba2039f1b-20261103-172507",
  "./src/js/engine/forage.js?v=ba2039f1b-20261103-172507",
  "./src/js/engine/combat.js?v=ba2039f1b-20261103-172507",
  "./src/js/audio-registry.js?v=ba2039f1b-20261103-172507",
  "./src/js/text.js?v=ba2039f1b-20261103-172507",
  "./src/js/game.js?v=ba2039f1b-20261103-172507",
  "./src/js/encounters.js?v=ba2039f1b-20261103-172507",
  "./src/js/conversation.js?v=ba2039f1b-20261103-172507",
  "./src/js/convo-mood.js?v=ba2039f1b-20261103-172507",
  "./src/js/convoTopics.js?v=ba2039f1b-20261103-172507",
  "./src/js/naming-rite.js?v=ba2039f1b-20261103-172507",
  "./src/js/convo-wants.js?v=ba2039f1b-20261103-172507",
  "./src/js/convo-dialogue.js?v=ba2039f1b-20261103-172507",
  "./src/js/convo-beats.js?v=ba2039f1b-20261103-172507",
  "./src/js/convo-scene.js?v=ba2039f1b-20261103-172507",
  "./src/js/voice-piper.js?v=ba2039f1b-20261103-172507",
  "./src/js/voice-system.js?v=ba2039f1b-20261103-172507",
  "./src/js/examine.js?v=ba2039f1b-20261103-172507",
  "./src/js/equipment.js?v=ba2039f1b-20261103-172507",
  "./src/js/journal.js?v=ba2039f1b-20261103-172507",
  "./src/js/party.js?v=ba2039f1b-20261103-172507",
  "./src/js/favor-water.js?v=ba2039f1b-20261103-172507",
  "./src/js/favor-forage.js?v=ba2039f1b-20261103-172507",
  "./src/js/favor-outing.js?v=ba2039f1b-20261103-172507",
  "./src/js/party-formal.js?v=ba2039f1b-20261103-172507",
  "./src/js/truth.js?v=ba2039f1b-20261103-172507",
  "./src/js/galactic-cast.js?v=ba2039f1b-20261103-172507",
  "./src/js/contests.js?v=ba2039f1b-20261103-172507",
  "./src/js/broadcast.js?v=ba2039f1b-20261103-172507",
  "./src/js/contestEngine.js?v=ba2039f1b-20261103-172507",
  "./src/js/alienPlayers.js?v=ba2039f1b-20261103-172507",
  "./src/js/storage.js?v=ba2039f1b-20261103-172507",
  "./src/js/perceive.js?v=ba2039f1b-20261103-172507",
  "./src/js/carexplore.js?v=ba2039f1b-20261103-172507",
  "./src/js/justice.js?v=ba2039f1b-20261103-172507",
  "./src/js/food.js?v=ba2039f1b-20261103-172507",
  "./src/js/betrayal.js?v=ba2039f1b-20261103-172507",
  "./src/js/corpses.js?v=ba2039f1b-20261103-172507",
  "./src/js/corruption.js?v=ba2039f1b-20261103-172507",
  "./src/js/lifeseed.js?v=ba2039f1b-20261103-172507",
  "./src/js/spawn-knack.js?v=ba2039f1b-20261103-172507",
  "./src/js/trial-deeds.js?v=ba2039f1b-20261103-172507",
  "./src/js/practice-deeds.js?v=ba2039f1b-20261103-172507",
  "./src/js/tracks.js?v=ba2039f1b-20261103-172507",
  "./src/js/villager-build.js?v=ba2039f1b-20261103-172507",
  "./src/js/progression.js?v=ba2039f1b-20261103-172507",
  "./src/js/waveLedger.js?v=ba2039f1b-20261103-172507",
  "./src/js/standing.js?v=ba2039f1b-20261103-172507",
  "./src/js/feastBuff.js?v=ba2039f1b-20261103-172507",
  "./src/js/ledger.js?v=ba2039f1b-20261103-172507",
  "./src/js/exposure.js?v=ba2039f1b-20261103-172507",
  "./src/js/abilityActions.js?v=ba2039f1b-20261103-172507",
  "./src/js/buildarounds.js?v=ba2039f1b-20261103-172507",
  "./src/js/foodPower.js?v=ba2039f1b-20261103-172507",
  "./src/js/monsterBehaviors.js?v=ba2039f1b-20261103-172507",
  "./src/js/partyTactics.js?v=ba2039f1b-20261103-172507",
  "./src/js/sigW3a.js?v=ba2039f1b-20261103-172507",
  "./src/js/statusEffects.js?v=ba2039f1b-20261103-172507",
  "./src/js/sigW3b.js?v=ba2039f1b-20261103-172507",
  "./src/js/metaProgression.js?v=ba2039f1b-20261103-172507",
  "./src/js/sigW3c.js?v=ba2039f1b-20261103-172507",
  "./src/js/sigW4.js?v=ba2039f1b-20261103-172507",
  "./src/js/sigW5.js?v=ba2039f1b-20261103-172507",
  "./src/js/villager-agency.js?v=ba2039f1b-20261103-172507",
  "./src/js/win-plan.js?v=ba2039f1b-20261103-172507",
  "./src/js/npc-triggers.js?v=ba2039f1b-20261103-172507",
  "./src/js/fieldFights.js?v=ba2039f1b-20261103-172507",
  "./src/js/party-wiring.js?v=ba2039f1b-20261103-172507",
  "./src/js/party-bond.js?v=ba2039f1b-20261103-172507",
  "./src/js/villager-objectives.js?v=ba2039f1b-20261103-172507",
  "./src/js/villager-mapmem.js?v=ba2039f1b-20261103-172507",
  "./src/js/codex-people.js?v=ba2039f1b-20261103-172507",
  "./src/js/fallen-memorial.js?v=ba2039f1b-20261103-172507",
  "./src/js/graves.js?v=ba2039f1b-20261103-172507",
  "./src/js/membership.js?v=ba2039f1b-20261103-172507",
  "./src/js/gardenCultivation.js?v=ba2039f1b-20261103-172507",
  "./src/js/havenGrowth.js?v=ba2039f1b-20261103-172507",
  "./src/js/shelter.js?v=ba2039f1b-20261103-172507",
  "./src/js/hierarchy.js?v=ba2039f1b-20261103-172507",
  "./src/js/scaleDiscovery.js?v=ba2039f1b-20261103-172507",
  "./src/js/comms.js?v=ba2039f1b-20261103-172507",
  "./src/js/table.js?v=ba2039f1b-20261103-172507",
  "./src/js/pods.js?v=ba2039f1b-20261103-172507",
  "./src/js/titans.js?v=ba2039f1b-20261103-172507",
  "./src/js/finale-campaign.js?v=ba2039f1b-20261103-172507",
  "./src/js/godhood.js?v=ba2039f1b-20261103-172507",
  "./src/js/pantheon.js?v=ba2039f1b-20261103-172507",
  "./src/js/records.js?v=ba2039f1b-20261103-172507",
  "./src/js/table-feared.js?v=ba2039f1b-20261103-172507",
  "./src/js/table-indispensable.js?v=ba2039f1b-20261103-172507",
  "./src/js/table-beloved.js?v=ba2039f1b-20261103-172507",
  "./src/js/table-witness.js?v=ba2039f1b-20261103-172507",
  "./src/js/table-assimilated.js?v=ba2039f1b-20261103-172507",
  "./src/js/table-defiant.js?v=ba2039f1b-20261103-172507",
  "./src/js/relay-ext.js?v=ba2039f1b-20261103-172507",
  "./src/js/relay-dialogue.js?v=ba2039f1b-20261103-172507",
  "./src/js/table-relay.js?v=ba2039f1b-20261103-172507",
  "./src/js/safetynets.js?v=ba2039f1b-20261103-172507",
  "./src/js/villageAgency.js?v=ba2039f1b-20261103-172507",
  "./src/js/memdepth.js?v=ba2039f1b-20261103-172507",
  "./src/js/overtime.js?v=ba2039f1b-20261103-172507",
  "./src/js/network-campaign.js?v=ba2039f1b-20261103-172507",
  "./src/js/debug-scenarios.js?v=ba2039f1b-20261103-172507",
  "./src/js/keepsakes.js?v=ba2039f1b-20261103-172507",
  "./src/js/skill-teaching.js?v=ba2039f1b-20261103-172507",
  "./src/js/world.js?v=ba2039f1b-20261103-172507",
  "./src/js/nomad.js?v=ba2039f1b-20261103-172507",
  "./src/js/nomad-wild.js?v=ba2039f1b-20261103-172507",
  "./src/js/nomad-scenes.js?v=ba2039f1b-20261103-172507",
  "./src/js/nomad-drive.js?v=ba2039f1b-20261103-172507",
  "./src/js/temperature.js?v=ba2039f1b-20261103-172507",
  "./src/js/godpath.js?v=ba2039f1b-20261103-172507",
  "./src/js/godverbs.js?v=ba2039f1b-20261103-172507",
  "./src/js/endingKey.js?v=ba2039f1b-20261103-172507",
  "./src/js/telemetry-hooks.js?v=ba2039f1b-20261103-172507",
  "./src/js/feel.js?v=ba2039f1b-20261103-172507",
  "./src/js/build.js?v=ba2039f1b-20261103-172507",
  "./src/js/whereAreWe.js?v=ba2039f1b-20261103-172507",
  "./src/js/drama.js?v=ba2039f1b-20261103-172507",
  "./src/js/move-anim.js?v=ba2039f1b-20261103-172507",
  "./src/js/presentation.js?v=ba2039f1b-20261103-172507",
  "./src/js/sprites.js?v=ba2039f1b-20261103-172507",
  "./src/js/tile-scenes.js?v=ba2039f1b-20261103-172507",
  "./src/js/regional-audio.js?v=ba2039f1b-20261103-172507",
  "./src/js/favor-company.js?v=ba2039f1b-20261103-172507",
  "./src/js/timeSettlement.js?v=ba2039f1b-20261103-172507",
  "./src/js/app.js?v=ba2039f1b-20261103-172507",
  "./src/js/feel-audio.js?v=ba2039f1b-20261103-172507",
  "./manifest.json?v=ba2039f1b-20261103-172507",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=ba2039f1b-20261103-172507",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=ba2039f1b-20261103-172507",
  "./src/data/alienPlayers.json?v=ba2039f1b-20261103-172507",
  "./src/data/animals.json?v=ba2039f1b-20261103-172507",
  "./src/data/arrivalText.json?v=ba2039f1b-20261103-172507",
  "./src/data/background_survivors.json?v=ba2039f1b-20261103-172507",
  "./src/data/biomes.json?v=ba2039f1b-20261103-172507",
  "./src/data/books.json?v=ba2039f1b-20261103-172507",
  "./src/data/build-notes.json?v=ba2039f1b-20261103-172507",
  "./src/data/cell_defs.json?v=ba2039f1b-20261103-172507",
  "./src/data/characterGen.json?v=ba2039f1b-20261103-172507",
  "./src/data/climates.json?v=ba2039f1b-20261103-172507",
  "./src/data/contests.json?v=ba2039f1b-20261103-172507",
  "./src/data/cooking.json?v=ba2039f1b-20261103-172507",
  "./src/data/events.json?v=ba2039f1b-20261103-172507",
  "./src/data/evolutions.json?v=ba2039f1b-20261103-172507",
  "./src/data/favor-rules.json?v=ba2039f1b-20261103-172507",
  "./src/data/feast-surge.json?v=ba2039f1b-20261103-172507",
  "./src/data/foreignSpeech.json?v=ba2039f1b-20261103-172507",
  "./src/data/gardening.json?v=ba2039f1b-20261103-172507",
  "./src/data/godpaths.json?v=ba2039f1b-20261103-172507",
  "./src/data/items.json?v=ba2039f1b-20261103-172507",
  "./src/data/justiceVoice.json?v=ba2039f1b-20261103-172507",
  "./src/data/knowledge.json?v=ba2039f1b-20261103-172507",
  "./src/data/lifeseeds.json?v=ba2039f1b-20261103-172507",
  "./src/data/locations.json?v=ba2039f1b-20261103-172507",
  "./src/data/monsterBehaviors.json?v=ba2039f1b-20261103-172507",
  "./src/data/monsters.json?v=ba2039f1b-20261103-172507",
  "./src/data/nameCultures.json?v=ba2039f1b-20261103-172507",
  "./src/data/originPicker.json?v=ba2039f1b-20261103-172507",
  "./src/data/plants.json?v=ba2039f1b-20261103-172507",
  "./src/data/presentation.json?v=ba2039f1b-20261103-172507",
  "./src/data/recipes.json?v=ba2039f1b-20261103-172507",
  "./src/data/regions.json?v=ba2039f1b-20261103-172507",
  "./src/data/relicEnhancements.json?v=ba2039f1b-20261103-172507",
  "./src/data/reward-economy.json?v=ba2039f1b-20261103-172507",
  "./src/data/schemas.json?v=ba2039f1b-20261103-172507",
  "./src/data/statusEffects.json?v=ba2039f1b-20261103-172507",
  "./src/data/synergies.json?v=ba2039f1b-20261103-172507",
  "./src/data/table-beats.json?v=ba2039f1b-20261103-172507",
  "./src/data/table-endings.json?v=ba2039f1b-20261103-172507",
  "./src/data/titans.json?v=ba2039f1b-20261103-172507",
  "./src/data/tracks.json?v=ba2039f1b-20261103-172507",
  "./src/data/villagers.json?v=ba2039f1b-20261103-172507",
  "./src/data/wave-ledger.json?v=ba2039f1b-20261103-172507"
];
// END GENERATED OFFLINE ASSETS

self.addEventListener('install', e => {
  // Cache everything fresh for this version, then sit in "waiting" —
  // do NOT skipWaiting here; the page decides when to switch.
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        // Only cache successful same-origin basics; game data is versioned by CACHE.
        // AUDIO RUNTIME CACHE (2026-10-12): voice lines are 14MB — too heavy to
        // precache at install, but the fetch handler never stored them, so the
        // offline PWA lost all voice after first install. Cache audio responses
        // at runtime: play once online, then it works offline.
        try {
          const ct = resp.headers.get('content-type') || '';
          if (resp.ok && (ct.indexOf('audio/') === 0 || e.request.url.indexOf('/src/audio/') !== -1)) {
            const copy = resp.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
          }
        } catch (err) { /* cache failure must never break playback */ }
        return resp;
      }).catch(() => {
        if (e.request.mode === 'navigate') return caches.match('./index.html');
        throw new Error('offline');
      });
    })
  );
});
