"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle, Mail, Send } from "lucide-react";
import { submitInquiry } from "@/api/contact";
import { inquiryFieldErrors, inquiryPayload, validateInquiry, type InquiryErrors, type InquiryValues } from "@/lib/contact";

const inputClass = "mt-1.5 min-h-11 w-full min-w-0 rounded-lg border border-[#D7DFE8] bg-white px-3 py-2 text-base text-[#082B50] placeholder:text-[#8390A0] focus:border-[#C8A253] focus:outline-2 focus:outline-offset-2 focus:outline-[#C8A253]";
const fields = ["fullName", "email", "phone", "subject", "message", "privacyAccepted"] as const;

export function ContactInquiryForm({ demo }: { demo: boolean }) {
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [failed, setFailed] = useState(false);
  const [success, setSuccess] = useState(false);
  const locked = useRef(false);
  const feedback = useRef<HTMLDivElement>(null);
  const mutation = useMutation({ mutationFn: (values: InquiryValues) => submitInquiry(inquiryPayload(values), demo), retry: 0 });

  function focusError(form: HTMLFormElement, next: InquiryErrors) {
    const field = fields.find((key) => next[key]);
    requestAnimationFrame(() => field ? form.querySelector<HTMLElement>(`[name="${field}"]`)?.focus() : feedback.current?.focus());
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current || mutation.isPending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const values: InquiryValues = {
      fullName: String(data.get("fullName") ?? ""), email: String(data.get("email") ?? ""), phone: String(data.get("phone") ?? ""),
      subject: String(data.get("subject") ?? ""), message: String(data.get("message") ?? ""), privacyAccepted: data.get("privacyAccepted") === "on", website: String(data.get("website") ?? ""),
    };
    const next = validateInquiry(values);
    setErrors(next); setFailed(false); setSuccess(false);
    if (Object.keys(next).length) { focusError(form, next); return; }
    locked.current = true;
    try {
      await mutation.mutateAsync(values);
      form.reset(); setErrors({}); setSuccess(true);
      requestAnimationFrame(() => feedback.current?.focus());
    } catch (error) {
      const fieldErrors = inquiryFieldErrors(error);
      setErrors(fieldErrors); setFailed(true); focusError(form, fieldErrors);
    } finally { locked.current = false; }
  }

  const error = (field: keyof InquiryValues) => errors[field] ? <p id={`inquiry-${field}-error`} className="mt-1 text-sm leading-6 text-red-700">{errors[field]}</p> : null;
  const accessibility = (field: keyof InquiryValues) => ({ "aria-invalid": !!errors[field], "aria-describedby": errors[field] ? `inquiry-${field}-error` : undefined });
  return <section aria-labelledby="inquiry-title" className="min-w-0 rounded-2xl border border-[#E0E7EF] bg-white p-4 shadow-sm sm:p-6">
    <div className="flex items-center gap-3"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#FAF4E7] text-[#B48B36]"><Mail className="size-7" aria-hidden="true" /></span><h2 id="inquiry-title" className="text-xl font-bold leading-8 text-[#082B50] sm:text-2xl">أرسل لنا استفسارك</h2></div>
    <p className="mt-2 text-sm leading-7 text-muted-foreground">إذا كان لديك سؤال أو طلب محدد، عبّئ النموذج التالي لتسجيل استفسارك لدى فريق طريق.</p>
    {demo ? <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-900">وضع تجريبي: لن تُرسل بياناتك أو تُحفظ، ولا يُنشأ استفسار حقيقي.</p> : null}
    <div ref={feedback} tabIndex={-1} className="rounded-lg focus-visible:outline-2 focus-visible:outline-accent">
      {success ? <p role="status" className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm leading-7 text-green-900">{demo ? "اكتملت محاكاة الاستفسار بنجاح. لم تُرسل بياناتك ولم يتم حفظ استفسار حقيقي." : "تم تسجيل استفسارك بنجاح لدى فريق طريق. هذا التأكيد لا يعني تسليم بريد إلكتروني أو ضمان وقت للرد."}</p> : null}
      {failed || errors.website ? <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-7 text-red-800">تعذر إرسال الاستفسار. راجع الحقول الموضحة وحاول مجددًا؛ بياناتك ما زالت محفوظة في النموذج.</p> : null}
    </div>
    <form onSubmit={submit} noValidate aria-labelledby="inquiry-title" aria-busy={mutation.isPending} className="mt-4">
      <fieldset disabled={mutation.isPending} className="min-w-0 space-y-4 disabled:opacity-70">
        <legend className="sr-only">بيانات الاستفسار</legend>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <div className="min-w-0"><label htmlFor="inquiry-fullName" className="text-sm font-bold">الاسم الكامل <span aria-hidden="true">*</span></label><input id="inquiry-fullName" name="fullName" autoComplete="name" required minLength={2} placeholder="أدخل اسمك الكامل" className={inputClass} {...accessibility("fullName")} />{error("fullName")}</div>
          <div className="min-w-0"><label htmlFor="inquiry-email" className="text-sm font-bold">البريد الإلكتروني <span aria-hidden="true">*</span></label><input id="inquiry-email" name="email" type="email" dir="ltr" autoComplete="email" required placeholder="example@email.com" className={`${inputClass} text-right`} {...accessibility("email")} />{error("email")}</div>
        </div>
        <div><label htmlFor="inquiry-phone" className="text-sm font-bold">رقم الهاتف <span className="font-normal">(اختياري)</span></label><input id="inquiry-phone" name="phone" type="tel" dir="ltr" autoComplete="tel" className={`${inputClass} text-right`} {...accessibility("phone")} />{error("phone")}</div>
        <div><label htmlFor="inquiry-subject" className="text-sm font-bold">موضوع الاستفسار <span aria-hidden="true">*</span></label><select id="inquiry-subject" name="subject" required defaultValue="" className={inputClass} {...accessibility("subject")}><option value="" disabled>اختر موضوع الاستفسار</option>{["استفسار عن القبول الجامعي", "استفسار عن الوجهات الدراسية", "استفسار عن المنح الدراسية", "استفسار عن الخدمات", "استفسار آخر"].map((subject) => <option key={subject} value={subject}>{subject}</option>)}</select>{error("subject")}</div>
        <div><label htmlFor="inquiry-message" className="text-sm font-bold">رسالتك <span aria-hidden="true">*</span></label><textarea id="inquiry-message" name="message" required minLength={10} rows={4} placeholder="اكتب تفاصيل استفسارك هنا…" className={`${inputClass} resize-y leading-7`} {...accessibility("message")} />{error("message")}</div>
        <input type="hidden" name="website" defaultValue="" />
        <div><div className="flex items-start gap-2"><input id="inquiry-privacy" name="privacyAccepted" type="checkbox" required className="mt-1 size-5 shrink-0 accent-[#082B50] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" {...accessibility("privacyAccepted")} /><label htmlFor="inquiry-privacy" className="text-sm leading-7">أوافق على <Link href="/privacy" className="rounded-sm font-bold text-[#17669C] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-accent">سياسة الخصوصية</Link> ومعالجة بياناتي لغرض الرد على الاستفسار.</label></div>{error("privacyAccepted")}</div>
        <button type="submit" disabled={mutation.isPending} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#082B50] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#173E65] active:bg-[#06213D] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#C8A253] disabled:cursor-wait motion-reduce:transition-none">{mutation.isPending ? <LoaderCircle className="size-5 motion-safe:animate-spin" aria-hidden="true" /> : <Send className="size-5" aria-hidden="true" />}{mutation.isPending ? "جارٍ إرسال الاستفسار…" : "إرسال الاستفسار"}</button>
      </fieldset>
    </form>
  </section>;
}
