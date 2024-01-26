import { render, html } from 'lit-html'
import { cache } from 'lit-html/directives/cache.js'

export const DJ = () => {
	render(cache(html`
		DJ
	`), document.getElementById('app'))
}