import { html, render } from "lit-html"

export const AddEvent = () => {
	render(html`
		<div class="p-5">
			add milonga event
			add pratica event
			new milonga
			new lesson
		</div>
	`, document.getElementById('app'))
}