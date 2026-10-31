"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, LoaderCircle, X } from "lucide-react";
import { submitScholarshipAssistance } from "@/api/scholarship-assistance";
import { assistanceFieldErrors, canRequestScholarshipAssistance, scholarshipAssistancePayload, validateAssistance, type AssistanceErrors, type AssistanceScholarship, type AssistanceValues } from "@/lib/scholarship-assistance";
import { cn } from "@/lib/utils";

const AssistanceContext = createContext<((trigger: HTMLButtonElement) => void) | null>(null);
export const assistanceButtonClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-l from-[#CBA452] to-[#BE913B] px-4 py-2.5 text-sm font-bold leading-6 text-[#132C4D] shadow-sm transition-colors hover:from-[#D8B66C] hover:to-[#CBA452] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:opacity-60";

export function ScholarshipAssistanceButton({ children, className, primary = false, sticky = false }: { children: ReactNode; className?: string; primary?: boolean; sticky?: boolean }) {
  const open = useContext(AssistanceContext);
  return <button type="button" id={primary ? "scholarship-primary-assistance" : sticky ? "scholarship-sticky-assistance" : undefined} aria-haspopup="dialog" aria-controls="scholarship-assistance-dialog" className={cn(assistanceButtonClass, className)} onClick={(event) => open?.(event.currentTarget)}>{children}<ArrowLeft className="size-4 shrink-0" aria-hidden="true" /></button>;
}

export function ScholarshipAssistance({ scholarship, demo, children }: { scholarship: AssistanceScholarship; demo: boolean; children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const locked = useRef(false);
  const [open, setOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [errors, setErrors] = useState<AssistanceErrors>({});
  const [failed, setFailed] = useState(false);
  const allowed = canRequestScholarshipAssistance(scholarship);
  const mutation = useMutation({
    mutationFn: (values: AssistanceValues) => submitScholarshipAssistance(scholarshipAssistancePayload(scholarship, values), demo),
    retry: false,
  });

  useEffect(() => {
    if (!allowed) return;
    const primary = document.getElementById("scholarship-primary-assistance");
    const closing = document.getElementById("scholarship-closing-cta");
    const contextual = document.getElementById("scholarship-context-cta");
    const footer = document.querySelector("footer");
    if (!primary) return;
    // Show only after the early CTA has scrolled away; stop before closing/footer controls.
    let passedPrimary = false;
    const visibleEnd = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === primary) passedPrimary = !entry.isIntersecting && entry.boundingClientRect.bottom < 0;
        else if (entry.isIntersecting) visibleEnd.add(entry.target);
        else visibleEnd.delete(entry.target);
      }
      setSticky(passedPrimary && visibleEnd.size === 0);
    });
    [primary, contextual, closing, footer].forEach((element) => { if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, [allowed]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  function show(button: HTMLButtonElement) {
    if (!allowed || !dialog.current || dialog.current.open) return;
    trigger.current = button;
    dialog.current.showModal();
    setOpen(true);
    requestAnimationFrame(() => dialog.current?.querySelector<HTMLElement>(mutation.isSuccess ? "[data-success]" : '[name="fullName"]')?.focus());
  }

  function close() {
    if (locked.current) return;
    dialog.current?.close();
  }

  function focusError(next: AssistanceErrors) {
    requestAnimationFrame(() => {
      const field = Object.keys(next)[0];
      if (field) dialog.current?.querySelector<HTMLElement>(`[name="${field}"]`)?.focus();
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current || mutation.isSuccess || !allowed) return;
    const data = new FormData(event.currentTarget);
    const values: AssistanceValues = {
      fullName: String(data.get("fullName") ?? ""), email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""), message: String(data.get("message") ?? ""),
      privacyAccepted: data.get("privacyAccepted") === "on", website: String(data.get("website") ?? ""),
    };
    const next = validateAssistance(values);
    setErrors(next);
    setFailed(false);
    if (Object.keys(next).length) { focusError(next); return; }
    locked.current = true;
    try {
      await mutation.mutateAsync(values);
      requestAnimationFrame(() => dialog.current?.querySelector<HTMLElement>("[data-success]")?.focus());
    } catch (error) {
      const fields = assistanceFieldErrors(error);
      setErrors(fields);
      setFailed(true);
      focusError(fields);
    } finally { locked.current = false; }
  }

  const inputClass = "mt-1.5 min-h-11 w-full rounded-lg border border-border bg-white px-3 py-2 text-base text-foreground focus:border-accent focus:outline-2 focus:outline-offset-2 focus:outline-accent disabled:opacity-60";
  const fieldError = (field: keyof AssistanceValues) => errors[field] ? <p id={`assistance-${field}-error`} className="mt-1 text-sm text-red-700">{errors[field]}</p> : null;
  return <AssistanceContext.Provider value={show}>
    {children}
    {allowed && sticky && !open ? <div className="pointer-events-none fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-24 right-4 z-30 lg:hidden"><ScholarshipAssistanceButton sticky className="pointer-events-auto w-full shadow-lg">اطلب مساعدة بالتقديم</ScholarshipAssistanceButton></div> : null}
    {allowed ? <dialog ref={dialog} id="scholarship-assistance-dialog" aria-labelledby="assistance-title" aria-describedby="assistance-description" dir="rtl" className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto overscroll-contain rounded-2xl border border-border bg-white p-5 text-foreground shadow-2xl backdrop:bg-[#061D36]/65 sm:p-7" onCancel={(event) => { if (locked.current) event.preventDefault(); }} onClose={() => {
      setOpen(false);
      // The conditional sticky trigger is remounted after closing the dialog.
      requestAnimationFrame(() => {
        const target = trigger.current?.isConnected ? trigger.current : document.getElementById("scholarship-sticky-assistance") ?? document.getElementById("scholarship-primary-assistance");
        target?.focus({ preventScroll: true });
      });
    }}>
      <div className="flex items-start justify-between gap-4">
        <h2 id="assistance-title" className="text-xl font-bold leading-8 text-primary">طلب مساعدة بالتقديم</h2>
        <button type="button" aria-label="إغلاق نموذج المساعدة" onClick={close} disabled={mutation.isPending} className="grid size-11 shrink-0 place-items-center rounded-lg border hover:bg-secondary disabled:opacity-50"><X className="size-5" aria-hidden="true" /></button>
      </div>
      <p className="mt-2 rounded-lg bg-secondary px-3 py-2 text-sm font-bold leading-7 text-primary">{scholarship.titleAr}</p>
      <p id="assistance-description" className="mt-3 text-sm leading-7 text-muted-foreground">هذا طلب مساعدة من أكاديمية طريق، وليس تقديماً رسمياً لدى الجهة المانحة، ولا يضمن القبول.</p>
      {demo ? <p className="mt-2 text-sm leading-6 text-amber-800">وضع تجريبي: لن تُرسل البيانات أو تُحفظ، ولا يمثّل هذا النموذج طلباً حقيقياً.</p> : null}
      {mutation.isSuccess ? <div role="status" className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">
        <CheckCircle2 className="mb-3 size-8 text-green-700" aria-hidden="true" />
        <h3 data-success tabIndex={-1} className="font-bold leading-7 text-primary">{demo ? "اكتملت محاكاة الطلب بنجاح" : "تم حفظ طلب المساعدة بنجاح"}</h3>
        <p className="mt-2 text-sm leading-7">{demo ? "لم تُرسل بياناتك إلى الخادم ولم يتم إنشاء طلب حقيقي." : "تم تسجيل طلبك لدى أكاديمية طريق. هذا التأكيد لا يعني إرسال طلب رسمي للمنحة أو ضمان وصول بريد إلكتروني أو التواصل الفوري."}</p>
        <button type="button" className={cn(assistanceButtonClass, "mt-4")} onClick={close}>إغلاق</button>
      </div> : <form onSubmit={submit} noValidate className="mt-5 space-y-4" aria-busy={mutation.isPending}>
        <fieldset disabled={mutation.isPending} className="space-y-4">
          {([['fullName', 'الاسم الكامل', 'text', 'name'], ['email', 'البريد الإلكتروني', 'email', 'email'], ['phone', 'رقم الهاتف (اختياري)', 'tel', 'tel']] as const).map(([name, label, type, autoComplete]) => <div key={name}>
            <label htmlFor={`assistance-${name}`} className="text-sm font-bold text-primary">{label}</label>
            <input id={`assistance-${name}`} name={name} type={type} autoComplete={autoComplete} dir={name === "fullName" ? "auto" : "ltr"} required={name !== "phone"} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `assistance-${name}-error` : undefined} className={inputClass} />
            {fieldError(name)}
          </div>)}
          <div><label htmlFor="assistance-message" className="text-sm font-bold text-primary">رسالتك</label><textarea id="assistance-message" name="message" rows={4} required dir="auto" aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "assistance-message-error" : undefined} className={cn(inputClass, "resize-y")} />{fieldError("message")}</div>
          <div className="hidden" aria-hidden="true"><label htmlFor="assistance-website">Website</label><input id="assistance-website" name="website" tabIndex={-1} autoComplete="off" /></div>
          <div><div className="flex items-start gap-2"><input id="assistance-privacy" name="privacyAccepted" type="checkbox" required className="mt-1 size-5 shrink-0 accent-primary" aria-invalid={Boolean(errors.privacyAccepted)} aria-describedby={errors.privacyAccepted ? "assistance-privacyAccepted-error" : undefined} /><label htmlFor="assistance-privacy" className="text-sm leading-7">أوافق على معالجة بياناتي وفق <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="rounded-sm text-primary underline underline-offset-4">سياسة الخصوصية (تفتح في نافذة جديدة)</Link>.</label></div>{fieldError("privacyAccepted")}</div>
        </fieldset>
        {failed ? <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm leading-7 text-red-800">تعذّر حفظ الطلب. راجع الحقول الموضحة، أو حاول مجدداً. لم يتم تأكيد استلام طلبك.</p> : null}
        <button type="submit" disabled={mutation.isPending} className={cn(assistanceButtonClass, "w-full")}>{mutation.isPending ? <><LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />جارٍ {demo ? "محاكاة الطلب" : "إرسال الطلب"}…</> : demo ? "محاكاة إرسال طلب المساعدة" : "إرسال طلب المساعدة"}</button>
        <p className="sr-only" role="status">{mutation.isPending ? "جارٍ معالجة طلبك، يرجى الانتظار." : ""}</p>
      </form>}
    </dialog> : null}
  </AssistanceContext.Provider>;
}
