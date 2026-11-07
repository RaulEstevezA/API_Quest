/**
 * Composition root of the interface: owns the current screen, injects the storage
 * and connects the screens to the state hooks. Game rules belong in `core/`.
 *
 * The website header appears only on the main menu. Every other screen is immersive,
 * and its only navigation is the way back in its `ScreenBar`.
 */

import { useEffect, useState, type ReactNode } from 'react'
import { getMission, missions } from '../content/missions'
import { uiText } from '../content/ui-text'
import { findFirstPendingMission, findNextMission } from '../core/progress'
import type { StorageAdapter } from '../core/storage'
import { Backdrop } from './art/Backdrop'
import { browserStorage } from './browser-storage'
import { AchievementsScreen } from './components/AchievementsScreen'
import { ApiDocs } from './components/ApiDocs'
import { Header } from './components/Header'
import { MainMenu } from './components/MainMenu'
import { MissionMap } from './components/MissionMap'
import { MissionWorkspace } from './components/MissionWorkspace'
import { OnboardingDialog } from './components/OnboardingDialog'
import { Sandbox } from './components/Sandbox'
import { ScreenBar } from './components/ScreenBar'
import { useLanguage } from './i18n'
import { FIRST_MISSION_ID, INITIAL_SCREEN, type Screen } from './screens'
import { useGameProgress } from './use-game-progress'
import { useOnboarding } from './use-onboarding'
import { useSandbox } from './use-sandbox'

interface AppProps {
  /** Store for progress and preferences. Tests replace the browser one. */
  storage?: StorageAdapter
}

/** Renders the whole game. */
export function App({ storage = browserStorage }: AppProps) {
  const { language, setLanguage } = useLanguage(storage)
  const { progress, storageAvailable, progressWasReset, recordCompletion, earnAchievement, reset } =
    useGameProgress(storage)
  const sandbox = useSandbox(storage, earnAchievement)
  const onboarding = useOnboarding(storage)
  const [screen, setScreen] = useState<Screen>(INITIAL_SCREEN)

  // Each screen is a new page for the player, so it must start at the top.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screen])

  const resetWithConfirmation = () => {
    if (window.confirm(uiText.menu.resetConfirmation[language])) reset()
  }

  const startFirstMission = () => {
    onboarding.close()
    setScreen({ name: 'mission', missionId: FIRST_MISSION_ID })
  }

  const backToMenu = () => setScreen({ name: 'menu' })

  const openMission = (missionId: string) => setScreen({ name: 'mission', missionId })

  // A first-time player has nothing to continue: Missions is the way in.
  const pendingMission = findFirstPendingMission(missions, progress)
  const canContinue = pendingMission !== null && Object.keys(progress.completedMissions).length > 0

  /** Adds the way back to the screens that have nothing else in their bar. */
  const withMenuBar = (content: ReactNode) => (
    <>
      <ScreenBar backLabel={uiText.menu.back[language]} onBack={backToMenu} />
      {content}
    </>
  )

  const renderMissionMap = () => (
    <MissionMap
      language={language}
      progress={progress}
      onBack={backToMenu}
      onOpenMission={openMission}
    />
  )

  const renderScreen = () => {
    switch (screen.name) {
      case 'menu':
        return (
          <MainMenu
            language={language}
            storageAvailable={storageAvailable}
            progressWasReset={progressWasReset}
            onContinue={canContinue ? () => openMission(pendingMission) : null}
            onNavigate={(name) => setScreen({ name })}
            onHelp={onboarding.show}
            onReset={resetWithConfirmation}
          />
        )
      case 'missions':
        return renderMissionMap()
      case 'docs':
        return withMenuBar(<ApiDocs language={language} />)
      case 'sandbox':
        return withMenuBar(<Sandbox language={language} sandbox={sandbox} />)
      case 'achievements':
        return withMenuBar(<AchievementsScreen language={language} earned={progress.achievements} />)
      case 'mission': {
        const mission = getMission(screen.missionId)
        // An unknown identifier cannot come from the catalogue, but it must not leave a blank page.
        if (!mission) return renderMissionMap()
        const nextId = findNextMission(missions, mission.id, progress)
        return (
          <MissionWorkspace
            key={mission.id}
            mission={mission}
            language={language}
            onBack={() => setScreen({ name: 'missions' })}
            onComplete={(xp, attempts, hints) => recordCompletion(mission.id, xp, attempts, hints)}
            onNext={nextId ? () => openMission(nextId) : null}
          />
        )
      }
    }
  }

  return (
    <>
      <Backdrop prominent={screen.name === 'menu'} lights={sandbox.lights} alarm={sandbox.alarm} />
      {screen.name === 'menu' && <Header language={language} onLanguageChange={setLanguage} />}
      <main className="app-shell">{renderScreen()}</main>
      <OnboardingDialog
        language={language}
        open={onboarding.open}
        onClose={onboarding.close}
        onStart={startFirstMission}
      />
    </>
  )
}
