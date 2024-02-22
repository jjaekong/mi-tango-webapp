import dayjs from "dayjs/esm"
import { getDoc, getDocs, getFirestore, query, where, collection, orderBy, startAt, endAt } from "firebase/firestore"
import { html, render } from "lit-html"
import { MilongaEventItem } from "./components/milonga_event_item"

export const AllMilongaEvents = async () => {

	const db = getFirestore()
	const q = query(
		collection(db, `${process.env.MODE}.milonga_events`),
		where('countryCode', '==', localStorage.getItem('country_code')),
        where('startAt', '>', dayjs().hour(6).toDate()),
		orderBy('startAt')
	)
	const qSnap = await getDocs(q)
	// console.log(qSnap)
	// // qSnap.forEach(doc => {
	// // 	console.log(doc.data())
	// // })
	
	render(html`
		<div class="p-5">
            <ul>
                ${
                    qSnap.docs.map(doc => {
                        return html`<li class="bg-white mt-3 p-3 rounded-xl">${ MilongaEventItem({ id: doc.id, ...doc.data() }) }</li>`
                    })
                }
            </ul>
		</div>
	`, document.getElementById('app'))
}