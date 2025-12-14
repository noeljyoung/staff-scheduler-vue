<template>
  <div class="card">
    <div style="display:flex; justify-content:space-between; gap:8px; align-items:center;">
      <h3 style="margin:0;">{{ title }}</h3>
      <button v-if="ui.selectedShift" @click="ui.setSelectedShift(null)" style="cursor:pointer;">
        Clear
      </button>
    </div>

    <div style="display:grid; gap:10px; margin-top:10px;">
      <label style="display:grid; gap:4px;">
        <span style="font-size:13px; opacity:0.75;">Date (YYYY-MM-DD)</span>
        <input v-model="draft.date" placeholder="2025-12-08" />
      </label>

      <label style="display:grid; gap:4px;">
        <span style="font-size:13px; opacity:0.75;">Store</span>
        <select v-model="draft.storeId">
          <option value="">Select…</option>
          <option v-for="s in stores" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </label>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
        <label style="display:grid; gap:4px;">
          <span style="font-size:13px; opacity:0.75;">Start</span>
          <input v-model="draft.startTime" placeholder="10:00" />
        </label>
        <label style="display:grid; gap:4px;">
          <span style="font-size:13px; opacity:0.75;">End</span>
          <input v-model="draft.endTime" placeholder="18:00" />
        </label>
      </div>

      <label style="display:grid; gap:4px;">
        <span style="font-size:13px; opacity:0.75;">Staff</span>
        <select :value="draft.staffId ?? ''" @change="onStaffChange">
          <option value="">Unassigned</option>
          <option v-for="m in staff" :key="m.id" :value="m.id">
            {{ m.name }} ({{ m.contractType }})
          </option>
        </select>
      </label>

      <label style="display:grid; gap:4px;">
        <span style="font-size:13px; opacity:0.75;">Notes</span>
        <input v-model="draft.notes" placeholder="Optional" />
      </label>

      <button
        @click="save"
        :disabled="isSaving || !draft.date || !draft.storeId"
        :style="{ cursor: isSaving ? 'not-allowed' : 'pointer' }"
      >
        {{ isSaving ? "Saving…" : "Save" }}
      </button>

      <div v-if="isError" style="color:#c00;">{{ errorText }}</div>
      <div v-else-if="isSuccess" style="font-size:13px; opacity:0.75;">Saved.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import type { ShiftAssignment, StaffMember, Store } from "../../../api/types";
import { useUpsertAssignment } from "../../../api/hooks";
import { useUiStore } from "../../../store/uiStore";

const props = defineProps<{
  stores: Store[];
  staff: StaffMember[];
}>();

const ui = useUiStore();
const upsert = useUpsertAssignment();

function emptyShift(): ShiftAssignment {
  return {
    id: "",
    date: "",
    storeId: "",
    staffId: null,
    startTime: "10:00",
    endTime: "18:00",
    notes: "",
  };
}

const draft = reactive<ShiftAssignment>(emptyShift());

watch(
  () => ui.selectedShift,
  (sel) => {
    const next = sel ?? emptyShift();
    Object.assign(draft, next);
  },
  { immediate: true }
);

const title = computed(() => (ui.selectedShift ? "Edit shift" : "Create shift"));

const isSaving = computed(() => upsert.isPending.value);
const isError = computed(() => upsert.isError.value);
const isSuccess = computed(() => upsert.isSuccess.value);
const errorText = computed(() => String(upsert.error.value ?? ""));

function onStaffChange(e: Event) {
  const target = e.target as HTMLSelectElement;
  draft.staffId = target.value ? target.value : null;
}

function save() {
  const payload: ShiftAssignment = {
    ...draft,
    id: draft.id || `tmp_${Date.now()}`,
  };
  upsert.mutate(payload);
}
</script>
