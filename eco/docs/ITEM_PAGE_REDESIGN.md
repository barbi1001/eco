# תכנית: בנייה מחדש של עמוד המוצר — עיצוב אחיד, מובייל קודם

> **קובץ זה הוא מקור האמת של המשימה.** כל סוכן (AI או אדם) שממשיך את העבודה — יתחיל בקריאת הקובץ הזה בלבד, יבחר את המשימה הפתוחה הבאה, ובסיום יסמן ✅ ויוסיף שורת סטטוס **באותו קומיט של הקוד**.

---

## הקשר ומטרה

עמוד המוצר (`src/routes/[category]/[item]/+page.svelte`) מפוצל היום לשתי קומפוננטות ענק:

| קובץ | גודל | הבעיה |
|---|---|---|
| `src/lib/comonents/mobileItem.svelte` | 558KB, ‏4,961 שורות | כל העמוד הוא `<svg>` אחד עם `preserveAspectRatio="none"` — הכל נמתח ומתעוות לפי רוחב המסך; UI ממוקם בקואורדינטות ידניות בתוך `<foreignObject>` |
| `src/lib/comonents/desctoItem.svelte` | 3MB, ‏10,124 שורות, ‏4,699 paths | שם המוצר והמחיר הם `<text>` של SVG (לא נגיש, לא ניתן לבחירה/חיפוש); כפתור הקנייה הוא `<g onclick>` מזויף ולא `<button>` |

העיצוב של המעצבת יפה אבל קשה לתפעול. **ההחלטה (אושרה ע"י בעל האתר):** בונים קומפוננטה אחת חדשה, נקייה ורספונסיבית, מובייל-קודם, שמשרתת גם מובייל וגם דסקטופ. שואבים השראה ויזואלית משני הקבצים הקיימים ומחלצים מהם אלמנטים דקורטיביים (פפיון, פנינים, גרדיאנטים) **כקישוטים בלבד** — לא כמבנה העמוד. הקבצים הישנים נשארים בריפו ללא שינוי (rollback + רפרנס).

---

## עדכון (2026-07-17): שתי התצוגות חיות זו לצד זו + כפתור מעבר

בעל האתר אישר את התצוגה הנקייה (`ItemPage`) וביקש **לא להחליף** את העיצוב הכבד אלא לתת לגולש לעבור ביניהם. לכן `+page.svelte` מרנדר עכשיו את שתי המערכות, ומחליף לפי `viewMode`:

- **`classic`** (ברירת מחדל) — העיצוב המקורי הכבד: `mobileItem.svelte` (מתחת ל-600px) / `desctoItem.svelte` (מעל), עם `{#key mobiles}` בדיוק כמו בגרסה המקורית.
- **`easy`** — התצוגה הנקייה החדשה: `ItemPage` על אותם props.
- כפתור צף מלמעלה (`.toggleBtn`, ‏`position:fixed; top; left:50%`) עם טקסט מתחלף: "✨ לתצוגה נוחה" ↔ "🎀 לתצוגה המעוצבת". הבחירה נשמרת ב-`localStorage` תחת המפתח `barb-item-view` (מוגן ב-`browser` מ-`$app/environment`).
- **חשוב:** כפתור הוואטסאפ עובר ל-`bottom-20` רק בתצוגת `easy` (בגלל בר הקנייה הדביק); בתצוגת `classic` הוא נשאר `bottom-2`. ה-wrapper משתמש ב-`.classicwrap` (‏`width:100vw; overflow-y:hidden`) לתצוגה הכבדה ו-`.fullwidth` לנקייה.

### באג SSR שתוקן תוך כדי (קריטי)
`mobileItem.svelte` קרס ב-SSR עם `ReferenceError: Cannot access 'shopsi' before initialization`. הסיבה: בראש הסקריפט היה `let imge = find()` ש-`find()` ניגש ל-`shopsi` **לפני** ש-`$props()` אותחל (‏TDZ). התיקון: הוסרה הפונקציה `find()` הישנה (שכללה גם `setTimeout` מת אחרי `return`), ובמקומה `let imge = $derived(shopsi ? shopsi.data.attributes.img5.data : [])` **אחרי** בלוק ה-`$props()`. זה תיקון כירורגי נקודתי — לא נגענו בגאומטריית ה-SVG.

### "מריחה" (smearing) — נבדק, לא משוחזר
נבדק חשש ה"מריחה" מ-`preserveAspectRatio="none"`: נמדד ש-ה-SVG מתרנדר ביחס הטבעי שלו (‏rendered ratio 0.167 = viewBox ratio) גם ב-430px וגם ב-599px, כלומר **אין עיוות בפועל** — הרוחב והגובה גדלים פרופורציונלית. צילומי מסך ב-375/599px מראים כתר, כותרת ותמונת מוצר קריאים וללא מתיחה. אם בעל האתר מזהה אלמנט ספציפי ש"נמרח" — צריך שיצביע עליו; שינוי עיוור של הגאומטריה מסכן את עבודת המילימטרים.

### קוביית ה-Swiper (בקשה מפורשת: לשמר)
- בתצוגת `classic` הקוביה נשמרת כמות שהיא (הקבצים המקוריים לא נגעו בהם).
- **נוסף** אפקט הקוביה גם ל-`ItemGallery.svelte` של התצוגה הנקייה: `effect="cube"` + `cubeEffect` (shadow/slideShadows) + מודול `EffectCube` + `Mousewheel`, בדיוק כמו ההגדרות ב-`mobileItem.svelte:2810-2825`.
- **מלכודת שתוקנה:** אפקט cube מכריח `overflow:visible` על אלמנט ה-swiper → פאות הקוביה המסובבות ניפחו את רוחב העמוד למיליוני px. התיקון: עטיפת ה-`<Swiper>` ב-`.galleryFrame` (‏`aspect-ratio:1/1; overflow:hidden; border-radius`) שחוסמת את הגלישה. אומת: `scrollWidth-clientWidth == 0` בשני ה-viewports.

### אימות (offline, על `dev-item-test` עם `agil1.json`)
`npm run build` עובר. ‏Playwright ‏375+1280: התצוגה נטענת ב-`classic`, לחיצה על הכפתור מחליפה ל-`easy` (h1 "עגילים פרחוניים", ‏7 slides, ‏`.swiper-cube` קיים, אין גלילה אופקית, אפס page errors), והטקסט מתהפך. גודל chunk של route המוצר: **631 kB** (עלה מ-181 kB כי שתי המערכות נכללות עכשיו — צפוי ומכוון).

---

## ⚠️ חוקי ברזל לכל סוכן — קרא לפני הכל

**קבצים שאסור לקרוא במלואם** (יפוצצו את ה-context):

- `src/lib/comonents/mobileItem.svelte` (4,961 שורות)
- `src/lib/comonents/desctoItem.svelte` (10,124 שורות)
- `src/lib/comonents/mobilefront.svelte`, `desctopfront.svelte`, `mobilecatego.svelte`, `deskcatego.svelte`
- `src/lib/svg/buy.svelte` (31KB — לקרוא רק אם מחלצים ממנו)

**איך לדגום אותם במקום:**

1. `Read` עם `offset`/`limit` לטווחי שורות ידועים (מפת השורות למטה).
2. `Grep -n` על תבניות כמו `id="..."`, `<foreignObject`, `<g id=`, `url\(#`.
3. לחילוץ קבוצת SVG: לחפש את ה-id, לקרוא ±80 שורות סביבו, ואז לכל `url(#name)` שמופיע — לחפש את הגדרת הגרדיאנט ולקרוא רק אותה.
4. לעולם לא להריץ פורמטר/lint אוטומטי על הקבצים האלה.

**מפת שורות מאומתת (נכון ל-2026-07-17):**

`mobileItem.svelte`:
- props (destructure) — שורות 52–70. שים לב: `imge` מגיע כ-prop מהעמוד אבל **לא** נקלט שם — הקומפוננטה גוזרת אותו מ-`shopsi` בשורה 4.
- הגדרות גרדיאנטים — משורה 89: ‏`pearlGrad` ‏90–95, ‏`ribbonGrad` ‏96–101, ‏`threadGrad` ‏102–106, ‏`spoolWoodGrad` ‏107+. שאר ה-defs עד ~1213.
- גלריית Swiper (‏foreignObject) — 2796–2868 (דפוס הייבוא של Swiper: שורות 32–50).
- כפתור "להזמנה!" (button אמיתי) — 4760–4802.
- תיאור — 4803–4811. **פפיון דקורטיבי `<g id="bowDecoration">` — 4812–4862** (תלוי רק ב-`pearlGrad` + `ribbonGrad`).
- כותרת h1 — ‏4864–4882; מחיר — 4883–4899; "מידע נוסף" — 4900–4918; בלוק מת "tttt" — ‏4919–4927; ‏`</svg>` — ‏4928.

`desctoItem.svelte`:
- שם/מחיר כ-`<text>` — ‏~5567–5572; כפתור קנייה מזויף `<g onclick>` — ‏~5173; תיאור foreignObject — ‏~9971; ‏Swiper — ‏~10055.

---

## חוזה הנתונים (לא משתנה!)

`+page.js` מושך את כל הפריטים מ-Strapi‏ (`https://strapi-7iq2.onrender.com/api/items?populate=%2A`), מסנן לפי id, מחזיר `{id, pdata, relatedP, loading}`. תמונות Cloudinary עם `formats.{thumbnail,small,medium,large}.url`. ‏img1/img4 עשויים להיות `video/mp4`.

Props שהעמוד מעביר (החוזה של הקומפוננטה החדשה — זהה לישן):

```js
let { onaddto, shopsi, is1vid = false, is4vid = false, low = false,
      shem, imga, imgb, imgc, imgd, imge = [], id, kind, url, des, price, w = 0 } = $props();
```

- לחיצת קנייה → `onaddto({ pr: id })` (אותו shape כמו היום).
- `low === true` → מצב טעינה, אסור לגשת לנתונים.
- **מלכודת:** בעמוד, שורה ~106: `imge = ...img5.data || new Array(imga)` — כלומר `imge` יכול להיות מערך של אובייקטי Strapi **או** מערך של מחרוזת אחת. חובה לנרמל (`typeof im === 'string'`) אחרת קריסה על `im.attributes.mime`.

זרימת עגלה: `addToCart` בעמוד דוחף ל-store‏ (`src/lib/stores/cart.js`) ופותח דיאלוג עם `carta.svelte` → טופס `yalla.svelte` → ‏POST ל-`/api/teleg` + `/api/mail`. לא נוגעים בזה.

---

## קומפוננטות קיימות לשימוש חוזר (לא לכתוב מחדש!)

| קובץ | תפקיד |
|---|---|
| `src/lib/components/jewelry/OptimizedImage.svelte` | תמונה עם lazy + skeleton shimmer |
| `src/lib/components/jewelry/SkeletonLoader.svelte` | שלדי טעינה |
| `src/lib/utils/deviceDetection.ts` | `prefersReducedMotion`, ‏`getOptimalImageQuality`, ‏debounce |
| `src/lib/utils/lazy.js` | ‏IntersectionObserver action |
| `src/lib/comonents/item/similarProducts.svelte` + `productCard.svelte` | גריד "מוצרים דומים" RTL מוכן |
| `src/lib/comonents/whatsappButton.svelte` | כפתור וואטסאפ צף (כבר מרונדר ב-`+page.svelte:150`) |
| Tailwind config | צבעי מותג: `barb #FF0066`, ‏`nice`, ‏`pinki`; גרדיאנטים `goldGrad`, ‏`aigold`, ‏`goldShain` |
| `app.css` | פונטים עבריים מ-Cloudinary + מחלקות `sparkle-text` / `metallic-text` / `royal-text` |

---

## שלב 0 — קובץ התכנית הזה

- [x] 0.1 יצירת `docs/ITEM_PAGE_REDESIGN.md` (הקובץ הזה) וקומיט ראשון.
  - סטטוס: נכתב 2026-07-17.

---

## שלב 1 — ליבת העמוד החדש (מובייל קודם, פונקציונלי)

מבנה קבצים חדש:

```
src/lib/comonents/item/
  ItemPage.svelte        # אורקסטרטור — מחליף את הפיצול מובייל/דסקטופ
  ItemGallery.svelte     # גלריית Swiper (תמונות + וידאו)
  ItemInfo.svelte        # h1, מחיר, קטגוריה, תיאור
  ItemBuyBar.svelte      # בר קנייה דביק בתחתית (מובייל) / כפתור inline (דסקטופ)
```

- [x] **1.1 `ItemGallery.svelte`** — props: ‏`{ slides, shem, low = false }` כאשר `slides: Array<{url, isVideo, formats?}>`.
  - Swiper 8 בדיוק כמו הדפוס הקיים (`mobileItem.svelte:32-50`): ‏`import { Swiper, SwiperSlide } from 'swiper/svelte'`, מודולים `[Pagination, Zoom, Keyboard]`, אפקט slide רגיל (לוותר על cube), ‏`zoom: true`, ‏loop רק כש-`slides.length > 1`.
  - תמונות: `srcset` מ-`formats` של Cloudinary‏ (small 500w / medium 750w / large 1000w), ‏`sizes="(min-width:1024px) 50vw, 100vw"`, ‏slide ראשון `loading="eager"` והשאר lazy, עטוף ב-`swiper-zoom-container`. ‏`alt="{shem} תמונת המוצר"`.
  - וידאו: `<video autoplay loop muted playsinline>` — **חובה `playsinline`** (חסר היום, שובר iOS).
  - שורת thumbnails מתחת לגלריה ב-≥640px‏ (`slideTo(i)`); נקודות pagination במובייל.
  - סטטוס: נכתב 2026-07-17. בלי `$lib/style.css` הישן (הוא מקבע ‎.swiper ל-780px אבסולוטי) — סטיילינג scoped בקומפוננטה.
- [x] **1.2 `ItemInfo.svelte`** — props: ‏`{ shem, price, kind, des, low = false }`.
  - ‏`<h1>` אמיתי (יחיד בעמוד), מחיר `₪{price}` גדול עם גרדיאנט זהב (`bg-goldGrad bg-clip-text text-transparent`), ‏`kind` כ-pill שמקשר חזרה ל-`/{url}`, תיאור תחת `<h2>מידע נוסף</h2>` עם קו מפריד דקורטיבי. הכל `dir="rtl" text-right`.
  - סטטוס: נכתב 2026-07-17, כולל שילוב BowRibbon מעל ה-h1 ו-PearlString לפני "מידע נוסף".
- [x] **1.3 `ItemBuyBar.svelte`** — props: ‏`{ price, onbuy, low = false }`.
  - מובייל (<1024px): ‏`fixed bottom-0 inset-x-0 z-40`, ריפוד `pb-[env(safe-area-inset-bottom)]`, כפתור "להזמנה!" ברוחב מלא, גובה מינימלי 56px (יעד מגע ≥44px). סטיילינג הכפתור מועתק מהקיים (`mobileItem.svelte:4769-4800`): גרדיאנט מגנטה `#aa1f5d→#d52474`, מסגרת/טקסט קרם `#fff6d5`, פינות pill — בגודל פונט שפוי.
  - דסקטופ (≥1024px): ‏CSS בלבד — `lg:static` בתוך עמודת המידע (בלי branching ב-JS).
  - לפנות מקום לכפתור הוואטסאפ הצף: להזיז אותו ל-`bottom-20` במובייל (שינוי class ב-`+page.svelte:150`).
  - סטטוס: נכתב 2026-07-17. במובייל הבר מציג מחיר + כפתור; בדסקטופ (‎lg:‎) הופך static והמחיר מוסתר (מוצג כבר ב-ItemInfo).
- [x] **1.4 `ItemPage.svelte`** — אורקסטרטור עם החוזה המלא שלמעלה.
  - ‏`low === true` → פריסת שלד עם `SkeletonLoader` (בלוק גלריה + 3 שורות טקסט + כפתור).
  - נרמול `imge` (מחרוזת/אובייקט Strapi), סינון null וכפילויות URL (היום `imgb = ... || imga` יוצר 4 עותקים של אותה תמונה בפריטים דלים — לבצע dedupe, תמיד להשאיר לפחות slide אחד).
  - פריסה מובייל (ברירת מחדל, עמודה אחת, RTL): גלריה (רוחב מלא, ‏aspect-ratio ~1/1, ‏rounded-2xl, צל רך) → ‏ItemInfo ‏→ slot לקישוט (שלב 2) → ‏`<SimilarProducts/>` ‏→ ‏ItemBuyBar דביק. רקע: ורוד המותג `#ff83a8` (או גרדיאנט עדין `#ff83a8→#fb6298`), תוכן על כרטיסי קרם לקריאוּת.
  - פריסה דסקטופ (`lg:` ‏≥1024px): ‏`grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto`; עמודת גלריה `lg:sticky lg:top-24`, עמודת מידע עם הכפתור inline. ‏SimilarProducts ברוחב מלא מתחת.
  - סטטוס: נכתב 2026-07-17. נרמול imge + ‏dedupe לפי URL מיושם ב-`$derived.by`.
- [x] **1.5 חיווט ב-`+page.svelte` + תיקון באג Carta** — שינוי מינימלי:
  - להחליף את הייבוא של `DesctoItem`/`Mobile` ב-`ItemPage`; בענף הטעינה `<ItemPage low={true} />`; בענף הרגיל `<ItemPage {...כל-הprops} />`. למחוק את הפיצול `{#key mobiles}` (להשאיר `bind:clientWidth={w}` ולהעביר `w` — הגלריה משתמשת בו לדחיית אתחול Swiper כמו היום, ‏`{#if w != 0}`).
  - **באג קיים שחובה לתקן:** שורה 144: ‏`<Carta on:close={closed} />` — אבל `carta.svelte` מצפה ל-prop‏ `onclose` (‏Svelte 5 runes). לשנות ל-`<Carta onclose={closed} />`.
  - ניקוי מותר: הסרת ייבואים מתים (`data1..data5`, ‏`circOut`, ‏`Buy`, ‏`fly`) וסטייל `.slide` מת. **לא לגעת** ב-`+page.js` ולא בלוגיקת הנתונים בשלושת בלוקי `run()`.
  - סטטוס: בוצע 2026-07-17. בנוסף לתיקון `onclose`: ‏`closed(event)` שוּנה לקרוא `event.name` (ולא `event.detail.name`) כי carta מעביר אובייקט שטוח. גם משימות 3.4 (‏`.fullwidth` → ‏width:100%) ו-4.1 (רוחב דיאלוג ל-`min(92vw,480px)`) בוצעו באותו מעבר. הוסר `console.log(data.pdata...img5...)` שהיה עלול לקרוס על null.
- [x] **1.6 אימות שלב 1** (ראה פרוטוקול אימות למטה).
  - סטטוס: בוצע 2026-07-17 עם Playwright על route בדיקה מקומי `/dev-item-test/` (‏Strapi ברנדר לא הגיב — ‏connection failure — אז נבנה route שמרנדר את ItemPage עם `agil1.json`; מוגן ב-`dev` ולא יוצג בפרודקשן). תוצאות ב-375×812 ו-1280×800: ‏h1 תקין, 7 סליידים (5 ייחודיים + כפילויות loop), בר קנייה נראה ולחיץ (גובה 56px), ‏thumbnails בדסקטופ, אפס גלילה אופקית, אפס שגיאות JS, ‏handler הקנייה יורה. ‏`vite build` עובר; ‏chunk השרת של ה-route ירד ל-181KB (הקבצים הענקיים כבר לא מיובאים). **נותר לאמת מול Strapi חי כשיתעורר: זרימת עגלה מלאה + פריט וידאו + פריט דל.**

**Rollback מדויק (אם משהו נשבר בפרודקשן):** ב-`+page.svelte` להחזיר:
```svelte
import DesctoItem from '$lib/comonents/desctoItem.svelte';
import Mobile from '$lib/comonents/mobileItem.svelte';
<!-- ובתבנית: -->
{#key mobiles}
  {#if mobiles}<Mobile ...props />{:else}<DesctoItem ...props />{/if}
{/key}
```
(הקבצים הישנים לא נמחקים — הם במקום.)

---

## שלב 2 — חילוץ אלמנטים דקורטיביים + ליטוש

### מתכון חילוץ (לבצע בדיוק כך)

1. איתור: `Grep -n 'id="<name>"'` בקובץ הענק; ‏`Read` עם offset/limit של ±80 שורות סביב.
2. תלויות: לחפש במרקאפ שחולץ `url\(#([a-zA-Z0-9-]+)\)`; לכל id — לגרפ את הגדרת ה-gradient ולקרוא רק את שורותיה (ב-mobileItem ההגדרות בשורות 89–~1213, כל גרדיאנט 5–10 שורות).
3. ליצור `src/lib/svg/decor/<Name>.svelte`: ‏`<svg viewBox="..." xmlns="http://www.w3.org/2000/svg">` עצמאי עם `<defs>` (הגרדיאנטים שהועתקו — **לשנות את שמות ה-ids עם קידומת**, למשל `bow-pearlGrad`, כי ids גלובליים ב-DOM ויתנגשו) + הקבוצה עם transform מנוטרל.
4. חיתוך viewBox לפי קואורדינטות הקבוצה (הפפיון: בערך x ‏−382..382, ‏y ‏−90..230 → ‏`viewBox="-390 -100 780 340"`). אם קשה — לרנדר זמנית עם viewBox ענק ולמדוד ב-devtools עם `getBBox()`.
5. כל קובץ < ‏~10KB. ‏props: ‏`{ class = '', width = '100%' }` בלבד. תמיד `aria-hidden="true"` + ‏`pointer-events-none`.

- [x] **2.1 `BowRibbon.svelte`** — מ-`mobileItem.svelte:4812-4862` (‏`<g id="bowDecoration">`). תלוי רק ב-`pearlGrad` (‏90–95) + ‏`ribbonGrad` (‏96–101). מיקום: מעל ה-h1 במובייל (~120px רוחב), פינת עמודת המידע בדסקטופ.
  - סטטוס: חולץ 2026-07-17 ל-`src/lib/svg/decor/BowRibbon.svelte`, ‏viewBox="-390 -85 780 315", ‏ids עם קידומת `bow-`. משולב ב-ItemInfo מעל ה-h1.
- [x] **2.2 `PearlString.svelte`** — עשר ה-`<circle fill="url(#pearlGrad)">` מאותו אזור. מיקום: מפריד לפני "מידע נוסף" ולפני SimilarProducts.
  - סטטוס: נוצר 2026-07-17 (‏ids עם קידומת `pearls-`). משולב ב-ItemInfo וב-ItemPage לפני SimilarProducts.
- [ ] **2.3 קישוט זהב מ-`desctoItem.svelte`** — ‏best-effort, מוגבל ל-30 דקות: לגרפ `<g id=` / ‏`gold` באזור שורות 5100–5600. **נכשל? מותר ואף רצוי ליפול ל-fallback:** ‏`static/Wool.svg`, ‏`static/Wool2.svg`, ‏`static/store.svg` כ-`<img>` + גרדיאנטים `bg-goldGrad`/`bg-aigold` מ-Tailwind. לתעד כאן איזו החלטה התקבלה.
  - סטטוס:
- [ ] **2.4 ליטוש טיפוגרפיה** — טיפול זהב במחיר, קווים מפרידים `h-0.5 bg-goldGrad`, שימוש במחלקות `sparkle-text`/`metallic-text` מ-app.css במקומות נבחרים. כל אנימציה מכבדת `prefersReducedMotion()`.
  - סטטוס:
- [ ] **2.5 מעבר ויזואלי על מצב הטעינה (skeleton)**.
  - סטטוס:

---

## שלב 3 — ליטוש דסקטופ (אותה קומפוננטה)

- [x] 3.1 אימות הגריד ב-1024/1280/1536px; הגבלת גובה גלריה `lg:max-h-[80vh]`.
  - סטטוס: אומת ב-1280 עם צילום מסך (גלריה מימין, מידע משמאל — RTL תקין). ‏1024/1536 טרם נבדקו.
- [ ] 3.2 התנהגות thumbnails + ניווט מקלדת (מודול Keyboard כבר בפנים).
  - סטטוס:
- [ ] 3.3 מצבי hover, ‏`focus-visible` על כפתור/thumbnails, ‏h1 ‏`text-2xl lg:text-4xl`.
  - סטטוס:
- [x] 3.4 אפס גלילה אופקית; לשנות `.fullwidth` ב-`+page.svelte` מ-`width:100vw; overflow-y:hidden` ל-`width:100%` (‏100vw גורם overflow ברוחב פס הגלילה).
  - סטטוס: בוצע ואומת (‏scrollWidth − clientWidth = 0 בשני הגדלים).

---

## שלב 4 — ניקיון

- [x] 4.1 `carta.svelte` / דיאלוג העגלה: ב-`+page.svelte` לשנות `[data-svelte-dialog-content].content` מ-`width:66vw` ל-`width:min(92vw, 480px); max-height:85dvh; overflow-y:auto; border-radius:1rem;`. להגדיל כפתורי +/− בעגלה ל-≥44px.
  - סטטוס: בוצע במלואו 2026-07-17 — רוחב הדיאלוג תוקן ב-`+page.svelte`, כפתורי +/− ב-`carta.svelte` הוגדלו ל-44×44px עם aria-label.
- [ ] 4.2 הסרת קוד מת מ-`+page.svelte` (רשימה ב-1.5). בלוקי `run()` של הנתונים נשארים.
  - סטטוס:
- [ ] 4.3 `Grep 'desctoItem|mobileItem' src` — לוודא שאין ייבוא נוסף. **לא למחוק את הקבצים** — הם נשארים כרפרנס/rollback. לתעד כאן.
  - סטטוס:
- [ ] 4.4 עדכון סופי של המסמך + רישום גודל bundle לפני/אחרי.
  - סטטוס:

---

## פרוטוקול אימות (להריץ אחרי שלבים 1, 3, 4)

1. `npm run dev` → לפתוח route של מוצר אמיתי (`/{category}/{id}`). **לתעד כאן אחרי הגילוי הראשון:** id של פריט תקין: ___, פריט וידאו: ___, פריט עם תמונות חסרות: ___.
2. ‏DevTools ‏375×812: עמודה אחת, בר קנייה דביק נראה ולחיץ, אין גלילה אופקית, swipe + pinch-zoom עובדים, נקודות pagination.
3. ‏1280px: שתי עמודות, גלריה דביקה, כפתור inline.
4. זרימת עגלה: "להזמנה" → דיאלוג נפתח בגודל נכון בשני הגדלים → +/− כמות → "ביצוע הזמנה" → טופס yalla נטען. **לא לשלוח באמת** ל-/api/teleg בדב — מספיק לוודא ב-console שה-handler ‏`onclose` יורה.
5. פריט וידאו: mp4 מתנגן muted ‏inline (לבדוק באמולציית iOS את `playsinline`).
6. פריט דל (חסרות img2–5): גלריה מציגה slides אחרי dedupe, אין קריסה על fallback של `imge`.
7. `npm run build` עובר (גם adapter-vercel וגם static/Tauri). נתיב הדסקטופ אמור לרדת ב-~3MB של SVG מוטמע — לרשום מספרים כאן: לפני ___, אחרי ___.
8. ‏Lighthouse מובייל על ה-route: ‏LCP אמור להשתפר; לוודא h1 יחיד, ‏alt לכל התמונות.

---

## סיכונים וטיפול

| סיכון | טיפול |
|---|---|
| מוות של session באמצע בגלל קבצי ענק | המסמך הזה + חוקי הברזל; כל משימה = קומיט קטן עצמאי |
| ‏Swiper 8 ב-Svelte 5 | עובד כבר בפרודקשן — להעתיק את דפוס הייבוא מ-`mobileItem.svelte:32-50` בדיוק |
| התנגשות ids של גרדיאנטים מחולצים | קידומת ייחודית לכל קומפוננטה |
| חילוץ מ-desctoItem קשה מדי | ‏fallback מוצהר: ‏static/Wool*.svg + גרדיאנטים של Tailwind. לתעד את ההחלטה |
| קריסת `imge` (מחרוזת מ-`new Array(imga)`) | נרמול ב-ItemPage + בדיקת פריט דל |
| ‏`on:close` של Carta לא יורה (באג קיים) | תיקון ל-`onclose=` במשימה 1.5 |
| כפתור וואטסאפ מתנגש בבר הקנייה | ‏FAB ל-`bottom-20` במובייל |
| הבדלי אדפטר Tauri/static | ‏`npm run build` בפרוטוקול האימות; אין API חדש של דפדפן |
