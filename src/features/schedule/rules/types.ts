export type ViolationSeverity = "error" | "warn";

export type Violation = {
  id: string;
  severity: ViolationSeverity;
  message: string;
  assignmentIds: string[];
  staffId?: string;
  date?: string;
};
