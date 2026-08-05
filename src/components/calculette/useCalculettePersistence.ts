import { useEffect, useRef } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { calculetteSchema, CALCULETTE_DEFAULTS, type CalculetteFormValues } from './calculetteSchema';
import { trackEvent } from '@/lib/analytics';

const STORAGE_KEY = 'hippodoc.calculette.v1';
const DEBOUNCE_MS = 500;

/**
 * Persistance localStorage anonyme, 1 scénario, RGPD-friendly.
 * - Restaure au mount (silencieux, garde Zod).
 * - Auto-save debounced sur watch.
 */
export function useCalculettePersistence(methods: UseFormReturn<CalculetteFormValues>) {
  const restoredRef = useRef(false);

  // Restore au mount
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      // Refonte UX mai 2026 — Migration legacy `profil='mixte'` (visible avant) →
      // `profil='installe_s1' + depassementsAutorises=true` (état dérivé).
      if (parsed && typeof parsed === 'object' && parsed.profil === 'mixte') {
        parsed.profil = 'installe_s1';
        parsed.depassementsAutorises = true;
      }
      const safe = calculetteSchema.safeParse(parsed);
      if (safe.success) {
        // V22 — `declarant` n'est jamais persisté : réinit à 1 à chaque visite.
        methods.reset({ ...safe.data, declarant: 1 });
        trackEvent('calculette_2042_dspamc_restored');
      } else {
        // Schéma invalide → on nettoie
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // localStorage indisponible (mode navigation privée) → silencieux
    }
  }, [methods]);

  // Auto-save debounced
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const sub = methods.watch((values) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          // V22 — exclure `declarant` du payload persisté (volatile, défaut 1).
          const { declarant: _declarant, ...persistable } = values as Record<string, unknown>;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
        } catch {
          // Quota plein ou indisponible → silencieux
        }
      }, DEBOUNCE_MS);
    });
    return () => {
      if (timer) clearTimeout(timer);
      sub.unsubscribe();
    };
  }, [methods]);
}

export function resetCalculettePersistence(methods: UseFormReturn<CalculetteFormValues>) {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* silencieux */
  }
  methods.reset(CALCULETTE_DEFAULTS);
}
