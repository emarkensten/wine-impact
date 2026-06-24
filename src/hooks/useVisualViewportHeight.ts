'use client';

import { type CSSProperties, useSyncExternalStore } from 'react';

function subscribe(onChange: () => void) {
  const vv = window.visualViewport;
  if (!vv) return () => {};
  vv.addEventListener('resize', onChange);
  vv.addEventListener('scroll', onChange);
  return () => {
    vv.removeEventListener('resize', onChange);
    vv.removeEventListener('scroll', onChange);
  };
}

/**
 * Height of the visual viewport in px — i.e. the space actually visible,
 * which on iOS Safari shrinks when the software keyboard opens (the layout
 * viewport and `100dvh` do NOT). Returns null on the server / before mount.
 *
 * Used to cap the search/manual drawer so it never grows taller than the
 * area above the keyboard (which otherwise clips the drawer header off the
 * top of the screen on iOS).
 */
export function useVisualViewportHeight(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => window.visualViewport?.height ?? null,
    () => null
  );
}

/**
 * Inline style for a bottom-anchored (vaul) drawer that contains a focusable
 * input, so the iOS software keyboard can't clip the drawer's header off the
 * top of the screen. Cap the height to the visible viewport and lift the
 * drawer to sit directly above the keyboard. Use with `repositionInputs={false}`
 * on the Drawer so vaul's own (buggy) handling doesn't fight this.
 *
 * Returns undefined before mount (server / first paint) so the CSS class
 * height applies normally.
 */
export function useKeyboardAwareDrawerStyle(): CSSProperties | undefined {
  const viewportHeight = useVisualViewportHeight();
  if (viewportHeight == null) return undefined;

  const offsetTop = window.visualViewport?.offsetTop ?? 0;
  const keyboardInset = Math.max(0, window.innerHeight - viewportHeight - offsetTop);

  return {
    maxHeight: `${Math.round(viewportHeight - 8)}px`,
    bottom: keyboardInset > 1 ? `${Math.round(keyboardInset)}px` : undefined,
  };
}
