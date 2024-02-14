import dayjs from "dayjs/esm"
import { collection, getFirestore, query, where, getDocs } from "firebase/firestore"
import { html } from "lit-html"
import { HashtagIcon, HeadphonesIcon } from "../icons.js"

export const TodayMilongas = async () => {
	
	const milongaEvents = []
	
	console.log(dayjs().add(-6, 'hour'))
	
	const countryCode = localStorage.getItem('country_code')
	const db = getFirestore()
	const q = query(
		collection(db, `${process.env.MODE}.milonga_events`),
		where('countryCode', '==', countryCode),
		where('date', '==', dayjs().add(-6, 'hour').format('YYYY-MM-DD')),
	)
	const snap = await getDocs(q)
	// console.log('snap', snap)

	snap.forEach(doc => {
		const data = doc.data()
		milongaEvents.push(html`
			<li class="mt-3">
				<a href="#milonga_event/${doc.id}" class="flex w-100 items-center">
					<div class="self-start">
						<time class="flex flex-col rounded-xl justify-center items-center leading-tight size-14 bg-slate-100">
							<span class="font-bold">8</span>
							<span class="text-slate-400 text-xs">PM</span>
						</time>
					</div>
					<div class="mx-3">
						<h6 class="font-bold">${data.name}</h6>
						<ul class="inline-flex flex-wrap text-slate-500 text-sm">
							<li class="me-1 inline-flex items-center"><span class="me-1">${ HeadphonesIcon({classList: 'size-4' }) }</span>시스루</li>
							<li class="me-1 inline-flex items-center"><span class="">${ HashtagIcon({classList: 'size-4' }) }</span>예약가능</li>
						</ul>
					</div>
					<div class="ms-auto self-start">
						<img class="block size-14 rounded-xl" src="https://picsum.photos/100/100">
					</div>
				</a>
			</li>
		`)
	})

	return html`
		<section id="today-milongas" class="mb-4 p-5 rounded-2xl bg-white shadow-xl">
			<header class="mb-5 flex flex-wrap justify-between items-end">
				<h2 class="text-lg font-bold">오늘의 밀롱가</h2>
				<time class="font-bold">${dayjs().add(-6, 'hour').format("MMM Do dddd")}</time>
			</header>
			${
				snap.empty
					? html`<p>오늘은 밀롱가가 없어요</p>`
					: html`<ul>${milongaEvents}</ul>`
			}
			<a href="#all_milonga_events" class="block border-t py-4 text-slate-500 text-center mt-4 p-5 -mb-5">전체 밀롱가 이벤트 보기</a>
		</section>
	`
}