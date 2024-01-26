import { render, html } from 'lit-html'
import { cache } from 'lit-html/directives/cache.js'

export const Me = () => {
	render(cache(html`
		ME
	`), document.getElementById('app'))
}