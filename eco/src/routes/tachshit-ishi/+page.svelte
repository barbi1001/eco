<script lang="ts">
	import { Head } from 'svead';
	import { fly, fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import WhatsappButton from '$lib/comonents/whatsappButton.svelte';

	const DESIGNER_URL = '/customjewelry';

	// ── Materials shown in the "world of beads" section.
	// Each entry renders as an inline SVG swatch, so the section costs no image requests.
	const materials = [
		{
			name: 'פנינה לבנה',
			note: 'קלאסי ורומנטי',
			stops: [
				['0%', '#ffffff'],
				['45%', '#f7f2ec'],
				['100%', '#ddd0c2']
			]
		},
		{
			name: 'זהב',
			note: 'חם ונוצץ',
			stops: [
				['0%', '#fcf6ba'],
				['45%', '#bf953f'],
				['100%', '#8a6a1f']
			]
		},
		{
			name: 'כסף',
			note: 'נקי ומודרני',
			stops: [
				['0%', '#ffffff'],
				['45%', '#cfd8dc'],
				['100%', '#8c9aa3']
			]
		},
		{
			name: 'קריסטל',
			note: 'נצנוץ בשמש',
			stops: [
				['0%', '#ffffff'],
				['40%', '#e6d9ff'],
				['100%', '#b39ddb']
			]
		},
		{
			name: 'עץ',
			note: 'טבעי ורגוע',
			stops: [
				['0%', '#e5c9a3'],
				['45%', '#b98b58'],
				['100%', '#7d5533']
			]
		},
		{
			name: 'ורוד פודרה',
			note: 'עדין ונשי',
			stops: [
				['0%', '#ffffff'],
				['40%', '#ffd6e6'],
				['100%', '#f48fb1']
			]
		}
	];

	const sizes = [
		{ label: 'קטן', cm: '0.5 ס"מ', r: 9 },
		{ label: 'בינוני', cm: '0.8 ס"מ', r: 13 },
		{ label: 'גדול', cm: '1.2 ס"מ', r: 18 }
	];

	const templates = [
		{
			icon: '📿',
			title: 'צמיד חרוזים עם שם',
			body: 'תבנית צמיד עם שורת חרוזים מסביב, מקום לתליון מרכזי ולקסמים בצדדים. כאן נכנס השם או המילה שבחרת — בחרוזי אותיות.',
			tags: ['מותאם למידת היד', 'טקסט אישי', 'קסמים בצדדים']
		},
		{
			icon: '🎀',
			title: 'שרשרת פפיון',
			body: 'שרשרת עדינה עם פפיון במרכז ונקודות עיצוב לאורכה — לחרוזים, לקסם קטן ולתליון. מתאימה גם למתנה.',
			tags: ['עיצוב עדין', 'תליון מרכזי', 'חרוזים לאורך']
		},
		{
			icon: '✨',
			title: 'ועוד תבניות בדרך',
			body: 'התבניות מתחדשות מעת לעת — עגילים, טבעות וגרסאות נוספות של צמידים ושרשראות. כל תבנית חדשה מופיעה אצלך בגלריה אוטומטית.',
			tags: ['מתעדכן', 'עגילים', 'טבעות']
		}
	];

	const steps = [
		{
			n: 1,
			title: 'בוחרת תבנית',
			body: 'נכנסת לגלריה ובוחרת את הבסיס — צמיד, שרשרת או תבנית אחרת. אפשר לסנן לפי סוג תכשיט.'
		},
		{
			n: 2,
			title: 'מודדת את היד',
			body: 'בצמידים בוחרת את היקף פרק היד. המערכת מחשבת לבד כמה חרוזים נכנסים, ומשאירה מקום לתפס.'
		},
		{
			n: 3,
			title: 'כותבת את הטקסט',
			body: 'שם, מילה או תאריך — בעברית או באנגלית. חרוזי האותיות מסתדרים במרכז התכשיט בעצמם.'
		},
		{
			n: 4,
			title: 'מרכיבה את החרוזים',
			body: 'לוחצת על כל נקודה בתכשיט ובוחרת חרוז, קסם או תליון. הכל מתעדכן על המסך בזמן אמת, כולל המחיר.'
		},
		{
			n: 5,
			title: 'מאשרת ומזמינה',
			body: 'רואה תצוגה מקדימה מוגדלת, אפשר גם להוריד תמונה. משאירה פרטים וכתובת — ואני חוזרת אלייך.'
		}
	];

	const faq = [
		{
			q: 'אני לא מבינה בעיצוב — זה מסובך?',
			a: 'ממש לא. כל תכשיט מגיע כשהוא כבר מורכב עם חרוזי פנינה לבנים כברירת מחדל, כך שיש לך תכשיט מוכן מהרגע הראשון. מכאן את מחליפה רק את מה שמתחשק לך.'
		},
		{
			q: 'איך אני יודעת שהצמיד יהיה במידה?',
			a: 'בוחרת את היקף פרק היד (בין 12 ל-25 ס"מ), והמערכת מחשבת בעצמה כמה חרוזים נכנסים, כולל מרווח לתפס. אם חרוז גדול נכנס לעיצוב, המידה מתעדכנת בהתאם.'
		},
		{
			q: 'אפשר לכתוב בעברית?',
			a: 'כן, גם בעברית וגם באנגלית. יש חרוזי אותיות לכל האלפבית בשתי השפות, והטקסט ממוקם אוטומטית במרכז התכשיט בכיוון הנכון.'
		},
		{
			q: 'מה אם אני צריכה להפסיק באמצע?',
			a: 'העיצוב נשמר אצלך במכשיר אוטומטית. את יכולה לסגור את הדף ולחזור להמשיך מאותה נקודה בתוך 24 שעות.'
		},
		{
			q: 'כמה זה עולה?',
			a: 'המחיר מורכב ממחיר בסיס של התבנית ומהרכיבים שבחרת, ומוצג לך בזמן אמת בזמן העיצוב. אין הפתעות בסוף — את רואה את הסכום לפני שאת שולחת את ההזמנה.'
		},
		{
			q: 'ומה קורה אחרי שאני שולחת?',
			a: 'ההזמנה מגיעה אליי עם התצוגה המקדימה של העיצוב שלך, ואני חוזרת אלייך לאישור פרטים ולתיאום. התכשיט מיוצר בעבודת יד בסטודיו בטבריה ונשלח אלייך.'
		}
	];

	// Same template, three different bead choices — rendered as inline SVG so the
	// section stays honest (no stock photos) and costs no extra requests.
	const looks = [
		{
			title: 'פנינה לבנה',
			caption: 'קלאסי, נקי, מתאים להכל',
			bead: 'url(#look-pearl)',
			accent: 'url(#look-pearl)',
			letters: []
		},
		{
			title: 'זהב וקריסטל',
			caption: 'חגיגי, לאירועים',
			bead: 'url(#look-gold)',
			accent: 'url(#look-crystal)',
			letters: []
		},
		{
			title: 'עם השם שלך',
			caption: 'אישי — ואין עוד אחד כזה',
			bead: 'url(#look-pearl)',
			accent: 'url(#look-pink)',
			letters: ['ש', 'י', 'ר']
		}
	];

	const jsonLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Service',
		name: 'עיצוב תכשיט אישי אונליין – ברבי עיצובים',
		serviceType: 'עיצוב תכשיטים בהתאמה אישית',
		description:
			'מעצבת תכשיטים אינטראקטיבית: בוחרים תבנית, מידת יד, טקסט אישי בחרוזי אותיות, חרוזים, קסמים ותליונים — ומזמינים תכשיט בעבודת יד.',
		areaServed: 'IL',
		provider: {
			'@type': 'LocalBusiness',
			name: 'ברבי עיצובים',
			address: {
				'@type': 'PostalAddress',
				addressLocality: 'טבריה',
				addressCountry: 'IL'
			}
		},
		url: 'https://barbracha.vercel.app/tachshit-ishi',
		potentialAction: {
			'@type': 'Action',
			name: 'התחילי לעצב',
			target: 'https://barbracha.vercel.app/customjewelry'
		}
	});

	const faqLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faq.map((item) => ({
			'@type': 'Question',
			name: item.q,
			acceptedAnswer: { '@type': 'Answer', text: item.a }
		}))
	});
</script>

<Head
	title="עיצוב תכשיט אישי אונליין | בחרי תבנית, חרוזים ואותיות – ברבי עיצובים טבריה"
	description="עצבי תכשיט משלך אונליין: כמה תבניות לבחירה, מגוון חרוזים – פנינה, זהב, כסף, קריסטל ועץ, חרוזי אותיות בעברית ובאנגלית, קסמים ותליונים. מותאם למידת היד, בעבודת יד בטבריה."
	canonical="https://barbracha.vercel.app/tachshit-ishi"
	openGraph={{
		title: 'עיצוב תכשיט אישי אונליין | ברבי עיצובים – טבריה',
		description:
			'בחרי תבנית, מידת יד, טקסט אישי בחרוזי אותיות, חרוזים וקסמים — וצרי תכשיט שהוא רק שלך. תצוגה מקדימה בזמן אמת, ייצור בעבודת יד בטבריה.',
		url: 'https://barbracha.vercel.app/tachshit-ishi',
		siteName: 'ברבי עיצובים',
		image: {
			url: 'https://res.cloudinary.com/barb1/image/upload/v1672529650/%D7%A6%D7%99%D7%9C%D7%95%D7%9D_%D7%9E%D7%A1%D7%9A_20221108_142006_tmkrfo.png',
			width: 1080,
			height: 1080,
			alt: 'עיצוב תכשיט אישי אונליין – ברבי עיצובים טבריה'
		}
	}}
/>

<svelte:head>
	{@html `<script type="application/ld+json">${jsonLd}</script>`}
	{@html `<script type="application/ld+json">${faqLd}</script>`}
</svelte:head>

<div class="landing" dir="rtl">
	<!-- decorative sparkles -->
	<div class="sparkles" aria-hidden="true">
		{#each Array(18) as _, i}
			<span
				class="sparkle"
				style="top:{(i * 37) % 96}%; right:{(i * 53) % 94}%; animation-delay:{(i % 9) * 0.7}s;
				       --s:{6 + (i % 4) * 4}px"
			></span>
		{/each}
	</div>

	<!-- ══════════ HERO ══════════ -->
	<section class="hero">
		<div class="hero-inner" in:fly={{ y: 28, duration: 700, easing: quintOut }}>
			<span class="eyebrow">ברבי עיצובים · סטודיו בטבריה</span>

			<h1 class="hero-title">
				<span class="line-1">התכשיט שלך.</span>
				<span class="line-2 sparkly-uv">בעיצוב שלך.</span>
			</h1>

			<p class="hero-sub">
				לא לבחור מתוך מה שיש — <strong>ליצור</strong> את מה שאין. מעצבת התכשיטים שלי פותחת לך את
				הסטודיו מהבית: כמה תבניות לבחירה, מגוון חרוזים בחומרים ובגדלים שונים, חרוזי אותיות בעברית
				ובאנגלית, קסמים ותליונים — והכל מתאים בדיוק למידה שלך.
			</p>

			<div class="cta-row">
				<a class="cta-primary" href={DESIGNER_URL}>להתחיל לעצב עכשיו ←</a>
				<a class="cta-ghost" href="#how">קודם תסבירי לי איך זה עובד</a>
			</div>

			<ul class="trust">
				<li><span aria-hidden="true">🤍</span> ללא התחייבות — מעצבים, ואז מחליטים</li>
				<li><span aria-hidden="true">📏</span> מותאם למידת פרק היד שלך</li>
				<li><span aria-hidden="true">✋</span> בעבודת יד בסטודיו בטבריה</li>
			</ul>
		</div>

		<!-- animated bracelet illustration -->
		<div class="hero-art" in:fade={{ duration: 900, delay: 250 }} aria-hidden="true">
			<svg viewBox="0 0 320 320" class="bracelet-svg">
				<defs>
					<linearGradient id="li-gold" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stop-color="#FCF6BA" />
						<stop offset="50%" stop-color="#BF953F" />
						<stop offset="100%" stop-color="#8a6a1f" />
					</linearGradient>
					<radialGradient id="li-pearl" cx="35%" cy="30%" r="75%">
						<stop offset="0%" stop-color="#ffffff" />
						<stop offset="55%" stop-color="#f6efe7" />
						<stop offset="100%" stop-color="#d8c8b8" />
					</radialGradient>
					<radialGradient id="li-pink" cx="35%" cy="30%" r="75%">
						<stop offset="0%" stop-color="#ffffff" />
						<stop offset="45%" stop-color="#ffd0e2" />
						<stop offset="100%" stop-color="#ec4899" />
					</radialGradient>
				</defs>

				<circle cx="160" cy="160" r="112" fill="none" stroke="url(#li-gold)" stroke-width="2" opacity="0.5" />

				{#each Array(24) as _, i}
					{@const angle = (i / 24) * Math.PI * 2 - Math.PI / 2}
					{@const cx = 160 + 112 * Math.cos(angle)}
					{@const cy = 160 + 112 * Math.sin(angle)}
					{@const isLetter = i >= 10 && i <= 13}
					<g class="orbit-bead" style="animation-delay:{i * 0.12}s">
						<circle
							cx={cx}
							cy={cy}
							r={isLetter ? 13 : 10}
							fill={isLetter ? 'url(#li-pink)' : 'url(#li-pearl)'}
							stroke="#ffffff"
							stroke-width="1.5"
						/>
						{#if isLetter}
							<text
								x={cx}
								y={cy}
								text-anchor="middle"
								dominant-baseline="central"
								font-size="12"
								font-weight="700"
								fill="#831843">{['ב', 'ר', 'כ', 'ה'][i - 10]}</text
							>
						{/if}
					</g>
				{/each}

				<!-- center pendant -->
				<g class="pendant">
					<path
						d="M160 120 C 148 104, 122 108, 122 130 C 122 152, 148 166, 160 182 C 172 166, 198 152, 198 130 C 198 108, 172 104, 160 120 Z"
						fill="url(#li-gold)"
						stroke="#fff8dc"
						stroke-width="1.5"
					/>
					<circle cx="146" cy="128" r="4" fill="#fffdf3" opacity="0.85" />
				</g>
				<text
					x="160"
					y="212"
					text-anchor="middle"
					font-size="15"
					font-weight="700"
					fill="#831843"
					opacity="0.85">התכשיט שלך</text
				>
			</svg>
		</div>
	</section>

	<!-- ══════════ TEMPLATES ══════════ -->
	<section class="band band-light">
		<div class="wrap">
			<h2 class="section-title">מתחילות מתבנית — ומשם הכל שלך</h2>
			<p class="section-lead">
				התבנית היא הבסיס של התכשיט: היא קובעת את הצורה ואת נקודות העיצוב. בוחרים אחת, וכל שאר
				ההחלטות נשארות אצלך.
			</p>

			<div class="cards">
				{#each templates as t}
					<article class="card">
						<div class="card-icon" aria-hidden="true">{t.icon}</div>
						<h3>{t.title}</h3>
						<p>{t.body}</p>
						<ul class="chips">
							{#each t.tags as tag}
								<li>{tag}</li>
							{/each}
						</ul>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- ══════════ BEADS ══════════ -->
	<section class="band band-pink">
		<div class="wrap">
			<h2 class="section-title">עולם שלם של חרוזים</h2>
			<p class="section-lead">
				כל נקודה בתכשיט היא בחירה. אותה תבנית תיראה אחרת לגמרי עם פנינה לבנה, עם זהב או עם קריסטל
				סגלגל — וזה בדיוק העניין.
			</p>

			<div class="swatches">
				{#each materials as m, mi}
					<div class="swatch">
						<svg viewBox="0 0 64 64" aria-hidden="true">
							<defs>
								<radialGradient id="mat-{mi}" cx="35%" cy="30%" r="75%">
									{#each m.stops as [offset, color]}
										<stop offset={offset} stop-color={color} />
									{/each}
								</radialGradient>
							</defs>
							<circle cx="32" cy="32" r="26" fill="url(#mat-{mi})" stroke="#ffffff" stroke-width="2" />
							<ellipse cx="24" cy="23" rx="7" ry="5" fill="#ffffff" opacity="0.55" />
						</svg>
						<p class="swatch-name">{m.name}</p>
						<p class="swatch-note">{m.note}</p>
					</div>
				{/each}
			</div>

			<div class="two-col">
				<div class="mini-card">
					<h3>שלושה גדלים, מראה אחר לגמרי</h3>
					<p>
						חרוזים קטנים לעיצוב עדין ומדויק, בינוניים לקלאסי, גדולים להצהרה. הגודל משפיע גם על מספר
						החרוזים שנכנסים — והמערכת דואגת לזה במקומך.
					</p>
					<div class="size-row">
						{#each sizes as s}
							<div class="size-item">
								<svg viewBox="0 0 44 44" aria-hidden="true">
									<defs>
										<radialGradient id="sz-{s.label}" cx="35%" cy="30%" r="75%">
											<stop offset="0%" stop-color="#ffffff" />
											<stop offset="45%" stop-color="#f7f2ec" />
											<stop offset="100%" stop-color="#ddd0c2" />
										</radialGradient>
									</defs>
									<circle cx="22" cy="22" r={s.r} fill="url(#sz-{s.label})" stroke="#fff" stroke-width="1.5" />
								</svg>
								<span class="size-label">{s.label}</span>
								<span class="size-cm">{s.cm}</span>
							</div>
						{/each}
					</div>
				</div>

				<div class="mini-card">
					<h3>חרוזי אותיות — עברית ואנגלית</h3>
					<p>
						שם של מישהי אהובה, מילה שמחזיקה אותך, תאריך שאת לא רוצה לשכוח. כותבת את הטקסט, והאותיות
						מסתדרות במרכז התכשיט בסדר ובכיוון הנכון — בלי שתצטרכי לחשב כלום.
					</p>
					<div class="letters">
						<!-- each group keeps its own reading direction so the beads spell the word -->
						<span class="letter-group" dir="rtl">
							{#each ['א', 'ה', 'ב', 'ה'] as letter, li}
								<span class="letter-bead" style="animation-delay:{li * 0.15}s">{letter}</span>
							{/each}
						</span>
						<span class="letter-group" dir="ltr">
							{#each ['L', 'O', 'V', 'E'] as letter, li}
								<span class="letter-bead" style="animation-delay:{(li + 4) * 0.15}s">{letter}</span>
							{/each}
						</span>
					</div>
				</div>
			</div>

			<div class="cards">
				<article class="card">
					<div class="card-icon" aria-hidden="true">💛</div>
					<h3>קסמים קטנים</h3>
					<p>
						לב, כוכב, פרפר, פרח, חמסה, עין, עוגן, מפתח — התוספות הקטנות שהופכות תכשיט נחמד לתכשיט
						שמספר סיפור.
					</p>
				</article>
				<article class="card">
					<div class="card-icon" aria-hidden="true">🔆</div>
					<h3>תליון מרכזי</h3>
					<p>
						לב גדול, עץ החיים, מגן דוד, חמסה מפורטת, אינפיניטי או פרפר צבעוני — נקודת המבט של
						התכשיט.
					</p>
				</article>
				<article class="card">
					<div class="card-icon" aria-hidden="true">👀</div>
					<h3>רואה הכל בזמן אמת</h3>
					<p>
						כל חרוז שאת מוסיפה מופיע מיד על התכשיט על המסך, יחד עם המחיר המעודכן. אפשר להתלבט, להחליף
						ולהתחיל מהתחלה — בלי לשלם על התלבטות.
					</p>
				</article>
			</div>
		</div>
	</section>

	<!-- ══════════ HOW IT WORKS ══════════ -->
	<section class="band band-light" id="how">
		<div class="wrap">
			<h2 class="section-title">איך זה עובד — חמישה צעדים</h2>
			<p class="section-lead">כל התהליך אצלך בטלפון או במחשב, בקצב שלך.</p>

			<ol class="steps">
				{#each steps as s}
					<li class="step">
						<div class="step-num" aria-hidden="true">{s.n}</div>
						<div class="step-body">
							<h3>{s.title}</h3>
							<p>{s.body}</p>
						</div>
					</li>
				{/each}
			</ol>

			<div class="inline-cta">
				<a class="cta-primary" href={DESIGNER_URL}>יאללה, מתחילה ←</a>
			</div>
		</div>
	</section>

	<!-- ══════════ FIT ══════════ -->
	<section class="band band-dark">
		<div class="wrap fit-wrap">
			<div class="fit-text">
				<h2 class="section-title on-dark">המידה — החלק שאף אחד לא אוהב, וכאן הוא פתור</h2>
				<p>
					צמיד יפה שלא במידה נשאר במגירה. לכן במעצבת בוחרים היקף פרק יד (בין 12 ל-25 ס"מ), והמערכת
					עושה את החשבון: כמה חרוזים נכנסים, איפה נגמר המקום, וכמה מרווח להשאיר לתפס.
				</p>
				<ul class="fit-list">
					<li>המערכת שומרת מקום לתפס — כדי שהצמיד ייסגר בנוחות</li>
					<li>בוחרת חרוז גדול יותר? מספר החרוזים והמידה מתעדכנים לבד</li>
					<li>הטקסט שכתבת נבדק מול המקום הפנוי, ואם הוא ארוך מדי תדעי מיד</li>
				</ul>
			</div>
			<div class="fit-art" aria-hidden="true">
				<div class="ruler">
					{#each Array(14) as _, i}
						<span class="tick" class:major={i % 2 === 0}>{i % 2 === 0 ? 12 + i : ''}</span>
					{/each}
				</div>
				<p class="ruler-caption">היקף פרק היד בסנטימטרים</p>
			</div>
		</div>
	</section>

	<!-- ══════════ SAME TEMPLATE, DIFFERENT LOOKS ══════════ -->
	<section class="band band-light">
		<div class="wrap">
			<h2 class="section-title">אותה תבנית, שלוש נשים שונות</h2>
			<p class="section-lead">
				זה אותו צמיד בדיוק — רק החרוזים התחלפו. וזה כל הרעיון: התכשיט יוצא דומה לך, לא למישהי
				אחרת.
			</p>

			<svg width="0" height="0" style="position:absolute" aria-hidden="true">
				<defs>
					<radialGradient id="look-pearl" cx="35%" cy="30%" r="75%">
						<stop offset="0%" stop-color="#ffffff" />
						<stop offset="50%" stop-color="#f7f2ec" />
						<stop offset="100%" stop-color="#ddd0c2" />
					</radialGradient>
					<radialGradient id="look-gold" cx="35%" cy="30%" r="75%">
						<stop offset="0%" stop-color="#fdf8c9" />
						<stop offset="45%" stop-color="#bf953f" />
						<stop offset="100%" stop-color="#8a6a1f" />
					</radialGradient>
					<radialGradient id="look-crystal" cx="35%" cy="30%" r="75%">
						<stop offset="0%" stop-color="#ffffff" />
						<stop offset="45%" stop-color="#e6d9ff" />
						<stop offset="100%" stop-color="#b39ddb" />
					</radialGradient>
					<radialGradient id="look-pink" cx="35%" cy="30%" r="75%">
						<stop offset="0%" stop-color="#ffffff" />
						<stop offset="45%" stop-color="#ffd0e2" />
						<stop offset="100%" stop-color="#ec4899" />
					</radialGradient>
				</defs>
			</svg>

			<div class="looks">
				{#each looks as look}
					<figure class="look">
						<svg viewBox="0 0 200 200" aria-hidden="true">
							<circle
								cx="100"
								cy="100"
								r="68"
								fill="none"
								stroke="#e8d3a8"
								stroke-width="1.5"
								opacity="0.7"
							/>
							{#each Array(20) as _, i}
								{@const angle = (i / 20) * Math.PI * 2 - Math.PI / 2}
								{@const bx = 100 + 68 * Math.cos(angle)}
								{@const by = 100 + 68 * Math.sin(angle)}
								{@const letterIndex = i - 8}
								{@const isLetter = look.letters.length > 0 && letterIndex >= 0 && letterIndex < look.letters.length}
								{@const isAccent = !isLetter && i % 5 === 0}
								<circle
									cx={bx}
									cy={by}
									r={isLetter ? 10 : 8}
									fill={isLetter ? look.accent : isAccent ? look.accent : look.bead}
									stroke="#ffffff"
									stroke-width="1.2"
								/>
								{#if isLetter}
									<text
										x={bx}
										y={by}
										text-anchor="middle"
										dominant-baseline="central"
										font-size="10"
										font-weight="700"
										fill="#831843">{look.letters[letterIndex]}</text
									>
								{/if}
							{/each}
						</svg>
						<figcaption>
							<strong>{look.title}</strong>
							<span>{look.caption}</span>
						</figcaption>
					</figure>
				{/each}
			</div>

			<p class="looks-note">
				מה שאת מעצבת על המסך נוצר אחר כך בעבודת יד, כאן בסטודיו בטבריה.
			</p>
		</div>
	</section>

	<!-- ══════════ FAQ ══════════ -->
	<section class="band band-pink">
		<div class="wrap">
			<h2 class="section-title">שאלות שנשאלתי כבר</h2>
			<div class="faq">
				{#each faq as item}
					<details>
						<summary>{item.q}</summary>
						<p>{item.a}</p>
					</details>
				{/each}
			</div>
		</div>
	</section>

	<!-- ══════════ FINAL CTA ══════════ -->
	<section class="band band-final">
		<div class="wrap final">
			<h2 class="final-title sparkly-uv">מוכנה לראות את התכשיט שלך?</h2>
			<p class="final-sub">
				זה לוקח כמה דקות, זה חינם, וזה לא מחייב אותך בכלום. בואי נראה מה יוצא.
			</p>
			<a class="cta-primary big" href={DESIGNER_URL}>לפתיחת מעצבת התכשיטים ←</a>

			<p class="or">או שנדבר קודם?</p>
			<div class="wa">
				<WhatsappButton text="עיצוב תכשיט אישי אונליין" rotate={false} />
			</div>

			<a class="cta-ghost" href="/sadnaot">מעדיפה לעצב איתי פנים אל פנים? לסדנאות בסטודיו</a>
		</div>
	</section>
</div>

<style>
	.landing {
		position: relative;
		min-height: 100vh;
		overflow-x: hidden;
		font-family: 'Heebo', 'MakabiYG', sans-serif;
		background: #fff6fa;
		isolation: isolate;
	}

	/* ── sparkles ─────────────────────────── */
	.sparkles {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 0;
		overflow: hidden;
	}

	.sparkle {
		position: absolute;
		width: var(--s);
		height: var(--s);
		background: radial-gradient(circle, #fff 0%, rgba(252, 246, 186, 0.85) 40%, transparent 70%);
		border-radius: 50%;
		opacity: 0;
		animation: twinkle 5.5s ease-in-out infinite;
	}

	@keyframes twinkle {
		0%,
		100% {
			opacity: 0;
			transform: scale(0.4);
		}
		45% {
			opacity: 0.95;
			transform: scale(1);
		}
	}

	/* ── hero ─────────────────────────────── */
	.hero {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-columns: 1.15fr 0.85fr;
		gap: 2.5rem;
		align-items: center;
		padding: 4.5rem 1.5rem 4rem;
		max-width: 1180px;
		margin: 0 auto;
	}

	.eyebrow {
		display: inline-block;
		font-size: 0.85rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: #9d174d;
		background: linear-gradient(90deg, rgba(252, 246, 186, 0.9), rgba(251, 207, 232, 0.9));
		border: 1px solid rgba(191, 149, 63, 0.35);
		border-radius: 2rem;
		padding: 0.35rem 1rem;
		margin-bottom: 1.25rem;
	}

	.hero-title {
		font-size: clamp(2.4rem, 6.5vw, 4.2rem);
		font-weight: 900;
		line-height: 1.05;
		margin: 0 0 1.1rem;
		font-family: 'MakabiYG', 'Heebo', sans-serif;
	}

	.hero-title .line-1,
	.hero-title .line-2 {
		display: block;
	}

	.hero-title .line-1 {
		color: #831843;
	}

	.hero-sub {
		font-size: clamp(1rem, 2.1vw, 1.2rem);
		line-height: 1.75;
		color: #7a1f47;
		max-width: 34rem;
		margin: 0 0 1.75rem;
	}

	.hero-sub strong {
		color: #be185d;
		font-weight: 800;
	}

	.cta-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.9rem;
		margin-bottom: 1.75rem;
	}

	.cta-primary {
		display: inline-block;
		background: linear-gradient(135deg, #831843 0%, #be185d 45%, #ec4899 72%, #831843 100%);
		color: #fcf6ba;
		font-weight: 800;
		font-size: 1.05rem;
		padding: 0.9rem 2rem;
		border-radius: 2rem;
		border: 2px solid #bf953f;
		text-decoration: none;
		box-shadow:
			0 6px 22px rgba(190, 24, 93, 0.4),
			0 0 0 1px rgba(252, 246, 186, 0.25) inset;
		transition:
			transform 0.25s ease,
			box-shadow 0.25s ease;
	}

	.cta-primary:hover {
		transform: translateY(-3px);
		box-shadow: 0 10px 30px rgba(236, 72, 153, 0.55);
	}

	.cta-primary.big {
		font-size: 1.2rem;
		padding: 1.05rem 2.6rem;
	}

	.cta-ghost {
		display: inline-block;
		color: #9d174d;
		font-weight: 700;
		font-size: 0.98rem;
		text-decoration: none;
		border-bottom: 2px dotted rgba(157, 23, 77, 0.45);
		padding-bottom: 0.15rem;
	}

	.cta-ghost:hover {
		color: #be185d;
		border-bottom-style: solid;
	}

	.trust {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem 1.4rem;
	}

	.trust li {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		font-size: 0.92rem;
		font-weight: 600;
		color: #9d174d;
	}

	/* ── hero art ─────────────────────────── */
	.hero-art {
		display: flex;
		justify-content: center;
	}

	.bracelet-svg {
		width: 100%;
		max-width: 360px;
		height: auto;
		filter: drop-shadow(0 12px 28px rgba(190, 24, 93, 0.22));
		animation: slow-spin 60s linear infinite;
	}

	@keyframes slow-spin {
		to {
			transform: rotate(360deg);
		}
	}

	.orbit-bead {
		animation: bead-pop 4.5s ease-in-out infinite;
		transform-box: fill-box;
		transform-origin: center;
	}

	@keyframes bead-pop {
		0%,
		100% {
			opacity: 0.85;
		}
		50% {
			opacity: 1;
		}
	}

	.pendant {
		animation: pendant-float 4s ease-in-out infinite;
		transform-box: fill-box;
		transform-origin: center;
	}

	@keyframes pendant-float {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.06);
		}
	}

	/* ── bands ────────────────────────────── */
	.band {
		position: relative;
		z-index: 1;
		padding: 3.75rem 1.25rem;
	}

	.band-light {
		background: linear-gradient(180deg, #fffdfe 0%, #fff4f9 100%);
	}

	.band-pink {
		background: linear-gradient(180deg, #ffeaf3 0%, #ffdcea 100%);
	}

	.band-dark {
		background: linear-gradient(135deg, #5b0c2f 0%, #831843 55%, #4a0a26 100%);
		color: #ffe9f2;
	}

	.band-final {
		background:
			radial-gradient(ellipse at 50% 0%, rgba(252, 246, 186, 0.55) 0%, transparent 60%),
			linear-gradient(180deg, #ffdcea 0%, #ff9cc0 100%);
		text-align: center;
	}

	.wrap {
		max-width: 1120px;
		margin: 0 auto;
	}

	.section-title {
		font-family: 'MakabiYG', 'Heebo', sans-serif;
		font-size: clamp(1.6rem, 4vw, 2.5rem);
		font-weight: 900;
		line-height: 1.2;
		margin: 0 0 0.85rem;
		color: #831843;
		text-align: center;
	}

	.section-title.on-dark {
		color: #fcf6ba;
		text-align: right;
	}

	.section-lead {
		text-align: center;
		font-size: 1.05rem;
		line-height: 1.7;
		color: #9d174d;
		max-width: 46rem;
		margin: 0 auto 2.5rem;
	}

	/* ── cards ────────────────────────────── */
	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 1.25rem;
	}

	.card {
		background: #fff;
		border: 1px solid rgba(191, 149, 63, 0.28);
		border-radius: 1.1rem;
		padding: 1.5rem 1.35rem;
		box-shadow: 0 6px 20px rgba(190, 24, 93, 0.1);
		transition:
			transform 0.25s ease,
			box-shadow 0.25s ease;
	}

	.card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 28px rgba(190, 24, 93, 0.18);
	}

	.card-icon {
		font-size: 2rem;
		line-height: 1;
		margin-bottom: 0.7rem;
	}

	.card h3 {
		font-size: 1.2rem;
		font-weight: 800;
		color: #be185d;
		margin: 0 0 0.55rem;
	}

	.card p {
		font-size: 0.97rem;
		line-height: 1.7;
		color: #7a1f47;
		margin: 0;
	}

	.chips {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		padding: 0;
		margin: 1rem 0 0;
	}

	.chips li {
		font-size: 0.78rem;
		font-weight: 700;
		color: #9d174d;
		background: linear-gradient(90deg, rgba(252, 246, 186, 0.7), rgba(251, 207, 232, 0.7));
		border: 1px solid rgba(191, 149, 63, 0.3);
		border-radius: 1rem;
		padding: 0.22rem 0.7rem;
	}

	/* ── swatches ─────────────────────────── */
	.swatches {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 1rem;
		margin-bottom: 2.5rem;
	}

	.swatch {
		background: rgba(255, 255, 255, 0.75);
		border: 1px solid rgba(191, 149, 63, 0.28);
		border-radius: 1rem;
		padding: 1rem 0.6rem;
		text-align: center;
		backdrop-filter: blur(4px);
	}

	.swatch svg {
		width: 58px;
		height: 58px;
		display: block;
		margin: 0 auto 0.5rem;
		filter: drop-shadow(0 3px 6px rgba(131, 24, 67, 0.18));
	}

	.swatch-name {
		font-size: 0.95rem;
		font-weight: 800;
		color: #be185d;
		margin: 0;
	}

	.swatch-note {
		font-size: 0.78rem;
		color: #9d174d;
		margin: 0.15rem 0 0;
		opacity: 0.85;
	}

	/* ── two column mini cards ────────────── */
	.two-col {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.25rem;
		margin-bottom: 2.5rem;
	}

	.mini-card {
		background: #fff;
		border: 1px solid rgba(191, 149, 63, 0.28);
		border-radius: 1.1rem;
		padding: 1.5rem 1.35rem;
		box-shadow: 0 6px 20px rgba(190, 24, 93, 0.1);
	}

	.mini-card h3 {
		font-size: 1.15rem;
		font-weight: 800;
		color: #be185d;
		margin: 0 0 0.6rem;
	}

	.mini-card p {
		font-size: 0.97rem;
		line-height: 1.7;
		color: #7a1f47;
		margin: 0 0 1.1rem;
	}

	.size-row {
		display: flex;
		align-items: flex-end;
		justify-content: space-around;
		gap: 0.75rem;
	}

	.size-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.2rem;
	}

	.size-item svg {
		width: 46px;
		height: 46px;
	}

	.size-label {
		font-size: 0.85rem;
		font-weight: 800;
		color: #be185d;
	}

	.size-cm {
		font-size: 0.75rem;
		color: #9d174d;
	}

	.letters {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem 0.9rem;
	}

	.letter-group {
		display: flex;
		gap: 0.5rem;
	}

	.letter-bead {
		width: 2.5rem;
		height: 2.5rem;
		display: grid;
		place-items: center;
		border-radius: 50%;
		font-weight: 800;
		font-size: 1rem;
		color: #831843;
		background: radial-gradient(circle at 35% 30%, #fff 0%, #ffd0e2 45%, #ec4899 100%);
		border: 2px solid #fff;
		box-shadow: 0 3px 8px rgba(190, 24, 93, 0.28);
		animation: bead-bob 3s ease-in-out infinite;
	}

	@keyframes bead-bob {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-5px);
		}
	}

	/* ── steps ────────────────────────────── */
	.steps {
		list-style: none;
		padding: 0;
		margin: 0 auto 2.25rem;
		max-width: 44rem;
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}

	.step {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		background: #fff;
		border: 1px solid rgba(191, 149, 63, 0.28);
		border-radius: 1rem;
		padding: 1.15rem 1.25rem;
		box-shadow: 0 4px 14px rgba(190, 24, 93, 0.09);
	}

	.step-num {
		flex-shrink: 0;
		width: 2.4rem;
		height: 2.4rem;
		display: grid;
		place-items: center;
		border-radius: 50%;
		font-weight: 900;
		font-size: 1.1rem;
		color: #831843;
		background: linear-gradient(135deg, #fcf6ba 0%, #bf953f 100%);
		border: 2px solid #fff;
		box-shadow: 0 3px 8px rgba(191, 149, 63, 0.35);
	}

	.step-body h3 {
		font-size: 1.1rem;
		font-weight: 800;
		color: #be185d;
		margin: 0 0 0.3rem;
	}

	.step-body p {
		font-size: 0.97rem;
		line-height: 1.7;
		color: #7a1f47;
		margin: 0;
	}

	.inline-cta {
		text-align: center;
	}

	/* ── fit section ──────────────────────── */
	.fit-wrap {
		display: grid;
		grid-template-columns: 1.2fr 0.8fr;
		gap: 2.5rem;
		align-items: center;
	}

	.fit-text p {
		font-size: 1.03rem;
		line-height: 1.75;
		color: #ffe0ee;
		margin: 0 0 1.2rem;
	}

	.fit-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}

	.fit-list li {
		position: relative;
		padding-right: 1.65rem;
		font-size: 0.98rem;
		line-height: 1.6;
		color: #ffeaf4;
	}

	.fit-list li::before {
		content: '✦';
		position: absolute;
		right: 0;
		top: 0;
		color: #fcf6ba;
		font-size: 1rem;
	}

	.fit-art {
		text-align: center;
	}

	.ruler {
		display: flex;
		align-items: flex-end;
		justify-content: center;
		gap: 0.35rem;
		padding: 1.25rem 0.75rem 0.75rem;
		background: linear-gradient(180deg, rgba(252, 246, 186, 0.16), rgba(252, 246, 186, 0.05));
		border: 1px solid rgba(252, 246, 186, 0.35);
		border-radius: 0.9rem;
	}

	.tick {
		display: flex;
		flex-direction: column-reverse;
		align-items: center;
		font-size: 0.68rem;
		font-weight: 700;
		color: #fcf6ba;
		width: 1.5rem;
	}

	.tick::before {
		content: '';
		display: block;
		width: 2px;
		height: 14px;
		background: rgba(252, 246, 186, 0.55);
		margin-bottom: 0.3rem;
		border-radius: 1px;
	}

	.tick.major::before {
		height: 26px;
		background: #fcf6ba;
	}

	.ruler-caption {
		margin: 0.75rem 0 0;
		font-size: 0.88rem;
		color: #ffd9e9;
	}

	/* ── looks ────────────────────────────── */
	.looks {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
		gap: 1.1rem;
	}

	.look {
		margin: 0;
		background: #fff;
		border: 1px solid rgba(191, 149, 63, 0.28);
		border-radius: 1.1rem;
		padding: 1rem 0.75rem 1.1rem;
		text-align: center;
		box-shadow: 0 6px 20px rgba(190, 24, 93, 0.1);
	}

	.look svg {
		width: 100%;
		max-width: 190px;
		height: auto;
		display: block;
		margin: 0 auto 0.6rem;
		filter: drop-shadow(0 5px 12px rgba(131, 24, 67, 0.15));
	}

	.look figcaption strong {
		display: block;
		font-size: 1.05rem;
		font-weight: 800;
		color: #be185d;
	}

	.look figcaption span {
		display: block;
		font-size: 0.85rem;
		color: #9d174d;
		margin-top: 0.15rem;
	}

	.looks-note {
		text-align: center;
		margin: 1.75rem 0 0;
		font-size: 0.98rem;
		font-weight: 600;
		color: #9d174d;
	}

	/* ── faq ──────────────────────────────── */
	.faq {
		max-width: 46rem;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}

	.faq details {
		background: #fff;
		border: 1px solid rgba(191, 149, 63, 0.3);
		border-radius: 0.9rem;
		padding: 0.95rem 1.2rem;
		box-shadow: 0 4px 12px rgba(190, 24, 93, 0.08);
	}

	.faq summary {
		cursor: pointer;
		font-weight: 800;
		font-size: 1.02rem;
		color: #be185d;
		list-style: none;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.faq summary::-webkit-details-marker {
		display: none;
	}

	.faq summary::before {
		content: '＋';
		font-weight: 900;
		color: #bf953f;
	}

	.faq details[open] summary::before {
		content: '－';
	}

	.faq p {
		margin: 0.7rem 0 0;
		font-size: 0.97rem;
		line-height: 1.75;
		color: #7a1f47;
	}

	/* ── final ────────────────────────────── */
	.final {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
	}

	.final-title {
		font-family: 'MakabiYG', 'Heebo', sans-serif;
		font-size: clamp(1.8rem, 5vw, 3rem);
		font-weight: 900;
		margin: 0 0 0.6rem;
	}

	.final-sub {
		font-size: 1.05rem;
		line-height: 1.7;
		color: #7a1f47;
		max-width: 34rem;
		margin: 0 0 1.6rem;
	}

	.or {
		margin: 1.75rem 0 0;
		font-size: 0.95rem;
		font-weight: 700;
		color: #831843;
	}

	/* WhatsappButton ships with margin-left: 30px on its floating state */
	.wa {
		margin-left: -30px;
		margin-bottom: 0.5rem;
	}

	/* ── responsive ───────────────────────── */
	@media (max-width: 900px) {
		.hero {
			grid-template-columns: 1fr;
			padding: 3rem 1.25rem 2.5rem;
			text-align: center;
		}

		.hero-sub,
		.trust {
			margin-inline: auto;
			justify-content: center;
		}

		.cta-row {
			justify-content: center;
		}

		.hero-art {
			order: -1;
		}

		.bracelet-svg {
			max-width: 260px;
		}

		.fit-wrap {
			grid-template-columns: 1fr;
		}

		.section-title.on-dark {
			text-align: center;
		}
	}

	@media (max-width: 480px) {
		.band {
			padding: 2.75rem 1rem;
		}

		.cta-primary {
			width: 100%;
			text-align: center;
		}

		.ruler {
			gap: 0.15rem;
		}

		.tick {
			width: 1.1rem;
			font-size: 0.6rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		/* the sparkles get their visibility from the animation — hold them at a steady glow */
		.sparkle {
			opacity: 0.5;
		}

		.sparkle,
		.bracelet-svg,
		.orbit-bead,
		.pendant,
		.letter-bead {
			animation: none;
		}

		.card:hover,
		.cta-primary:hover {
			transform: none;
		}
	}
</style>
