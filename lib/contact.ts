export type InquiryValues = { fullName: string; email: string; phone: string; subject: string; message: string; privacyAccepted: boolean; website: string };
export type InquiryErrors = Partial<Record<keyof InquiryValues, string>>;
export type InquiryPayload = Omit<InquiryValues, "phone" | "privacyAccepted"> & { phone: string | null; privacyAccepted: true };
export type ContactSettings = Partial<Record<"academyNameAr" | "contactEmail" | "contactPhone" | "addressAr" | "facebookUrl" | "instagramUrl" | "linkedinUrl" | "youtubeUrl", string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function validateInquiry(values: InquiryValues): InquiryErrors {
  const errors: InquiryErrors = {};
  if (values.fullName.trim().length < 2) errors.fullName = "يرجى كتابة الاسم الكامل (حرفان على الأقل).";
  if (!emailPattern.test(values.email.trim())) errors.email = "يرجى إدخال بريد إلكتروني صحيح.";
  if (values.subject.trim().length < 3) errors.subject = "يرجى اختيار موضوع الاستفسار (ثلاثة أحرف على الأقل).";
  if (values.message.trim().length < 10) errors.message = "يرجى كتابة تفاصيل الاستفسار (عشرة أحرف على الأقل).";
  if (!values.privacyAccepted) errors.privacyAccepted = "يرجى الموافقة على سياسة الخصوصية.";
  if (values.website) errors.website = "تعذر إرسال الاستفسار. يرجى المحاولة مجددًا.";
  // Optional phone syntax is owned by the Backend; don't invent a country/format restriction.
  return errors;
}

export function inquiryPayload(values: InquiryValues): InquiryPayload {
  if (Object.keys(validateInquiry(values)).length) throw new Error("Invalid inquiry.");
  return { fullName: values.fullName.trim(), email: values.email.trim(), phone: values.phone.trim() || null, subject: values.subject.trim(), message: values.message.trim(), privacyAccepted: true, website: "" };
}

export function inquiryFieldErrors(error: unknown): InquiryErrors {
  const object = (value: unknown): Record<string, unknown> => value !== null && typeof value === "object" ? value as Record<string, unknown> : {};
  const outer = object(error);
  const transport = object(outer.cause ?? error);
  const data = object(object(transport.response).data);
  const fields = object(object(object(data.error).details).fields);
  const errors: InquiryErrors = {};
  for (const key of ["fullName", "email", "phone", "subject", "message", "privacyAccepted", "website"] as const) {
    const value = fields[key];
    const message = Array.isArray(value) ? value.find((item) => typeof item === "string") : value;
    if (typeof message === "string" && message.trim()) errors[key] = message;
  }
  return errors;
}

export function contactSettings(value: unknown): ContactSettings {
  if (!value || typeof value !== "object") return {};
  const source = value as Record<string, unknown>;
  const result: ContactSettings = {};
  for (const key of ["academyNameAr", "contactEmail", "contactPhone", "addressAr", "facebookUrl", "instagramUrl", "linkedinUrl", "youtubeUrl"] as const) {
    const item = typeof source[key] === "string" ? source[key].trim() : "";
    if (!item) continue;
    if (key === "contactEmail" && !emailPattern.test(item)) continue;
    if (key === "contactPhone" && (!/^\+?[\d\s().-]+$/.test(item) || item.replace(/\D/g, "").length < 6 || item.replace(/\D/g, "").length > 15)) continue;
    if (key.endsWith("Url")) {
      try {
        const url = new URL(item);
        if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) continue;
      } catch { continue; }
    }
    result[key] = item;
  }
  return result;
}

// Presentation only: never persisted to settings or used as real contact destinations.
const contactPlaceholders = {
  contactEmail: "example@tareeq-academy.com",
  contactPhone: "+963 900 000 000",
  addressAr: "عنوان تجريبي — يُحدَّث لاحقاً",
} as const;

export function contactInformation(settings: ContactSettings) {
  const verified = contactSettings(settings);
  function field(key: keyof typeof contactPlaceholders) {
    const value = verified[key] || contactPlaceholders[key];
    const placeholder = !verified[key] || value === contactPlaceholders[key];
    const href = placeholder ? undefined : key === "contactEmail" ? `mailto:${value}` : key === "contactPhone" ? `tel:${value.replace(/[^\d+]/g, "")}` : undefined;
    return { value, placeholder, href };
  }
  return { email: field("contactEmail"), phone: field("contactPhone"), address: field("addressAr"), settings: verified };
}
