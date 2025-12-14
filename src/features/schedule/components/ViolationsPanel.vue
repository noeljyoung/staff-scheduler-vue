<template>
  <div class="card">
    <h3 style="margin:0;">Rule checks</h3>
    <div style="font-size:13px; opacity:0.75; margin-top:6px;">
      Errors block publishing; warnings are advisory.
    </div>

    <div style="display:grid; gap:8px; margin-top:12px;">
      <div v-if="violations.length === 0" style="font-size:14px; opacity:0.75;">
        No issues detected.
      </div>

      <div v-for="v in violations" :key="v.id" style="border:1px solid #ddd; border-radius:10px; padding:10px;">
        <div style="display:flex; justify-content:space-between; gap:8px;">
          <span class="badge" :class="v.severity">{{ v.severity.toUpperCase() }}</span>
          <span style="font-size:12px; opacity:0.7;">{{ v.date ?? "" }}</span>
        </div>

        <div style="margin-top:6px; font-weight:600;">{{ v.message }}</div>

        <div style="margin-top:6px; font-size:13px; opacity:0.8;">
          Staff: {{ staffName(v.staffId) }}
        </div>

        <div style="margin-top:6px; font-size:12px; opacity:0.75;">
          Assignments: {{ v.assignmentIds.join(", ") }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StaffMember } from "../../../api/types";
import type { Violation } from "../rules/types";

const props = defineProps<{
  violations: Violation[];
  staff: StaffMember[];
}>();

function staffName(id?: string) {
  if (!id) return "—";
  return props.staff.find((s) => s.id === id)?.name ?? id;
}
</script>
