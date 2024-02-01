import { html } from "lit-html"
import { map } from "lit-html/directives/map.js"
import { djItem } from "../components/dj_item.js"

export const DJs = () => {
	return html`
		<section id="djs" class="mb-4 rounded-3xl bg-white shadow-xl shadow-slate-100 p-5">
			<header class="mb-5">
				<h2 class="text-xl font-bold">DJ</h2>
				<small class="text-sm text-slate-500">DJ의 밀롱가 일정을 확인하세요.</small>
			</header>
			<ul>
				${
					map([10, 100, 1000, 1050, 550], item => html`<li class="mt-3">${djItem(item)}</li>`)
				}
			</ul>
			<a href="#all_djs" class="block border-t py-4 text-slate-500 text-center mt-4 -mb-5">전체 DJ 보기</a>
		</section>
	`
}