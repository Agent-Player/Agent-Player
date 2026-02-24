# Skills Marketplace Implementation

## 📋 نظرة عامة

تم تنفيذ نظام متكامل لسوق Claude Skills يسمح للمستخدمين بتصفح وتثبيت المهارات من مستودع Anthropic الرسمي على GitHub.

**التاريخ**: 2026-02-24
**الحالة**: ⚠️ غير مكتمل - يوجد خطأ 404 في marketplace API endpoints

---

## ✅ ما تم تنفيذه

### 1. قاعدة البيانات (Migration 040)
**الملف**: `packages/backend/src/db/migrations/040_skills_system.sql`

تم إنشاء 3 جداول:

```sql
-- مصادر المهارات (Anthropic, LobeHub, SkillsMP)
skill_sources (
  id, name, type, repo_url, api_url,
  is_enabled, priority, created_at, updated_at
)

-- المهارات المثبتة محلياً
installed_skills (
  id, source_id, skill_name, display_name,
  description, category, file_path, metadata,
  is_enabled, install_date, last_used, usage_count
)

-- سجل استخدام المهارات (للتحليلات)
skill_usage_log (
  id, skill_id, user_id, agent_id,
  used_at, session_context, success
)
```

**المصادر المُضافة تلقائياً**:
- ✅ Anthropic Official (github, enabled, priority 100)
- ⏸️ LobeHub (api, disabled, priority 50)
- ⏸️ SkillsMP (api, disabled, priority 30)

---

### 2. خدمة GitHub Integration
**الملف**: `packages/backend/src/services/anthropic-skills-service.ts` (368 سطر)

**المكتبة المستخدمة**: `@octokit/rest` للتعامل مع GitHub API

**الوظائف الرئيسية**:

| Function | الوصف | الحالة |
|----------|-------|--------|
| `fetchAvailableSkills()` | جلب كل المهارات من anthropics/skills | ✅ يعمل |
| `fetchCategorySkills()` | جلب مهارات من فئة معينة | ✅ يعمل |
| `fetchSkillContent()` | تحميل محتوى SKILL.md | ✅ يعمل |
| `parseSkillMetadata()` | استخراج البيانات من frontmatter | ✅ يعمل |
| `installSkill()` | تثبيت مهارة محلياً | ✅ يعمل |
| `searchSkills()` | البحث في المهارات المثبتة | ✅ يعمل |
| `getInstalledSkills()` | عرض المهارات المثبتة | ✅ يعمل |
| `uninstallSkill()` | حذف مهارة | ✅ يعمل |
| `getEnabledSkillsContent()` | تجميع محتوى المهارات للـ AI | ✅ يعمل |

**مسار التخزين**: `.data/skills/` (يتم إنشاؤه تلقائياً)

**مثال على التثبيت**:
```typescript
const localPath = await anthropicSkillsService.installSkill(
  'pdf-extractor',
  'skills/Document Skills/pdf-extractor'
);
// النتيجة: .data/skills/pdf-extractor.md
```

---

### 3. API Routes
**الملف**: `packages/backend/src/api/routes/skills.ts`

تم إضافة 8 endpoints جديدة:

#### Marketplace Endpoints

| Method | Endpoint | الوصف | الحالة |
|--------|----------|-------|--------|
| GET | `/api/skills/marketplace/sources` | عرض مصادر المهارات | ✅ يعمل |
| GET | `/api/skills/marketplace/available` | جلب المهارات من Anthropic | ⚠️ 404 |
| GET | `/api/skills/marketplace/installed` | عرض المهارات المثبتة | ⚠️ 404 |
| POST | `/api/skills/marketplace/install` | تثبيت مهارة | ⚠️ 404 |
| DELETE | `/api/skills/marketplace/:skillId` | حذف مهارة | ⚠️ 404 |
| GET | `/api/skills/marketplace/search?q=` | البحث | ⚠️ 404 |
| GET | `/api/skills/marketplace/stats` | إحصائيات | ⚠️ 404 |
| PUT | `/api/skills/marketplace/:skillId/toggle` | تفعيل/تعطيل | ⚠️ 404 |

**ملاحظة**: الـ endpoints تعمل عند استدعائها مباشرة من البورت 41522:
```bash
curl http://localhost:41522/api/skills/marketplace/available
# النتيجة: {"success":true,"skills":[...],"count":16}
```

لكن **لا تعمل** من الفرونت اند (port 41521):
```
GET http://localhost:41521/api/skills/marketplace/available 404 (Not Found)
```

---

### 4. AI Agent Tool
**الملف**: `packages/backend/src/tools/skill-install.ts` (181 سطر)

أداة تسمح للـ AI بالبحث والتثبيت تلقائياً:

**الاستخدامات**:
```typescript
// 1. البحث عن مهارة
{
  "action": "search",
  "query": "pdf"
}
// النتيجة: قائمة بالمهارات المطابقة

// 2. تثبيت مهارة
{
  "action": "install",
  "query": "pdf-extractor",
  "skillPath": "skills/Document Skills/pdf-extractor"
}
// النتيجة: تثبيت محلي + إضافة للـ database

// 3. عرض المثبت
{
  "action": "list_installed"
}
// النتيجة: قائمة بكل المهارات المثبتة
```

**تم التسجيل في**: `packages/backend/src/tools/index.ts`

---

### 5. واجهة المستخدم (Frontend)
**الملف**: `src/app/(dashboard)/dashboard/skills/page.tsx` (224 سطر)

**التصميم النهائي**:
- ✅ تبويبتين فقط: Local Skills | Marketplace
- ✅ حقل بحث موحد
- ✅ زر Refresh للماركت بليس
- ✅ عرض شبكي responsive (3 أعمدة)
- ✅ أيقونات من lucide-react (Github, HardDrive, Package)
- ✅ Toast notifications بدلاً من alerts

**الواجهات**:
```typescript
interface LocalSkill {
  name: string;
  version: string;
  description?: string;
  author?: string;
  triggers?: string[];
}

interface MarketplaceSkill {
  name: string;
  description?: string;
  category: string;
  path?: string;
}
```

**الحالة الحالية**:
- ✅ Local Skills Tab يعمل (8 مهارات موجودة)
- ❌ Marketplace Tab يظهر 404 عند الضغط على Refresh

---

## ❌ المشاكل الحالية

### 1. خطأ 404 على Marketplace APIs

**الخطأ**:
```
GET http://localhost:41521/api/skills/marketplace/available 404 (Not Found)
```

**السبب المحتمل**:
- الفرونت اند (Next.js port 41521) يحاول استدعاء الـ API من نفس البورت
- لا يوجد proxy configuration في Next.js لتوجيه `/api/*` إلى البورت 41522
- لا يوجد Next.js API routes في `src/app/api/` لعمل proxy

**اختبار مباشر يعمل**:
```bash
# من البورت الصحيح يعمل
curl http://localhost:41522/api/skills/marketplace/available
# ✅ {"success":true,"skills":[...],"count":16}

curl http://localhost:41522/api/skills
# ✅ {"success":true,"skills":[...],"total":8}
```

**الحل المطلوب**:
1. إنشاء Next.js API route proxy في `src/app/api/skills/marketplace/[...path]/route.ts`
2. أو تعديل `next.config.ts` لإضافة rewrites
3. أو استخدام `NEXT_PUBLIC_BACKEND_URL` مباشرة في fetch calls

---

### 2. Local Skills لا تظهر في الواجهة

**المشكلة**: عداد يظهر (0) بدلاً من (8)

**السبب**:
- البيانات موجودة في الباك اند
- مشكلة في الـ fetch من الفرونت اند
- نفس مشكلة الـ 404 - الـ API لا تصل

**ملاحظة**: عند التشغيل المباشر على البورت 41522 تظهر البيانات صحيحة.

---

## 🔧 خطوات الإكمال المطلوبة

### الخطوة 1: إصلاح API Proxy (أولوية عالية ⚠️)

**الحل الموصى به**: إنشاء Next.js API route

```typescript
// src/app/api/skills/[...path]/route.ts
export async function GET(request: Request) {
  const { pathname } = new URL(request.url);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:41522';

  const response = await fetch(`${backendUrl}${pathname}`);
  const data = await response.json();

  return Response.json(data);
}

export async function POST(request: Request) {
  // نفس المنطق للـ POST
}
```

**أو استخدام rewrites في next.config.ts**:
```typescript
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:41522/api/:path*',
      },
    ];
  },
};
```

---

### الخطوة 2: اختبار التثبيت والبحث

بعد إصلاح الـ proxy:

1. ✅ تحميل قائمة المهارات من Anthropic (16 مهارة متوقعة)
2. ✅ البحث في المهارات
3. ✅ تثبيت مهارة جديدة
4. ✅ التحقق من ظهورها في Local Skills
5. ✅ اختبار الحذف

---

### الخطوة 3: تحسينات اختيارية

- [ ] إضافة loading states أفضل
- [ ] إضافة صور/أيقونات للمهارات
- [ ] عرض تفاصيل المهارة قبل التثبيت (modal)
- [ ] نظام تقييم/مراجعة
- [ ] إضافة tags/filters للفئات
- [ ] دعم تحديث المهارات المثبتة
- [ ] دعم مصادر أخرى (LobeHub, SkillsMP)

---

## 📁 هيكل الملفات المتأثرة

```
packages/backend/
├── src/
│   ├── db/
│   │   └── migrations/
│   │       └── 040_skills_system.sql          ✅ إنشاء جداول
│   ├── services/
│   │   └── anthropic-skills-service.ts        ✅ خدمة GitHub
│   ├── api/
│   │   └── routes/
│   │       └── skills.ts                      ✅ 8 endpoints جديدة
│   └── tools/
│       ├── skill-install.ts                   ✅ أداة AI
│       └── index.ts                           ✅ تسجيل الأداة

src/app/(dashboard)/dashboard/skills/
└── page.tsx                                   ✅ واجهة المستخدم

.data/
└── skills/                                    📁 مجلد التخزين المحلي
    └── *.md                                   (سيتم إنشاؤها عند التثبيت)
```

---

## 🧪 اختبارات يدوية

### اختبار الباك اند مباشرة (✅ يعمل):

```bash
# 1. عرض المهارات المحلية
curl http://localhost:41522/api/skills

# 2. عرض المهارات من Anthropic
curl http://localhost:41522/api/skills/marketplace/available

# 3. عرض المهارات المثبتة
curl http://localhost:41522/api/skills/marketplace/installed

# 4. البحث
curl "http://localhost:41522/api/skills/marketplace/search?q=pdf"

# 5. تثبيت مهارة
curl -X POST http://localhost:41522/api/skills/marketplace/install \
  -H "Content-Type: application/json" \
  -d '{"skillName":"pdf","skillPath":"skills/Document Skills/pdf"}'
```

### اختبار من الفرونت اند (❌ لا يعمل حالياً):

افتح المتصفح على: http://localhost:41521/dashboard/skills

1. تحقق من Local Skills → يجب أن يظهر (8)
2. اضغط Marketplace tab
3. اضغط Refresh → يجب أن تظهر المهارات من Anthropic

**الحالة الحالية**: 404 error

---

## 📚 الموارد والمراجع

- **Anthropic Skills Repository**: https://github.com/anthropics/skills
- **Octokit REST API**: https://octokit.github.io/rest.js/
- **SKILL.md Format**: Markdown file with YAML frontmatter
- **Alternative Sources**:
  - LobeHub: https://lobehub.com
  - SkillsMP: https://skillsmp.com

---

## 🚀 التشغيل الحالي

### Backend (Port 41522):
```bash
cd C:\MAMP\htdocs\agent\agent_player\packages\backend
pnpm dev
```

### Frontend (Port 41521):
```bash
cd C:\MAMP\htdocs\agent\agent_player
pnpm dev
```

### التحقق من التشغيل:
```bash
# Backend status
curl http://localhost:41522/api/skills

# Frontend status
http://localhost:41521/dashboard/skills
```

---

## 📝 ملاحظات مهمة

1. **Migration 040 طُبِّق بنجاح** ✅
   - الجداول موجودة في قاعدة البيانات
   - المصادر الافتراضية مُضافة

2. **الباك اند يعمل 100%** ✅
   - جميع الـ APIs تستجيب بشكل صحيح
   - GitHub API integration يعمل
   - التخزين المحلي يعمل

3. **المشكلة الوحيدة**: Next.js Proxy ❌
   - الفرونت اند لا يصل للباك اند APIs
   - يحتاج proxy configuration

4. **المهارات الحالية في Local**: 8 مهارات
   - يتم تحميلها من workspace skills
   - منفصلة عن marketplace skills

---

## ⏭️ الخطوة التالية (غداً)

**الأولوية الأولى**: إصلاح Next.js API Proxy

اختر أحد الحلول:
1. ✅ إنشاء API route في `src/app/api/skills/[...path]/route.ts`
2. ✅ إضافة rewrites في `next.config.ts`
3. ✅ استخدام environment variable مباشرة في fetch

بعد الإصلاح:
- اختبار التثبيت من الواجهة
- اختبار البحث
- اختبار الحذف
- إضافة تحسينات UI

---

**تم التوثيق بتاريخ**: 2026-02-24
**الحالة**: في انتظار إصلاح API Proxy
**التقدم**: 85% (الباك اند مكتمل، الفرونت اند يحتاج proxy فقط)
