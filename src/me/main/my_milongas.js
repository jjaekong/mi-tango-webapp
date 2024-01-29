import { collection, getDocs, getFirestore, query, where } from "firebase/firestore"
import { html, nothing } from "lit-html"
import { map } from 'lit-html/directives/map.js'
import { until } from 'lit-html/directives/until.js'
import { ENV } from "../../config"

export const MyMilongas = async (currentUser) => {

	const db = getFirestore()
	const q = query(collection(db, `${ENV}.milongas`), where('createdBy', '==', currentUser.uid))
	const qSnap = await getDocs(q)

	qSnap.forEach((doc) => {
		console.log(doc.id, " => ", doc.data());
	});

	return html`
		<section class="mb-4 bg-white p-5 rounded-xl shadow-xl shadow-slate-100">
			<header class="mb-4">
				<h6 class="font-bold text-lg">내 밀롱가 (${html`${qSnap.size})`}</h6>
			</header>
			<ul>
				${
					map(qSnap.docs, (doc) => {
						const data = {
							id: doc.id,
							...doc.data()
						}
						return html`
							<li class="mt-3">
								<a href="#milonga/${data.id}" class="flex items-center">
									<div class="flex-0">
										${data.logoURL ? html`AA` : html`<div class="size-12 bg-slate-100 rounded-xl"></div>` }
									</div>
									<div class="mx-3">
										${data.name}
									</div>
								</a>
							</li>
						`
					})
				}
			</ul>
		</section>
	`
}