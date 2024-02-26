import dayjs from 'dayjs/esm'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { render, html, nothing } from 'lit-html'
import { ArrowLeftIcon, AtSymbolIcon, ChevronRightIcon, HeadphonesIcon } from './icons'

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

	const djs = milongaEventData.djs?.length > 0 ? milongaEventData.djs.join(", ") : null

	render(html`
		<div class="milonga-event relative">
			<header class="p-5 flex items-center -mb-5 h-10 w-full absolute mix-blend-difference z-[10]">
				<div class="min-w-[20%]"><a href="#" @click=${e => { e.preventDefault(); history.back() }}>${ArrowLeftIcon()}</a></div>
				<div class="flex-1"><h1 class="sr-only">밀롱가 이벤트</h1></div>
				<div class="min-w-[20%] flex justify-end"></div>
			</header>
			<div class="shadow-inner shadow-black-700">
				<img src="https://picsum.photos/300/400" class="aspect-[2/1] object-cover w-full h-full">
			</div>
			<div class="p-5">
				<h1 class="font-semibold text-lg">${milongaEventData.name}</h1>
				<div class="mb-4">
					<div><time>${dayjs(milongaEventData.startAt.seconds*1000).format('LLLL')}</time></div>
					${
						milongaEventData.place
							? html`<div class="flex items-center">${AtSymbolIcon({ classList: 'size-4 me-1' })}${milongaEventData.place.name}</div>`
							: nothing
					}
					${
						milongaEventData.djs?.length > 0
							? html`
								<div class="flex items-center">
									${HeadphonesIcon({ classList: 'size-4 me-1' })}
									<ul class="inline-flex felx-wrap">
										${milongaEventData.djs.map((dj, index) => {
											return html`<li class="me-1">${dj.name}</li>`
										})}
									</ul>
								</div>`
							: nothing
					}
				</div>
				<a href=#milonga/${milongaEventData.milonga.id} class="btn-primary w-full mb-4 flex items-center">
					<p>${milongaEventData.milonga.name}의 모든 정보 보기</p>
					${ChevronRightIcon({ classList: "size-4 text-white ms-auto" })}
				</a>
				<section class="card p-5 mb-4">
					<header>
						<h1 class="font-semibold">DJs</h1>
					</header>
				</section>
				<section class="card p-5 mb-4">
					<header>
						<h1 class="font-semibold">장소</h1>
					</header>
				</section>
				<section class="card p-5 mb-4">
					<header>
						<h1 class="font-semibold">오거나이저</h1>
					</header>
				</section>
				<section class="card p-5 mb-4">
					<header>
						<h1 class="font-semibold">설명</h1>
					</header>
				</section>
			</div>
		</div>
	`, document.getElementById('app'))
}