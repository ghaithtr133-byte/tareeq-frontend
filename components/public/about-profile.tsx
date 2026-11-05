import { BookOpen, Compass, Eye, HeartHandshake, ShieldCheck, Sparkles, Target } from "lucide-react";
import { EmptyState } from "@/components/ui/content-state";
import { BalancedCardGrid } from "@/components/ui/balanced-card-grid";
import { HomeSectionError } from "@/components/home/home-section-error";
import { aboutTemporaryContent, aboutText, type AboutProfileState } from "@/lib/about-content";

const panel = "min-w-0 rounded-2xl border border-[#E0E7EF] bg-white p-5 shadow-[0_8px_28px_-20px_rgba(8,43,80,0.25)] sm:p-7";
const goldIcon = "grid size-12 shrink-0 place-items-center rounded-xl border border-[#C8A253]/25 bg-[#FAF4E7] text-[#A47B2D]";
const valueIcons = [Eye, HeartHandshake, ShieldCheck, Compass];

export function AboutProfile({ profile }: { profile: AboutProfileState }) {
  const content = profile.status === "ready" ? profile.content : {};
  const temporaryValues = content.values === undefined;
  const values = temporaryValues ? aboutTemporaryContent.values : content.values!;
  return <div className="space-y-8 sm:space-y-10">
    {profile.status === "error" ? <HomeSectionError title="تعذّر تحميل نبذة الأكاديمية" description="يرجى المحاولة مجدداً. تبقى خيارات التواصل متاحة." />
      : profile.status !== "ready" ? <EmptyState title="الملف التعريفي غير متاح حالياً" description="النصوص الموسومة أدناه مواضع تحريرية مؤقتة، وليست معلومات مؤسسية معتمدة." /> : null}
    <section aria-labelledby="about-story-title" className={`${panel} border-s-4 border-s-[#C8A253]`}>
      <div className="flex items-center gap-3"><span className={goldIcon}><BookOpen className="size-6" aria-hidden="true" /></span><div><p className="text-xs leading-6 text-[#946D2C]">خلف كل رحلة حكاية</p><h2 id="about-story-title" className="text-2xl font-bold leading-10">قصتنا</h2></div></div>
      <p data-about-story className="mt-4 max-w-4xl whitespace-pre-line text-base leading-9 text-[#52647A] [overflow-wrap:anywhere]">{profile.status === "error" ? "" : aboutText(content.story, "story")}</p>
    </section>
    <section aria-labelledby="about-direction-title">
      <h2 id="about-direction-title" className="mb-4 text-2xl font-bold leading-10">رؤيتنا ورسالتنا</h2>
      <div className="grid items-stretch gap-4 md:grid-cols-2">
        {[{ title: "رؤيتنا", value: content.vision, slot: "vision" as const, icon: Eye }, { title: "رسالتنا", value: content.mission, slot: "mission" as const, icon: Target }].map(({ title, value, slot, icon: Icon }) => <article key={slot} className={panel}>
          <span className={goldIcon}><Icon className="size-6" aria-hidden="true" /></span><h3 className="mt-3 text-xl font-bold leading-8">{title}</h3>
          {profile.status !== "error" ? <p className="mt-2 whitespace-pre-line text-sm leading-8 text-[#52647A] [overflow-wrap:anywhere]">{aboutText(value, slot)}</p> : null}
        </article>)}
      </div>
    </section>
    <section aria-labelledby="about-values-title">
      <div className="mb-4 flex items-center gap-2"><Sparkles className="size-5 text-[#A47B2D]" aria-hidden="true" /><h2 id="about-values-title" className="text-2xl font-bold leading-10">قيمنا</h2></div>
      {temporaryValues && profile.status !== "error" ? <p className="mb-4 text-sm leading-7 text-[#52647A]">عناوين تحريرية مقترحة تنتظر الاعتماد، وليست سياسات رسمية للأكاديمية.</p> : null}
      {profile.status !== "error" && !values.length ? <EmptyState title="القيم المعتمدة غير متاحة حالياً" description="ستظهر القيم هنا عند توفر محتواها المعتمد." /> : null}
      {profile.status !== "error" ? <BalancedCardGrid columns={{ sm: 2, lg: 4 }} gap={4}>{values.map((item, index) => {
        const Icon = valueIcons[index % valueIcons.length];
        return <article key={index} className="min-w-0 rounded-2xl border border-[#E0E7EF] bg-white p-5 transition-colors duration-200 hover:border-[#C8A253]/65 motion-reduce:transition-none">
          <Icon className="mb-4 size-7 text-[#A47B2D]" strokeWidth={1.6} aria-hidden="true" /><h3 className="text-base font-bold leading-8 [overflow-wrap:anywhere]">{item.title.trim() || aboutTemporaryContent.valueTitle}</h3><p className="mt-2 whitespace-pre-line text-sm leading-8 text-[#52647A] [overflow-wrap:anywhere]">{item.description.trim() || aboutTemporaryContent.valueDescription}</p>
        </article>;
      })}</BalancedCardGrid> : null}
    </section>
  </div>;
}
