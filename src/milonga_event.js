import dayjs from 'dayjs/esm'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { render, html, nothing } from 'lit-html'
import { djItem } from './components/dj_item'
import { ArrowLeftIcon, AtSymbolIcon, ChevronRightIcon, HeadphonesIcon } from './icons'
import { AddDJDialog } from './components/add_dj_dialog'
import { getMilonga, hasPermitToEditMilonga } from './service'
import { goBack } from './util'
import { getAuth } from 'firebase/auth'

export const MilongaEvent = async () => {

	const auth = getAuth()
	await auth.authStateReady()
    const currentUser = auth.currentUser

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

	console.log('milongaEventData ==> ', milongaEventData)

	const hasPermit = hasPermitToEditMilonga(await getMilonga(milongaEventData.milonga.id), currentUser.email)

	console.log('hasPermit: ', hasPermit)

	render(html`
		<div class="milonga-event relative">
			<header class="p-5 flex items-center w-full absolute top-0 left-0 z-[10] text-white">
				<div class="min-w-[20%]"><a href="#" @click=${goBack}>${ ArrowLeftIcon( { classList: 'rounded-full bg-black/50 text-white size-6' }) }</a></div>
				<div class="flex-1"><h1 class="sr-only">밀롱가 이벤트</h1></div>
				<div class="min-w-[20%] flex justify-end"></div>
			</header>
			<div class="aspect-[4/3] relative">
				<img src="https://picsum.photos/300/400" class="object-cover w-full h-full">
				<div class="absolute bottom-0 left-0 w-full p-5 text-white bg-gradient-to-t from-black">
					<div>
						<h1 class="font-semibold text-lg">${milongaEventData.name}</h1>
						<div><time>${dayjs(milongaEventData.startAt.seconds*1000).format('LLLL')}</time></div>
						<div>${ dayjs(milongaEventData.startAt.seconds*1000).fromNow() }</div>
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
												return html`<li class="me-1">${index == 0 ? dj.name : ', '+dj.name}</li>`
											})}
										</ul>
									</div>`
								: nothing
						}
					</div>
				</div>
			</div>
			<div class="p-5">
				<a href="#milonga/${milongaEventData.milonga.id}" class="btn-primary w-full mb-4 flex items-center">
					<p class="text-left">${milongaEventData.milonga.name}의 모든 정보 보기</p>
					${ChevronRightIcon({ classList: "size-4 text-white ms-auto" })}
				</a>
				<section class="card p-5 mb-4" id="djs">
					<header class="flex items-center">
						<h1 class="font-semibold">DJs</h1>
						${ hasPermit ? html`<button type="button" class="text-indigo-500 ms-auto font-semibold" @click=${e => { document.getElementById('add-dj-dialog').showModal() }}>DJ 추가</button>` : nothing }
					</header>
					${
						milongaEventData.djs?.length > 0
							? html`<ul>${ milongaEventData.djs.map(dj => html`<li class="mb-2">${ djItem(dj) }</li>`) }</ul>`
							: html`<p class="text-slate-500 text-sm mt-3">아직 DJ를 입력하지 않았습니다.</p>`
					}
				</section>
				${ hasPermit ? await AddDJDialog(milongaEventData) : nothing }
				<section class="card p-5 mb-4" id="place">
					<header>
						<h1 class="font-semibold">장소</h1>
					</header>
					${
						milongaEventData.place
							? html`<div>${milongaEventData.place.name}</div>`
							: html`<p class="text-slate-500 text-sm mt-3">아직 장소를 입력하지 않았습니다.</p>`
					}
				</section>
				<section class="card p-5 mb-4" id="organizers">
					<header>
						<h1 class="font-semibold">입장료</h1>
					</header>
					${
						milongaEventData.entranceFee
							? html`<div>${milongaEventData.entranceFee}</div>`
							: html`<p class="text-slate-500 text-sm mt-3">아직 입장료를 입력하지 않았습니다.</p>`
					}
				</section>
				<section class="card p-5 mb-4" id="organizers">
					<header>
						<h1 class="font-semibold">오거나이저</h1>
					</header>
					${
						milongaEventData.organizers?.length > 0
							? html`<ul>${ milongaEventData.organizers.map(organizer => html`<li class="mb-2">${ organizer.name }</li>`) }</ul>`
							: html`<p class="text-slate-500 text-sm mt-3">아직 오거나이저를 입력하지 않았습니다.</p>`
					}
				</section>
				<section class="card p-5 mb-4" id="description">
					<header>
						<h1 class="font-semibold">설명</h1>
					</header>
					${
						milongaEventData.description
							? html`<div>${milongaEventData.description}</div>`
							: html`<p class="text-slate-500 text-sm mt-3">아직 설명을 입력하지 않았습니다.</p>`
					}
				</section>
			</div>
		</div>
	`, document.getElementById('app'))
}