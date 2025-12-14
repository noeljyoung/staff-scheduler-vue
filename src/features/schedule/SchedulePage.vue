<template>
  <div class="grid" :style="{ gridTemplateColumns: '1fr 360px', alignItems: 'start', gap: '12px' }">
    <div class="grid" :style="{ gap: '12px' }">
      <!-- header card unchanged -->

      <div class="card">
        <div v-if="scheduleQuery.isLoading.value">Loading schedule…</div>
        <div v-else-if="scheduleQuery.isError.value" style="color:#c00;">
          {{ String(scheduleQuery.error.value) }}
        </div>

        <WeekGrid
          v-else
          :days="days"
          :stores="visibleStores"
          :staff="staff"
          :assignments="assignments"
          :violations="violations"
          @create-shift="handleCreateShift"
          @assign-shift="handleAssignShift"
        />
      </div>
    </div>

    <div class="grid" :style="{ gap: '12px' }">
      <StaffList :staff="staff" />
      <ShiftEditor :stores="stores" :staff="staff" />
      <ViolationsPanel :violations="violations" :staff="staff" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { addDays, format, startOfWeek } from "date-fns";
import { useStores, useStaff, useSchedule, useUpsertAssignment } from "../../api/hooks";
import { useUiStore } from "../../store/uiStore";
import { evaluateAssignments } from "./rules/evaluate";

import StorePicker from "./components/StorePicker.vue";
import WeekGrid from "./components/WeekGrid.vue";
import ShiftEditor from "./components/ShiftEditor.vue";
import ViolationsPanel from "./components/ViolationsPanel.vue";
import StaffList from "./components/StaffList.vue";

import type { ShiftAssignment } from "../../api/types";

const ui = useUiStore();
const upsert = useUpsertAssignment();

const storesQuery = useStores();
const staffQuery = useStaff();

const stores = computed(() => storesQuery.data.value ?? []);
const staff = computed(() => staffQuery.data.value ?? []);

const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

const firstDay = days[0];
const lastDay = days[6];

if (!firstDay || !lastDay) {
  // Handle the case where days are undefined
  throw new Error('Invalid date range');
}

const from = format(firstDay, "yyyy-MM-dd");
const to = format(lastDay, "yyyy-MM-dd");

const selectedStoreIds = computed(() => ui.selectedStoreIds);
const setSelectedStoreIds = (ids: string[]) => ui.setSelectedStoreIds(ids);

watchEffect(() => {
  if (stores.value.length > 0 && ui.selectedStoreIds.length === 0) {
    ui.setSelectedStoreIds(stores.value.map((s) => s.id));
  }
});

// Note: vue-query's enabled flag is evaluated when hook is created.
// For simplicity in this skeleton, store selection is set early via watchEffect.
const scheduleQuery = useSchedule(from, to, selectedStoreIds); // pass computed/ref, NOT .value


const assignments = computed(() => scheduleQuery.data.value?.assignments ?? []);
const visibleStores = computed(() => stores.value.filter((s) => selectedStoreIds.value.includes(s.id)));
const violations = computed(() => evaluateAssignments(assignments.value));

function handleCreateShift(payload: {
  date: string;
  storeId: string;
  staffId?: string | null;
  autoSave?: boolean;
}) {
  const draft: ShiftAssignment = {
    id: `tmp_${Date.now()}`, // MSW will upsert by id; backend can ignore tmp_ scheme
    date: payload.date,
    storeId: payload.storeId,
    staffId: payload.staffId ?? null,
    startTime: "10:00",
    endTime: "18:00",
    notes: "",
  };

  if (payload.autoSave) {
    // Create + persist immediately
    upsert.mutate(draft);
    // Optional: clear selection so editor doesn't jump around
    ui.setSelectedShift(null);
    return;
  }

  // Click-to-create: prefill editor so user can adjust times first
  ui.setSelectedShift(draft);
}


function handleAssignShift(payload: { assignment: ShiftAssignment; staffId: string }) {
  // Update existing assignment + persist via mock API
  const updated: ShiftAssignment = { ...payload.assignment, staffId: payload.staffId };
  upsert.mutate(updated);
}
</script>
