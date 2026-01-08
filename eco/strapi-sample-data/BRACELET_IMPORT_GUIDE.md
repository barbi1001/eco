# מדריך העלאת נתוני צמידים לסטראפי

## סקירה כללית

מדריך זה מסביר כיצד להעלות את כל נתוני הצמידים החדשים לסטראפי, כולל:
- טמפלט צמיד מלא עם מטא-דאטה
- חרוזי אותיות בעברית ובאנגלית
- חרוזים רגילים עם קוטר מוגדר
- קסמים מיוחדים לצמידים
- תליונים מרכזיים

## קבצי הנתונים החדשים

### 1. טמפלט הצמיד הראשי
**קובץ:** `complete-bracelet-template.json`
**תיאור:** טמפלט צמיד מלא עם 18 עמדות לחרוזים, 3 עמדות לקסמים ועמדה אחת לתליון מרכזי

**תכונות מיוחדות:**
- `is_bracelet: true` - מפעיל פונקציונליות צמיד
- `bracelet_metadata` - מטא-דאטה עם הגדרות צמיד
- SVG מפורט עם גרדיאנט וצללים
- תמיכה בטקסט אישי וחרוזי אותיות

### 2. חרוזי אותיות עבריות
**קובץ:** `letter-beads-hebrew.json`
**תיאור:** 22 חרוזי אותיות עבריות (א-ת)

**תכונות:**
- `is_letter_bead: true`
- `letter_value` - הערך של האות
- `diameter: 0.8` - קוטר סטנדרטי
- SVG עם אות עברית מרכזית

### 3. חרוזי אותיות אנגליות
**קובץ:** `letter-beads-english.json`
**תיאור:** 26 חרוזי אותיות אנגליות (A-Z)

**תכונות:**
- `is_letter_bead: true`
- `letter_value` - הערך של האות (אותיות קטנות)
- `diameter: 0.8` - קוטר סטנדרטי
- SVG עם אות אנגלית גדולה

### 4. חרוזים רגילים לצמיד
**קובץ:** `bracelet-beads.json`
**תיאור:** 10 סוגי חרוזים בגדלים שונים

**סוגים:**
- חרוזים קטנים (0.5 ס"מ)
- חרוזים בינוניים (0.8 ס"מ)
- חרוזים גדולים (1.2 ס"מ)
- חומרים: זהב, כסף, פנינה, קריסטל, עץ

### 5. קסמים לצמיד
**קובץ:** `bracelet-charms.json`
**תיאור:** 8 קסמים מיוחדים לצמידים

**סוגים:**
- לב זהב
- כוכב זהב
- פרפר כסף
- עין כחולה
- חמסה זהב
- פרח ורוד
- עוגן כסף
- מפתח זהב

### 6. תליונים מרכזיים
**קובץ:** `bracelet-pendants.json`
**תיאור:** 6 תליונים גדולים למרכז הצמיד

**סוגים:**
- לב גדול זהב
- עץ החיים
- מגן דוד כסף
- חמסה מפורטת
- אינפיניטי כסף
- פרפר צבעוני

## הוראות העלאה לסטראפי

### שלב 1: הכנת הסביבה
1. וודאי שסטראפי פועל ומחובר
2. וודאי שהסכמות הבאות קיימות:
   - `jewelry-templates`
   - `jewelry-components`
   - `custom-jewelry-orders`

### שלב 2: העלאת הטמפלט
```bash
# העלה את הטמפלט החדש
curl -X POST "http://localhost:1337/api/jewelry-templates" \\
  -H "Content-Type: application/json" \\
  -d @complete-bracelet-template.json
```

### שלב 3: העלאת חרוזי האותיות העבריות
```bash
# העלה כל חרוז אות בנפרד
for bead in $(cat letter-beads-hebrew.json | jq -c '.[]'); do
  curl -X POST "http://localhost:1337/api/jewelry-components" \\
    -H "Content-Type: application/json" \\
    -d "$bead"
done
```

### שלב 4: העלאת חרוזי האותיות האנגליות
```bash
# העלה כל חרוז אות בנפרד
for bead in $(cat letter-beads-english.json | jq -c '.[]'); do
  curl -X POST "http://localhost:1337/api/jewelry-components" \\
    -H "Content-Type: application/json" \\
    -d "$bead"
done
```

### שלב 5: העלאת החרוזים הרגילים
```bash
# העלה כל חרוז בנפרד
for bead in $(cat bracelet-beads.json | jq -c '.[]'); do
  curl -X POST "http://localhost:1337/api/jewelry-components" \\
    -H "Content-Type: application/json" \\
    -d "$bead"
done
```

### שלב 6: העלאת הקסמים
```bash
# העלה כל קסם בנפרד
for charm in $(cat bracelet-charms.json | jq -c '.[]'); do
  curl -X POST "http://localhost:1337/api/jewelry-components" \\
    -H "Content-Type: application/json" \\
    -d "$charm"
done
```

### שלב 7: העלאת התליונים
```bash
# העלה כל תליון בנפרד
for pendant in $(cat bracelet-pendants.json | jq -c '.[]'); do
  curl -X POST "http://localhost:1337/api/jewelry-components" \\
    -H "Content-Type: application/json" \\
    -d "$pendant"
done
```

## סקריפט העלאה אוטומטי

אתה יכול להשתמש בסקריפט הבא להעלאה אוטומטית של כל הנתונים:

```bash
#!/bin/bash

STRAPI_URL="http://localhost:1337"
API_TOKEN="your-api-token-here"  # אם נדרש

# פונקציה להעלאת קובץ JSON
upload_json_array() {
    local file=$1
    local endpoint=$2
    
    echo "מעלה $file ל-$endpoint..."
    
    for item in $(cat "$file" | jq -c '.[]'); do
        curl -X POST "$STRAPI_URL/api/$endpoint" \\
            -H "Content-Type: application/json" \\
            -H "Authorization: Bearer $API_TOKEN" \\
            -d "$item"
        echo "הועלה פריט מ-$file"
    done
}

# פונקציה להעלאת אובייקט יחיד
upload_single_json() {
    local file=$1
    local endpoint=$2
    
    echo "מעלה $file ל-$endpoint..."
    
    curl -X POST "$STRAPI_URL/api/$endpoint" \\
        -H "Content-Type: application/json" \\
        -H "Authorization: Bearer $API_TOKEN" \\
        -d @"$file"
    echo "הועלה $file"
}

# העלאת הטמפלט
upload_single_json "complete-bracelet-template.json" "jewelry-templates"

# העלאת כל החרוזים והקסמים
upload_json_array "letter-beads-hebrew.json" "jewelry-components"
upload_json_array "letter-beads-english.json" "jewelry-components"
upload_json_array "bracelet-beads.json" "jewelry-components"
upload_json_array "bracelet-charms.json" "jewelry-components"
upload_json_array "bracelet-pendants.json" "jewelry-components"

echo "סיום העלאה!"
```

## בדיקת התוצאות

לאחר ההעלאה, בדוק בממשק הניהול של סטראפי:

1. **Templates:** אמור להיות טמפלט חדש בשם "צמיד מותאם אישית עם טקסט"
2. **Components:** אמורים להיות:
   - 48 חרוזי אותיות (22 עברית + 26 אנגלית)
   - 10 חרוזים רגילים
   - 8 קסמים
   - 6 תליונים

## פתרון בעיות

### בעיה: שגיאת אימות
**פתרון:** וודא שכל השדות הנדרשים קיימים בסכמה

### בעיה: שגיאת קוטר
**פתרון:** וודא שהשדה `diameter` מוגדר כ-Number בסכמה

### בעיה: חרוזי אותיות לא מזוהים
**פתרון:** וודא שהשדות `is_letter_bead` ו-`letter_value` קיימים

## הערות חשובות

1. **גיבוי:** גבה את הנתונים הקיימים לפני ההעלאה
2. **בדיקה:** בדוק שהטמפלט מוצג נכון באפליקציה
3. **תמונות:** אם יש תמונות אמיתיות, העלה אותן בנפרד
4. **ביצועים:** ההעלאה עשויה לקחת זמן עקב כמות הנתונים הגדולה

## תמיכה

אם נתקלת בבעיות, בדוק:
1. שהסכמות מעודכנות עם השדות החדשים
2. שסטראפי פועל ומחובר
3. שיש הרשאות כתיבה למסד הנתונים