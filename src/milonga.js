import { render, html } from 'lit-html'
import { cache } from 'lit-html/directives/cache.js'

export const Milonga = () => {
	render(cache(html`
		milonga
	`), document.getElementById('app'))
}