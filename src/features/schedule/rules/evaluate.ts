import type { ShiftAssignment } from "../../../api/types";
import type { Violation } from "./types";

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function overlaps(a: ShiftAssignment, b: ShiftAssignment): boolean {
  if (a.date !== b.date) return false;
  if (a.staffId == null || b.staffId == null) return false;
  if (a.staffId !== b.staffId) return false;

  const aStart = toMinutes(a.startTime);
  const aEnd = toMinutes(a.endTime);
  const bStart = toMinutes(b.startTime);
  const bEnd = toMinutes(b.endTime);

  return aStart < bEnd && bStart < aEnd;
}

export function evaluateAssignments(assignments: ShiftAssignment[]): Violation[] {
  const violations: Violation[] = [];

  // 1) Overlapping shifts
  for (let i = 0; i < assignments.length; i++) {
    for (let j = i + 1; j < assignments.length; j++) {
      const a = assignments[i];
      const b = assignments[j];
      if (overlaps(a, b)) {
        violations.push({
          id: `overlap:${a.id}:${b.id}`,
          severity: "error",
          message: "Overlapping shifts for the same staff member.",
          assignmentIds: [a.id, b.id],
          staffId: a.staffId ?? undefined,
          date: a.date,
        });
      }
    }
  }

  // 2) No double-store per day
  const byStaffDate = new Map<string, ShiftAssignment[]>();
  for (const a of assignments) {
    if (!a.staffId) continue;
    const key = `${a.staffId}|${a.date}`;
    const arr = byStaffDate.get(key) ?? [];
    arr.push(a);
    byStaffDate.set(key, arr);
  }

  for (const [key, arr] of byStaffDate.entries()) {
    const storeSet = new Set(arr.map((x) => x.storeId));
    if (storeSet.size > 1) {
      const [staffId, date] = key.split("|");
      violations.push({
        id: `double-store:${key}`,
        severity: "error",
        message: "Staff member is assigned to multiple stores on the same day.",
        assignmentIds: arr.map((x) => x.id),
        staffId,
        date,
      });
    }
  }

  return violations;
}
