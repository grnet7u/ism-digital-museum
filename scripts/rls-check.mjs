// Real RLS matrix: visitor, creator A, creator B and admin, each with the publishable key only.
// Run: npm run rls-check   (reads .env.local; see docs/TESTS.md for the required test accounts)
import { createClient } from '@supabase/supabase-js'

const env = process.env
const need = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY', 'RLS_A_EMAIL', 'RLS_A_PASSWORD',
  'RLS_B_EMAIL', 'RLS_B_PASSWORD', 'RLS_ADMIN_EMAIL', 'RLS_ADMIN_PASSWORD']
const missing = need.filter((k) => !env[k])
if (missing.length) { console.error('Missing in .env.local:', missing.join(', ')); process.exit(2) }

const client = () => createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } })
async function signIn(prefix) {
  const c = client()
  const { data, error } = await c.auth.signInWithPassword({ email: env[`${prefix}_EMAIL`], password: env[`${prefix}_PASSWORD`] })
  if (error) throw new Error(`${prefix} login failed: ${error.message}`)
  return { c, id: data.user.id }
}

let failed = 0
const check = (name, ok, detail = '') => {
  if (!ok) failed++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok || !detail ? '' : ` — ${detail}`}`)
}

const visitor = client()
const A = await signIn('RLS_A'), B = await signIn('RLS_B'), admin = await signIn('RLS_ADMIN')
const tag = `rls-check ${new Date().toISOString()}`
const png = new Blob([Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10])], { type: 'image/png' })
const path = `exhibits/${A.id}/${crypto.randomUUID()}.png`

// Storage
let r = await A.c.storage.from('museum-media').upload(path, png, { contentType: 'image/png' })
check('A uploads into own folder', !r.error, r.error?.message)
r = await B.c.storage.from('museum-media').upload(`exhibits/${A.id}/${crypto.randomUUID()}.png`, png, { contentType: 'image/png' })
check('B cannot upload into A folder', Boolean(r.error))
r = await B.c.storage.from('museum-media').upload(path, png, { contentType: 'image/png', upsert: true })
check('B cannot overwrite A file', Boolean(r.error))
r = await A.c.storage.from('museum-media').upload(`exhibits/${A.id}/${crypto.randomUUID()}.txt`, new Blob(['x'], { type: 'text/plain' }), { contentType: 'text/plain' })
check('text/plain upload rejected', Boolean(r.error))
r = await visitor.storage.from('museum-media').createSignedUrl(path, 60)
check('visitor cannot sign unpublished image', Boolean(r.error))

// Exhibits
r = await A.c.from('exhibits').insert({ title: tag, creator_id: B.id }).select()
check('A cannot insert with B creator_id', Boolean(r.error))
r = await A.c.from('exhibits').insert({ title: tag, status: 'published' }).select()
check('A cannot insert published', Boolean(r.error))
r = await A.c.from('exhibits').insert({ title: tag, image_path: path, year_created: 2025, technology_stack: ['React'] }).select().single()
check('A inserts own draft', !r.error && r.data?.creator_id === A.id, r.error?.message)
const id = r.data?.id

r = await visitor.from('exhibits').select('id').eq('id', id)
check('visitor cannot read draft', !r.error && r.data.length === 0)
r = await B.c.from('exhibits').select('id').eq('id', id)
check('B cannot read A draft', !r.error && r.data.length === 0)
r = await B.c.from('exhibits').update({ title: 'hacked' }).eq('id', id).select()
check('B cannot update A exhibit', !r.data?.length)
r = await B.c.from('exhibits').delete().eq('id', id).select()
check('B cannot delete A exhibit', !r.data?.length)
r = await A.c.from('exhibits').update({ creator_id: B.id }).eq('id', id).select()
check('A cannot change creator_id', Boolean(r.error))
r = await A.c.from('exhibits').update({ moderation_note: 'self' }).eq('id', id).select()
check('A cannot write moderation note', Boolean(r.error))
r = await A.c.from('exhibits').update({ status: 'published' }).eq('id', id).select()
check('A cannot publish directly', Boolean(r.error))
r = await A.c.from('exhibits').update({ image_path: `exhibits/${B.id}/x.png` }).eq('id', id).select()
check('A cannot point image at B folder', Boolean(r.error))

r = await A.c.from('exhibits').update({ status: 'pending' }).eq('id', id).select().single()
check('A submits for review', r.data?.status === 'pending', r.error?.message)
r = await admin.c.from('exhibits').update({ status: 'published', moderation_note: null }).eq('id', id).select().single()
check('admin publishes', r.data?.status === 'published', r.error?.message)
r = await visitor.from('exhibits').select('id').eq('id', id)
check('visitor reads published', r.data?.length === 1)
r = await visitor.storage.from('museum-media').createSignedUrl(path, 60)
check('visitor can sign published image', !r.error, r.error?.message)
r = await A.c.from('exhibits').update({ title: `${tag} edited` }).eq('id', id).select().single()
check('editing published returns to pending', r.data?.status === 'pending', r.error?.message)
r = await visitor.from('exhibits').select('id').eq('id', id)
check('visitor no longer sees edited work', r.data?.length === 0)

// Self-promotion: user_metadata is user-editable and must not grant admin.
await A.c.auth.updateUser({ data: { role: 'admin' } })
await A.c.auth.refreshSession()
r = await A.c.from('teachers').insert({ name: tag }).select()
check('A with user_metadata.role=admin still cannot write teachers', Boolean(r.error))
r = await visitor.from('teachers').insert({ name: tag }).select()
check('visitor cannot write teachers', Boolean(r.error))
for (const table of ['events', 'history_entries', 'exhibition_categories']) {
  const row = { events: { title: tag, event_date: '2025-01-01' }, history_entries: { year: 2025, title: tag }, exhibition_categories: { name: tag } }[table]
  r = await B.c.from(table).insert(row).select()
  check(`B cannot write ${table}`, Boolean(r.error))
}
await A.c.auth.updateUser({ data: { role: null } })
r = await admin.c.from('teachers').insert({ name: tag }).select().single()
check('admin can write teachers', !r.error, r.error?.message)
if (r.data) await admin.c.from('teachers').delete().eq('id', r.data.id)

r = await A.c.from('profiles').update({ display_name: 'hacked' }).eq('id', B.id).select()
check('A cannot edit B profile', !r.data?.length)
r = await A.c.from('profiles').update({ avatar_path: path }).eq('id', A.id).select()
check('A cannot use exhibit file as avatar', Boolean(r.error))

// Cleanup (B delete must have left A's file intact first).
r = await B.c.storage.from('museum-media').remove([path])
r = await A.c.storage.from('museum-media').list(`exhibits/${A.id}`, { search: path.split('/').pop() })
check('B cannot delete A file', r.data?.length === 1)
r = await A.c.from('exhibits').delete().eq('id', id).select()
check('A deletes own exhibit', r.data?.length === 1, r.error?.message)
r = await A.c.storage.from('museum-media').remove([path])
check('A deletes own file', r.data?.length === 1, r.error?.message)

console.log(failed ? `\n${failed} check(s) FAILED` : '\nAll RLS checks passed')
process.exit(failed ? 1 : 0)
