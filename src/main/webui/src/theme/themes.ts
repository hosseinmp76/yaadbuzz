export type ThemeId =
  | 'teal-yearbook'
  | 'forest-night'
  | 'ink-saffron'
  | 'lagoon-mist'
  | 'copper-slate'

export type ThemeDefinition = {
  id: ThemeId
  label: string
  description: string
  preview: [string, string, string]
  vars: Record<string, string>
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'teal-yearbook',
    label: 'Teal Yearbook',
    description: 'Cool white workspace with deep teal — matches the product look.',
    preview: ['#0f5f5a', '#f4f6f5', '#ffffff'],
    vars: {
      '--ink': '#14201f',
      '--muted': '#5b6b68',
      '--paper': '#f4f6f5',
      '--paper-2': '#e8eeec',
      '--brand': '#0f5f5a',
      '--brand-deep': '#0a4541',
      '--accent': '#1a7a72',
      '--line': 'rgba(20, 32, 31, 0.10)',
      '--panel': 'rgba(255, 255, 255, 0.92)',
      '--panel-strong': '#ffffff',
      '--shadow': '0 12px 40px rgba(20, 32, 31, 0.08)',
      '--glow-1': 'rgba(15, 95, 90, 0.08)',
      '--glow-2': 'rgba(15, 95, 90, 0.04)',
      '--danger': '#b91c1c',
      '--on-brand': '#ffffff',
    },
  },
  {
    id: 'forest-night',
    label: 'Forest Night',
    description: 'Deep moss and gold for late-night editing.',
    preview: ['#3f6212', '#141a14', '#d4a72c'],
    vars: {
      '--ink': '#ecf0e7',
      '--muted': '#a3b094',
      '--paper': '#141a14',
      '--paper-2': '#1c241c',
      '--brand': '#65a30d',
      '--brand-deep': '#3f6212',
      '--accent': '#d4a72c',
      '--line': 'rgba(236, 240, 231, 0.14)',
      '--panel': 'rgba(28, 36, 28, 0.92)',
      '--panel-strong': 'rgba(36, 46, 36, 0.96)',
      '--shadow': '0 12px 40px rgba(0, 0, 0, 0.35)',
      '--glow-1': 'rgba(101, 163, 13, 0.14)',
      '--glow-2': 'rgba(212, 167, 44, 0.08)',
      '--danger': '#f87171',
      '--on-brand': '#102010',
    },
  },
  {
    id: 'ink-saffron',
    label: 'Ink & Saffron',
    description: 'Cool stone paper with sharp ink and saffron accents.',
    preview: ['#1e293b', '#f1f5f9', '#ea580c'],
    vars: {
      '--ink': '#0f172a',
      '--muted': '#64748b',
      '--paper': '#f1f5f9',
      '--paper-2': '#e2e8f0',
      '--brand': '#1e293b',
      '--brand-deep': '#0f172a',
      '--accent': '#ea580c',
      '--line': 'rgba(15, 23, 42, 0.12)',
      '--panel': 'rgba(255, 255, 255, 0.92)',
      '--panel-strong': '#ffffff',
      '--shadow': '0 12px 40px rgba(15, 23, 42, 0.08)',
      '--glow-1': 'rgba(30, 41, 59, 0.08)',
      '--glow-2': 'rgba(234, 88, 12, 0.08)',
      '--danger': '#b91c1c',
      '--on-brand': '#f8fafc',
    },
  },
  {
    id: 'lagoon-mist',
    label: 'Lagoon Mist',
    description: 'Airy coastal blues with a bright lagoon brand.',
    preview: ['#0e7490', '#f0f9ff', '#ffffff'],
    vars: {
      '--ink': '#164e63',
      '--muted': '#0e7490',
      '--paper': '#f0f9ff',
      '--paper-2': '#e0f2fe',
      '--brand': '#0891b2',
      '--brand-deep': '#0e7490',
      '--accent': '#0e7490',
      '--line': 'rgba(14, 116, 144, 0.14)',
      '--panel': 'rgba(255, 255, 255, 0.92)',
      '--panel-strong': '#ffffff',
      '--shadow': '0 12px 40px rgba(8, 145, 178, 0.10)',
      '--glow-1': 'rgba(8, 145, 178, 0.10)',
      '--glow-2': 'rgba(8, 145, 178, 0.05)',
      '--danger': '#b91c1c',
      '--on-brand': '#ecfeff',
    },
  },
  {
    id: 'copper-slate',
    label: 'Copper Slate',
    description: 'Graphite surfaces with warm copper highlights.',
    preview: ['#b45309', '#1f2937', '#e5e7eb'],
    vars: {
      '--ink': '#f3f4f6',
      '--muted': '#9ca3af',
      '--paper': '#1f2937',
      '--paper-2': '#111827',
      '--brand': '#d97706',
      '--brand-deep': '#b45309',
      '--accent': '#67e8f9',
      '--line': 'rgba(243, 244, 246, 0.14)',
      '--panel': 'rgba(31, 41, 55, 0.92)',
      '--panel-strong': 'rgba(17, 24, 39, 0.96)',
      '--shadow': '0 12px 40px rgba(0, 0, 0, 0.4)',
      '--glow-1': 'rgba(217, 119, 6, 0.14)',
      '--glow-2': 'rgba(103, 232, 249, 0.08)',
      '--danger': '#fca5a5',
      '--on-brand': '#111827',
    },
  },
]

export const DEFAULT_THEME_ID: ThemeId = 'teal-yearbook'
export const THEME_STORAGE_KEY = 'yaadbuzz.theme'

export function getTheme(id: string | null | undefined): ThemeDefinition {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0]
}
