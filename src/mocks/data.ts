import type { ShiftAssignment, StaffMember, Store } from "../api/types";

export const stores: Store[] = [
  { id: "guess-kids", name: "Guess Kids" },
  { id: "ef-stj", name: "EF St. Julians" },
  { id: "liujo-tigne", name: "Liu Jo Tigne" },
];

export const staff: StaffMember[] = [
  { id: "laura", name: "Laura", contractType: "PT" },
  { id: "noel", name: "Noel", contractType: "FT" },
  { id: "alex", name: "Alex", contractType: "FT" },
];

export let assignments: ShiftAssignment[] = [
  {
    id: "a1",
    date: "2025-12-08",
    storeId: "guess-kids",
    staffId: "laura",
    startTime: "10:00",
    endTime: "18:00",
  },
  {
    id: "a2",
    date: "2025-12-08",
    storeId: "ef-stj",
    staffId: "laura",
    startTime: "18:00",
    endTime: "20:00",
  },
];
