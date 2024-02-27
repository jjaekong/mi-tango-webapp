import dayjs from 'dayjs/esm'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { render, html, nothing } from 'lit-html'
import { djItem } from './components/dj_item'
import { ArrowLeftIcon, AtSymbolIcon, ChevronRightIcon, HeadphonesIcon } from './icons'
import { hasPermitToEditMilonga, getMilonga } from './service'

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

	console.log('milongaEventData ==> ', milongaEventData)

	function showAddDJDialog() {
		document.getElementById('dj-dialog').showModal()
	}

	function closeDJDialog() {
		document.getElementById('dj-dialog').close()
	}

	render(html`
		<div class="milonga-event relative">
			<header class="p-5 flex items-center w-full absolute top-0 left-0 mix-blend-difference z-[10] text-white">
				<div class="min-w-[20%]"><a href="#" @click=${e => { e.preventDefault(); history.back() }}>${ ArrowLeftIcon() }</a></div>
				<div class="flex-1"><h1 class="sr-only">밀롱가 이벤트</h1></div>
				<div class="min-w-[20%] flex justify-end"></div>
			</header>
			<div class="aspect-[4/3] relative">
				<img src="https://picsum.photos/300/400" class="object-cover w-full h-full">
				<div class="absolute bottom-0 left-0 w-full p-5 text-white bg-black/50">
					<div class="mix-blend-difference">
						<h1 class="font-semibold">${milongaEventData.name}</h1>
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
				</div>
			</div>
			<div class="p-5">
				<a href=#milonga/${milongaEventData.milonga.id} class="btn-primary w-full mb-4 flex items-center">
					<p>${milongaEventData.milonga.name}의 모든 정보 보기</p>
					${ChevronRightIcon({ classList: "size-4 text-white ms-auto" })}
				</a>
				<section class="card p-5 mb-4" id="djs">
					<header class="flex items-center">
						<h1 class="font-semibold">DJs</h1>
					</header>
					${
						milongaEventData.djs?.length > 0
							? html`<ul>${ milongaEventData.djs.map(dj => html`<li class="mb-2">${ djItem(dj) }</li>`) }</ul>`
							: html`<p class="text-slate-500 text-sm mt-3">아직 DJ 정보를 입력하지 않았습니다.</p>`
					}
				</section>
				<dialog id="dj-dialog" class="card"></dialog>
				<section class="card p-5 mb-4" id="place">
					<header>
						<h1 class="font-semibold">장소</h1>
					</header>
				</section>
				<section class="card p-5 mb-4" id="organizers">
					<header>
						<h1 class="font-semibold">입장료</h1>
					</header>
				</section>
				<section class="card p-5 mb-4" id="organizers">
					<header>
						<h1 class="font-semibold">오거나이저</h1>
					</header>
				</section>
				<section class="card p-5 mb-4" id="description">
					<header>
						<h1 class="font-semibold">설명</h1>
					</header>
				</section>
			</div>
		</div>
	`, document.getElementById('app'))

	hasPermitToEditMilonga(await getMilonga(milongaEventData.milonga.id))
		.then(() => {
			render(
				html`<button type="button" class="text-indigo-500 ms-auto font-semibold" @click=${showAddDJDialog}>DJ 추가</button>`,
				document.querySelector('#djs > header')
			)
			render(html`
				<header class="flex items-center p-4">
					<h1>DJ 추가</h1>
					<button class="ms-auto text-slate-500" type="button" @click=${closeDJDialog}>닫기</button>
				</header>
				<div role="tablist" class="flex">
					<button class="flex-1 btn-secondary" role="tab" aria-controls="dj-tabpanel-1" aria-selected="true">최근 선택</button>
					<button class="flex-1 btn-secondary" role="tab" aria-controls="dj-tabpanel-2" aria-selected="false">검색 선택</button>
					<button class="flex-1 btn-secondary" role="tab" aria-controls="dj-tabpanel-3" aria-selected="false">직접 입력</button>
				</div>
				<div role="tabpanel" class="p-4" id="dj-tabpanel-1">
					<form method="dialog">
						TEST
						<button class="btn-primary">선택</button>
					</form>
				</div>
				<div role="tabpanel" class="p-4" id="dj-tabpanel-2" hidden>
					<form method="dialog">
						TEST
						<button class="btn-primary">선택</button>
					</form>
				</div>
				<div role="tabpanel" class="p-4" id="dj-tabpanel-3" hidden>
					<form method="dialog">
						TEST
						<button class="btn-primary">선택</button>
					</form>
				</div>
			`, document.getElementById('dj-dialog'))
		})
}