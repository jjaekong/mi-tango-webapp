import dayjs from 'dayjs/esm'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { render, html } from 'lit-html'
import { ArrowLeftIcon } from './icons'

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

	render(html`
		<div class="milonga-event relative">
			<header class="p-5 flex items-center -mb-5 h-10 w-full absolute mix-blend-difference z-[10]">
				<div class="min-w-[20%]"><a href="#" @click=${e => { e.preventDefault(); history.back() }}>${ArrowLeftIcon()}</a></div>
				<div class="flex-1"><h1 class="sr-only">밀롱가 이벤트</h1></div>
				<div class="min-w-[20%] flex justify-end"></div>
			</header>
			<div class="shadow-inner shadow-black-700 aspect-[2/1]"></div>
			<div class="p-5">
				<h4 class="font-bold mb-4">${dayjs(milongaEventData.startAt.seconds*1000).format('LLLL')}</h4>
				<a href=#milonga/${milongaEventData.milonga.id} class="block rounded-lg bg-indigo-500 text-white p-3 focus:ring focus:ring-offset-2 focus:ring-indigo-300">
					${milongaEventData.milonga.name}의 정보 보기
				</a>
			</div>
		</div>
	`, document.getElementById('app'))
}