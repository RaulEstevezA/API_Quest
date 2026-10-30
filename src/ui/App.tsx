import { useState } from 'react'
import { getMission } from '../content/missions'
import { Dashboard } from './components/Dashboard'
import { Header } from './components/Header'
import { ApiDocs } from './components/ApiDocs'
import { MissionWorkspace } from './components/MissionWorkspace'
import { Sandbox } from './components/Sandbox'
import { useGameProgress } from './use-game-progress'
import { useLanguage } from './i18n'
import { OnboardingDialog } from './components/OnboardingDialog'

const ONBOARDING_STORAGE_KEY = 'api-quest.onboarding-seen'

function shouldShowOnboarding() {
  try { return localStorage.getItem(ONBOARDING_STORAGE_KEY) !== 'true' } catch { return true }
}

export function App() {
  const { language, setLanguage } = useLanguage()
  const { progress, storageAvailable, recordCompletion, reset } = useGameProgress()
  const [missionId, setMissionId] = useState<string | null>(null)
  const [view, setView] = useState<'missions' | 'docs' | 'sandbox'>('missions')
  const [showOnboarding, setShowOnboarding] = useState(shouldShowOnboarding)
  const mission = missionId ? getMission(missionId) : undefined

  const resetWithConfirmation = () => {
    const message = language === 'es' ? '¿Reiniciar todo el progreso y el XP?' : 'Reset all progress and XP?'
    if (window.confirm(message)) reset()
  }

  const closeOnboarding = () => {
    setShowOnboarding(false)
    try { localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true') } catch { /* It may reappear next visit when storage is unavailable. */ }
  }

  const startFirstMission = () => {
    closeOnboarding()
    setView('missions')
    setMissionId('first-request-1')
  }

  return <>
    <Header language={language} onLanguageChange={setLanguage} onHome={() => { setMissionId(null); setView('missions') }} onDocs={() => { setMissionId(null); setView('docs') }} onSandbox={() => { setMissionId(null); setView('sandbox') }} onHelp={() => setShowOnboarding(true)} />
    <main className="app-shell">
      {mission ? <MissionWorkspace key={mission.id} mission={mission} language={language} onBack={() => setMissionId(null)} onComplete={(xp, attempts, hints) => recordCompletion(mission.id, xp, attempts, hints)} /> : view === 'docs' ? <ApiDocs language={language} /> : view === 'sandbox' ? <Sandbox language={language} /> : <Dashboard language={language} progress={progress} storageAvailable={storageAvailable} onOpenMission={setMissionId} onReset={resetWithConfirmation} />}
    </main>
    <footer className="site-footer"><span>API Quest</span><a href="https://raulesteveza.github.io/">{language === 'es' ? 'Volver a la web' : 'Back to website'}</a></footer>
    <OnboardingDialog language={language} open={showOnboarding} onClose={closeOnboarding} onStart={startFirstMission} />
  </>
}
