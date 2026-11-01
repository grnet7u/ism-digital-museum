import { BrowserRouter, NavLink, Route, Routes, Link } from 'react-router-dom'
import { isSupabaseConfigured } from './lib/supabase'
import AuthProvider from './features/auth/AuthProvider'
import { useAuth } from './features/auth/auth-context'
import RequireAuth from './components/RequireAuth'
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
import './App.css'

const pages = [
  ['/exhibits', 'Бүтээлүүд'], ['/teachers', 'Багш нар'],
  ['/events', 'Арга хэмжээ'], ['/history', 'Түүх'],
  ['/creators', 'Бүтээгчид'], ['/evolution', 'Технологийн хувьсал'],
]
function Home() {
  return <><section className="hero">
    <span className="eyebrow">UFE · ISM DIGITAL MUSEUM</span>
    <h1>Түүх. Бүтээл.<br />Технологийн хувьсал.</h1>
    <p>Мэдээллийн системийн менежментийн тэнхимийн мэдлэг, бүтээл, хөгжлийн түүх.</p>
    <div className="actions"><Link className="button" to="/exhibits">Бүтээлүүд үзэх</Link><Link className="button secondary" to="/evolution">Технологийн хувьсал</Link></div>
  </section><section className="section"><h2>Музейтэй танилцах</h2><div className="grid">
    {pages.map(([path, title]) => <Link className="card" key={path} to={path}><h3>{title}</h3><span>Хэсгийг нээх →</span></Link>)}
  </div></section></>
}
function PendingPage({ title }) {
  return <section className="section"><p className="eyebrow">ХӨГЖҮҮЛЭЛТИЙН СУУРЬ</p><h1>{title}</h1><p>Энэ хэсгийн өгөгдөл болон үйлдлүүдийг дараагийн үе шатанд холбоно.</p><Link to="/">Нүүр рүү буцах</Link></section>
}
function NotFound() {
  return <section className="section"><h1>Хуудас олдсонгүй</h1><p>Таны хайсан хаяг байхгүй байна.</p><Link to="/">Нүүр рүү буцах</Link></section>
}
function AccountLinks() {
  const { user, isAdmin, signOut } = useAuth()
  if (!user) return <Link className="login" to="/login">Нэвтрэх</Link>
  return <div className="account">
    {isAdmin && <NavLink to="/admin">Админ</NavLink>}
    <NavLink to="/my-works">Миний бүтээл</NavLink>
    <button className="button secondary-light" onClick={signOut}>Гарах</button>
  </div>
}
export default function App() {
  return <AuthProvider><BrowserRouter><header><Link className="brand" to="/">ISM <span>Digital Museum</span></Link><nav aria-label="Үндсэн цэс">{pages.map(([path,title]) => <NavLink key={path} to={path}>{title}</NavLink>)}</nav><AccountLinks /></header>
    <main>{!isSupabaseConfigured && <aside className="setup-note" role="status">Supabase хараахан тохируулаагүй. Өгөгдөл болон нэвтрэлт ажиллахгүй.</aside>}
    <Routes><Route path="/" element={<Home />} />
      <Route path="/teachers" element={<TeachersPage />} />
      <Route path="/teachers/:id" element={<TeacherDetailPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:id" element={<EventDetailPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/creators" element={<CreatorsPage />} />
      <Route path="/creators/:id" element={<CreatorDetailPage />} />
      <Route path="/evolution" element={<PendingPage title="Технологийн хувьсал" />} />
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
    <footer>ISM Digital Museum · Оюутны төслийн хөгжүүлэлтийн хувилбар</footer>
  </BrowserRouter></AuthProvider>
}
