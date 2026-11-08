import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { demoReply } from '../features/chat/demoReply'
import { t, usePrefs } from '../features/prefs/prefs-context'

const SUGGESTIONS = [['Бүтээл хайх', 'Search works'], ['Технологийн хувьсал', 'Technology evolution'], ['Бүтээл нэмэх', 'Add a work']]

/** Floating demo assistant. Replies come from local keyword rules (demoReply); nothing is sent anywhere. */
export default function ChatBot() {
  const { lang } = usePrefs()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { if (open) inputRef.current?.focus() }, [open])
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }) }, [messages, typing])
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  function send(text) {
    const question = text.trim()
    if (!question || typing) return
    setMessages((m) => [...m, { from: 'user', text: question }])
    setDraft('')
    setTyping(true)
    // Short pause so the demo feels conversational.
    setTimeout(() => { setMessages((m) => [...m, { from: 'bot', ...demoReply(question, lang) }]); setTyping(false) }, 450)
  }

  return <>
    {open && <section className="chat-panel" role="dialog" aria-label={t('Demo туслах', 'Demo assistant')}>
      <div className="chat-head">
        <div><strong>{t('ISM туслах', 'ISM assistant')}</strong><span>{t('Demo · бодит AI биш', 'Demo · not a real AI')}</span></div>
        <button className="chat-close" onClick={() => setOpen(false)} aria-label={t('Хаах', 'Close')}>×</button>
      </div>
      <div className="chat-log" aria-live="polite">
        <p className="msg bot">{t('Сайн байна уу! Музейн талаар юу мэдмээр байна?', 'Hi! What would you like to know about the museum?')}</p>
        {messages.map((m, i) => <div key={i} className={`msg ${m.from}`}>
          <p>{m.text}</p>
          {m.links?.length > 0 && <p className="msg-links">{m.links.map(([to, label]) => <Link key={to} to={to} onClick={() => setOpen(false)}>{label} →</Link>)}</p>}
        </div>)}
        {typing && <p className="msg bot typing" aria-label={t('Бичиж байна', 'Typing')}><span /><span /><span /></p>}
        <div ref={endRef} />
      </div>
      {messages.length === 0 && <div className="chat-suggest">{SUGGESTIONS.map((s) => <button key={s[0]} onClick={() => send(t(...s))}>{t(...s)}</button>)}</div>}
      <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(draft) }}>
        <input ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={300}
          placeholder={t('Асуултаа бичнэ үү…', 'Type your question…')} aria-label={t('Асуулт', 'Question')} />
        <button className="button" disabled={!draft.trim() || typing}>{t('Илгээх', 'Send')}</button>
      </form>
    </section>}
    <button className="chat-fab" onClick={() => setOpen((o) => !o)} aria-expanded={open}
      aria-label={open ? t('Туслахыг хаах', 'Close assistant') : t('Туслахаас асуух', 'Ask the assistant')}>
      {open ? '×' : <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M12 3C6.5 3 2 6.8 2 11.5c0 2.4 1.2 4.6 3.1 6.1L4 21l4.3-2.1c1.2.4 2.4.6 3.7.6 5.5 0 10-3.8 10-8.5S17.5 3 12 3Zm-4 9.7a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Zm4 0a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Zm4 0a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z" /></svg>}
    </button>
  </>
}
