import { render, html } from 'lit-html'
import { cache } from 'lit-html/directives/cache.js'

export const Club = () => {
	render(cache(html`
		Club
	`), document.getElementById('app'))
}