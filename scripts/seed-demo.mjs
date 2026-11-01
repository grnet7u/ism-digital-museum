// Demo content through the real API + RLS (admin and test creators, publishable key only).
// Everything is titled "[Demo]" so it is never mistaken for real department history.
// Run once: npm run seed-demo   (refuses to run twice)
import { createClient } from '@supabase/supabase-js'
import { deflateSync } from 'node:zlib'

const env = process.env
const client = () => createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } })
async function signIn(prefix) {
  const c = client()
  const { data, error } = await c.auth.signInWithPassword({ email: env[`${prefix}_EMAIL`], password: env[`${prefix}_PASSWORD`] })
  if (error) throw new Error(`${prefix}: ${error.message}`)
  return { c, id: data.user.id }
}
const must = ({ data, error }) => { if (error) throw error; return data }

// Minimal gradient PNG so no third-party image is needed.
function png([r, g, b], w = 640, h = 400) {
  const table = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0 })
  const crc = (buf) => { let c = -1; for (const x of buf) c = table[(c ^ x) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0 }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
    const body = Buffer.concat([Buffer.from(type), data]); const sum = Buffer.alloc(4); sum.writeUInt32BE(crc(body))
    return Buffer.concat([len, body, sum])
  }
  const raw = Buffer.alloc((w * 3 + 1) * h)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * (w * 3 + 1) + 1 + x * 3, t = (x + y) / (w + h)
    raw[i] = r * (1 - t) + 8 * t; raw[i + 1] = g * (1 - t) + 71 * t; raw[i + 2] = b * (1 - t) + 247 * t
  }
  const head = Buffer.alloc(13); head.writeUInt32BE(w); head.writeUInt32BE(h, 4); head[8] = 8; head[9] = 2
  return new Blob([Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', head), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])], { type: 'image/png' })
}
async function upload(c, folder, color) {
  const path = `${folder}/${crypto.randomUUID()}.png`
  must(await c.storage.from('museum-media').upload(path, png(color), { contentType: 'image/png' }))
  return path
}

const admin = await signIn('RLS_ADMIN'), A = await signIn('RLS_A'), B = await signIn('RLS_B')
if (must(await admin.c.from('events').select('id').like('title', '[Demo]%')).length) {
  console.log('Demo content already exists — nothing done.'); process.exit(0)
}

const events = [
  { title: '[Demo] Тэнхимийн өдөрлөгийн жишээ', event_date: '2025-04-18', color: [8, 4, 91],
    description: 'Demo: зурагт цомгийн боломжийг харуулах туршилтын арга хэмжээ. Бодит арга хэмжээ биш.',
    photos: ['Demo зураг 1', 'Demo зураг 2', 'Demo зураг 3'] },
  { title: '[Demo] Програмчлалын тэмцээний жишээ', event_date: '2024-11-22', color: [0, 120, 90],
    description: 'Demo: огноо, тайлбар, цомгийн бүтцийг шалгах туршилтын бичлэг. Бодит арга хэмжээ биш.',
    photos: ['Demo зураг 1', 'Demo зураг 2'] },
]
for (const ev of events) {
  const row = must(await admin.c.from('events').insert({ title: ev.title, event_date: ev.event_date, description: ev.description,
    cover_image_path: await upload(admin.c, 'events', ev.color), published: true }).select().single())
  for (const [i, caption] of ev.photos.entries()) {
    must(await admin.c.from('event_photos').insert({ event_id: row.id, caption, sort_order: i,
      image_path: await upload(admin.c, `events/${row.id}`, [ev.color[0] + 40 * i, ev.color[1], ev.color[2]]) }))
  }
}

must(await admin.c.from('history_entries').insert([
  { year: 2024, title: '[Demo] Түүхийн хэсгийн жишээ бичлэг', published: true,
    description: 'Demo: тэнхимийн түүхийн баталгаажсан мэдээлэл ирэхэд энэ бичлэгийг устгаж, эх сурвалжтай бодит бичлэг оруулна.' },
  { year: 2025, title: '[Demo] Он цагийн дарааллын жишээ', published: true,
    description: 'Demo: түүхийн бичлэгүүд он дарааллаар харагдаж байгааг харуулна. Бодит түүх биш.' },
]))

const categories = Object.fromEntries(must(await admin.c.from('exhibition_categories').select('id, name')).map((c) => [c.name, c.id]))
const exhibits = [
  [A, 2022, 'Веб аппликейшн', '[Demo] Номын сангийн бүртгэл', ['PHP', 'MySQL', 'jQuery', 'Bootstrap'], [190, 90, 20]],
  [B, 2022, 'Өгөгдлийн сан ба анализ', '[Demo] Борлуулалтын тайлан', ['Excel', 'SQL', 'Power BI'], [150, 30, 60]],
  [A, 2023, 'Веб аппликейшн', '[Demo] Оюутны клубын сайт', ['PHP', 'MySQL', 'JavaScript', 'Bootstrap'], [200, 120, 0]],
  [B, 2023, 'Мобайл аппликейшн', '[Demo] Хичээлийн хуваарь апп', ['Java', 'Android', 'Firebase'], [20, 140, 60]],
  [A, 2024, 'Веб аппликейшн', '[Demo] Дадлагын зар', ['React', 'JavaScript', 'Node.js', 'PostgreSQL'], [30, 90, 200]],
  [B, 2024, 'Өгөгдлийн сан ба анализ', '[Demo] Элсэлтийн өгөгдлийн шинжилгээ', ['Python', 'Pandas', 'SQL', 'Power BI'], [110, 40, 160]],
  [A, 2025, 'Веб аппликейшн', '[Demo] Цахим музейн прототип', ['React', 'JavaScript', 'Supabase', 'PostgreSQL'], [8, 71, 247]],
  [B, 2025, 'Мобайл аппликейшн', '[Demo] Хоолны захиалгын апп', ['Flutter', 'Dart', 'Supabase'], [0, 150, 150]],
  [B, 2025, 'Судалгаа', '[Demo] Хиймэл оюуны чатботын судалгаа', ['Python', 'OpenAI API', 'React'], [90, 20, 120]],
]
for (const [who, year, category, title, tech, color] of exhibits) {
  const row = must(await who.c.from('exhibits').insert({ title, year_created: year, category_id: categories[category], technology_stack: tech,
    description: 'Demo: Technology Evolution болон хайлтыг шалгах зорилгоор оруулсан туршилтын бүтээл. Бодит оюутны ажил биш.',
    image_path: await upload(who.c, `exhibits/${who.id}`, color), status: 'pending' }).select().single())
  must(await admin.c.from('exhibits').update({ status: 'published' }).eq('id', row.id))
}
must(await A.c.from('profiles').update({ bio: 'Demo бүтээгчийн профайл (туршилтын хэрэглэгч).' }).eq('id', A.id))
must(await B.c.from('profiles').update({ bio: 'Demo бүтээгчийн профайл (туршилтын хэрэглэгч).' }).eq('id', B.id))
console.log(`Seeded ${events.length} demo events, 2 history entries, ${exhibits.length} published demo exhibits.`)
