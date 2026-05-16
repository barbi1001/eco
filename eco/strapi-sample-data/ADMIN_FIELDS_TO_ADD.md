# שדות להוספה ב-Strapi לפאנל הניהול

הוסיפי את השדות הבאים לקולקציה **Custom Jewelry Order** ב-Strapi (Content-Type Builder).

## שדות חדשים לקולקציה `custom-jewelry-order`

| שם שדה (API ID)      | סוג שדה                                                                                              | תיאור                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `admin_notes`        | Long text (Text)                                                                                     | הערות פנימיות של המנהלת על ההזמנה                  |
| `paid`               | Boolean (Default: false)                                                                             | האם שולם                                           |
| `payment_method`     | Enumeration: `cash`, `bit`, `credit_card`, `bank_transfer`, `paybox`                                 | אמצעי תשלום (Allow null)                           |
| `payment_date`       | DateTime                                                                                             | תאריך התשלום (Allow null)                          |
| `tracking_number`    | Short text (String)                                                                                  | מספר מעקב משלוח / מספר חשבונית                     |
| `shipping_method`    | Enumeration: `pickup`, `delivery`, `israel_post`, `courier`                                          | שיטת איסוף/משלוח (Allow null)                      |
| `production_deadline`| Date                                                                                                 | תאריך יעד להפקה (Allow null)                       |
| `priority`           | Enumeration: `low`, `normal`, `high`, `urgent` (Default: `normal`)                                   | דחיפות                                             |
| `is_archived`        | Boolean (Default: false)                                                                             | סומן לארכיון (יוסתר מהרשימה הראשית)                |

## עדכון שדה קיים `order_status`

ב-Strapi, ערכי לערכים את ה-Enumeration של `order_status` כדי לתמוך בכל מחזור החיים:

```
pending
confirmed
in_production
ready
shipped
completed
cancelled
```

(הקוד שולח כברירת מחדל `pending` כשהזמנה חדשה נוצרת — לכן הוא חייב להישאר ראשון/קיים)

## הגדרות הרשאות ב-Strapi (Users & Permissions)

### 1. תפקיד `Public` (אנונימי)

**חשוב לוודא:** לתפקיד Public **אין** הרשאות `find` / `findOne` / `update` / `delete` על `custom-jewelry-order`. רק `create` נשאר (אם משתמשים בו מהדפדפן — אם כל היצירה עוברת דרך ה-API token, אפילו `create` יכול להישאר כבוי).

### 2. תפקיד חדש: `Admin Manager`

צרי תפקיד חדש בשם `Admin Manager` עם ההרשאות:

על `custom-jewelry-order`:
- ✅ `find`
- ✅ `findOne`
- ✅ `update`

על `upload` (כדי לראות תמונות תצוגה):
- ✅ `find`
- ✅ `findOne`

### 3. משתמש מנהלת

ב-Strapi → **Users (Users-Permissions)** → New Entry:
- Username: `admin` (לדוגמה)
- Email: האימייל של המנהלת
- Password: סיסמה חזקה
- Confirmed: ✅ true
- Blocked: ❌ false
- Role: `Admin Manager`

## הגדרת `.env` בפרויקט SvelteKit

ודאי ש-`.env` של SvelteKit מכיל:

```
VITE_STRAPI_URL=https://strapi-7iq2.onrender.com
```

(לא נדרש API token לצד הלקוח — המנהלת תתחבר עם משתמש+סיסמה)

## נתיבים חדשים באתר

לאחר ההגדרות, פאנל הניהול זמין בכתובות:
- `/admin/login` — התחברות
- `/admin/orders` — רשימת כל ההזמנות (סינון/חיפוש)
- `/admin/orders/[id]` — פרטי הזמנה + עדכון סטטוס/הערות
