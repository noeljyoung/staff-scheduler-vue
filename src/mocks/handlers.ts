import { http, HttpResponse } from "msw";
import { assignments, staff, stores } from "./data";
import type { ShiftAssignment } from "../api/types";

function randomId(prefix = "a") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export const handlers = [
  http.get("/api/stores", () => HttpResponse.json(stores)),
  http.get("/api/staff", () => HttpResponse.json(staff)),

  http.get("/api/schedule", ({ request }) => {
    const url = new URL(request.url);
    const from = url.searchParams.get("from") ?? "";
    const to = url.searchParams.get("to") ?? "";
    const storeIds = (url.searchParams.get("storeIds") ?? "").split(",").filter(Boolean);

    const filtered = assignments.filter((a) => {
      const inRange = (!from || a.date >= from) && (!to || a.date <= to);
      const inStores = storeIds.length === 0 ? true : storeIds.includes(a.storeId);
      return inRange && inStores;
    });

    return HttpResponse.json({ stores, staff, assignments: filtered });
  }),

  http.post("/api/assignments", async ({ request }) => {
    const payload = (await request.json()) as ShiftAssignment;

    const idx = assignments.findIndex((a) => a.id === payload.id);

    // update (in place)
    if (idx >= 0) {
      assignments[idx] = payload;
      return HttpResponse.json(assignments[idx]);
    }

    // create (in place)
    const created = { ...payload, id: payload.id || randomId("a") };
    assignments.unshift(created); // IMPORTANT: mutate, do not reassign
    return HttpResponse.json(created);
  }),
];
