export type TourStep = {
  id: string
  /** Value of `data-tour` on the target element */
  target: string
  titleKey: string
  bodyKey: string
  /** Navigate here before highlighting (supports `:orgId` / `:teamId`) */
  path?: string
  /** Team tab query param when on a team page */
  tab?: string
}

const TEAM_TABS = [
  'members',
  'tributes',
  'characteristics',
  'memories',
  'topics',
  'search',
  'yearbook',
  'settings',
] as const

export type TourContextIds = {
  orgId?: string
  teamId?: string
}

function resolvePath(path: string, ids: TourContextIds): string {
  return path
    .replace(':orgId', ids.orgId ?? '')
    .replace(':teamId', ids.teamId ?? '')
}

export function buildTourSteps(ids: TourContextIds): TourStep[] {
  const steps: TourStep[] = [
    {
      id: 'orgs-list',
      target: 'orgs-list',
      titleKey: 'onboarding.steps.orgsList.title',
      bodyKey: 'onboarding.steps.orgsList.body',
      path: '/app',
    },
    {
      id: 'create-org',
      target: 'create-org',
      titleKey: 'onboarding.steps.createOrg.title',
      bodyKey: 'onboarding.steps.createOrg.body',
      path: '/app',
    },
    {
      id: 'join-team',
      target: 'join-team',
      titleKey: 'onboarding.steps.joinTeam.title',
      bodyKey: 'onboarding.steps.joinTeam.body',
      path: '/app',
    },
  ]

  if (ids.orgId) {
    steps.push(
      {
        id: 'teams-list',
        target: 'teams-list',
        titleKey: 'onboarding.steps.teamsList.title',
        bodyKey: 'onboarding.steps.teamsList.body',
        path: '/orgs/:orgId',
      },
      {
        id: 'create-team',
        target: 'create-team',
        titleKey: 'onboarding.steps.createTeam.title',
        bodyKey: 'onboarding.steps.createTeam.body',
        path: '/orgs/:orgId',
      },
    )
  }

  if (ids.teamId) {
    for (const tab of TEAM_TABS) {
      steps.push({
        id: `tab-${tab}`,
        target: `tab-${tab}`,
        titleKey: `onboarding.steps.tabs.${tab}.title`,
        bodyKey: `onboarding.steps.tabs.${tab}.body`,
        path: '/teams/:teamId',
        tab,
      })
    }
  } else if (ids.orgId) {
    steps.push({
      id: 'empty-continue',
      target: 'create-team',
      titleKey: 'onboarding.steps.emptyContinue.title',
      bodyKey: 'onboarding.steps.emptyContinue.body',
      path: '/orgs/:orgId',
    })
  } else {
    steps.push({
      id: 'empty-continue',
      target: 'create-org',
      titleKey: 'onboarding.steps.emptyContinue.title',
      bodyKey: 'onboarding.steps.emptyContinue.body',
      path: '/app',
    })
  }

  return steps.map((step) =>
    step.path ? { ...step, path: resolvePath(step.path, ids) } : step,
  )
}

export function tourTargetSelector(target: string): string {
  return `[data-tour="${target}"]`
}
