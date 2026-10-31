# ISM Digital Museum

UFE Интернет програмчлалын бие даалт. **Хөгжүүлэгч: Claude Code.**
Энэ repository нь ажиллах суурь орчин, дэлгэрэнгүй хэрэгжүүлэх төлөвлөгөөтэй. Бүх функц дуусаагүй.

## Эхлэх

Node 24.x, npm. Сангууд энэ компьютерт суусан; өөр компьютерт `npm ci`.

```powershell
npm run dev
```

Нээх: http://127.0.0.1:5173 . Supabase тохируулаагүй үед эх загвар өөрийн төлөвөө тодорхой харуулна.

Supabase холбох үед `.env.example`-ийг `.env.local` болгон хуулж, зөв project-ийн URL болон publishable key-г editor дотор бөглөнө. Secret/service-role түлхүүр бүү ашигла.

## Claude-д өгөх

Эхлээд `CLAUDE.md`, дараа нь `docs/CLAUDE-START.md` доторх prompt. Нарийвчилсан төлөвлөгөө `docs/PLAN.md`; DB/эрх `docs/ARCHITECTURE.md`; загвар `docs/DESIGN.md`; шалгах зүйл `docs/TESTS.md`; deployment `docs/DEPLOYMENT.md`; явц `docs/STATUS.md`.

## Команд

| Команд | Үйлдэл |
|---|---|
| npm run dev | Local server, 5173 |
| npm run check | Lint + unit tests + production build |
| npm run test | Aggregation tests |
| npm run build | dist үүсгэх |
| npm run preview | Production bundle-ийг local харах |

## Технологи ба бүтэц

React/JavaScript, Vite, React Router, Supabase client, CSS, Vitest. `src/` код; `tests/` тест; `docs/` заавар. SQL migrations-ийг Claude M1 үе шатанд нэмнэ. Vercel тохиргоо бэлэн, cloud deployment хийгдээгүй.

Багшийн 10 профайлын өмнөх судалгаа `docs/reference/teacher-research.md`-д локалаар бий. PDF болон зураг мөн reference хавтаст байна. Эдгээр нь Git-д орохгүй; шинэ checkout-д зөвшөөрөгдсөн reference-ийг тусад нь авах шаардлагатай. Зөвшөөрөлтэй, нягталсан нийтэд харагдах агуулгыг л seed болгоно.

## Одоогийн хязгаар

Нэвтрэлт/өгөгдөл/зураг/RLS/admin/бүтээлч UI хэрэгжээгүй. Supabase project, GitHub remote, Vercel URL байхгүй. UI-ийн placeholder-уудыг бодит ажиллагаатай гэж үзэхгүй. Эцсийн хүлээн авах шалгуурыг PLAN/TESTS-ээс хар.
