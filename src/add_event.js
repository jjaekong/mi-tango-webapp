import { html, render } from "lit-html"

export const AddEvent = () => {
	render(html`
		<div class="p-5">
			ADD EVENT
		</div>
	`, document.getElementById('app'))
}