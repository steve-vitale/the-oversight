/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'ac1b82736-20261118-232437';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=ac1b82736-20261118-232437",
  "./src/js/engine/modifiers.js?v=ac1b82736-20261118-232437",
  "./src/js/engine/calories.js?v=ac1b82736-20261118-232437",
  "./src/js/engine/day.js?v=ac1b82736-20261118-232437",
  "./src/js/engine/forage.js?v=ac1b82736-20261118-232437",
  "./src/js/engine/combat.js?v=ac1b82736-20261118-232437",
  "./src/js/audio-registry.js?v=ac1b82736-20261118-232437",
  "./src/js/text.js?v=ac1b82736-20261118-232437",
  "./src/js/game.js?v=ac1b82736-20261118-232437",
  "./src/js/encounters.js?v=ac1b82736-20261118-232437",
  "./src/js/conversation.js?v=ac1b82736-20261118-232437",
  "./src/js/convo-mood.js?v=ac1b82736-20261118-232437",
  "./src/js/convoTopics.js?v=ac1b82736-20261118-232437",
  "./src/js/naming-rite.js?v=ac1b82736-20261118-232437",
  "./src/js/convo-wants.js?v=ac1b82736-20261118-232437",
  "./src/js/convo-dialogue.js?v=ac1b82736-20261118-232437",
  "./src/js/convo-beats.js?v=ac1b82736-20261118-232437",
  "./src/js/convo-scene.js?v=ac1b82736-20261118-232437",
  "./src/js/voice-piper.js?v=ac1b82736-20261118-232437",
  "./src/js/voice-system.js?v=ac1b82736-20261118-232437",
  "./src/js/examine.js?v=ac1b82736-20261118-232437",
  "./src/js/equipment.js?v=ac1b82736-20261118-232437",
  "./src/js/journal.js?v=ac1b82736-20261118-232437",
  "./src/js/party.js?v=ac1b82736-20261118-232437",
  "./src/js/favor-water.js?v=ac1b82736-20261118-232437",
  "./src/js/favor-forage.js?v=ac1b82736-20261118-232437",
  "./src/js/favor-outing.js?v=ac1b82736-20261118-232437",
  "./src/js/party-formal.js?v=ac1b82736-20261118-232437",
  "./src/js/truth.js?v=ac1b82736-20261118-232437",
  "./src/js/galactic-cast.js?v=ac1b82736-20261118-232437",
  "./src/js/contests.js?v=ac1b82736-20261118-232437",
  "./src/js/broadcast.js?v=ac1b82736-20261118-232437",
  "./src/js/contestEngine.js?v=ac1b82736-20261118-232437",
  "./src/js/alienPlayers.js?v=ac1b82736-20261118-232437",
  "./src/js/storage.js?v=ac1b82736-20261118-232437",
  "./src/js/perceive.js?v=ac1b82736-20261118-232437",
  "./src/js/carexplore.js?v=ac1b82736-20261118-232437",
  "./src/js/justice.js?v=ac1b82736-20261118-232437",
  "./src/js/food.js?v=ac1b82736-20261118-232437",
  "./src/js/betrayal.js?v=ac1b82736-20261118-232437",
  "./src/js/corpses.js?v=ac1b82736-20261118-232437",
  "./src/js/corruption.js?v=ac1b82736-20261118-232437",
  "./src/js/lifeseed.js?v=ac1b82736-20261118-232437",
  "./src/js/spawn-knack.js?v=ac1b82736-20261118-232437",
  "./src/js/trial-deeds.js?v=ac1b82736-20261118-232437",
  "./src/js/practice-deeds.js?v=ac1b82736-20261118-232437",
  "./src/js/tracks.js?v=ac1b82736-20261118-232437",
  "./src/js/villager-build.js?v=ac1b82736-20261118-232437",
  "./src/js/progression.js?v=ac1b82736-20261118-232437",
  "./src/js/waveLedger.js?v=ac1b82736-20261118-232437",
  "./src/js/standing.js?v=ac1b82736-20261118-232437",
  "./src/js/ladder.js?v=ac1b82736-20261118-232437",
  "./src/js/feastBuff.js?v=ac1b82736-20261118-232437",
  "./src/js/ledger.js?v=ac1b82736-20261118-232437",
  "./src/js/exposure.js?v=ac1b82736-20261118-232437",
  "./src/js/abilityActions.js?v=ac1b82736-20261118-232437",
  "./src/js/buildarounds.js?v=ac1b82736-20261118-232437",
  "./src/js/foodPower.js?v=ac1b82736-20261118-232437",
  "./src/js/monsterBehaviors.js?v=ac1b82736-20261118-232437",
  "./src/js/partyTactics.js?v=ac1b82736-20261118-232437",
  "./src/js/sigW3a.js?v=ac1b82736-20261118-232437",
  "./src/js/statusEffects.js?v=ac1b82736-20261118-232437",
  "./src/js/sigW3b.js?v=ac1b82736-20261118-232437",
  "./src/js/metaProgression.js?v=ac1b82736-20261118-232437",
  "./src/js/sigW3c.js?v=ac1b82736-20261118-232437",
  "./src/js/sigW4.js?v=ac1b82736-20261118-232437",
  "./src/js/sigW5.js?v=ac1b82736-20261118-232437",
  "./src/js/villager-agency.js?v=ac1b82736-20261118-232437",
  "./src/js/win-plan.js?v=ac1b82736-20261118-232437",
  "./src/js/npc-triggers.js?v=ac1b82736-20261118-232437",
  "./src/js/fieldFights.js?v=ac1b82736-20261118-232437",
  "./src/js/party-wiring.js?v=ac1b82736-20261118-232437",
  "./src/js/party-bond.js?v=ac1b82736-20261118-232437",
  "./src/js/villager-objectives.js?v=ac1b82736-20261118-232437",
  "./src/js/villager-goals.js?v=ac1b82736-20261118-232437",
  "./src/js/villager-brain.js?v=ac1b82736-20261118-232437",
  "./src/js/bond-initiation.js?v=ac1b82736-20261118-232437",
  "./src/js/villager-mapmem.js?v=ac1b82736-20261118-232437",
  "./src/js/codex-people.js?v=ac1b82736-20261118-232437",
  "./src/js/fallen-memorial.js?v=ac1b82736-20261118-232437",
  "./src/js/graves.js?v=ac1b82736-20261118-232437",
  "./src/js/membership.js?v=ac1b82736-20261118-232437",
  "./src/js/gardenCultivation.js?v=ac1b82736-20261118-232437",
  "./src/js/havenGrowth.js?v=ac1b82736-20261118-232437",
  "./src/js/shelter.js?v=ac1b82736-20261118-232437",
  "./src/js/hierarchy.js?v=ac1b82736-20261118-232437",
  "./src/js/scaleDiscovery.js?v=ac1b82736-20261118-232437",
  "./src/js/comms.js?v=ac1b82736-20261118-232437",
  "./src/js/table.js?v=ac1b82736-20261118-232437",
  "./src/js/pods.js?v=ac1b82736-20261118-232437",
  "./src/js/titans.js?v=ac1b82736-20261118-232437",
  "./src/js/finale-campaign.js?v=ac1b82736-20261118-232437",
  "./src/js/godhood.js?v=ac1b82736-20261118-232437",
  "./src/js/pantheon.js?v=ac1b82736-20261118-232437",
  "./src/js/records.js?v=ac1b82736-20261118-232437",
  "./src/js/table-feared.js?v=ac1b82736-20261118-232437",
  "./src/js/table-indispensable.js?v=ac1b82736-20261118-232437",
  "./src/js/table-beloved.js?v=ac1b82736-20261118-232437",
  "./src/js/table-witness.js?v=ac1b82736-20261118-232437",
  "./src/js/table-assimilated.js?v=ac1b82736-20261118-232437",
  "./src/js/table-defiant.js?v=ac1b82736-20261118-232437",
  "./src/js/relay-ext.js?v=ac1b82736-20261118-232437",
  "./src/js/relay-dialogue.js?v=ac1b82736-20261118-232437",
  "./src/js/table-relay.js?v=ac1b82736-20261118-232437",
  "./src/js/safetynets.js?v=ac1b82736-20261118-232437",
  "./src/js/villageAgency.js?v=ac1b82736-20261118-232437",
  "./src/js/memdepth.js?v=ac1b82736-20261118-232437",
  "./src/js/overtime.js?v=ac1b82736-20261118-232437",
  "./src/js/network-campaign.js?v=ac1b82736-20261118-232437",
  "./src/js/debug-scenarios.js?v=ac1b82736-20261118-232437",
  "./src/js/keepsakes.js?v=ac1b82736-20261118-232437",
  "./src/js/skill-teaching.js?v=ac1b82736-20261118-232437",
  "./src/js/person-trust.js?v=ac1b82736-20261118-232437",
  "./src/js/companion-score.js?v=ac1b82736-20261118-232437",
  "./src/js/world.js?v=ac1b82736-20261118-232437",
  "./src/js/nomad.js?v=ac1b82736-20261118-232437",
  "./src/js/nomad-wild.js?v=ac1b82736-20261118-232437",
  "./src/js/nomad-scenes.js?v=ac1b82736-20261118-232437",
  "./src/js/nomad-drive.js?v=ac1b82736-20261118-232437",
  "./src/js/temperature.js?v=ac1b82736-20261118-232437",
  "./src/js/godpath.js?v=ac1b82736-20261118-232437",
  "./src/js/godverbs.js?v=ac1b82736-20261118-232437",
  "./src/js/endingKey.js?v=ac1b82736-20261118-232437",
  "./src/js/telemetry-hooks.js?v=ac1b82736-20261118-232437",
  "./src/js/finishLog.js?v=ac1b82736-20261118-232437",
  "./src/js/feel.js?v=ac1b82736-20261118-232437",
  "./src/js/build.js?v=ac1b82736-20261118-232437",
  "./src/js/whereAreWe.js?v=ac1b82736-20261118-232437",
  "./src/js/drama.js?v=ac1b82736-20261118-232437",
  "./src/js/move-anim.js?v=ac1b82736-20261118-232437",
  "./src/js/presentation.js?v=ac1b82736-20261118-232437",
  "./src/js/sprites.js?v=ac1b82736-20261118-232437",
  "./src/js/tile-scenes.js?v=ac1b82736-20261118-232437",
  "./src/js/regional-audio.js?v=ac1b82736-20261118-232437",
  "./src/js/favor-company.js?v=ac1b82736-20261118-232437",
  "./src/js/timeSettlement.js?v=ac1b82736-20261118-232437",
  "./src/js/app.js?v=ac1b82736-20261118-232437",
  "./src/js/feel-audio.js?v=ac1b82736-20261118-232437",
  "./manifest.json?v=ac1b82736-20261118-232437",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=ac1b82736-20261118-232437",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=ac1b82736-20261118-232437",
  "./src/data/alienPlayers.json?v=ac1b82736-20261118-232437",
  "./src/data/animals.json?v=ac1b82736-20261118-232437",
  "./src/data/arrivalText.json?v=ac1b82736-20261118-232437",
  "./src/data/background_survivors.json?v=ac1b82736-20261118-232437",
  "./src/data/biomes.json?v=ac1b82736-20261118-232437",
  "./src/data/books.json?v=ac1b82736-20261118-232437",
  "./src/data/build-notes.json?v=ac1b82736-20261118-232437",
  "./src/data/cell_defs.json?v=ac1b82736-20261118-232437",
  "./src/data/characterGen.json?v=ac1b82736-20261118-232437",
  "./src/data/climates.json?v=ac1b82736-20261118-232437",
  "./src/data/contests.json?v=ac1b82736-20261118-232437",
  "./src/data/cooking.json?v=ac1b82736-20261118-232437",
  "./src/data/events.json?v=ac1b82736-20261118-232437",
  "./src/data/evolutions.json?v=ac1b82736-20261118-232437",
  "./src/data/favor-rules.json?v=ac1b82736-20261118-232437",
  "./src/data/feast-surge.json?v=ac1b82736-20261118-232437",
  "./src/data/foreignSpeech.json?v=ac1b82736-20261118-232437",
  "./src/data/gardening.json?v=ac1b82736-20261118-232437",
  "./src/data/godpaths.json?v=ac1b82736-20261118-232437",
  "./src/data/items.json?v=ac1b82736-20261118-232437",
  "./src/data/justiceVoice.json?v=ac1b82736-20261118-232437",
  "./src/data/knowledge.json?v=ac1b82736-20261118-232437",
  "./src/data/ladder-capstones.json?v=ac1b82736-20261118-232437",
  "./src/data/lifeseeds.json?v=ac1b82736-20261118-232437",
  "./src/data/locations.json?v=ac1b82736-20261118-232437",
  "./src/data/monsterBehaviors.json?v=ac1b82736-20261118-232437",
  "./src/data/monsters.json?v=ac1b82736-20261118-232437",
  "./src/data/nameCultures.json?v=ac1b82736-20261118-232437",
  "./src/data/originPicker.json?v=ac1b82736-20261118-232437",
  "./src/data/pellet-boost.json?v=ac1b82736-20261118-232437",
  "./src/data/plants.json?v=ac1b82736-20261118-232437",
  "./src/data/presentation.json?v=ac1b82736-20261118-232437",
  "./src/data/recipes.json?v=ac1b82736-20261118-232437",
  "./src/data/regions.json?v=ac1b82736-20261118-232437",
  "./src/data/relicEnhancements.json?v=ac1b82736-20261118-232437",
  "./src/data/reward-economy.json?v=ac1b82736-20261118-232437",
  "./src/data/schemas.json?v=ac1b82736-20261118-232437",
  "./src/data/statusEffects.json?v=ac1b82736-20261118-232437",
  "./src/data/synergies.json?v=ac1b82736-20261118-232437",
  "./src/data/table-beats.json?v=ac1b82736-20261118-232437",
  "./src/data/table-endings.json?v=ac1b82736-20261118-232437",
  "./src/data/titans.json?v=ac1b82736-20261118-232437",
  "./src/data/tracks.json?v=ac1b82736-20261118-232437",
  "./src/data/villagers.json?v=ac1b82736-20261118-232437",
  "./src/data/wave-ledger.json?v=ac1b82736-20261118-232437"
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
