const KEY = 'yaadbuzz.onboarding.v1'

export type OnboardingState = {
  completed?: boolean
  dismissed?: boolean
}

function read(): OnboardingState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    return JSON.parse(raw) as OnboardingState
  } catch {
    return {}
  }
}

function write(next: OnboardingState) {
  localStorage.setItem(KEY, JSON.stringify(next))
}

export function isOnboardingCompleted(): boolean {
  return !!read().completed
}

export function isOnboardingDismissed(): boolean {
  return !!read().dismissed
}

export function markOnboardingCompleted() {
  write({ ...read(), completed: true, dismissed: true })
}

export function markOnboardingDismissed() {
  write({ ...read(), dismissed: true })
}

export function clearOnboardingDismissed() {
  const state = read()
  write({ ...state, dismissed: false })
}

export function resetOnboardingForReplay() {
  const state = read()
  write({ ...state, dismissed: false })
}
