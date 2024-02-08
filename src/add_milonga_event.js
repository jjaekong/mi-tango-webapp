import { getAuth } from "firebase/auth"
import { html, render } from "lit-html"
import { ArrowLeftIcon } from "./icons"
import dayjs from "dayjs/esm"
import { hasPermitToEditMilonga } from "./milonga"
import { addDoc, collection, doc, getDoc, getFirestore } from "firebase/firestore"

export const AddMilongaEvent = async () => {

    if (location.hash.indexOf('?') === -1) {
        history.back()
        return
    }

    const searchParams = new URLSearchParams(location.hash.split('?')[1])

    if (!searchParams.get('milongaId')) {
        history.back()
        return
    }

    const milongaId = searchParams.get('milongaId')

    console.log("milongaId:", milongaId)

	const hasPermit = await hasPermitToEditMilonga(milongaId)

	if (!hasPermit) {
		alert('권한이 없습니다.');
		history.back()
		return
	}

	const auth = getAuth()
	await auth.authStateReady()
    const currentUser = auth.currentUser
    
    const db = getFirestore()
    const milongaRef = doc(db, `${process.env.MODE}.milongas`, milongaId)
    const milongaSnap = await getDoc(milongaRef)
    const milongaData = milongaSnap.exists()
        ? { id: milongaSnap.id, ...milongaSnap.data() }
        : null

	const milongaEventData = {
		countryCode: localStorage.getItem('country_code'),
		// milongaId: milongaId,
		milonga: {
			name: milongaData.name || null,
			id: milongaId,
			logoURL: milongaData.logoURL || null
		},
        name: milongaData.name,
		posters: [],
		date: dayjs().format('YYYY-MM-DD'),
		startAt: '19:00',
		endAt: '00:00',
		place: null,
		organizers: [],
		djs: [],
		performers: [],
		entranceFee: null,
		description: null,
		createdAt: dayjs().toDate(),
		createdBy: currentUser.uid
	}

    const placeList = [
        { id: 'onada', name: '오나다', logoURL: 'https://picsum.photos/100/100' },
        { id: 'ocho', name: '오초', logoURL: 'https://picsum.photos/100/100' },
        { id: 'otra', name: '오뜨라', logoURL: 'https://picsum.photos/100/100' },
    ]

	function addMilongaEvent(e) {
        e.preventDefault()
		// if (!milongaEventData.place) {
		// 	alert('장소를 입력하지 않았습니다.');
		// 	document.getElementById('search-place').focus()
		// 	return;
		// }
		milongaEventData.date = document.getElementById('date').value
		const startAt = dayjs(`${milongaEventData.date} ${document.getElementById('start-time').value}`)
		const endAt = dayjs(`${milongaEventData.date} ${document.getElementById('end-time').value}`)
		milongaEventData.startAt = startAt.toDate()		
		milongaEventData.endAt = startAt > endAt ? endAt.add(1, 'day').toDate() : endAt.toDate()
		milongaEventData.entranceFee = document.getElementById('entrance-fee').value
		milongaEventData.description = document.getElementById('description').value
        milongaEventData.name = document.getElementById('name').value

		console.log('event data ', milongaEventData)

		const db = getFirestore()
		const millongaEventCol = collection(db, `${process.env.MODE}.milonga_events`)
		addDoc(millongaEventCol, milongaEventData)
			.then(milongaEventRef => {
				location.replace(`#milonga_event/${milongaEventRef.id}`)
			})
			.catch(error => {
				console.log(error)
			})
    }

	render(html`
		<div class="add-milonga-event p-5">
            <header class="flex items-center mb-5 h-10 w-full">
				<div class="min-w-[20%]"><a href="#" @click=${e => {
                    e.preventDefault();
                    history.back()
                }}>${ArrowLeftIcon()}</a></div>
				<div class="flex-1"><h1 class="font-bold text-center">이벤트 추가</h1></div>
				<div class="min-w-[20%] flex justify-end"></div>
			</header>
            <form name="add-milonga-event-form" @submit=${addMilongaEvent}>
                <div class="mb-3">
					<label class="block mb-1 px-2 text-sm" for="poster-file" for="">포스터</label>
					<input type="file" class="hidden" id="poster-file">
					<div id="posters"></div>
					<button type="button" class="text-purple-500 border-slate-200 p-3 bg-slate-100 w-full rounded-lg">포스터 업로드</button>
                </div>
                <div class="mb-3">
					<label for="name" class="block mb-1 px-2 text-sm">이벤트명</label>
					<input class="w-full rounded-lg border-slate-200" id="name" type="text" placeholder="이벤트명" value="${milongaEventData.name}" required>
                </div>
                <div class="mb-3">
					<label for="date" class="block mb-1 px-2 text-sm">날짜</label>
					<input class="w-full rounded-lg border-slate-200" id="date" type="date" required min="${dayjs().format('YYYY-MM-DD')}" value="${dayjs().format('YYYY-MM-DD')}">
                </div>
                <div class="mb-3 flex">
                    <div class="flex-1">
                        <label class="block mb-1 px-2 text-sm" for="start-time">시작시간</label>
                        <input class="w-full rounded-lg border-slate-200" id="start-time" type="time" step="600" required value="19:00">
					</div>
                    <div class="flex-1 ms-2">
                        <label class="block mb-1 px-2 text-sm" for="end-time">종료시간</label>
                        <input class="w-full rounded-lg border-slate-200" id="end-time" type="time" step="600" required value="00:00">
					</div>
                </div>
				<div class="mb-3">
                    <div>
                        <label class="block mb-1 px-2 text-sm" for="search-place">장소</label>
                        <input class="w-full rounded-lg border-slate-200" id="search-place" type="search" placeholder="장소 검색" list="place-list" @input=${e => { console.log('ok') }}>
                        <datalist id="place-list">
                            <option value="onada">오나다</option>
                            <option value="ocho">오초</option>
                            <option value="otra">오뜨라</option>
                        </datalist>
					</div>
                </div>
                <div class="mb-3">
                    <div>
                        <label class="block mb-1 px-2 text-sm" for="search-dj">DJ</label>
                        <input class="w-full rounded-lg border-slate-200" id="search-dj" type="search" placeholder="DJ 검색">
					</div>
                </div>
                <!-- <div class="mb-3">
                    <div>
                        <label class="block mb-1 px-2 text-sm" for="search-performer">공연</label>
                        <input class="w-full rounded-lg border-slate-200" id="search-performer" type="search" placeholder="공연자 검색">
					</div>
                </div> -->
				<div class="mb-3">
                    <div>
                        <label class="block mb-1 px-2 text-sm" for="entrance-fee">입장료</label>
                        <input class="w-full rounded-lg border-slate-200" id="entrance-fee" type="text" placeholder="입장료" required>
					</div>
                </div>
				<div class="mb-3">
                    <div>
                        <label class="block mb-1 px-2 text-sm" for="description">설명</label>
						<textarea placeholder="설명" id="description" class="w-full rounded border-slate-200" rows="5"></textarea>
					</div>
                </div>
                <div class="mt-4">
                    <button type="submit" class="p-3 bg-purple-500 text-white block w-full rounded-lg">추가</button>
                </div>
            </form>
        </div>
	`, document.getElementById('app'))
}

/**
 * 테이블 선택 가능
 * 테이블맵 / 테이블수 / 테이블맵과 맵핑된 테이블명 필요
 * 불가
 * 테이블수
 * 예약규칙(설명)
 */