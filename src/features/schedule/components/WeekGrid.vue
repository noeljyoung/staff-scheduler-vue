<template>
  <div style="overflow-x:auto;">
    <div
      :style="{
        display: 'grid',
        gridTemplateColumns: `220px repeat(${days.length}, 220px)`,
        gap: '8px'
      }"
    >
      <div />

      <div v-for="d in days" :key="d.toISOString()" style="font-weight:600;">
        {{ formatDay(d) }}
      </div>

      <template v-for="store in stores" :key="store.id">
        <div style="font-weight:600;">
          {{ store.name }}
        </div>

        <div
          v-for="d in days"
          :key="store.id + '-' + toDate(d)"
          :style="cellStyle"
          @dragover.prevent="onDragOver"
          @drop="onDropOnCell($event, store.id, toDate(d))"
        >
          <div v-if="cellItems(store.id, toDate(d)).length === 0">
            <button
              @click="emitCreateShift(store.id, toDate(d), null)"
              style="
                width: 100%;
                border: 1px dashed #ddd;
                background: white;
                border-radius: 10px;
                padding: 10px;
                cursor: pointer;
                text-align: left;
              "
            >
              <div style="font-weight:600;">+ Add shift</div>
              <div style="font-size:12px; opacity:0.75;">Click to prefill the editor</div>
            </button>
          </div>

          <div v-else style="display:grid; gap:8px;">
            <button
              v-for="a in cellItems(store.id, toDate(d))"
              :key="a.id"
              @click="ui.setSelectedShift(a)"
              :style="shiftButtonStyle"
              @dragover.prevent="onDragOver"
              @drop="onDropOnShift($event, a)"
              :title="'Drop staff here to assign'"
            >
              <div style="display:flex; justify-content:space-between; gap:8px;">
                <strong style="font-size:14px;">{{ a.startTime }}–{{ a.endTime }}</strong>
                <span v-if="badgeCount(a.id) > 0" class="badge" :class="badgeSeverity(a.id)">
                  {{ badgeCount(a.id) }} issue(s)
                </span>
              </div>

              <div style="font-size:13px; opacity:0.8;">
                {{ staffName(a.staffId) }}
              </div>
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from "date-fns";
import type { ShiftAssignment, StaffMember, Store } from "../../../api/types";
import type { Violation } from "../rules/types";
import { useUiStore } from "../../../store/uiStore";

const ui = useUiStore();

const props = defineProps<{
  days: Date[];
  stores: Store[];
  staff: StaffMember[];
  assignments: ShiftAssignment[];
  violations: Violation[];
}>();

const emit = defineEmits<{
  (e: "create-shift", payload: { date: string; storeId: string; staffId?: string | null; autoSave?: boolean }): void;
  (e: "assign-shift", payload: { assignment: ShiftAssignment; staffId: string }): void;
}>();


const cellStyle = {
  border: "1px dashed #ddd",
  borderRadius: "10px",
  padding: "8px",
  minHeight: "88px",
  background: "#fafafa",
};

const shiftButtonStyle = {
  textAlign: "left",
  border: "1px solid #ddd",
  background: "white",
  borderRadius: "10px",
  padding: "8px",
  cursor: "pointer",
} as const;

function toDate(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function formatDay(d: Date) {
  return format(d, "EEE dd MMM");
}

function staffName(id: string | null) {
  return props.staff.find((x) => x.id === id)?.name ?? "—";
}

function cellItems(storeId: string, date: string) {
  return props.assignments
    .filter((a) => a.storeId === storeId && a.date === date)
    .slice()
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

function violationHits(shiftId: string) {
  return props.violations.filter((v) => v.assignmentIds.includes(shiftId));
}

function badgeCount(shiftId: string) {
  return violationHits(shiftId).length;
}

function badgeSeverity(shiftId: string) {
  const hits = violationHits(shiftId);
  const isError = hits.some((h) => h.severity === "error");
  return isError ? "error" : "warn";
}

function onDragOver(e: DragEvent) {
  if (!e.dataTransfer) return;
  // indicate a “copy/assign” action
  e.dataTransfer.dropEffect = "copy";
}

function getStaffIdFromDrop(e: DragEvent): string | null {
  if (!e.dataTransfer) return null;
  const staffId = e.dataTransfer.getData("text/staff-id");
  return staffId || null;
}

function emitCreateShift(storeId: string, date: string, staffId: string | null) {
  emit("create-shift", { storeId, date, staffId });
}

function onDropOnCell(e: DragEvent, storeId: string, date: string) {
  const staffId = getStaffIdFromDrop(e);
  if (!staffId) return;

  // If empty cell: create + save immediately
  if (isCellEmpty(storeId, date)) {
    emit("create-shift", { storeId, date, staffId, autoSave: true });
    return;
  }

  // If not empty: we still prefill editor (non-destructive)
  emit("create-shift", { storeId, date, staffId, autoSave: false });
}


function onDropOnShift(e: DragEvent, assignment: ShiftAssignment) {
  const staffId = getStaffIdFromDrop(e);
  if (!staffId) return;
  // Drop staff onto an existing shift: assign and persist
  emit("assign-shift", { assignment, staffId });
}

function isCellEmpty(storeId: string, date: string) {
  return cellItems(storeId, date).length === 0;
}

</script>
