<script>
	import { Button, Container, Head, Hr, Html, Img, Preview, Section, Text } from 'svelte-email';

	export let name = 'John';
	export let cart = []
	export let total = 0
	const fontFamily =
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';

	const main = {
		backgroundColor: '#ffffff'
	};

	const container = {
		margin: '0 auto',
		padding: '20px 0 48px'
	};

	const logo = {
		margin: '0 auto'
	};

	const paragraph = {
		fontFamily,
		fontSize: '16px',
		lineHeight: '26px'
	};

	const btnContainer = {
		textAlign: 'center'
	};

	const button = {
		fontFamily,
		backgroundColor: '#5F51E8',
		borderRadius: '3px',
		color: '#fff',
		fontSize: '16px',
		textDecoration: 'none',
		textAlign: 'center' ,
		display: 'block'
	};

	const hr = {
		borderColor: '#cccccc',
		margin: '20px 0'
	};

	const footer = {
		fontFamily,
		color: '#8898aa',
		fontSize: '12px'
	};
</script>

<Html lang="en">
	<Head />
	<Preview preview="Welcome to BarB" />
	<Section style={main}>
		<Container style={container}>
			<Img
				src="https://svelte.dev/svelte-logo-horizontal.svg"
				alt="Svelte logo"
				style={logo}
				width="200"
				height="50"
			/>
			<Text style={paragraph}>{name}, welcome to BarB</Text>
			<Text style={paragraph}>A place for Outstanding beutiful designs</Text>
			<Section style={btnContainer}>
			<Text style={paragraph}>הזמנתך על סך 
				{total}
			התקבלה בהצלחה!
			הפריטים שהזמנת:
			{#each cart as car} {car} {/each}
			</Text>
				</Section>
			<Section style={btnContainer}>
				<Button pX={12} pY={12} style={button} href="https://www.barbracha.art">
					View on Site
				</Button>
			</Section>
			<Text style={paragraph}>Happy day!</Text>
			<Hr style={hr} />
			<Text style={footer}>BarB</Text>
		</Container>
	</Section>
</Html>
