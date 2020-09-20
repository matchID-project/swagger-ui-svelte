import App from './App.svelte';
import './scss/global.scss'

const app = new App({
	target: document.body,
	props: {
		name: 'world'
	}
});

export default app;
