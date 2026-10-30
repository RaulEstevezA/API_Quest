import { useState } from 'react'
import { getMission } from '../content/missions'
import { Dashboard } from './components/Dashboard'
import { Header } from './components/Header'
import { ApiDocs } from './components/ApiDocs'
import { MissionWorkspace } from './components/MissionWorkspace'
import { Sandbox } from './components/Sandbox'
import { useGameProgress } from './use-game-progress'
import { useLanguage } from './i18n'

export function App() {
  const { language, setLanguage } = useLanguage()
  const { progress, storageAvailable, recordCompletion, reset } = useGameProgress()
  const [missionId, setMissionId] = useState<string | null>(null)
  const [view, setView] = useState<'missions' | 'docs' | 'sandbox'>('missions')
  const mission = missionId ? getMission(missionId) : undefined

  const resetWithConfirmation = () => {
    const message = language === 'es' ? '¿Reiniciar todo el progreso y el XP?' : 'Reset all progress and XP?'
    if (window.confirm(message)) reset()
  }

  return <>
    <Header language={language} onLanguageChange={setLanguage} onHome={() => { setMissionId(null); setView('missions') }} onDocs={() => { setMissionId(null); setView('docs') }} onSandbox={() => { setMissionId(null); setView('sandbox') }} />
    <main className="app-shell">
      {mission ? <MissionWorkspace key={mission.id} mission={mission} language={language} onBack={() => setMissionId(null)} onComplete={(xp, attempts, hints) => recordCompletion(mission.id, xp, attempts, hints)} /> : view === 'docs' ? <ApiDocs language={language} /> : view === 'sandbox' ? <Sandbox language={language} /> : <Dashboard language={language} progress={progress} storageAvailable={storageAvailable} onOpenMission={setMissionId} onReset={resetWithConfirmation} />}
    </main>
    <footer className="site-footer"><span>API Quest</span><a href="https://raulesteveza.github.io/">{language === 'es' ? 'Volver a la web' : 'Back to website'}</a></footer>
  </>
}
