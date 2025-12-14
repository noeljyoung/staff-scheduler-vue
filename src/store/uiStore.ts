import { defineStore } from "pinia";
import type { ShiftAssignment } from "../api/types";

export const useUiStore = defineStore("ui", {
  state: () => ({
    selectedStoreIds: [] as string[],
    selectedShift: null as ShiftAssignment | null,
  }),
  actions: {
    setSelectedStoreIds(ids: string[]) {
      this.selectedStoreIds = ids;
    },
    setSelectedShift(shift: ShiftAssignment | null) {
      this.selectedShift = shift;
    },
  },
});
