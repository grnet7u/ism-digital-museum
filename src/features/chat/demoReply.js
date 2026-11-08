/**
 * Rule-based demo assistant: no AI and no network. Matches keywords (Mongolian or English)
 * and answers in the requested language with links into the site.
 */
const RULES = [
  { keys: ['сайн', 'hello', 'hi', 'hey', 'мэнд'],
    mn: 'Сайн байна уу! Би ISM музейн demo туслах. Бүтээл, багш, арга хэмжээ, технологийн хувьслын талаар асуугаарай.',
    en: 'Hello! I am the ISM museum demo assistant. Ask me about works, teachers, events or technology evolution.' },
  { keys: ['хувьсал', 'evolution', 'харьцуул', 'compare', 'trend', 'чиг'],
    mn: 'Технологийн хувьсал хуудсанд хоёр оныг сонгоод аль технологи хэдэн бүтээлд ашиглагдсаныг харьцуулна. Тоон дээр дарвал тухайн бүтээлүүд гарна.',
    en: 'On the Technology Evolution page pick two years to compare how many works used each technology. Click a number to see those works.',
    links: [['/evolution', ['Технологийн хувьсал', 'Technology Evolution']]] },
  { keys: ['нэмэх', 'оруулах', 'upload', 'add', 'submit', 'илгээх', 'шинэ бүтээл'],
    mn: 'Нэвтэрсний дараа "Миний бүтээл" → "+ Шинэ бүтээл" дээр дарж зураг, технологи, холбоосоо оруулна. Админ хянаад нийтэлнэ.',
    en: 'After logging in, open "My works" → "+ New work" and add an image, technologies and links. An admin reviews it before it is published.',
    links: [['/my-works/new', ['Шинэ бүтээл', 'New work']]] },
  { keys: ['бүтээл', 'exhibit', 'work', 'project', 'төсөл', 'хайх', 'search', 'filter', 'шүү'],
    mn: 'Бүтээлүүд хуудсанд гарчгаар хайж, он, ангилал, технологиор шүүж болно. Шүүлтүүр URL-д хадгалагддаг тул холбоосыг хуваалцаж болно.',
    en: 'On the Exhibits page you can search by title and filter by year, category and technology. Filters stay in the URL, so you can share the link.',
    links: [['/exhibits', ['Бүтээлүүд', 'Exhibits']]] },
  { keys: ['багш', 'teacher', 'professor', 'хичээл', 'course'],
    mn: 'Багш нар хуудсанд тэнхимийн багш нарын албан тушаал, заадаг хичээл, товч танилцуулга бий.',
    en: 'The Teachers page lists department teachers with their position, courses and a short bio.',
    links: [['/teachers', ['Багш нар', 'Teachers']]] },
  { keys: ['арга хэмжээ', 'event', 'зураг', 'photo', 'album', 'цомог'],
    mn: 'Арга хэмжээ хуудсанд үйл явдал бүр огноо, тайлбар, зурагт цомогтой.',
    en: 'Each event on the Events page has a date, a description and a photo album.',
    links: [['/events', ['Арга хэмжээ', 'Events']]] },
  { keys: ['түүх', 'history', 'он тоо', 'timeline'],
    mn: 'Тэнхимийн түүх хуудсанд чухал үйл явдлууд оны дарааллаар байна.',
    en: 'The History page shows department milestones in order of year.',
    links: [['/history', ['Түүх', 'History']]] },
  { keys: ['нэвтрэх', 'бүртгүүл', 'login', 'log in', 'sign', 'register', 'нууц үг', 'password'],
    mn: 'И-мэйлээрээ бүртгүүлээд ирсэн холбоосоор баталгаажуулна. Дараа нь нэвтэрч өөрийн бүтээлээ нэмнэ.',
    en: 'Sign up with your e-mail and confirm it with the link we send. Then log in to add your own works.',
    links: [['/login', ['Нэвтрэх', 'Log in']], ['/register', ['Бүртгүүлэх', 'Sign up']]] },
  { keys: ['бүтээгч', 'creator', 'оюутан', 'student', 'author'],
    mn: 'Бүтээгчид хуудсанд нийтлэгдсэн бүтээлтэй оюутнууд болон тэдний бүтээлүүд бий.',
    en: 'The Creators page shows students with published works and links to their projects.',
    links: [['/creators', ['Бүтээгчид', 'Creators']]] },
  { keys: ['ai', 'хиймэл', 'чи хэн', 'who are you', 'бот', 'bot'],
    mn: 'Би жинхэнэ хиймэл оюун биш, түлхүүр үгэнд тулгуурласан demo туслах. Ямар ч мэдээлэл гадагш илгээгддэггүй.',
    en: 'I am not a real AI, just a keyword-based demo assistant. Nothing you type leaves your browser.' },
]

const FALLBACK = {
  mn: 'Уучлаарай, ойлгосонгүй. Жишээ нь "бүтээл хайх", "технологийн хувьсал", "багш нар" эсвэл "бүтээл нэмэх" гэж асуугаарай.',
  en: 'Sorry, I did not get that. Try "search works", "technology evolution", "teachers" or "add a work".',
}

/** Returns { text, links: [[path, label]] } in the given language ('mn' | 'en'). */
export function demoReply(message, lang) {
  const text = message.toLowerCase()
  // Whole-word match for short Latin keys ("hi", "ai") so "this" or "said" do not trigger them.
  const hit = (key) => (/^[a-z]{1,3}$/.test(key) ? new RegExp(`\\b${key}\\b`).test(text) : text.includes(key))
  const rule = RULES.find((r) => r.keys.some(hit))
  const pick = (pair) => (lang === 'en' ? pair[1] : pair[0])
  if (!rule) return { text: FALLBACK[lang], links: [] }
  return { text: rule[lang], links: (rule.links ?? []).map(([path, label]) => [path, pick(label)]) }
}
