import dayjs from "dayjs/esm"
import { collection, getFirestore, query, where, getDocs } from "firebase/firestore"
import { html } from "lit-html"
import { MilongaEventItem } from "../components/milonga_event_item.js"

export const TodayMilongas = async () => {
	
	const countryCode = localStorage.getItem('country_code')
	const db = getFirestore()
	const q = query(
		collection(db, `${process.env.MODE}.milonga_events`),
		where('countryCode', '==', countryCode),
		where('date', '==', dayjs().add(-6, 'hour').format('YYYY-MM-DD')),
	)
	const snap = await getDocs(q)

	return html`
		<section id="today-milongas" class="mb-4 p-5 rounded-2xl bg-white shadow-xl">
			<header class="mb-5 flex flex-wrap justify-between items-end">
				<h2 class="text-lg font-bold">오늘의 밀롱가</h2>
				<time class="font-bold">${dayjs().add(-6, 'hour').format("MMM Do dddd")}</time>
			</header>
			${
				snap.empty
					? html`<p class="text-slate-500">오늘은 밀롱가가 없어요</p>`
					: html`
                        <ul>
                            ${
                                snap.docs.map(doc => html`<li class="mb-3">
                                    ${
                                        MilongaEventItem({
                                            id: doc.id, ...doc.data()
                                        })
                                    }
                                </li>`)
                            }
                        </ul>`
			}
			<a href="#all_milonga_events" class="block border-t py-4 text-slate-500 text-center mt-4 p-5 -mb-5">전체 밀롱가 이벤트 보기</a>
		</section>
	`
}