import { html } from "lit-html"
import { map } from "lit-html/directives/map.js"
import { djItem } from "../components/dj_item.js"

export const DJs = async () => {
	return html`
		<section id="djs" class="mb-4 p-5 rounded-2xl bg-white shadow-xl">
			<header class="mb-5">
				<h2 class="text-lg font-bold">DJ</h2>
				<small class="text-sm text-slate-500">DJ의 밀롱가 일정을 확인하세요.</small>
			</header>
			<ul>
				${
					map([10, 100, 1000, 1050, 550], item => html`<li class="mt-4">${djItem(item)}</li>`)
				}
			</ul>
			<a href="#all_djs" class="block border-t py-4 text-slate-500 text-center mt-4 p-5 -mb-5">전체 DJ 보기</a>
		</section>
	`
}