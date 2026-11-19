/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'af7fddfc4-20261119-183656';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=af7fddfc4-20261119-183656",
  "./src/js/engine/modifiers.js?v=af7fddfc4-20261119-183656",
  "./src/js/engine/calories.js?v=af7fddfc4-20261119-183656",
  "./src/js/engine/day.js?v=af7fddfc4-20261119-183656",
  "./src/js/engine/forage.js?v=af7fddfc4-20261119-183656",
  "./src/js/engine/combat.js?v=af7fddfc4-20261119-183656",
  "./src/js/audio-registry.js?v=af7fddfc4-20261119-183656",
  "./src/js/text.js?v=af7fddfc4-20261119-183656",
  "./src/js/game.js?v=af7fddfc4-20261119-183656",
  "./src/js/encounters.js?v=af7fddfc4-20261119-183656",
  "./src/js/conversation.js?v=af7fddfc4-20261119-183656",
  "./src/js/convo-mood.js?v=af7fddfc4-20261119-183656",
  "./src/js/convoTopics.js?v=af7fddfc4-20261119-183656",
  "./src/js/naming-rite.js?v=af7fddfc4-20261119-183656",
  "./src/js/convo-wants.js?v=af7fddfc4-20261119-183656",
  "./src/js/convo-dialogue.js?v=af7fddfc4-20261119-183656",
  "./src/js/convo-beats.js?v=af7fddfc4-20261119-183656",
  "./src/js/convo-scene.js?v=af7fddfc4-20261119-183656",
  "./src/js/voice-piper.js?v=af7fddfc4-20261119-183656",
  "./src/js/voice-system.js?v=af7fddfc4-20261119-183656",
  "./src/js/examine.js?v=af7fddfc4-20261119-183656",
  "./src/js/equipment.js?v=af7fddfc4-20261119-183656",
  "./src/js/journal.js?v=af7fddfc4-20261119-183656",
  "./src/js/party.js?v=af7fddfc4-20261119-183656",
  "./src/js/favor-water.js?v=af7fddfc4-20261119-183656",
  "./src/js/favor-forage.js?v=af7fddfc4-20261119-183656",
  "./src/js/favor-outing.js?v=af7fddfc4-20261119-183656",
  "./src/js/party-formal.js?v=af7fddfc4-20261119-183656",
  "./src/js/truth.js?v=af7fddfc4-20261119-183656",
  "./src/js/galactic-cast.js?v=af7fddfc4-20261119-183656",
  "./src/js/contests.js?v=af7fddfc4-20261119-183656",
  "./src/js/broadcast.js?v=af7fddfc4-20261119-183656",
  "./src/js/contestEngine.js?v=af7fddfc4-20261119-183656",
  "./src/js/alienPlayers.js?v=af7fddfc4-20261119-183656",
  "./src/js/storage.js?v=af7fddfc4-20261119-183656",
  "./src/js/perceive.js?v=af7fddfc4-20261119-183656",
  "./src/js/carexplore.js?v=af7fddfc4-20261119-183656",
  "./src/js/justice.js?v=af7fddfc4-20261119-183656",
  "./src/js/food.js?v=af7fddfc4-20261119-183656",
  "./src/js/betrayal.js?v=af7fddfc4-20261119-183656",
  "./src/js/corpses.js?v=af7fddfc4-20261119-183656",
  "./src/js/corruption.js?v=af7fddfc4-20261119-183656",
  "./src/js/lifeseed.js?v=af7fddfc4-20261119-183656",
  "./src/js/spawn-knack.js?v=af7fddfc4-20261119-183656",
  "./src/js/trial-deeds.js?v=af7fddfc4-20261119-183656",
  "./src/js/practice-deeds.js?v=af7fddfc4-20261119-183656",
  "./src/js/tracks.js?v=af7fddfc4-20261119-183656",
  "./src/js/villager-build.js?v=af7fddfc4-20261119-183656",
  "./src/js/progression.js?v=af7fddfc4-20261119-183656",
  "./src/js/waveLedger.js?v=af7fddfc4-20261119-183656",
  "./src/js/standing.js?v=af7fddfc4-20261119-183656",
  "./src/js/ladder.js?v=af7fddfc4-20261119-183656",
  "./src/js/feastBuff.js?v=af7fddfc4-20261119-183656",
  "./src/js/ledger.js?v=af7fddfc4-20261119-183656",
  "./src/js/exposure.js?v=af7fddfc4-20261119-183656",
  "./src/js/abilityActions.js?v=af7fddfc4-20261119-183656",
  "./src/js/buildarounds.js?v=af7fddfc4-20261119-183656",
  "./src/js/foodPower.js?v=af7fddfc4-20261119-183656",
  "./src/js/monsterBehaviors.js?v=af7fddfc4-20261119-183656",
  "./src/js/partyTactics.js?v=af7fddfc4-20261119-183656",
  "./src/js/sigW3a.js?v=af7fddfc4-20261119-183656",
  "./src/js/statusEffects.js?v=af7fddfc4-20261119-183656",
  "./src/js/sigW3b.js?v=af7fddfc4-20261119-183656",
  "./src/js/metaProgression.js?v=af7fddfc4-20261119-183656",
  "./src/js/sigW3c.js?v=af7fddfc4-20261119-183656",
  "./src/js/sigW4.js?v=af7fddfc4-20261119-183656",
  "./src/js/sigW5.js?v=af7fddfc4-20261119-183656",
  "./src/js/villager-agency.js?v=af7fddfc4-20261119-183656",
  "./src/js/win-plan.js?v=af7fddfc4-20261119-183656",
  "./src/js/npc-triggers.js?v=af7fddfc4-20261119-183656",
  "./src/js/fieldFights.js?v=af7fddfc4-20261119-183656",
  "./src/js/party-wiring.js?v=af7fddfc4-20261119-183656",
  "./src/js/party-bond.js?v=af7fddfc4-20261119-183656",
  "./src/js/villager-objectives.js?v=af7fddfc4-20261119-183656",
  "./src/js/villager-goals.js?v=af7fddfc4-20261119-183656",
  "./src/js/villager-brain.js?v=af7fddfc4-20261119-183656",
  "./src/js/bond-initiation.js?v=af7fddfc4-20261119-183656",
  "./src/js/villager-mapmem.js?v=af7fddfc4-20261119-183656",
  "./src/js/codex-people.js?v=af7fddfc4-20261119-183656",
  "./src/js/fallen-memorial.js?v=af7fddfc4-20261119-183656",
  "./src/js/graves.js?v=af7fddfc4-20261119-183656",
  "./src/js/membership.js?v=af7fddfc4-20261119-183656",
  "./src/js/gardenCultivation.js?v=af7fddfc4-20261119-183656",
  "./src/js/havenGrowth.js?v=af7fddfc4-20261119-183656",
  "./src/js/shelter.js?v=af7fddfc4-20261119-183656",
  "./src/js/hierarchy.js?v=af7fddfc4-20261119-183656",
  "./src/js/scaleDiscovery.js?v=af7fddfc4-20261119-183656",
  "./src/js/comms.js?v=af7fddfc4-20261119-183656",
  "./src/js/table.js?v=af7fddfc4-20261119-183656",
  "./src/js/pods.js?v=af7fddfc4-20261119-183656",
  "./src/js/titans.js?v=af7fddfc4-20261119-183656",
  "./src/js/finale-campaign.js?v=af7fddfc4-20261119-183656",
  "./src/js/godhood.js?v=af7fddfc4-20261119-183656",
  "./src/js/pantheon.js?v=af7fddfc4-20261119-183656",
  "./src/js/records.js?v=af7fddfc4-20261119-183656",
  "./src/js/table-feared.js?v=af7fddfc4-20261119-183656",
  "./src/js/table-indispensable.js?v=af7fddfc4-20261119-183656",
  "./src/js/table-beloved.js?v=af7fddfc4-20261119-183656",
  "./src/js/table-witness.js?v=af7fddfc4-20261119-183656",
  "./src/js/table-assimilated.js?v=af7fddfc4-20261119-183656",
  "./src/js/table-defiant.js?v=af7fddfc4-20261119-183656",
  "./src/js/relay-ext.js?v=af7fddfc4-20261119-183656",
  "./src/js/relay-dialogue.js?v=af7fddfc4-20261119-183656",
  "./src/js/table-relay.js?v=af7fddfc4-20261119-183656",
  "./src/js/safetynets.js?v=af7fddfc4-20261119-183656",
  "./src/js/villageAgency.js?v=af7fddfc4-20261119-183656",
  "./src/js/memdepth.js?v=af7fddfc4-20261119-183656",
  "./src/js/overtime.js?v=af7fddfc4-20261119-183656",
  "./src/js/network-campaign.js?v=af7fddfc4-20261119-183656",
  "./src/js/debug-scenarios.js?v=af7fddfc4-20261119-183656",
  "./src/js/keepsakes.js?v=af7fddfc4-20261119-183656",
  "./src/js/skill-teaching.js?v=af7fddfc4-20261119-183656",
  "./src/js/person-trust.js?v=af7fddfc4-20261119-183656",
  "./src/js/companion-score.js?v=af7fddfc4-20261119-183656",
  "./src/js/world.js?v=af7fddfc4-20261119-183656",
  "./src/js/nomad.js?v=af7fddfc4-20261119-183656",
  "./src/js/nomad-wild.js?v=af7fddfc4-20261119-183656",
  "./src/js/nomad-scenes.js?v=af7fddfc4-20261119-183656",
  "./src/js/nomad-drive.js?v=af7fddfc4-20261119-183656",
  "./src/js/temperature.js?v=af7fddfc4-20261119-183656",
  "./src/js/godpath.js?v=af7fddfc4-20261119-183656",
  "./src/js/godverbs.js?v=af7fddfc4-20261119-183656",
  "./src/js/endingKey.js?v=af7fddfc4-20261119-183656",
  "./src/js/telemetry-hooks.js?v=af7fddfc4-20261119-183656",
  "./src/js/finishLog.js?v=af7fddfc4-20261119-183656",
  "./src/js/feel.js?v=af7fddfc4-20261119-183656",
  "./src/js/build.js?v=af7fddfc4-20261119-183656",
  "./src/js/whereAreWe.js?v=af7fddfc4-20261119-183656",
  "./src/js/drama.js?v=af7fddfc4-20261119-183656",
  "./src/js/move-anim.js?v=af7fddfc4-20261119-183656",
  "./src/js/presentation.js?v=af7fddfc4-20261119-183656",
  "./src/js/sprites.js?v=af7fddfc4-20261119-183656",
  "./src/js/tile-scenes.js?v=af7fddfc4-20261119-183656",
  "./src/js/regional-audio.js?v=af7fddfc4-20261119-183656",
  "./src/js/favor-company.js?v=af7fddfc4-20261119-183656",
  "./src/js/timeSettlement.js?v=af7fddfc4-20261119-183656",
  "./src/js/app.js?v=af7fddfc4-20261119-183656",
  "./src/js/feel-audio.js?v=af7fddfc4-20261119-183656",
  "./manifest.json?v=af7fddfc4-20261119-183656",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=af7fddfc4-20261119-183656",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=af7fddfc4-20261119-183656",
  "./src/data/alienPlayers.json?v=af7fddfc4-20261119-183656",
  "./src/data/animals.json?v=af7fddfc4-20261119-183656",
  "./src/data/arrivalText.json?v=af7fddfc4-20261119-183656",
  "./src/data/background_survivors.json?v=af7fddfc4-20261119-183656",
  "./src/data/biomes.json?v=af7fddfc4-20261119-183656",
  "./src/data/books.json?v=af7fddfc4-20261119-183656",
  "./src/data/build-notes.json?v=af7fddfc4-20261119-183656",
  "./src/data/cell_defs.json?v=af7fddfc4-20261119-183656",
  "./src/data/characterGen.json?v=af7fddfc4-20261119-183656",
  "./src/data/climates.json?v=af7fddfc4-20261119-183656",
  "./src/data/contests.json?v=af7fddfc4-20261119-183656",
  "./src/data/cooking.json?v=af7fddfc4-20261119-183656",
  "./src/data/events.json?v=af7fddfc4-20261119-183656",
  "./src/data/evolutions.json?v=af7fddfc4-20261119-183656",
  "./src/data/favor-rules.json?v=af7fddfc4-20261119-183656",
  "./src/data/feast-surge.json?v=af7fddfc4-20261119-183656",
  "./src/data/foreignSpeech.json?v=af7fddfc4-20261119-183656",
  "./src/data/gardening.json?v=af7fddfc4-20261119-183656",
  "./src/data/godpaths.json?v=af7fddfc4-20261119-183656",
  "./src/data/items.json?v=af7fddfc4-20261119-183656",
  "./src/data/justiceVoice.json?v=af7fddfc4-20261119-183656",
  "./src/data/knowledge.json?v=af7fddfc4-20261119-183656",
  "./src/data/ladder-capstones.json?v=af7fddfc4-20261119-183656",
  "./src/data/lifeseeds.json?v=af7fddfc4-20261119-183656",
  "./src/data/locations.json?v=af7fddfc4-20261119-183656",
  "./src/data/monsterBehaviors.json?v=af7fddfc4-20261119-183656",
  "./src/data/monsters.json?v=af7fddfc4-20261119-183656",
  "./src/data/nameCultures.json?v=af7fddfc4-20261119-183656",
  "./src/data/originPicker.json?v=af7fddfc4-20261119-183656",
  "./src/data/pellet-boost.json?v=af7fddfc4-20261119-183656",
  "./src/data/plants.json?v=af7fddfc4-20261119-183656",
  "./src/data/presentation.json?v=af7fddfc4-20261119-183656",
  "./src/data/recipes.json?v=af7fddfc4-20261119-183656",
  "./src/data/regions.json?v=af7fddfc4-20261119-183656",
  "./src/data/relicEnhancements.json?v=af7fddfc4-20261119-183656",
  "./src/data/reward-economy.json?v=af7fddfc4-20261119-183656",
  "./src/data/schemas.json?v=af7fddfc4-20261119-183656",
  "./src/data/statusEffects.json?v=af7fddfc4-20261119-183656",
  "./src/data/synergies.json?v=af7fddfc4-20261119-183656",
  "./src/data/table-beats.json?v=af7fddfc4-20261119-183656",
  "./src/data/table-endings.json?v=af7fddfc4-20261119-183656",
  "./src/data/titans.json?v=af7fddfc4-20261119-183656",
  "./src/data/tracks.json?v=af7fddfc4-20261119-183656",
  "./src/data/villagers.json?v=af7fddfc4-20261119-183656",
  "./src/data/wave-ledger.json?v=af7fddfc4-20261119-183656"
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
