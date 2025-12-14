import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { api } from "./client";
import type { ScheduleRangeResponse, ShiftAssignment, Store, StaffMember } from "./types";
import { computed, unref } from "vue";

export function useStores() {
  return useQuery({
    queryKey: ["stores"],
    queryFn: () => api<Store[]>("/api/stores"),
  });
}

export function useStaff() {
  return useQuery({
    queryKey: ["staff"],
    queryFn: () => api<StaffMember[]>("/api/staff"),
  });
}

export function useSchedule(from: string, to: string, storeIds: string[] | { value: string[] }) {
  const storeIdsComputed = computed(() => (Array.isArray(storeIds) ? storeIds : storeIds.value));

  return useQuery({
    queryKey: computed(() => ["schedule", from, to, storeIdsComputed.value]),
    queryFn: () =>
      api<ScheduleRangeResponse>(
        `/api/schedule?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&storeIds=${encodeURIComponent(
          storeIdsComputed.value.join(",")
        )}`
      ),
    enabled: computed(() => storeIdsComputed.value.length > 0),
  });
}

export function useUpsertAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ShiftAssignment) =>
      api<ShiftAssignment>("/api/assignments", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedule"] });
    },
  });
}
