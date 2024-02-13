import { getDoc, getDocs, getFirestore, query, where, collection, orderBy, startAt, endAt } from "firebase/firestore"
import { html, render } from "lit-html"

export const AllMilongaEvents = async () => {

	const db = getFirestore()
	const q = query(
		collection(db, `${process.env.MODE}.milonga_events`),
		where('countryCode', '==', localStorage.getItem('country_code')),
		orderBy('startAt')
	)
	const qSnap = await getDocs(q)
	console.log(qSnap)
	// qSnap.forEach(doc => {
	// 	console.log(doc.data())
	// })
	
	render(html`
		<div class="p-5">
			<ul>${
				qSnap.docs.map(doc => {
					const data = doc.data()
					return html`<li><a class="underline" href="#milonga_event/${doc.id}">${data.name}</a></li>`
				})
			}</ul>
		</div>
	`, document.getElementById('app'))
}