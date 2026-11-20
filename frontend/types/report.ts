export type ReportType = "lost" | "found";

export interface ReportFormValues {
  itemName: string;
  category: string;
  publicDescription: string;
  campusZone: string;
  locationDetail: string;
  incidentDate: string;
  photo: File | null;
  privateIdentifyingDetails: string;
  additionalNotes: string;
}

export type ReportFormErrors = Partial<Record<keyof ReportFormValues, string>>;

export interface ReportSubmissionSuccess {
  ok: true;
  referenceId: string;
  mode: "demo" | "api";
  message: string;
  submittedAt: string;
}

export interface ReportSubmissionFailure {
  ok: false;
  message: string;
}

export type ReportSubmissionResult =
  | ReportSubmissionSuccess
  | ReportSubmissionFailure;
