import { BrowserRouter, NavLink, Route, Routes, Link } from 'react-router-dom'
import { isSupabaseConfigured } from './lib/supabase'
import AuthProvider from './features/auth/AuthProvider'
import { useAuth } from './features/auth/auth-context'
import { t, usePrefs } from './features/prefs/prefs-context'
import RequireAuth from './components/RequireAuth'
import ChatBot from './components/ChatBot'
import AuthPage from './pages/AuthPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import ExhibitsPage from './pages/ExhibitsPage'
import ExhibitDetailPage from './pages/ExhibitDetailPage'
import MyWorksPage from './pages/MyWorksPage'
import ExhibitFormPage from './pages/ExhibitFormPage'
import { TeacherDetailPage, TeachersPage } from './pages/TeacherPages'
import { EventDetailPage, EventsPage } from './pages/EventPages'
import { CreatorDetailPage, CreatorsPage } from './pages/CreatorPages'
import HistoryPage from './pages/HistoryPage'
import AdminPage from './pages/AdminPage'
import EvolutionPage from './pages/EvolutionPage'
import './App.css'

const pages = () => [
  ['/exhibits', t('Бүтээлүүд', 'Exhibits')], ['/teachers', t('Багш нар', 'Teachers')],
  ['/events', t('Арга хэмжээ', 'Events')], ['/history', t('Түүх', 'History')],
  ['/creators', t('Бүтээгчид', 'Creators')], ['/evolution', t('Технологийн хувьсал', 'Technology Evolution')],
]
function Home() {
  return <><section className="hero">
    <span className="eyebrow">UFE · ISM DIGITAL MUSEUM</span>
    <h1>{t('Түүх. Бүтээл.', 'History. Works.')}<br />{t('Технологийн хувьсал.', 'Technology evolution.')}</h1>
    <p>{t('Мэдээллийн системийн менежментийн тэнхимийн мэдлэг, бүтээл, хөгжлийн түүх.', 'Knowledge, student works and the story of the Management Information Systems department.')}</p>
    <div className="actions"><Link className="button" to="/exhibits">{t('Бүтээлүүд үзэх', 'Browse works')}</Link><Link className="button secondary" to="/evolution">{t('Технологийн хувьсал', 'Technology Evolution')}</Link></div>
  </section><section className="section"><h2>{t('Музейтэй танилцах', 'Explore the museum')}</h2><div className="grid">
    {pages().map(([path, title]) => <Link className="card" key={path} to={path}><h3>{title}</h3><span>{t('Хэсгийг нээх →', 'Open section →')}</span></Link>)}
  </div></section></>
}
function NotFound() {
  return <section className="section"><h1>{t('Хуудас олдсонгүй', 'Page not found')}</h1><p>{t('Таны хайсан хаяг байхгүй байна.', 'The address you are looking for does not exist.')}</p><Link to="/">{t('Нүүр рүү буцах', 'Back to home')}</Link></section>
}
function AccountLinks() {
  const { user, isAdmin, signOut } = useAuth()
  if (!user) return <Link className="login" to="/login">{t('Нэвтрэх', 'Log in')}</Link>
  return <div className="account">
    {isAdmin && <NavLink to="/admin">{t('Админ', 'Admin')}</NavLink>}
    <NavLink to="/my-works">{t('Миний бүтээл', 'My works')}</NavLink>
    <button className="button secondary-light" onClick={signOut}>{t('Гарах', 'Log out')}</button>
  </div>
}
function PrefToggles() {
  const { lang, theme, toggleLang, toggleTheme } = usePrefs()
  return <div className="toggles">
    <button className="toggle" onClick={toggleLang} aria-label={lang === 'mn' ? 'Switch to English' : 'Монгол хэл рүү шилжих'}>{lang === 'mn' ? 'EN' : 'MN'}</button>
    <button className="toggle" onClick={toggleTheme} aria-label={theme === 'dark' ? t('Цайвар горим', 'Light mode') : t('Бараан горим', 'Dark mode')}>{theme === 'dark' ? '☀' : '☾'}</button>
  </div>
}
const YEAR = new Date().getFullYear()
function Footer() {
  return <footer className="site-footer">
    <div className="footer-grid">
      <div>
        <Link className="brand" to="/">ISM <span>Digital Museum</span></Link>
        <p>{t('СЭЗИС-ийн Мэдээллийн системийн менежментийн тэнхимийн түүх, бүтээл, технологийн хувьслыг нэг дор.', 'History, student works and technology evolution of the UFE Management Information Systems department, in one place.')}</p>
      </div>
      <nav aria-label={t('Хөлийн цэс', 'Footer menu')}>
        <h3>{t('Музей', 'Museum')}</h3>
        {pages().map(([path, title]) => <Link key={path} to={path}>{title}</Link>)}
      </nav>
      <nav aria-label={t('Хэрэглэгч', 'Account')}>
        <h3>{t('Хэрэглэгч', 'Account')}</h3>
        <Link to="/login">{t('Нэвтрэх', 'Log in')}</Link>
        <Link to="/register">{t('Бүртгүүлэх', 'Sign up')}</Link>
        <Link to="/my-works">{t('Миний бүтээл', 'My works')}</Link>
      </nav>
      <div>
        <h3>{t('Төслийн тухай', 'About')}</h3>
        <p>{t('Интернет програмчлалын бие даалт. [Demo] гэж тэмдэглэсэн агуулга нь жишээ өгөгдөл бөгөөд тэнхимийн бодит түүх биш.', 'Internet programming coursework. Content marked [Demo] is sample data, not real department history.')}</p>
      </div>
    </div>
    <p className="footer-bottom">© {YEAR} ISM Digital Museum · UFE</p>
  </footer>
}
export default function App() {
  usePrefs() // re-render the whole tree when language or theme changes
  return <AuthProvider><BrowserRouter><header><Link className="brand" to="/">ISM <span>Digital Museum</span></Link><nav aria-label={t('Үндсэн цэс', 'Main menu')}>{pages().map(([path, title]) => <NavLink key={path} to={path}>{title}</NavLink>)}</nav><PrefToggles /><AccountLinks /></header>
    <main>{!isSupabaseConfigured && <aside className="setup-note" role="status">{t('Supabase хараахан тохируулаагүй. Өгөгдөл болон нэвтрэлт ажиллахгүй.', 'Supabase is not configured yet. Data and login will not work.')}</aside>}
    <Routes><Route path="/" element={<Home />} />
      <Route path="/teachers" element={<TeachersPage />} />
      <Route path="/teachers/:id" element={<TeacherDetailPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:id" element={<EventDetailPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/creators" element={<CreatorsPage />} />
      <Route path="/creators/:id" element={<CreatorDetailPage />} />
      <Route path="/evolution" element={<EvolutionPage />} />
      <Route path="/exhibits" element={<ExhibitsPage />} />
      <Route path="/exhibits/:id" element={<ExhibitDetailPage />} />
      <Route path="/my-works/new" element={<RequireAuth><ExhibitFormPage /></RequireAuth>} />
      <Route path="/my-works/:id/edit" element={<RequireAuth><ExhibitFormPage /></RequireAuth>} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/my-works" element={<RequireAuth><MyWorksPage /></RequireAuth>} />
      <Route path="/admin" element={<RequireAuth admin><AdminPage /></RequireAuth>} />
      <Route path="*" element={<NotFound />} /></Routes></main>
    <Footer />
    <ChatBot />
  </BrowserRouter></AuthProvider>
}
