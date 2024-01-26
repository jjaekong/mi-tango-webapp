import { render, html } from 'lit-html'
import { cache } from 'lit-html/directives/cache.js'

export const MilongaEvent = () => {
	render(cache(html`
		MilongaEvent
	`), document.getElementById('app'))
}