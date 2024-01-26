import { render, html } from 'lit-html'
import { cache } from 'lit-html/directives/cache.js'

export const Login = () => {
	render(cache(html`
		LOGIN
	`), document.getElementById('app'))
}