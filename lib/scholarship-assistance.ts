import type { Scholarship } from "@/api/public-content";

export type AssistanceScholarship = Pick<Scholarship, "id" | "titleAr" | "status" | "applicationStatus" | "effectiveApplicationStatus">;
export type AssistanceValues = { fullName: string; email: string; phone: string; message: string; privacyAccepted: boolean; website: string };
export type AssistanceErrors = Partial<Record<keyof AssistanceValues, string>>;
export type ScholarshipAssistancePayload = Omit<AssistanceValues, "phone" | "privacyAccepted"> & {
  applicationType: "SCHOLARSHIP_ASSISTANCE";
  scholarshipId: string;
  phone: string | null;
  privacyAccepted: true;
};

export function canRequestScholarshipAssistance(scholarship: AssistanceScholarship) {
  return scholarship.status === "PUBLISHED" && (scholarship.effectiveApplicationStatus ?? scholarship.applicationStatus) === "OPEN";
}

export function validateAssistance(values: AssistanceValues): AssistanceErrors {
  const errors: AssistanceErrors = {};
  if (!values.fullName.trim()) errors.fullName = "يرجى كتابة الاسم الكامل.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "يرجى إدخال بريد إلكتروني صحيح.";
  if (!values.message.trim()) errors.message = "يرجى كتابة رسالتك.";
  if (!values.privacyAccepted) errors.privacyAccepted = "يرجى الموافقة على سياسة الخصوصية لإرسال الطلب.";
  return errors;
}

export function scholarshipAssistancePayload(scholarship: AssistanceScholarship, values: AssistanceValues): ScholarshipAssistancePayload {
  if (!canRequestScholarshipAssistance(scholarship) || !scholarship.id || values.website || Object.keys(validateAssistance(values)).length) {
    throw new Error("Scholarship assistance is unavailable or the form is invalid.");
  }
  return {
    applicationType: "SCHOLARSHIP_ASSISTANCE", scholarshipId: scholarship.id,
    fullName: values.fullName.trim(), email: values.email.trim(), phone: values.phone.trim() || null,
    message: values.message.trim(), privacyAccepted: true, website: "",
  };
}

/** The shared Axios interceptor preserves the Backend response in the error cause. */
export function assistanceFieldErrors(error: unknown): AssistanceErrors {
  const object = (value: unknown): Record<string, unknown> => value !== null && typeof value === "object" ? value as Record<string, unknown> : {};
  const outer = object(error);
  const transport = object(outer.cause ?? error);
  const data = object(object(transport.response).data);
  const fields = object(object(object(data.error).details).fields);
  const result: AssistanceErrors = {};
  for (const key of ["fullName", "email", "phone", "message", "privacyAccepted"] as const) {
    const value = fields[key];
    const message = Array.isArray(value) ? value.find((item) => typeof item === "string") : value;
    if (typeof message === "string" && message.trim()) result[key] = message;
  }
  return result;
}

export function scholarshipOfficialLink(officialSourceUrl: string | null, demoApplicationUrl?: string) {
  const safeUrl = (value?: string | null) => {
    try {
      const url = new URL(value ?? "");
      return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : null;
    } catch { return null; }
  };
  const application = safeUrl(demoApplicationUrl);
  if (application) return { href: application, label: "التقديم الرسمي" };
  const source = safeUrl(officialSourceUrl);
  return source ? { href: source, label: "المصدر الرسمي للمنحة" } : null;
}
