import { apiClient, ApiClientError } from "@/services/api";
import type { BackendFoundItem, BackendLostItem } from "@/types/api";
import type {
  ReportFormValues,
  ReportSubmissionResult,
  ReportType,
} from "@/types/report";
import { validateReportForm } from "@/utils/reportValidation";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read uploaded image."));
    reader.readAsDataURL(file);
  });
}

export const reportService = {
  async submitReport(
    type: ReportType,
    values: ReportFormValues
  ): Promise<ReportSubmissionResult> {
    const validationErrors = validateReportForm(values, type);
    if (Object.keys(validationErrors).length > 0) {
      return {
        ok: false,
        message: "Please fix the highlighted validation errors before submitting.",
      };
    }

    let imageUrl: string | undefined;
    if (values.photo) {
      try {
        imageUrl = await readFileAsDataUrl(values.photo);
      } catch {
        return {
          ok: false,
          message: "Could not read the selected image file. Please try another photo.",
        };
      }
    }

    try {
      if (type === "found") {
        const res = await apiClient.post<BackendFoundItem>("/found-items", {
          title: values.itemName.trim(),
          category: values.category.trim(),
          campusZone: values.campusZone.trim(),
          location: values.locationDetail.trim(),
          dateFound: values.incidentDate,
          publicDescription: values.publicDescription.trim(),
          privateVerificationDetails:
            values.privateIdentifyingDetails.trim() || undefined,
          additionalNotes: values.additionalNotes.trim() || undefined,
          imageUrl,
        });

        return {
          ok: true,
          referenceId: res.data.id,
          mode: "api",
          message:
            res.message || "Found item report submitted and saved to Findora.",
          submittedAt: res.data.createdAt,
        };
      }

      const res = await apiClient.post<BackendLostItem>("/lost-items", {
        title: values.itemName.trim(),
        category: values.category.trim(),
        campusZone: values.campusZone.trim(),
        location: values.locationDetail.trim(),
        dateLost: values.incidentDate,
        publicDescription: values.publicDescription.trim(),
        privateIdentifyingDetails:
          values.privateIdentifyingDetails.trim() || undefined,
        imageUrl,
      });

      return {
        ok: true,
        referenceId: res.data.id,
        mode: "api",
        message:
          res.message || "Lost item report submitted and saved to Findora.",
        submittedAt: res.data.createdAt,
      };
    } catch (error) {
      if (error instanceof ApiClientError) {
        const detailMessages = error.details
          ? Object.values(error.details).filter(Boolean).join(" ")
          : "";
        return {
          ok: false,
          message: detailMessages
            ? `${error.message} ${detailMessages}`
            : error.message,
        };
      }

      return {
        ok: false,
        message:
          "Unable to reach the Findora server. Please verify the backend is running and try again.",
      };
    }
  },
};
