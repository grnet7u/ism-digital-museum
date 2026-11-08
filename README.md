# ISM Digital Museum

UFE, Мэдээллийн системийн менежментийн тэнхимийн цахим музей. Интернет програмчлалын бие даалт.

Тэнхимийн багш нар, арга хэмжээ, түүх, оюутны бүтээлүүдийг нэг дор үзүүлж, бүтээлүүдэд ашигласан технологийн хувьслыг оноор харьцуулна.

**Production URL:** _(Vercel-д байршуулсны дараа энд бичнэ)_

## Боломжууд

| Хэсэг | Зам | Хэн |
|---|---|---|
| Бүтээлүүд: гарчгаар хайх, он/ангилал/технологиор шүүх (URL-д хадгалагдана) | `/exhibits`, `/exhibits/:id` | Бүгд |
| Технологийн хувьсал: он бүрийн тоо, хоёр оны харьцуулалт, дарж шүүх | `/evolution` | Бүгд |
| Багш нар, арга хэмжээ (зургийн цомог), тэнхимийн түүх, бүтээгчид | `/teachers`, `/events`, `/history`, `/creators` | Бүгд |
| Бүртгүүлэх, нэвтрэх (имэйл баталгаажуулалттай) | `/register`, `/login` | Зочин |
| Өөрийн бүтээл нэмэх/засах/устгах, зураг байршуулах, хянуулахаар илгээх | `/my-works` | Нэвтэрсэн хэрэглэгч |
| Бүтээл нийтлэх/буцаах, багш/арга хэмжээ/түүх/ангилал удирдах | `/admin` | Админ |

Мөн: Монгол/Англи хэл солих, цайвар/бараан горим (системийн тохиргоог дагана), demo туслах чатбот (түлхүүр үгэнд тулгуурласан, AI/API ашиглаагүй, мэдээлэл гадагш илгээхгүй).

Бүтээлийн төлөв: `draft → pending → published`. Нийтлэх эрх зөвхөн админд байна, үүнийг өгөгдлийн сангийн trigger болон RLS хамгаална (UI-д найддаггүй).

## Технологи

React 19, Vite, React Router, Supabase (Postgres + Auth + Storage + Row Level Security), CSS, Vitest, oxlint. Hosting: Vercel.

```
src/pages/        хуудсууд
src/components/   давтагддаг UI (ExhibitCard, LoadState, RequireAuth…)
src/features/     цэвэр логик: evolution/aggregate.js, exhibits/validate.js, exhibits/filter.js, auth
src/services/     Supabase query-нууд (exhibits, content, storage)
supabase/         migration (schema, RLS, storage policy), config
scripts/          rls-check.mjs (олон хэрэглэгчийн RLS шалгалт), seed-demo.mjs
tests/            Vitest
docs/             төлөвлөгөө, архитектур (ERD), дизайн, тест, deployment, явц
```

Өгөгдлийн бүтэц болон ERD: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). Байршуулах заавар: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md). Демо скрипт: [`docs/TESTS.md`](docs/TESTS.md).

## Local дээр ажиллуулах

Node 24.x, npm.

```powershell
npm ci
copy .env.example .env.local   # дараа нь VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY-г бөглөнө
npm run dev                     # http://127.0.0.1:5173
```

Зөвхөн **publishable** key ашиглана. Service-role/secret key-г frontend болон Git-д хэзээ ч бүү оруул.

## Командууд

| Команд | Үйлдэл |
|---|---|
| `npm run dev` | Local server (5173) |
| `npm run check` | Lint + unit test + production build |
| `npm run test` | Vitest (aggregation, filter, validation, upload compensation, auth) |
| `npm run build` / `npm run preview` | `dist` үүсгэх / local дээр харах |
| `npm run rls-check` | Бодит Supabase дээр зочин/A/B/админ эрхийг шалгах (`.env.local`-д тест аккаунт хэрэгтэй) |
| `npm run seed-demo` | **[Demo]** гэж тэмдэглэсэн жишээ өгөгдөл нэмэх |

## Агуулгын тухай

**[Demo]** гэж эхэлсэн бүтээл, арга хэмжээ, түүх нь функцийг харуулах жишээ өгөгдөл бөгөөд тэнхимийн бодит түүх биш. Багшийн мэдээллийг зөвшөөрөл баталгаажсаны дараа л нийтэлнэ, дэлгэрэнгүйг [`docs/CONTENT.md`](docs/CONTENT.md)-ээс харна уу. Demo зургууд нь генерацласан градиент тул гуравдагч этгээдийн зураг ашиглаагүй.
