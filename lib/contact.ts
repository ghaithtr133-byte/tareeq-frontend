export type InquiryValues = { fullName: string; email: string; phone: string; subject: string; message: string; privacyAccepted: boolean; website: string };
export type InquiryErrors = Partial<Record<keyof InquiryValues, string>>;
export type InquiryPayload = Omit<InquiryValues, "phone" | "privacyAccepted"> & { phone: string | null; privacyAccepted: true };
export type ContactSettings = Partial<Record<"academyNameAr" | "contactEmail" | "contactPhone" | "addressAr" | "facebookUrl" | "instagramUrl" | "linkedinUrl" | "youtubeUrl", string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function validateInquiry(values: InquiryValues): InquiryErrors {
  const errors: InquiryErrors = {};
  if (values.fullName.trim().length < 2 || values.fullName.trim().length > 150) errors.fullName = "يرجى كتابة الاسم الكامل من حرفين إلى 150 حرفاً.";
  if (!emailPattern.test(values.email.trim()) || values.email.trim().length > 254) errors.email = "يرجى إدخال بريد إلكتروني صحيح لا يتجاوز 254 حرفاً.";
  if (values.subject.trim().length < 3 || values.subject.trim().length > 200) errors.subject = "يرجى اختيار موضوع الاستفسار من 3 إلى 200 حرف.";
  if (values.message.trim().length < 10 || values.message.trim().length > 5000) errors.message = "يرجى كتابة تفاصيل الاستفسار من 10 إلى 5000 حرف.";
  if (values.phone.trim() && (values.phone.trim().length > 25 || !/^\+?[0-9][0-9 ()-]{5,23}[0-9]$/.test(values.phone.trim()))) errors.phone = "يرجى إدخال رقم هاتف صحيح من 7 إلى 25 خانة، ويمكن أن يبدأ برمز + الدولي.";
  if (!values.privacyAccepted) errors.privacyAccepted = "يرجى الموافقة على سياسة الخصوصية.";
  if (values.website) errors.website = "تعذر إرسال الاستفسار. يرجى المحاولة مجددًا.";
  // Phone remains optional; syntax and limits match GeneralInquiryCreateRequest, not a country-specific rule.
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
    // Map the documented field, never expose technical validation details or echoed personal data.
    if (typeof message === "string" && message.trim()) errors[key] = inquiryServerLabels[key];
  }
  return errors;
}

const inquiryServerLabels: Record<keyof InquiryValues, string> = {
  fullName: "يرجى مراجعة الاسم الكامل.", email: "يرجى مراجعة البريد الإلكتروني.", phone: "يرجى مراجعة صيغة رقم الهاتف.",
  subject: "يرجى مراجعة موضوع الاستفسار.", message: "يرجى مراجعة الرسالة وطولها.", privacyAccepted: "يرجى الموافقة على سياسة الخصوصية.", website: "تعذر إرسال الاستفسار. يرجى المحاولة مجدداً.",
};

export function inquiryFailureMessage(error: unknown) {
  const failure = error as { status?: number; response?: { status?: number; data?: { error?: { details?: { retryAfterSeconds?: unknown } } } }; cause?: { response?: { status?: number; data?: { error?: { details?: { retryAfterSeconds?: unknown } } } } } };
  const response = failure?.cause?.response ?? failure?.response;
  const status = failure?.status ?? response?.status;
  if (status === 429) {
    const seconds = response?.data?.error?.details?.retryAfterSeconds;
    return typeof seconds === "number" && Number.isSafeInteger(seconds) && seconds > 0
      ? `تم تجاوز عدد المحاولات المسموح. يرجى الانتظار ${seconds} ثانية قبل المحاولة مجدداً. بياناتك ما زالت في النموذج.`
      : "تم تجاوز عدد المحاولات المسموح. يرجى الانتظار والمحاولة لاحقاً. بياناتك ما زالت في النموذج.";
  }
  if (status === 413) return "حجم الرسالة كبير جداً. يرجى تقليل طولها والمحاولة مجدداً؛ بياناتك ما زالت في النموذج.";
  if (status === 403) return "تعذر إرسال الاستفسار من هذا الموقع حالياً. يرجى المحاولة لاحقاً؛ بياناتك ما زالت في النموذج.";
  return "تعذر إرسال الاستفسار. راجع الحقول الموضحة وحاول مجدداً؛ بياناتك ما زالت محفوظة في النموذج.";
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

/** Validates the documented public SiteSettings envelope before presentation. */
export function parseContactSettingsResponse(value: unknown): ContactSettings {
  const response = value && typeof value === "object" ? value as Record<string, unknown> : undefined;
  const data = response?.data;
  const fields = ["academyNameAr", "contactEmail", "contactPhone", "addressAr", "facebookUrl", "instagramUrl", "linkedinUrl", "youtubeUrl"];
  if (response?.success !== true || !data || typeof data !== "object" || Array.isArray(data) || !fields.some((key) => key in data) || fields.some((key) => (data as Record<string, unknown>)[key] !== undefined && (data as Record<string, unknown>)[key] !== null && typeof (data as Record<string, unknown>)[key] !== "string")) {
    throw new Error("Invalid site settings response.");
  }
  return contactSettings(data);
}

// Presentation only: never persisted to settings or used as real contact destinations.
const contactPlaceholders = {
  contactEmail: "example@tareeq-academy.com",
  contactPhone: "+963 900 000 000",
  addressAr: "عنوان تجريبي — يُحدَّث لاحقاً",
} as const;

export function contactInformation(settings: ContactSettings, demo = false) {
  const verified = contactSettings(settings);
  function field(key: keyof typeof contactPlaceholders) {
    const placeholder = !verified[key] || verified[key] === contactPlaceholders[key];
    const labels = { contactEmail: "البريد الإلكتروني", contactPhone: "رقم الهاتف", addressAr: "العنوان" };
    const value = placeholder ? demo ? contactPlaceholders[key] : `${labels[key]} (غير متوفر حالياً)` : verified[key]!;
    const href = placeholder ? undefined : key === "contactEmail" ? `mailto:${value}` : key === "contactPhone" ? `tel:${value.replace(/[^\d+]/g, "")}` : undefined;
    return { value, placeholder, href };
  }
  return { email: field("contactEmail"), phone: field("contactPhone"), address: field("addressAr"), settings: verified };
}
