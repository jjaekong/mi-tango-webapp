import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { render, html } from 'lit-html'
import { cache } from 'lit-html/directives/cache.js'

export const MilongaEvent = async () => {

	const milongaEventId = location.hash.split('/')[1]

    console.log('milonga event id ', milongaEventId)

	const db = getFirestore()
	const milongaEventRef = doc(db, `${process.env.MODE}.milonga_events`, milongaEventId)
	const milongaEventSnap = await getDoc(milongaEventRef)
	
	if (!milongaEventSnap.exists()) {
		alert('존재하지 않는 밀롱가 이벤트입니다.');
		history.back()
	}

	const milongaEventData = {
		id: milongaEventSnap.id,
		...milongaEventSnap.data()
	}

	render(cache(html`
		<div class="p-5">
			<a href=#milonga/${milongaEventData.milonga.id} class="block rounded-lg bg-purple-500 text-white p-3 focus:ring focus:ring-offset-2 focus:ring-purple-300">
				${milongaEventData.milonga.name}의 정보 보기
			</a>
		</div>
	`), document.getElementById('app'))
}