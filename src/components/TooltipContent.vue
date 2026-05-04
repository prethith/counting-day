<template>
  <div class="tooltip-card" :class="{ 'sheet-mode': sheetMode }">
    <template v-if="!constituency || constituency.status === 'pending'">
      <div class="tt-name">{{ constituency?.name ?? 'Unknown' }}</div>
      <div class="tt-district">{{ constituency?.district ?? '' }}</div>
      <div class="tt-pending">
        <span class="pending-dot" />
        Counting not started
      </div>
    </template>

    <template v-else>
      <!-- Header -->
      <div class="tt-header">
        <div>
          <div class="tt-name">{{ constituency.name }}</div>
          <div class="tt-district">{{ constituency.district }}</div>
        </div>
        <div
          class="tt-badge"
          :style="{
            background: allianceColor,
            color: allianceTextColor
          }"
        >
          {{ constituency.leadingAlliance }}
        </div>
      </div>

      <!-- Status bar -->
      <div class="tt-progress-wrap">
        <div class="tt-progress-bar">
          <div
            class="tt-progress-fill"
            :style="{ width: progressPct + '%', background: allianceColor }"
          />
        </div>
        <div class="tt-progress-label">
          {{ constituency.roundsComplete }}/{{ constituency.totalRounds }} rounds
          · {{ constituency.status === 'declared' ? 'Result declared' : 'Counting' }}
        </div>
      </div>

      <!-- Candidates — renders any number -->
      <div class="tt-candidates">
        <div
          v-for="(cand, i) in constituency.candidates"
          :key="cand.name + cand.party"
          class="tt-cand"
          :class="{ leading: i === 0, trailing: i > 0 }"
        >
          <span
            class="cand-dot"
            :style="{ background: i === 0 ? allianceColor : getCandColor(cand.alliance, i) }"
          />
          <span class="cand-name">{{ cand.name }}</span>
          <span class="cand-party">({{ cand.party }})</span>
          <span class="cand-votes">{{ fmt(cand.votes) }}</span>
        </div>
      </div>

      <!-- Margin: leader vs second place -->
      <div class="tt-margin" v-if="constituency.leadMargin != null">
        Lead margin:
        <strong :style="{ color: allianceColor }">
          {{ fmt(constituency.leadMargin) }} votes
        </strong>
      </div>

      <!-- Vote share bar — one segment per candidate -->
      <div class="tt-share-bar" v-if="constituency.totalCounted > 0 && constituency.candidates?.length">
        <div
          v-for="(cand, i) in constituency.candidates"
          :key="cand.name"
          class="share-segment"
          :style="{
            width: sharePct(cand.votes) + '%',
            background: i === 0 ? allianceColor : getCandColor(cand.alliance, i)
          }"
        />
      </div>
      <div class="tt-share-label" v-if="constituency.totalCounted > 0 && constituency.candidates?.length">
        <span :style="{ color: allianceColor }">
          {{ sharePct(constituency.candidates[0].votes) }}% {{ constituency.candidates[0].party }}
        </span>
        <span v-if="constituency.candidates.length > 2" class="label-others">
          +{{ constituency.candidates.length - 2 }} more
        </span>
        <span v-if="constituency.candidates[1]">
          {{ sharePct(constituency.candidates[1].votes) }}% {{ constituency.candidates[1].party }}
        </span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  constituency: Object,
  stateConfig: Object,
  sheetMode: Boolean,
})

const allianceColor = computed(() => {
  const key = props.constituency?.leadingAlliance
  return props.stateConfig?.alliances?.[key]?.color ?? '#888'
})

const allianceTextColor = computed(() => {
  const key = props.constituency?.leadingAlliance
  return props.stateConfig?.alliances?.[key]?.textColor ?? '#fff'
})

const progressPct = computed(() => {
  const c = props.constituency
  if (!c || !c.totalRounds) return 0
  return Math.round((c.roundsComplete / c.totalRounds) * 100)
})

// Per-candidate share of totalCounted
function sharePct(votes) {
  const total = props.constituency?.totalCounted
  if (!total || !votes) return 0
  return Math.round((votes / total) * 100)
}

// Color for non-leading candidates: use alliance color if known, else cycle greys
const FALLBACK_COLORS = ['#8e9aaf', '#98a69e', '#b0a89a', '#a09898']

function getCandColor(alliance, index) {
  if (alliance && props.stateConfig?.alliances?.[alliance]) {
    return props.stateConfig.alliances[alliance].color + 'cc'
  }
  return FALLBACK_COLORS[(index - 1) % FALLBACK_COLORS.length]
}

function fmt(n) {
  if (n == null) return '—'
  return Number(n).toLocaleString('en-IN')
}
</script>

<style scoped>
.tooltip-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.13);
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--text-main);
}

.tooltip-card.sheet-mode {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
  font-size: 13px;
}

.tt-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.tt-name {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.2;
}

.sheet-mode .tt-name { font-size: 18px; }

.tt-district {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 1px;
}

.sheet-mode .tt-district { font-size: 13px; margin-top: 2px; }

.tt-badge {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 3px 8px;
  border-radius: 99px;
  white-space: nowrap;
  flex-shrink: 0;
}

.sheet-mode .tt-badge { font-size: 12px; padding: 4px 12px; }

.tt-pending {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 12px;
  margin-top: 4px;
}

.pending-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--text-muted);
  opacity: 0.4;
}

/* Progress */
.tt-progress-wrap { margin-bottom: 10px; }

.tt-progress-bar {
  height: 3px;
  background: var(--border);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.tt-progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease;
}

.tt-progress-label {
  font-size: 10px;
  color: var(--text-muted);
}

/* Candidates */
.tt-candidates {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 8px;
}

.tt-cand {
  display: flex;
  align-items: center;
  gap: 5px;
}

.tt-cand.trailing { opacity: 0.75; }

.cand-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.cand-name {
  font-weight: 500;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cand-party {
  font-size: 10px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.cand-votes {
  font-variant-numeric: tabular-nums;
  font-size: 11px;
  flex-shrink: 0;
  margin-left: auto;
  font-weight: 600;
}

/* Margin */
.tt-margin {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

/* Vote share */
.tt-share-bar {
  display: flex;
  height: 5px;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
  gap: 1px;
}

.share-segment {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease;
  min-width: 0;
}

.tt-share-label {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--text-muted);
}

.label-others {
  font-size: 9px;
  color: var(--text-muted);
  opacity: 0.7;
}
</style>
