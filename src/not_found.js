import { render, html } from 'lit-html'
import { cache } from 'lit-html/directives/cache.js'

export const NotFound = () => {
	render(cache(html`
		not found
	`), document.getElementById('app'))
}