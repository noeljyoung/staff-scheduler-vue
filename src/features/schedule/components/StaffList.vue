<template>
  <div class="card">
    <h3 style="margin:0;">Staff</h3>
    <div style="font-size:13px; opacity:0.75; margin-top:6px;">
      Drag a person onto a shift or an empty day cell.
    </div>

    <div style="display:grid; gap:8px; margin-top:12px;">
      <div
        v-for="m in staff"
        :key="m.id"
        draggable="true"
        @dragstart="onDragStart($event, m.id)"
        style="
          border: 1px solid #ddd;
          border-radius: 10px;
          padding: 10px;
          background: white;
          cursor: grab;
          user-select: none;
        "
        :title="`Drag ${m.name}`"
      >
        <div style="font-weight:600;">{{ m.name }}</div>
        <div style="font-size:12px; opacity:0.75;">{{ m.contractType }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StaffMember } from "../../../api/types";

defineProps<{ staff: StaffMember[] }>();

function onDragStart(e: DragEvent, staffId: string) {
  if (!e.dataTransfer) return;
  e.dataTransfer.setData("text/staff-id", staffId);
  e.dataTransfer.effectAllowed = "copy";
}
</script>
