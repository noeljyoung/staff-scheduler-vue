export type Store = {
  id: string;
  name: string;
};

export type StaffMember = {
  id: string;
  name: string;
  contractType: "FT" | "PT";
};

export type ShiftAssignment = {
  id: string;
  date: string; // YYYY-MM-DD
  storeId: string;
  staffId: string | null;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  notes?: string;
};

export type ScheduleRangeResponse = {
  stores: Store[];
  staff: StaffMember[];
  assignments: ShiftAssignment[];
};
