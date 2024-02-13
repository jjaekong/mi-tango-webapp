import { collection, getDocsFromCache, getDocs, getFirestore, query, where } from "firebase/firestore"
import { html } from "lit-html"
import { getCountryName } from "../country"
import { map } from 'lit-html/directives/map.js'

export const LocalMilongas = async () => {

	const db = getFirestore()
    const q = query(
        collection(db, `${process.env.MODE}.milongas`),
        where('countryCode', '==', localStorage.getItem('country_code') || 'KR')
    )
	const milongasSnap = await getDocs(q)
	const milongas = []

	milongasSnap.forEach(doc => {
		milongas.push({
			id: doc.id,
			...doc.data()
		})
	})
	
	return html`
		<section id="today-milongas" class="mb-4 p-5 rounded-3xl bg-white shadow-xl shadow-gray-50">
			<header>
				<h2 class="text-lg font-bold">${getCountryName(localStorage.getItem('country_code'))}의 밀롱가</h2>
			</header>
			<ul>
				${
					map(milongas, m => html`<li class="mt-3"><a href="#milonga/${m.id}">${m.name}</a></li>`)
				}
			</ul>
			<!-- <a href="#all_milonga_events" class="block border-t py-4 text-slate-500 text-center mt-4 -mb-5">전체 밀롱가 이벤트 보기</a> -->
		</section>
	`
}