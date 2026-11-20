import type {
  ReportFormErrors,
  ReportFormValues,
  ReportType,
} from "@/types/report";

export const REPORT_CATEGORIES = [
  "Electronics",
  "Wallets",
  "Bags",
  "ID & Cards",
  "Keys",
  "Accessories",
  "Personal",
  "Stationery",
  "Other",
] as const;

export const CAMPUS_ZONES = [
  "Science Library",
  "Main Library",
  "North Hall",
  "Student Union",
  "Commons Café",
  "Engineering Courtyard",
  "Humanities Study Hall",
  "West Quad",
  "Campus Recreation Center",
  "Other Campus Area",
] as const;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// Detects likely full numeric IDs (9+ consecutive digits) pasted into public descriptions.
const SENSITIVE_NUMBER_PATTERN = /\b\d{9,}\b/;

export function validateImageFile(file: File): string | null {
  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_TYPES)[number]
    )
  ) {
    return "Unsupported format. Please upload a JPG, PNG, or WEBP image.";
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Image exceeds the 5MB maximum file size. Please choose a smaller file.";
  }

  return null;
}

export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function validateReportField(
  field: keyof ReportFormValues,
  values: ReportFormValues,
  type: ReportType
): string | undefined {
  const isFound = type === "found";

  switch (field) {
    case "itemName": {
      const trimmed = values.itemName.trim();
      if (!trimmed) return "Item name is required.";
      if (trimmed.length < 3) return "Enter at least 3 characters for the item name.";
      if (trimmed.length > 100) return "Item name must be 100 characters or fewer.";
      return undefined;
    }

    case "category": {
      if (!values.category.trim()) return "Please select an item category.";
      return undefined;
    }

    case "publicDescription": {
      const trimmed = values.publicDescription.trim();
      if (!trimmed) return "Please provide a brief public description.";
      if (trimmed.length < 15) {
        return "Description should be at least 15 characters to help identify the item.";
      }
      if (trimmed.length > 600) {
        return "Public description must be 600 characters or fewer.";
      }
      if (SENSITIVE_NUMBER_PATTERN.test(trimmed)) {
        return "Do not include full ID, card, or phone numbers in the public description. Use the private verification field instead.";
      }
      return undefined;
    }

    case "campusZone": {
      if (!values.campusZone.trim()) return "Please select a campus building or zone.";
      return undefined;
    }

    case "locationDetail": {
      const trimmed = values.locationDetail.trim();
      if (!trimmed) {
        return isFound
          ? "Please specify where on campus the item was found."
          : "Please specify where the item was last seen.";
      }
      if (trimmed.length < 3) return "Please provide a slightly more specific location.";
      if (trimmed.length > 140) return "Location detail must be 140 characters or fewer.";
      return undefined;
    }

    case "incidentDate": {
      if (!values.incidentDate) {
        return isFound
          ? "Please select the date the item was found."
          : "Please select the date the item was lost.";
      }
      if (values.incidentDate > getTodayIsoDate()) {
        return "Date cannot be in the future.";
      }
      return undefined;
    }

    case "photo": {
      if (!values.photo) return undefined;
      return validateImageFile(values.photo) ?? undefined;
    }

    case "privateIdentifyingDetails": {
      if (values.privateIdentifyingDetails.length > 400) {
        return "Private identifying details must be 400 characters or fewer.";
      }
      return undefined;
    }

    case "additionalNotes": {
      if (values.additionalNotes.length > 400) {
        return "Additional notes must be 400 characters or fewer.";
      }
      return undefined;
    }

    default:
      return undefined;
  }
}

export function validateReportForm(
  values: ReportFormValues,
  type: ReportType
): ReportFormErrors {
  const fields: (keyof ReportFormValues)[] = [
    "itemName",
    "category",
    "publicDescription",
    "campusZone",
    "locationDetail",
    "incidentDate",
    "photo",
    "privateIdentifyingDetails",
    "additionalNotes",
  ];

  const errors: ReportFormErrors = {};

  for (const field of fields) {
    const error = validateReportField(field, values, type);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
