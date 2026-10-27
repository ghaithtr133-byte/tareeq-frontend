"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, GraduationCap, MapPin } from "lucide-react";

import styles from "./featured-universities-carousel.module.css";

export type FeaturedUniversity = {
  id: string;
  title: string;
  href: string;
  countryName?: string;
  countrySlug?: string;
  city?: string;
  universityType?: string;
  logo?: string;
};

function UniversityFlag({ slug, countryName }: { slug?: string; countryName?: string }) {
  const label = `علم ${countryName ?? slug ?? "غير متاح"}`;
  if (slug === "romania") return (
    <svg role="img" aria-label={label} viewBox="0 0 30 20" className={styles.flagImage}>
      <path fill="#002B7F" d="M0 0h10v20H0z" /><path fill="#FCD116" d="M10 0h10v20H10z" /><path fill="#CE1126" d="M20 0h10v20H20z" />
    </svg>
  );
  if (slug === "poland") return (
    <svg role="img" aria-label={label} viewBox="0 0 30 20" className={styles.flagImage}>
      <path fill="#fff" d="M0 0h30v10H0z" /><path fill="#DC143C" d="M0 10h30v10H0z" />
    </svg>
  );
  if (slug === "hungary") return (
    <svg role="img" aria-label={label} viewBox="0 0 30 20" className={styles.flagImage}>
      <path fill="#CE2939" d="M0 0h30v7H0z" /><path fill="#fff" d="M0 7h30v6H0z" /><path fill="#477050" d="M0 13h30v7H0z" />
    </svg>
  );
  if (slug === "turkey") return (
    <svg role="img" aria-label={label} viewBox="0 0 30 20" className={styles.flagImage}>
      <path fill="#E30A17" d="M0 0h30v20H0z" /><circle fill="#fff" cx="12" cy="10" r="5.5" /><circle fill="#E30A17" cx="13.7" cy="10" r="4.4" /><path fill="#fff" d="m17.7 6.5.8 2.4H21l-2 1.5.8 2.4-2.1-1.5-2 1.5.8-2.4-2-1.5H17z" />
    </svg>
  );
  return <span role="img" aria-label="علم غير متاح" className="text-[#7890A8]"><MapPin className="size-5" aria-hidden="true" /></span>;
}

export function FeaturedUniversitiesCarousel({ items }: { items: FeaturedUniversity[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ index: 0, max: 0, measured: false });

  const updatePosition = useCallback(() => {
    const track = trackRef.current;
    const card = track?.firstElementChild as HTMLElement | null;
    if (!track || !card) return;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = card.getBoundingClientRect().width + gap;
    const visible = Math.max(1, Math.floor((track.clientWidth + gap + 1) / step));
    const max = Math.max(0, items.length - visible);
    const index = Math.min(max, Math.max(0, Math.round(-track.scrollLeft / step)));
    setPosition({ index, max, measured: true });
  }, [items.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(updatePosition);
    observer.observe(track);
    if (track.firstElementChild) observer.observe(track.firstElementChild);
    track.addEventListener("scroll", updatePosition, { passive: true });
    updatePosition();
    return () => {
      observer.disconnect();
      track.removeEventListener("scroll", updatePosition);
    };
  }, [updatePosition]);

  function move(direction: -1 | 1) {
    const track = trackRef.current;
    const card = track?.firstElementChild as HTMLElement | null;
    if (!track || !card) return;
    const next = Math.min(position.max, Math.max(0, position.index + direction));
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = card.getBoundingClientRect().width + gap;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: -next * step, behavior: reduceMotion ? "auto" : "smooth" });
    setPosition((current) => ({ ...current, index: next }));
  }

  return (
    <div className={styles.frame}>
      <div className={styles.carousel}>
        <div
          id="featured-universities-track"
          ref={trackRef}
          className={styles.track}
          role="region"
          aria-label="الجامعات المميزة"
          dir="rtl"
          tabIndex={0}
          data-all-visible={position.measured && position.max === 0}
        >
          {items.map((item) => (
            <Link key={item.id} href={item.href} className={styles.card}>
              <span className={styles.flag}>
                <UniversityFlag slug={item.countrySlug} countryName={item.countryName} />
              </span>
              <span className={styles.logoArea}>
                {item.logo ? (
                  <Image src={item.logo} alt={`شعار ${item.title}`} width={145} height={90} className={styles.logo} />
                ) : (
                  <span className={styles.logoFallback} aria-label={`شعار ${item.title} غير متاح`}>
                    <GraduationCap className="size-8 stroke-[1.5]" aria-hidden="true" />
                  </span>
                )}
              </span>
              <span className={styles.name}>{item.title}</span>
              <span className={styles.country}>{item.countryName ?? "البلد غير متاح"}</span>
              <span className={styles.badges}>
                {item.universityType ? <span className={styles.badge}>{item.universityType}</span> : null}
                {item.city ? <span className={styles.badge}>{item.city}</span> : null}
              </span>
            </Link>
          ))}
        </div>
        {position.max > 0 ? (
          <div className={styles.controls}>
            <button type="button" onClick={() => move(-1)} disabled={position.index === 0} aria-controls="featured-universities-track" aria-label="الجامعة السابقة" className={styles.arrow}>
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => move(1)} disabled={position.index === position.max} aria-controls="featured-universities-track" aria-label="الجامعة التالية" className={styles.arrow}>
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
