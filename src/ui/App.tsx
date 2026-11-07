/**
 * Composition root of the interface: owns the current screen, injects the storage
 * and connects the screens to the state hooks. Game rules belong in `core/`.
 */

import { useEffect, useState } from 'react'
import { getMission } from '../content/missions'
import { uiText } from '../content/ui-text'
import type { StorageAdapter } from '../core/storage'
import { Backdrop } from './art/Backdrop'
import { browserStorage } from './browser-storage'
import { ApiDocs } from './components/ApiDocs'
import { Dashboard } from './components/Dashboard'
import { GameNav } from './components/GameNav'
import { Header } from './components/Header'
import { MissionWorkspace } from './components/MissionWorkspace'
import { OnboardingDialog } from './components/OnboardingDialog'
import { Sandbox } from './components/Sandbox'
import { useLanguage } from './i18n'
import { FIRST_MISSION_ID, INITIAL_SCREEN, type Screen } from './screens'
import { useGameProgress } from './use-game-progress'
import { useOnboarding } from './use-onboarding'

interface AppProps {
  /** Store for progress and preferences. Tests replace the browser one. */
  storage?: StorageAdapter
}

/** Renders the whole game. */
export function App({ storage = browserStorage }: AppProps) {
  const { language, setLanguage } = useLanguage(storage)
  const { progress, storageAvailable, progressWasReset, recordCompletion, reset } = useGameProgress(storage)
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

  const renderDashboard = () => (
    <Dashboard
      language={language}
      progress={progress}
      storageAvailable={storageAvailable}
      progressWasReset={progressWasReset}
      onOpenMission={(missionId) => setScreen({ name: 'mission', missionId })}
      onReset={resetWithConfirmation}
    />
  )

  const renderScreen = () => {
    switch (screen.name) {
      case 'missions':
        return renderDashboard()
      case 'docs':
        return <ApiDocs language={language} />
      case 'sandbox':
        return <Sandbox language={language} storage={storage} />
      case 'mission': {
        const mission = getMission(screen.missionId)
        // An unknown identifier cannot come from the catalogue, but it must not leave a blank page.
        if (!mission) return renderDashboard()
        return (
          <MissionWorkspace
            key={mission.id}
            mission={mission}
            language={language}
            onBack={() => setScreen({ name: 'missions' })}
            onComplete={(xp, attempts, hints) => recordCompletion(mission.id, xp, attempts, hints)}
          />
        )
      }
    }
  }

  return (
    <>
      <Backdrop prominent={screen.name === 'missions'} />
      <Header language={language} onLanguageChange={setLanguage} />
      <GameNav
        language={language}
        current={screen.name}
        onNavigate={(name) => setScreen({ name })}
        onHelp={onboarding.show}
      />
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
