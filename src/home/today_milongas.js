import dayjs from "dayjs/esm"
import { html } from "lit-html"
import { map } from 'lit-html/directives/map.js'
import { MilongaEventItem } from "../components/milonga_event_item.js"

export const TodayMilongas = () => {
	return html`
		<section id="today-milongas" class="mb-4 rounded-3xl bg-white shadow-xl shadow-slate-100 p-5">
			<header class="mb-5 flex flex-wrap justify-between items-end">
				<h2 class="text-lg font-bold">오늘의 밀롱가</h2>
				<time class="font-bold">${dayjs().format("MMM Do dddd")}</time>
			</header>
			<ul>
				${
					map([10, 100, 1000, 1050, 550], item => html`<li class="mt-3">${MilongaEventItem(item)}</li>`)
				}
			</ul>
			<a href="#all_milonga_events" class="block border-t py-4 text-slate-500 text-center mt-4 -mb-5">전체 밀롱가 이벤트 보기</a>
		</section>
	`
}