/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'df40fced1-20261121-061523';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=df40fced1-20261121-061523",
  "./src/js/engine/modifiers.js?v=df40fced1-20261121-061523",
  "./src/js/engine/calories.js?v=df40fced1-20261121-061523",
  "./src/js/engine/day.js?v=df40fced1-20261121-061523",
  "./src/js/engine/forage.js?v=df40fced1-20261121-061523",
  "./src/js/engine/combat.js?v=df40fced1-20261121-061523",
  "./src/js/audio-registry.js?v=df40fced1-20261121-061523",
  "./src/js/text.js?v=df40fced1-20261121-061523",
  "./src/js/game.js?v=df40fced1-20261121-061523",
  "./src/js/encounters.js?v=df40fced1-20261121-061523",
  "./src/js/conversation.js?v=df40fced1-20261121-061523",
  "./src/js/convo-mood.js?v=df40fced1-20261121-061523",
  "./src/js/convoTopics.js?v=df40fced1-20261121-061523",
  "./src/js/naming-rite.js?v=df40fced1-20261121-061523",
  "./src/js/convo-wants.js?v=df40fced1-20261121-061523",
  "./src/js/convo-dialogue.js?v=df40fced1-20261121-061523",
  "./src/js/convo-beats.js?v=df40fced1-20261121-061523",
  "./src/js/convo-scene.js?v=df40fced1-20261121-061523",
  "./src/js/voice-piper.js?v=df40fced1-20261121-061523",
  "./src/js/voice-system.js?v=df40fced1-20261121-061523",
  "./src/js/examine.js?v=df40fced1-20261121-061523",
  "./src/js/equipment.js?v=df40fced1-20261121-061523",
  "./src/js/journal.js?v=df40fced1-20261121-061523",
  "./src/js/party.js?v=df40fced1-20261121-061523",
  "./src/js/favor-water.js?v=df40fced1-20261121-061523",
  "./src/js/favor-forage.js?v=df40fced1-20261121-061523",
  "./src/js/favor-outing.js?v=df40fced1-20261121-061523",
  "./src/js/party-formal.js?v=df40fced1-20261121-061523",
  "./src/js/truth.js?v=df40fced1-20261121-061523",
  "./src/js/galactic-cast.js?v=df40fced1-20261121-061523",
  "./src/js/contests.js?v=df40fced1-20261121-061523",
  "./src/js/broadcast.js?v=df40fced1-20261121-061523",
  "./src/js/contestEngine.js?v=df40fced1-20261121-061523",
  "./src/js/alienPlayers.js?v=df40fced1-20261121-061523",
  "./src/js/storage.js?v=df40fced1-20261121-061523",
  "./src/js/perceive.js?v=df40fced1-20261121-061523",
  "./src/js/carexplore.js?v=df40fced1-20261121-061523",
  "./src/js/justice.js?v=df40fced1-20261121-061523",
  "./src/js/food.js?v=df40fced1-20261121-061523",
  "./src/js/betrayal.js?v=df40fced1-20261121-061523",
  "./src/js/corpses.js?v=df40fced1-20261121-061523",
  "./src/js/corruption.js?v=df40fced1-20261121-061523",
  "./src/js/lifeseed.js?v=df40fced1-20261121-061523",
  "./src/js/spawn-knack.js?v=df40fced1-20261121-061523",
  "./src/js/trial-deeds.js?v=df40fced1-20261121-061523",
  "./src/js/practice-deeds.js?v=df40fced1-20261121-061523",
  "./src/js/tracks.js?v=df40fced1-20261121-061523",
  "./src/js/villager-build.js?v=df40fced1-20261121-061523",
  "./src/js/progression.js?v=df40fced1-20261121-061523",
  "./src/js/waveLedger.js?v=df40fced1-20261121-061523",
  "./src/js/standing.js?v=df40fced1-20261121-061523",
  "./src/js/ladder.js?v=df40fced1-20261121-061523",
  "./src/js/feastBuff.js?v=df40fced1-20261121-061523",
  "./src/js/ledger.js?v=df40fced1-20261121-061523",
  "./src/js/exposure.js?v=df40fced1-20261121-061523",
  "./src/js/abilityActions.js?v=df40fced1-20261121-061523",
  "./src/js/buildarounds.js?v=df40fced1-20261121-061523",
  "./src/js/foodPower.js?v=df40fced1-20261121-061523",
  "./src/js/monsterBehaviors.js?v=df40fced1-20261121-061523",
  "./src/js/partyTactics.js?v=df40fced1-20261121-061523",
  "./src/js/sigW3a.js?v=df40fced1-20261121-061523",
  "./src/js/statusEffects.js?v=df40fced1-20261121-061523",
  "./src/js/sigW3b.js?v=df40fced1-20261121-061523",
  "./src/js/metaProgression.js?v=df40fced1-20261121-061523",
  "./src/js/sigW3c.js?v=df40fced1-20261121-061523",
  "./src/js/sigW4.js?v=df40fced1-20261121-061523",
  "./src/js/sigW5.js?v=df40fced1-20261121-061523",
  "./src/js/villager-agency.js?v=df40fced1-20261121-061523",
  "./src/js/win-plan.js?v=df40fced1-20261121-061523",
  "./src/js/npc-triggers.js?v=df40fced1-20261121-061523",
  "./src/js/fieldFights.js?v=df40fced1-20261121-061523",
  "./src/js/party-wiring.js?v=df40fced1-20261121-061523",
  "./src/js/party-bond.js?v=df40fced1-20261121-061523",
  "./src/js/villager-objectives.js?v=df40fced1-20261121-061523",
  "./src/js/villager-goals.js?v=df40fced1-20261121-061523",
  "./src/js/villager-brain.js?v=df40fced1-20261121-061523",
  "./src/js/bond-initiation.js?v=df40fced1-20261121-061523",
  "./src/js/villager-mapmem.js?v=df40fced1-20261121-061523",
  "./src/js/codex-people.js?v=df40fced1-20261121-061523",
  "./src/js/fallen-memorial.js?v=df40fced1-20261121-061523",
  "./src/js/graves.js?v=df40fced1-20261121-061523",
  "./src/js/membership.js?v=df40fced1-20261121-061523",
  "./src/js/gardenCultivation.js?v=df40fced1-20261121-061523",
  "./src/js/havenGrowth.js?v=df40fced1-20261121-061523",
  "./src/js/shelter.js?v=df40fced1-20261121-061523",
  "./src/js/hierarchy.js?v=df40fced1-20261121-061523",
  "./src/js/scaleDiscovery.js?v=df40fced1-20261121-061523",
  "./src/js/comms.js?v=df40fced1-20261121-061523",
  "./src/js/table.js?v=df40fced1-20261121-061523",
  "./src/js/pods.js?v=df40fced1-20261121-061523",
  "./src/js/titans.js?v=df40fced1-20261121-061523",
  "./src/js/finale-campaign.js?v=df40fced1-20261121-061523",
  "./src/js/godhood.js?v=df40fced1-20261121-061523",
  "./src/js/pantheon.js?v=df40fced1-20261121-061523",
  "./src/js/records.js?v=df40fced1-20261121-061523",
  "./src/js/table-feared.js?v=df40fced1-20261121-061523",
  "./src/js/table-indispensable.js?v=df40fced1-20261121-061523",
  "./src/js/table-beloved.js?v=df40fced1-20261121-061523",
  "./src/js/table-witness.js?v=df40fced1-20261121-061523",
  "./src/js/table-assimilated.js?v=df40fced1-20261121-061523",
  "./src/js/table-defiant.js?v=df40fced1-20261121-061523",
  "./src/js/relay-ext.js?v=df40fced1-20261121-061523",
  "./src/js/relay-dialogue.js?v=df40fced1-20261121-061523",
  "./src/js/table-relay.js?v=df40fced1-20261121-061523",
  "./src/js/safetynets.js?v=df40fced1-20261121-061523",
  "./src/js/villageAgency.js?v=df40fced1-20261121-061523",
  "./src/js/memdepth.js?v=df40fced1-20261121-061523",
  "./src/js/overtime.js?v=df40fced1-20261121-061523",
  "./src/js/network-campaign.js?v=df40fced1-20261121-061523",
  "./src/js/debug-scenarios.js?v=df40fced1-20261121-061523",
  "./src/js/keepsakes.js?v=df40fced1-20261121-061523",
  "./src/js/skill-teaching.js?v=df40fced1-20261121-061523",
  "./src/js/person-trust.js?v=df40fced1-20261121-061523",
  "./src/js/companion-score.js?v=df40fced1-20261121-061523",
  "./src/js/world.js?v=df40fced1-20261121-061523",
  "./src/js/nomad.js?v=df40fced1-20261121-061523",
  "./src/js/nomad-wild.js?v=df40fced1-20261121-061523",
  "./src/js/nomad-scenes.js?v=df40fced1-20261121-061523",
  "./src/js/nomad-drive.js?v=df40fced1-20261121-061523",
  "./src/js/temperature.js?v=df40fced1-20261121-061523",
  "./src/js/godpath.js?v=df40fced1-20261121-061523",
  "./src/js/godverbs.js?v=df40fced1-20261121-061523",
  "./src/js/endingKey.js?v=df40fced1-20261121-061523",
  "./src/js/telemetry-hooks.js?v=df40fced1-20261121-061523",
  "./src/js/finishLog.js?v=df40fced1-20261121-061523",
  "./src/js/feel.js?v=df40fced1-20261121-061523",
  "./src/js/build.js?v=df40fced1-20261121-061523",
  "./src/js/whereAreWe.js?v=df40fced1-20261121-061523",
  "./src/js/drama.js?v=df40fced1-20261121-061523",
  "./src/js/move-anim.js?v=df40fced1-20261121-061523",
  "./src/js/presentation.js?v=df40fced1-20261121-061523",
  "./src/js/sprites.js?v=df40fced1-20261121-061523",
  "./src/js/tile-scenes.js?v=df40fced1-20261121-061523",
  "./src/js/regional-audio.js?v=df40fced1-20261121-061523",
  "./src/js/favor-company.js?v=df40fced1-20261121-061523",
  "./src/js/timeSettlement.js?v=df40fced1-20261121-061523",
  "./src/js/app.js?v=df40fced1-20261121-061523",
  "./src/js/feel-audio.js?v=df40fced1-20261121-061523",
  "./manifest.json?v=df40fced1-20261121-061523",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=df40fced1-20261121-061523",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=df40fced1-20261121-061523",
  "./src/data/alienPlayers.json?v=df40fced1-20261121-061523",
  "./src/data/animals.json?v=df40fced1-20261121-061523",
  "./src/data/arrivalText.json?v=df40fced1-20261121-061523",
  "./src/data/background_survivors.json?v=df40fced1-20261121-061523",
  "./src/data/biomes.json?v=df40fced1-20261121-061523",
  "./src/data/books.json?v=df40fced1-20261121-061523",
  "./src/data/build-notes.json?v=df40fced1-20261121-061523",
  "./src/data/cell_defs.json?v=df40fced1-20261121-061523",
  "./src/data/characterGen.json?v=df40fced1-20261121-061523",
  "./src/data/climates.json?v=df40fced1-20261121-061523",
  "./src/data/contests.json?v=df40fced1-20261121-061523",
  "./src/data/cooking.json?v=df40fced1-20261121-061523",
  "./src/data/events.json?v=df40fced1-20261121-061523",
  "./src/data/evolutions.json?v=df40fced1-20261121-061523",
  "./src/data/favor-rules.json?v=df40fced1-20261121-061523",
  "./src/data/feast-surge.json?v=df40fced1-20261121-061523",
  "./src/data/foreignSpeech.json?v=df40fced1-20261121-061523",
  "./src/data/gardening.json?v=df40fced1-20261121-061523",
  "./src/data/godpaths.json?v=df40fced1-20261121-061523",
  "./src/data/items.json?v=df40fced1-20261121-061523",
  "./src/data/justiceVoice.json?v=df40fced1-20261121-061523",
  "./src/data/knowledge.json?v=df40fced1-20261121-061523",
  "./src/data/ladder-capstones.json?v=df40fced1-20261121-061523",
  "./src/data/lifeseeds.json?v=df40fced1-20261121-061523",
  "./src/data/locations.json?v=df40fced1-20261121-061523",
  "./src/data/monsterBehaviors.json?v=df40fced1-20261121-061523",
  "./src/data/monsters.json?v=df40fced1-20261121-061523",
  "./src/data/nameCultures.json?v=df40fced1-20261121-061523",
  "./src/data/originPicker.json?v=df40fced1-20261121-061523",
  "./src/data/pellet-boost.json?v=df40fced1-20261121-061523",
  "./src/data/plants.json?v=df40fced1-20261121-061523",
  "./src/data/presentation.json?v=df40fced1-20261121-061523",
  "./src/data/recipes.json?v=df40fced1-20261121-061523",
  "./src/data/regions.json?v=df40fced1-20261121-061523",
  "./src/data/relicEnhancements.json?v=df40fced1-20261121-061523",
  "./src/data/reward-economy.json?v=df40fced1-20261121-061523",
  "./src/data/schemas.json?v=df40fced1-20261121-061523",
  "./src/data/statusEffects.json?v=df40fced1-20261121-061523",
  "./src/data/synergies.json?v=df40fced1-20261121-061523",
  "./src/data/table-beats.json?v=df40fced1-20261121-061523",
  "./src/data/table-endings.json?v=df40fced1-20261121-061523",
  "./src/data/titans.json?v=df40fced1-20261121-061523",
  "./src/data/tracks.json?v=df40fced1-20261121-061523",
  "./src/data/villagers.json?v=df40fced1-20261121-061523",
  "./src/data/wave-ledger.json?v=df40fced1-20261121-061523"
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
