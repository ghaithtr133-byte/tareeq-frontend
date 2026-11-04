"use client";

import { useEffect } from "react";

const DRAG_THRESHOLD = 8;

/** Block native previews and drag-release activation, not selection or scroll gestures. */
export function NativeDragGuard() {
  useEffect(() => {
    const site = document.querySelector<HTMLElement>("[data-public-site]");
    if (!site) return;
    let gesture: { control: Element; pointerId: number; x: number; y: number; moved: boolean } | null = null;
    let draggedClick: { control: Element; time: number } | null = null;

    function editable(target: Element) {
      return Boolean(target.closest("input, textarea") || target.closest<HTMLElement>("[contenteditable]")?.isContentEditable);
    }

    function preventNativeDrag(event: Event) {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      // Preserve native text editing, including moving selected text in editors.
      if (editable(target)) return;
      event.preventDefault();
    }

    function pointerDown(event: PointerEvent) {
      gesture = null;
      draggedClick = null;
      // Native touch scrolling/swipes already cancel their click; never intercept them.
      if (event.pointerType === "touch" || event.button !== 0 || !event.isPrimary) return;
      const target = event.target instanceof Element ? event.target : null;
      if (!target || editable(target)) return;
      const control = target.closest("a[href], button, [role='link'], [role='button']");
      if (control) gesture = { control, pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
    }

    function pointerMove(event: PointerEvent) {
      if (gesture?.pointerId === event.pointerId && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > DRAG_THRESHOLD) gesture.moved = true;
    }

    function pointerUp(event: PointerEvent) {
      pointerMove(event);
      if (gesture?.pointerId !== event.pointerId) return;
      if (gesture.moved) draggedClick = { control: gesture.control, time: event.timeStamp };
      gesture = null;
    }

    function pointerCancel() {
      gesture = null;
      draggedClick = null;
    }

    function preventDragClick(event: MouseEvent) {
      const dragged = draggedClick;
      draggedClick = null;
      // Keyboard/programmatic activation has detail=0 and must always work.
      if (!dragged || event.detail === 0 || event.timeStamp - dragged.time > 500) return;
      if (event.target instanceof Node && dragged.control.contains(event.target)) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    // Delegation also covers cards, images and links added after navigation.
    site.addEventListener("dragstart", preventNativeDrag, true);
    site.addEventListener("pointerdown", pointerDown, { capture: true, passive: true });
    site.addEventListener("pointermove", pointerMove, { capture: true, passive: true });
    site.addEventListener("pointerup", pointerUp, { capture: true, passive: true });
    site.addEventListener("pointercancel", pointerCancel, { capture: true, passive: true });
    site.addEventListener("click", preventDragClick, true);
    return () => {
      site.removeEventListener("dragstart", preventNativeDrag, true);
      site.removeEventListener("pointerdown", pointerDown, true);
      site.removeEventListener("pointermove", pointerMove, true);
      site.removeEventListener("pointerup", pointerUp, true);
      site.removeEventListener("pointercancel", pointerCancel, true);
      site.removeEventListener("click", preventDragClick, true);
    };
  }, []);

  return null;
}
