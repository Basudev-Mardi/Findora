"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { reportService } from "@/services/reportService";
import type {
  ReportFormErrors,
  ReportFormValues,
  ReportSubmissionResult,
  ReportType,
} from "@/types/report";
import {
  validateImageFile,
  validateReportField,
  validateReportForm,
} from "@/utils/reportValidation";

const INITIAL_VALUES: ReportFormValues = {
  itemName: "",
  category: "",
  publicDescription: "",
  campusZone: "",
  locationDetail: "",
  incidentDate: "",
  photo: null,
  privateIdentifyingDetails: "",
  additionalNotes: "",
};

export function useReportForm(type: ReportType) {
  const [values, setValues] = useState<ReportFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<ReportFormErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof ReportFormValues, boolean>>
  >({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] =
    useState<ReportSubmissionResult | null>(null);

  // Ref guard prevents duplicate submissions even on rapid double-clicks.
  const isSubmittingRef = useRef(false);
  const hasSubmittedCurrentFormRef = useRef(false);
  const previewUrlRef = useRef<string | null>(null);

  const updatePreviewUrl = useCallback((nextFile: File | null) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    if (!nextFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(nextFile);
    previewUrlRef.current = objectUrl;
    setPreviewUrl(objectUrl);
  }, []);

  // Revoke any active object URL when the hook unmounts.
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  const setFieldValue = useCallback(
    <K extends keyof ReportFormValues>(field: K, value: ReportFormValues[K]) => {
      hasSubmittedCurrentFormRef.current = false;
      setSubmissionResult((prev) => (prev && !prev.ok ? null : prev));

      setValues((prev) => {
        const next = { ...prev, [field]: value };
        if (touched[field]) {
          const fieldError = validateReportField(field, next, type);
          setErrors((prevErrors) => ({ ...prevErrors, [field]: fieldError }));
        }
        return next;
      });
    },
    [touched, type]
  );

  const handleBlur = useCallback(
    (field: keyof ReportFormValues) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      setValues((current) => {
        const fieldError = validateReportField(field, current, type);
        setErrors((prevErrors) => ({ ...prevErrors, [field]: fieldError }));
        return current;
      });
    },
    [type]
  );

  const handlePhotoSelect = useCallback(
    (file: File | null) => {
      hasSubmittedCurrentFormRef.current = false;
      setTouched((prev) => ({ ...prev, photo: true }));

      if (!file) {
        setValues((prev) => ({ ...prev, photo: null }));
        setErrors((prev) => ({ ...prev, photo: undefined }));
        updatePreviewUrl(null);
        return;
      }

      const validationError = validateImageFile(file);
      if (validationError) {
        setErrors((prev) => ({ ...prev, photo: validationError }));
        return;
      }

      setErrors((prev) => ({ ...prev, photo: undefined }));
      setValues((prev) => ({ ...prev, photo: file }));
      updatePreviewUrl(file);
    },
    [updatePreviewUrl]
  );

  const handleRemovePhoto = useCallback(() => {
    setValues((prev) => ({ ...prev, photo: null }));
    setErrors((prev) => ({ ...prev, photo: undefined }));
    updatePreviewUrl(null);
  }, [updatePreviewUrl]);

  const resetForm = useCallback(() => {
    hasSubmittedCurrentFormRef.current = false;
    setValues(INITIAL_VALUES);
    setErrors({});
    setTouched({});
    setSubmissionResult(null);
    updatePreviewUrl(null);
  }, [updatePreviewUrl]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      // Prevent duplicate or concurrent submissions.
      if (isSubmittingRef.current || hasSubmittedCurrentFormRef.current) {
        return;
      }

      const validationErrors = validateReportForm(values, type);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setTouched({
          itemName: true,
          category: true,
          publicDescription: true,
          campusZone: true,
          locationDetail: true,
          incidentDate: true,
          photo: true,
          privateIdentifyingDetails: true,
          additionalNotes: true,
        });
        setSubmissionResult({
          ok: false,
          message: "Please review the highlighted fields before submitting.",
        });
        return;
      }

      isSubmittingRef.current = true;
      setIsSubmitting(true);
      setSubmissionResult(null);

      try {
        const result = await reportService.submitReport(type, values);
        setSubmissionResult(result);

        if (result.ok) {
          hasSubmittedCurrentFormRef.current = true;
        }
      } catch {
        setSubmissionResult({
          ok: false,
          message: "An unexpected error occurred while submitting. Please try again.",
        });
      } finally {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [type, values]
  );

  return {
    values,
    errors,
    previewUrl,
    isSubmitting,
    submissionResult,
    setFieldValue,
    handleBlur,
    handlePhotoSelect,
    handleRemovePhoto,
    handleSubmit,
    resetForm,
  };
}
