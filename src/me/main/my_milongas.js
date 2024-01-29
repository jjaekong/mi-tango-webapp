import { getAuth } from "firebase/auth"
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore"
import { html, nothing } from "lit-html"
import { map } from 'lit-html/directives/map.js'
import { until } from 'lit-html/directives/until.js'
import { ENV } from "../../config"

export const MyMilongas = async () => {
	
	const auth = getAuth()

	const db = getFirestore()
	const q = query(collection(db, `${ENV}.milongas`), where('createdBy', '==', auth.currentUser.uid))
	const qSnap = await getDocs(q)

	qSnap.forEach((doc) => {
		console.log(doc.id, " => ", doc.data());
	});

	return html`
		<section class="mb-4 bg-white p-5 rounded-xl shadow-xl shadow-slate-100">
			<header>
				<h6>내 밀롱가 (${html`${qSnap.size})`}</h6>
			</header>
			<ul>
				${ map(qSnap.docs, (doc) => html`<li>${doc.data().name}</li>`) }
			</ul>
		</section>
	`
}