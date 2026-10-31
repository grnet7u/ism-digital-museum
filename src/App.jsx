import { BrowserRouter, NavLink, Route, Routes, Link } from 'react-router-dom'
import { isSupabaseConfigured } from './lib/supabase'
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
export default function App() {
  return <BrowserRouter><header><Link className="brand" to="/">ISM <span>Digital Museum</span></Link><nav aria-label="Үндсэн цэс">{pages.map(([path,title]) => <NavLink key={path} to={path}>{title}</NavLink>)}</nav><Link className="login" to="/login">Нэвтрэх</Link></header>
    <main><aside className="setup-note" role="status">Хөгжүүлэлтийн эх загвар · {isSupabaseConfigured ? 'Холболтын утгууд тохирсон; бодит ажиллагааг шалгах шаардлагатай.' : 'Supabase хараахан тохируулаагүй.'}</aside>
    <Routes><Route path="/" element={<Home />} />{pages.map(([path,title]) => <Route key={path} path={path} element={<PendingPage title={title} />} />)}<Route path="/login" element={<PendingPage title="Нэвтрэх" />} /><Route path="*" element={<PendingPage title="Хуудас олдсонгүй" />} /></Routes></main>
    <footer>ISM Digital Museum · Оюутны төслийн хөгжүүлэлтийн хувилбар</footer>
  </BrowserRouter>
}
