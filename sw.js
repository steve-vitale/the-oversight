/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'd09f47ea2-20261021-042230';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=d09f47ea2-20261021-042230",
  "./src/js/engine/modifiers.js?v=d09f47ea2-20261021-042230",
  "./src/js/engine/calories.js?v=d09f47ea2-20261021-042230",
  "./src/js/engine/day.js?v=d09f47ea2-20261021-042230",
  "./src/js/engine/forage.js?v=d09f47ea2-20261021-042230",
  "./src/js/engine/combat.js?v=d09f47ea2-20261021-042230",
  "./src/js/audio-registry.js?v=d09f47ea2-20261021-042230",
  "./src/js/game.js?v=d09f47ea2-20261021-042230",
  "./src/js/encounters.js?v=d09f47ea2-20261021-042230",
  "./src/js/conversation.js?v=d09f47ea2-20261021-042230",
  "./src/js/convo-mood.js?v=d09f47ea2-20261021-042230",
  "./src/js/convoTopics.js?v=d09f47ea2-20261021-042230",
  "./src/js/convo-wants.js?v=d09f47ea2-20261021-042230",
  "./src/js/convo-dialogue.js?v=d09f47ea2-20261021-042230",
  "./src/js/convo-beats.js?v=d09f47ea2-20261021-042230",
  "./src/js/convo-scene.js?v=d09f47ea2-20261021-042230",
  "./src/js/voice-piper.js?v=d09f47ea2-20261021-042230",
  "./src/js/voice-system.js?v=d09f47ea2-20261021-042230",
  "./src/js/examine.js?v=d09f47ea2-20261021-042230",
  "./src/js/equipment.js?v=d09f47ea2-20261021-042230",
  "./src/js/journal.js?v=d09f47ea2-20261021-042230",
  "./src/js/party.js?v=d09f47ea2-20261021-042230",
  "./src/js/favor-water.js?v=d09f47ea2-20261021-042230",
  "./src/js/party-formal.js?v=d09f47ea2-20261021-042230",
  "./src/js/truth.js?v=d09f47ea2-20261021-042230",
  "./src/js/galactic-cast.js?v=d09f47ea2-20261021-042230",
  "./src/js/contests.js?v=d09f47ea2-20261021-042230",
  "./src/js/broadcast.js?v=d09f47ea2-20261021-042230",
  "./src/js/contestEngine.js?v=d09f47ea2-20261021-042230",
  "./src/js/alienPlayers.js?v=d09f47ea2-20261021-042230",
  "./src/js/storage.js?v=d09f47ea2-20261021-042230",
  "./src/js/perceive.js?v=d09f47ea2-20261021-042230",
  "./src/js/carexplore.js?v=d09f47ea2-20261021-042230",
  "./src/js/justice.js?v=d09f47ea2-20261021-042230",
  "./src/js/food.js?v=d09f47ea2-20261021-042230",
  "./src/js/betrayal.js?v=d09f47ea2-20261021-042230",
  "./src/js/corpses.js?v=d09f47ea2-20261021-042230",
  "./src/js/corruption.js?v=d09f47ea2-20261021-042230",
  "./src/js/lifeseed.js?v=d09f47ea2-20261021-042230",
  "./src/js/spawn-knack.js?v=d09f47ea2-20261021-042230",
  "./src/js/trial-deeds.js?v=d09f47ea2-20261021-042230",
  "./src/js/practice-deeds.js?v=d09f47ea2-20261021-042230",
  "./src/js/tracks.js?v=d09f47ea2-20261021-042230",
  "./src/js/villager-build.js?v=d09f47ea2-20261021-042230",
  "./src/js/progression.js?v=d09f47ea2-20261021-042230",
  "./src/js/waveLedger.js?v=d09f47ea2-20261021-042230",
  "./src/js/standing.js?v=d09f47ea2-20261021-042230",
  "./src/js/feastBuff.js?v=d09f47ea2-20261021-042230",
  "./src/js/ledger.js?v=d09f47ea2-20261021-042230",
  "./src/js/exposure.js?v=d09f47ea2-20261021-042230",
  "./src/js/abilityActions.js?v=d09f47ea2-20261021-042230",
  "./src/js/buildarounds.js?v=d09f47ea2-20261021-042230",
  "./src/js/foodPower.js?v=d09f47ea2-20261021-042230",
  "./src/js/monsterBehaviors.js?v=d09f47ea2-20261021-042230",
  "./src/js/partyTactics.js?v=d09f47ea2-20261021-042230",
  "./src/js/sigW3a.js?v=d09f47ea2-20261021-042230",
  "./src/js/statusEffects.js?v=d09f47ea2-20261021-042230",
  "./src/js/sigW3b.js?v=d09f47ea2-20261021-042230",
  "./src/js/metaProgression.js?v=d09f47ea2-20261021-042230",
  "./src/js/sigW3c.js?v=d09f47ea2-20261021-042230",
  "./src/js/sigW4.js?v=d09f47ea2-20261021-042230",
  "./src/js/sigW5.js?v=d09f47ea2-20261021-042230",
  "./src/js/villager-agency.js?v=d09f47ea2-20261021-042230",
  "./src/js/fieldFights.js?v=d09f47ea2-20261021-042230",
  "./src/js/party-wiring.js?v=d09f47ea2-20261021-042230",
  "./src/js/party-bond.js?v=d09f47ea2-20261021-042230",
  "./src/js/villager-objectives.js?v=d09f47ea2-20261021-042230",
  "./src/js/villager-mapmem.js?v=d09f47ea2-20261021-042230",
  "./src/js/codex-people.js?v=d09f47ea2-20261021-042230",
  "./src/js/membership.js?v=d09f47ea2-20261021-042230",
  "./src/js/gardenCultivation.js?v=d09f47ea2-20261021-042230",
  "./src/js/havenGrowth.js?v=d09f47ea2-20261021-042230",
  "./src/js/shelter.js?v=d09f47ea2-20261021-042230",
  "./src/js/hierarchy.js?v=d09f47ea2-20261021-042230",
  "./src/js/scaleDiscovery.js?v=d09f47ea2-20261021-042230",
  "./src/js/comms.js?v=d09f47ea2-20261021-042230",
  "./src/js/table.js?v=d09f47ea2-20261021-042230",
  "./src/js/pods.js?v=d09f47ea2-20261021-042230",
  "./src/js/titans.js?v=d09f47ea2-20261021-042230",
  "./src/js/finale-campaign.js?v=d09f47ea2-20261021-042230",
  "./src/js/godhood.js?v=d09f47ea2-20261021-042230",
  "./src/js/pantheon.js?v=d09f47ea2-20261021-042230",
  "./src/js/records.js?v=d09f47ea2-20261021-042230",
  "./src/js/table-feared.js?v=d09f47ea2-20261021-042230",
  "./src/js/table-indispensable.js?v=d09f47ea2-20261021-042230",
  "./src/js/table-beloved.js?v=d09f47ea2-20261021-042230",
  "./src/js/table-witness.js?v=d09f47ea2-20261021-042230",
  "./src/js/table-assimilated.js?v=d09f47ea2-20261021-042230",
  "./src/js/table-defiant.js?v=d09f47ea2-20261021-042230",
  "./src/js/relay-ext.js?v=d09f47ea2-20261021-042230",
  "./src/js/relay-dialogue.js?v=d09f47ea2-20261021-042230",
  "./src/js/table-relay.js?v=d09f47ea2-20261021-042230",
  "./src/js/safetynets.js?v=d09f47ea2-20261021-042230",
  "./src/js/villageAgency.js?v=d09f47ea2-20261021-042230",
  "./src/js/memdepth.js?v=d09f47ea2-20261021-042230",
  "./src/js/overtime.js?v=d09f47ea2-20261021-042230",
  "./src/js/network-campaign.js?v=d09f47ea2-20261021-042230",
  "./src/js/debug-scenarios.js?v=d09f47ea2-20261021-042230",
  "./src/js/keepsakes.js?v=d09f47ea2-20261021-042230",
  "./src/js/skill-teaching.js?v=d09f47ea2-20261021-042230",
  "./src/js/world.js?v=d09f47ea2-20261021-042230",
  "./src/js/nomad.js?v=d09f47ea2-20261021-042230",
  "./src/js/nomad-wild.js?v=d09f47ea2-20261021-042230",
  "./src/js/nomad-scenes.js?v=d09f47ea2-20261021-042230",
  "./src/js/nomad-drive.js?v=d09f47ea2-20261021-042230",
  "./src/js/temperature.js?v=d09f47ea2-20261021-042230",
  "./src/js/godpath.js?v=d09f47ea2-20261021-042230",
  "./src/js/godverbs.js?v=d09f47ea2-20261021-042230",
  "./src/js/endingKey.js?v=d09f47ea2-20261021-042230",
  "./src/js/telemetry-hooks.js?v=d09f47ea2-20261021-042230",
  "./src/js/feel.js?v=d09f47ea2-20261021-042230",
  "./src/js/build.js?v=d09f47ea2-20261021-042230",
  "./src/js/whereAreWe.js?v=d09f47ea2-20261021-042230",
  "./src/js/drama.js?v=d09f47ea2-20261021-042230",
  "./src/js/move-anim.js?v=d09f47ea2-20261021-042230",
  "./src/js/presentation.js?v=d09f47ea2-20261021-042230",
  "./src/js/sprites.js?v=d09f47ea2-20261021-042230",
  "./src/js/tile-scenes.js?v=d09f47ea2-20261021-042230",
  "./src/js/regional-audio.js?v=d09f47ea2-20261021-042230",
  "./src/js/timeSettlement.js?v=d09f47ea2-20261021-042230",
  "./src/js/app.js?v=d09f47ea2-20261021-042230",
  "./src/js/feel-audio.js?v=d09f47ea2-20261021-042230",
  "./manifest.json?v=d09f47ea2-20261021-042230",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=d09f47ea2-20261021-042230",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=d09f47ea2-20261021-042230",
  "./src/data/alienPlayers.json?v=d09f47ea2-20261021-042230",
  "./src/data/animals.json?v=d09f47ea2-20261021-042230",
  "./src/data/arrivalText.json?v=d09f47ea2-20261021-042230",
  "./src/data/background_survivors.json?v=d09f47ea2-20261021-042230",
  "./src/data/biomes.json?v=d09f47ea2-20261021-042230",
  "./src/data/books.json?v=d09f47ea2-20261021-042230",
  "./src/data/build-notes.json?v=d09f47ea2-20261021-042230",
  "./src/data/cell_defs.json?v=d09f47ea2-20261021-042230",
  "./src/data/characterGen.json?v=d09f47ea2-20261021-042230",
  "./src/data/climates.json?v=d09f47ea2-20261021-042230",
  "./src/data/contests.json?v=d09f47ea2-20261021-042230",
  "./src/data/cooking.json?v=d09f47ea2-20261021-042230",
  "./src/data/events.json?v=d09f47ea2-20261021-042230",
  "./src/data/evolutions.json?v=d09f47ea2-20261021-042230",
  "./src/data/feast-surge.json?v=d09f47ea2-20261021-042230",
  "./src/data/foreignSpeech.json?v=d09f47ea2-20261021-042230",
  "./src/data/gardening.json?v=d09f47ea2-20261021-042230",
  "./src/data/godpaths.json?v=d09f47ea2-20261021-042230",
  "./src/data/items.json?v=d09f47ea2-20261021-042230",
  "./src/data/justiceVoice.json?v=d09f47ea2-20261021-042230",
  "./src/data/knowledge.json?v=d09f47ea2-20261021-042230",
  "./src/data/lifeseeds.json?v=d09f47ea2-20261021-042230",
  "./src/data/locations.json?v=d09f47ea2-20261021-042230",
  "./src/data/monsterBehaviors.json?v=d09f47ea2-20261021-042230",
  "./src/data/monsters.json?v=d09f47ea2-20261021-042230",
  "./src/data/nameCultures.json?v=d09f47ea2-20261021-042230",
  "./src/data/originPicker.json?v=d09f47ea2-20261021-042230",
  "./src/data/plants.json?v=d09f47ea2-20261021-042230",
  "./src/data/presentation.json?v=d09f47ea2-20261021-042230",
  "./src/data/recipes.json?v=d09f47ea2-20261021-042230",
  "./src/data/regions.json?v=d09f47ea2-20261021-042230",
  "./src/data/relicEnhancements.json?v=d09f47ea2-20261021-042230",
  "./src/data/reward-economy.json?v=d09f47ea2-20261021-042230",
  "./src/data/schemas.json?v=d09f47ea2-20261021-042230",
  "./src/data/statusEffects.json?v=d09f47ea2-20261021-042230",
  "./src/data/synergies.json?v=d09f47ea2-20261021-042230",
  "./src/data/table-beats.json?v=d09f47ea2-20261021-042230",
  "./src/data/table-endings.json?v=d09f47ea2-20261021-042230",
  "./src/data/titans.json?v=d09f47ea2-20261021-042230",
  "./src/data/tracks.json?v=d09f47ea2-20261021-042230",
  "./src/data/villagers.json?v=d09f47ea2-20261021-042230",
  "./src/data/wave-ledger.json?v=d09f47ea2-20261021-042230"
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
