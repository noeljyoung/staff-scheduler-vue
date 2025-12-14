<template>
  <div style="display:flex; gap:8px; align-items:center;">
    <span style="font-size:14px; opacity:0.75;">Stores</span>
    <select
      multiple
      :value="selectedStoreIds"
      @change="onSelectChange"
      style="min-width:220px; height:72px;"
    >
      <option v-for="s in stores" :key="s.id" :value="s.id">
        {{ s.name }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import type { Store } from "../../../api/types";

const props = defineProps<{
  stores: Store[];
  selectedStoreIds: string[];
}>();

const emit = defineEmits<{
  (e: "change", ids: string[]): void;
}>();

function onSelectChange(e: Event) {
  const target = e.target as HTMLSelectElement;
  const ids = Array.from(target.selectedOptions).map((o) => o.value);
  emit("change", ids);
}
</script>
