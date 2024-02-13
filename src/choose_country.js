import { html, render } from "lit-html"
import { map } from "lit-html/directives/map.js"
import { getCountries } from "./country"

export const ChooseCountry = () => {

	const chooseCountry = (e) => {
		e.preventDefault()
		localStorage.setItem("country_code", document.forms['choose-country-form'].elements['country-code'].value)
		location.replace('/#')
	}

	render(html`
		<div class="choose-country p-5">
			<h1>Mi Vida</h1>
			<p>국가를 선택하세요.</p>
			<form name="choose-country-form" @submit=${chooseCountry}>
				<div class="mb-3">
					${
						map(getCountries(), item => html`
							<label class="flex items-center">
								<input type="radio" name="country-code" value=${item.code} required>
								<span class="ms-1">${item.name}</span>
							</label>
						`)
					}
				</div>
				<div class="mt-4">
					<button type="submit" class="bg-indigo-500 p-3 text-white rounded-lg block">저장</button>
				</div>
			</form>
		</div>
	`, document.getElementById('app'))
}