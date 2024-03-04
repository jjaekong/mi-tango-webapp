import { getAuth } from "firebase/auth"
import { html, nothing, render } from "lit-html"
import { ArrowLeftIcon } from "./icons"
import dayjs from "dayjs/esm"
import { addDoc, collection, doc, getDoc, getDocs, getDocsFromCache, getDocsFromServer, getFirestore, query, where } from "firebase/firestore"
import { hasPermitToEditMilonga } from "./service"
import { debounce } from "lodash-es"

export const AddMilongaEvent = async () => {
    
    /**
     * 권한 체크 순서
     * 1. 로그인 했는지
     * 2. 밀롱가가 존재하는지
     * 3. 밀롱가 편집 권한이 있는지
     */

	const auth = getAuth()
	await auth.authStateReady()
    const currentUser = auth.currentUser

	if (!currentUser) {
		if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
			location.href = '#login'
		} else {
			history.back()
		}
		return;
	}

	const searchParams = new URLSearchParams(location.hash.split('?')[1])

    const milongaId = searchParams.get('milongaId')

	const milongaData = milongaId
        ? await (async () => {
                const db = getFirestore()
                const milongaRef = doc(db, `${process.env.MODE}.milongas`, milongaId)
                const milongaSnap = await getDoc(milongaRef)
                return milongaSnap.exists()
                    ? { id: milongaSnap.id, ...milongaSnap.data() }
                    : null			
            })()
        : null

    if (!milongaData) {
        alert('존재하지 않는 밀롱가입니다.')
        history.back()
        return
    }

    console.log("milongaId:", milongaId)
	console.log("milongaData:", milongaData)

	if (!hasPermitToEditMilonga(milongaData, currentUser.email)) {
		alert('밀롱가 컨텐츠를 편집할 권한이 없습니다.')
		history.back()
		return
	}

	const milongaEventData = {
		countryCode: localStorage.getItem('country_code'),
		milonga: {
			name: milongaData?.name || null,
			id: milongaId,
			logoURL: milongaData?.logoURL || null
		},
        name: milongaData?.name,
		date: dayjs().format('YYYY-MM-DD'),
		startAt: '19:00',
		endAt: '00:00',
		organizers: milongaData.organizers,
		createdAt: dayjs().toDate(),
		createdBy: currentUser.email
	}

	function submitAddMilongaEvent(e) {
        e.preventDefault()
		milongaEventData.date = document.forms['add-milonga-event-form'].elements['date'].value
		const startAt = dayjs(`${milongaEventData.date} ${document.forms['add-milonga-event-form'].elements['start-time'].value}`)
		const endAt = dayjs(`${milongaEventData.date} ${document.forms['add-milonga-event-form'].elements['end-time'].value}`)
		milongaEventData.startAt = startAt.toDate()
		milongaEventData.endAt = startAt > endAt ? endAt.add(1, 'day').toDate() : endAt.toDate()
        milongaEventData.name = document.forms['add-milonga-event-form'].elements['name'].value

		console.log('event data ', milongaEventData)

		const db = getFirestore()
		addDoc(collection(db, `${process.env.MODE}.milonga_events`), milongaEventData)
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
			<div class="p-5 mb-4 flex flex-col justify-center items-center rounded-xl bg-white">
				<h1 class="font-semibold mb-2">언제 이벤트가 열리나요?</h1>
				<p class="text-sm">이벤트를 추가한 후 포스터, 장소, 디제이, 입장료, 설명 등 정보를 입력할 수 있습니다.</p>
			</div>
            <form name="add-milonga-event-form" @submit=${submitAddMilongaEvent}>
                <div class="mb-3">
					<label for="name">이벤트명</label>
					<input id="name" type="text" placeholder="이벤트명" value="${milongaData.name}" required>
                </div>
                <div class="mb-3">
					<label for="date">날짜</label>
					<input id="date" type="date" required min="${dayjs().format('YYYY-MM-DD')}" value="${dayjs().format('YYYY-MM-DD')}">
                </div>
                <div class="mb-3 flex">
                    <div class="flex-1">
                        <label for="start-time">시작시간</label>
                        <input id="start-time" type="time" step="600" required value="19:00" list="start-time-list">
						<datalist id="start-time-list">
							<option value="14:00"></option>
							<option value="19:00"></option>
							<option value="20:00"></option>
							<option value="21:00"></option>
						</datalist>
					</div>
                    <div class="flex-1 ms-2">
                        <label for="end-time">종료시간</label>
                        <input id="end-time" type="time" step="600" required value="00:00" list="end-time-list">
						<datalist id="end-time-list">
							<option value="22:30"></option>
							<option value="23:00"></option>
							<option value="23:30"></option>
							<option value="00:00"></option>
							<option value="00:30"></option>
							<option value="01:00"></option>
							<option value="02:00"></option>
							<option value="03:00"></option>
						</datalist>
					</div>
                </div>
                <div class="mt-4">
                    <button type="submit" class="btn-primary w-full rounded-lg">추가</button>
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