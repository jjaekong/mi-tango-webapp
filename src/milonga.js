import { getAuth } from 'firebase/auth'
import { render, html } from 'lit-html'
import { cache } from 'lit-html/directives/cache.js'

export const Milonga = async () => {

	const auth = getAuth()

	await auth.authStateReady()

	render(cache(html`
		milonga
	`), document.getElementById('app'))
}