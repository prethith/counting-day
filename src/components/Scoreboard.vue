<template>
  <div class="scoreboard">
    <!-- Alliance cards -->
    <div class="alliance-grid">
      <button
        v-for="(allianceCfg, key) in stateConfig.alliances"
        :key="key"
        class="alliance-card"
        :class="{ winning: isWinning(key), expanded: expandedAlliance === key }"
        @click="toggleExpand(key)"
      >
        <div class="alliance-label" :style="{ color: allianceCfg.color }">
          {{ allianceCfg.label }}
        </div>
        <div class="alliance-count">{{ tally[key] ?? 0 }}</div>
        <div class="alliance-desc">{{ allianceCfg.description }}</div>
        <div class="expand-chevron" :class="{ open: expandedAlliance === key }">▾</div>
      </button>

      <!-- Pending -->
      <div class="alliance-card pending-card">
        <div class="alliance-label pending-label">Pending</div>
        <div class="alliance-count">{{ tally.pending ?? 0 }}</div>
        <div class="alliance-desc">Not yet started</div>
      </div>
    </div>

    <!-- Party breakdown panel -->
    <Transition name="breakdown">
      <div
        v-if="expandedAlliance && expandedParties.length"
        class="party-breakdown"
        :style="{ borderColor: stateConfig.alliances[expandedAlliance]?.color + '55' }"
      >
        <div class="breakdown-header">
          <span
            class="breakdown-title"
            :style="{ color: stateConfig.alliances[expandedAlliance]?.color }"
          >{{ stateConfig.alliances[expandedAlliance]?.label }} — by party</span>
        </div>
        <div class="party-rows">
          <div
            v-for="{ party, seats, declared: dec } in expandedParties"
            :key="party"
            class="party-row"
          >
            <span class="party-name">{{ party }}</span>
            <div class="party-seats">
              <span class="seats-leading">{{ seats }}</span>
              <span class="seats-declared" v-if="dec > 0">({{ dec }} won)</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Visual bar -->
    <div class="seats-bar-wrap">
      <div class="seats-bar">
        <div
          v-for="(allianceCfg, key) in stateConfig.alliances"
          :key="key"
          class="bar-segment"
          :style="{
            width: barPct(tally[key]) + '%',
            background: allianceCfg.color,
          }"
          :title="`${allianceCfg.label}: ${tally[key] ?? 0} seats`"
        />
        <div
          class="bar-segment bar-pending"
          :style="{ width: barPct(tally.pending) + '%' }"
        />
      </div>

      <!-- Majority marker -->
      <div
        class="majority-line"
        :style="{ left: majorityPct + '%' }"
      >
        <div class="majority-tick" />
        <div class="majority-label">{{ stateConfig.majority }}</div>
      </div>
    </div>

    <!-- Status line -->
    <div class="status-line">
      <span class="declared-count">{{ declared }} declared</span>
      <span class="separator">·</span>
      <span class="counting-count">{{ counting }} counting</span>
      <span class="separator">·</span>
      <span class="total-count">{{ stateConfig.totalSeats }} total seats</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  stateConfig: Object,
  tally: Object,
  declared: Number,
  counting: Number,
  constituencies: Array,
})

const expandedAlliance = ref(null)

function toggleExpand(key) {
  expandedAlliance.value = expandedAlliance.value === key ? null : key
}

const majorityPct = computed(() =>
  (props.stateConfig.majority / props.stateConfig.totalSeats) * 100
)

function barPct(seats) {
  if (!seats) return 0
  return (seats / props.stateConfig.totalSeats) * 100
}

function isWinning(key) {
  return (props.tally?.[key] ?? 0) >= props.stateConfig.majority
}

// Per-party seat counts { party: { seats, declared } }
const partyTally = computed(() => {
  const counts = {}
  for (const c of props.constituencies ?? []) {
    const party = c.candidates?.[0]?.party
    if (!party || !c.leadingAlliance) continue
    if (!counts[party]) counts[party] = { seats: 0, declared: 0 }
    counts[party].seats++
    if (c.roundsComplete >= c.totalRounds && c.totalRounds > 0) {
      counts[party].declared++
    }
  }
  return counts
})

const expandedParties = computed(() => {
  if (!expandedAlliance.value) return []
  const { partyAlliance } = props.stateConfig
  return Object.entries(partyTally.value)
    .filter(([party]) => {
      const mapped = partyAlliance?.[party]
      return expandedAlliance.value === 'OTH'
        ? !mapped || mapped === 'OTH'
        : mapped === expandedAlliance.value
    })
    .map(([party, { seats, declared }]) => ({ party, seats, declared }))
    .sort((a, b) => b.seats - a.seats)
})
</script>

<style scoped>
.scoreboard {
  font-family: var(--font-body);
}

.alliance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
  gap: 8px;
  margin-bottom: 10px;
}

.alliance-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 6px 4px;
  text-align: center;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  cursor: pointer;
  position: relative;
  font-family: inherit;
  width: 100%;
}

.alliance-card:hover {
  background: var(--bg-map);
}

.alliance-card.expanded {
  background: var(--bg-map);
  border-color: var(--text-muted);
}

.alliance-card.winning {
  border-color: currentColor;
  box-shadow: 0 0 0 1px currentColor;
}

.alliance-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.pending-label { color: var(--text-muted); }

.alliance-count {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1;
  margin-bottom: 2px;
}

.alliance-desc {
  font-size: 9px;
  color: var(--text-muted);
  line-height: 1.2;
}

.expand-chevron {
  font-size: 10px;
  color: var(--text-muted);
  line-height: 1;
  margin-top: 2px;
  transition: transform 0.2s;
  display: block;
}

.expand-chevron.open {
  transform: rotate(180deg);
}

/* Pending card (non-clickable) */
.pending-card {
  cursor: default;
}

/* Party breakdown */
.party-breakdown {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 10px;
  background: var(--bg-card);
}

.breakdown-header {
  margin-bottom: 8px;
}

.breakdown-title {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.party-rows {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.party-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}

.party-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-main);
}

.party-seats {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}

.seats-leading {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-main);
  font-variant-numeric: tabular-nums;
}

.seats-declared {
  font-size: 10px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

/* Transition */
.breakdown-enter-active,
.breakdown-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.breakdown-enter-from,
.breakdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Seats bar */
.seats-bar-wrap {
  position: relative;
  margin-bottom: 20px;
}

.seats-bar {
  display: flex;
  height: 10px;
  border-radius: 5px;
  overflow: hidden;
  background: var(--border);
  gap: 1px;
}

.bar-segment {
  height: 100%;
  border-radius: 1px;
  transition: width 0.6s ease;
  min-width: 0;
}

.bar-pending { background: var(--border); }

.majority-line {
  position: absolute;
  top: -4px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.majority-tick {
  width: 1.5px;
  height: 18px;
  background: var(--text-main);
  border-radius: 1px;
}

.majority-label {
  font-size: 9px;
  font-weight: 600;
  color: var(--text-muted);
  margin-top: 1px;
  white-space: nowrap;
}

/* Status line */
.status-line {
  font-size: 11px;
  color: var(--text-muted);
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.separator { opacity: 0.4; }

.declared-count { color: var(--text-main); font-weight: 500; }
</style>
