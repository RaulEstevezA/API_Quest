import { useEffect, useRef } from 'react'
import type { Language } from '../i18n'

interface OnboardingDialogProps {
  language: Language
  open: boolean
  onClose: () => void
  onStart: () => void
}

export function OnboardingDialog({ language, open, onClose, onStart }: OnboardingDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="onboarding-dialog"
      aria-labelledby="onboarding-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close()
      }}
    >
      <div className="onboarding-dialog__header">
        <div>
          <p className="eyebrow">{language === 'es' ? 'Antes de empezar' : 'Before you start'}</p>
          <h2 id="onboarding-title">{language === 'es' ? 'Cómo funciona API Quest' : 'How API Quest works'}</h2>
        </div>
        <button className="icon-button" type="button" aria-label={language === 'es' ? 'Cerrar' : 'Close'} onClick={() => dialogRef.current?.close()}>×</button>
      </div>

      <div className="onboarding-dialog__body">
        <p className="onboarding-dialog__intro">
          {language === 'es'
            ? 'Aprenderás APIs REST resolviendo tareas similares a las que recibe un equipo de desarrollo. No necesitas experiencia previa: las primeras misiones te guían paso a paso.'
            : 'You will learn REST APIs by solving tasks similar to those handled by a development team. No previous experience is required: the first missions guide you step by step.'}
        </p>

        <ol className="onboarding-steps">
          <li><span>1</span><div><strong>{language === 'es' ? 'Lee la misión' : 'Read the mission'}</strong><p>{language === 'es' ? 'El objetivo indica qué información debes obtener o qué cambio debes realizar.' : 'The objective tells you what information to retrieve or what change to make.'}</p></div></li>
          <li><span>2</span><div><strong>{language === 'es' ? 'Construye la petición' : 'Build the request'}</strong><p>{language === 'es' ? 'Elige el método HTTP y completa el endpoint. Más adelante añadirás query parameters, headers y JSON.' : 'Choose the HTTP method and complete the endpoint. Later you will add query parameters, headers, and JSON.'}</p></div></li>
          <li><span>3</span><div><strong>{language === 'es' ? 'Envía y revisa la respuesta' : 'Send and review the response'}</strong><p>{language === 'es' ? 'Pulsa «Enviar petición». Si hay un error, recibirás una explicación concreta y podrás volver a intentarlo.' : 'Select “Send Request.” If something is wrong, you will receive specific feedback and can try again.'}</p></div></li>
          <li><span>4</span><div><strong>{language === 'es' ? 'Aprende del resultado' : 'Learn from the result'}</strong><p>{language === 'es' ? 'Al resolverla verás la respuesta de la API, una explicación y el XP conseguido.' : 'After solving it, you will see the API response, an explanation, and the XP earned.'}</p></div></li>
        </ol>

        <div className="onboarding-locations">
          <article><h3>Docs</h3><p>{language === 'es' ? 'Consulta los endpoints y parámetros disponibles cuando una misión no te dé toda la información.' : 'Check available endpoints and parameters when a mission does not provide every detail.'}</p></article>
          <article><h3>Sandbox</h3><p>{language === 'es' ? 'Practica libremente sin afectar a las misiones. Puedes crear, consultar, modificar y eliminar recursos.' : 'Practise freely without affecting missions. You can create, read, update, and delete resources.'}</p></article>
          <article><h3>{language === 'es' ? 'Pistas y progreso' : 'Hints and progress'}</h3><p>{language === 'es' ? 'Usa pistas si te bloqueas. El progreso se guarda solo en este navegador y puedes reiniciarlo cuando quieras.' : 'Use hints if you get stuck. Progress is stored only in this browser and can be reset at any time.'}</p></article>
        </div>

        <p className="onboarding-dialog__note">{language === 'es' ? 'Consejo: empieza por «Abre el catálogo». Solo necesitas elegir GET y escribir /products.' : 'Tip: start with “Open the catalogue.” You only need to choose GET and enter /products.'}</p>
      </div>

      <div className="onboarding-dialog__actions">
        <button className="button" type="button" onClick={() => dialogRef.current?.close()}>{language === 'es' ? 'Explorar primero' : 'Explore first'}</button>
        <button className="button button--primary" type="button" onClick={onStart}>{language === 'es' ? 'Empezar primera misión' : 'Start first mission'}</button>
      </div>
    </dialog>
  )
}
