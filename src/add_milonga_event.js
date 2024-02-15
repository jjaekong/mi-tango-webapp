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

	if (!hasPermitToEditMilonga(milongaData)) {
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
		posters: [],
		date: dayjs().format('YYYY-MM-DD'),
		startAt: '19:00',
		endAt: '00:00',
		place: null,
		organizers: milongaData.organizers,
		djs: [],
		entranceFee: null,
		description: null,
		createdAt: dayjs().toDate(),
		createdBy: currentUser.email
	}

	function addMilongaEvent(e) {
        e.preventDefault()
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
		addDoc(collection(db, `${process.env.MODE}.milonga_events`), milongaEventData)
			.then(milongaEventRef => {
				location.replace(`#milonga_event/${milongaEventRef.id}`)
			})
			.catch(error => {
				console.log(error)
			})
    }

	async function searchPlace() {
		// document.getElementById('search-place-details').open = false
		render(nothing, document.getElementById('search-place-results'))
		const keyword = document.getElementById('search-place-keyword')
		if (!keyword.value) {
			alert("검색어를 입력하세요.")
			keyword.focus()
			return
		}
		const db = getFirestore()
		const q = query(
			collection(db, `${process.env.MODE}.places`),
			where('nameToArray', 'array-contains-any', keyword.value.split(""))
		)
		const snap = await getDocs(q)
		// document.getElementById('search-place-details').open = true
		console.log(snap)
		if (snap.empty) {
			render(html`<p>검색 결과가 없습니다.</p>`, document.getElementById('search-place-results'))
		} else {
            const results = snap.docs.filter(doc => {
                const data = {
                    id: doc.id,
                    ...doc.data()
                }
                return data.name.indexOf(keyword.value) > -1
            })
            // console.log('results', results)
            if (results.length > 0) {
                render(html`<ul class="mt-3">
                    ${
                        results.map(result => {
                            const data = {
                                id: result.id,
                                ...result.data()
                            }
                            return html`${data.name}`
                        })
                    }
                </ul>`, document.getElementById('search-place-results'))
            } else {
                render(html`<p>검색 결과가 없습니다.</p>`, document.getElementById('search-place-results'))
            }
		}
	}

	// async function searchDJ(e) {
	// 	if (!e.target.value) return
	// 	render(nothing, document.getElementById("dj-list"))
	// 	const keyword = e.target.value.split('')
	// 	console.log('keyword => ', keyword)
	// 	const db = getFirestore()
	// 	const q = query(
	// 		collection(db, `${process.env.MODE}.djs`),
	// 		where('nameArray', 'array-contains-any', keyword)
	// 	)
	// 	const snap = await getDocs(q)
	// 	if (snap.empty) {
	// 		render(nothing, document.getElementById('dj-list'))
	// 	} else {
	// 		render(html`${
	// 			snap.docs.map(doc => {
	// 				const data = {
	// 					id: doc.id,
	// 					...doc.data()
	// 				}
	// 				return html`<option value="${data.name}">${data.nationality}</option>`
	// 			})
	// 		}`, document.getElementById('dj-list'))
	// 	}
	// }

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
					<label for="poster-file">포스터</label>
					<input type="file" class="hidden" id="poster-file">
					<div id="posters"></div>
					<button type="button" class="text-indigo-500 p-3 bg-gray-200 w-full rounded-lg">포스터 업로드</button>
                </div>
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
				<div class="mb-3">
					<label for="search-place-keyword">장소</label>
					<div class="flex items-center">
						<input id="search-place-keyword" type="search" placeholder="장소 검색">
						<button type="button" class="flex-none btn-secondary ms-2 !py-2" @click=${searchPlace}>검색</button>
					</div>
					<details id="search-place-details" class="block mt-2 border bg-white rounded-lg p-3">
						<summary class="text-sm">장소 검색결과</summary>
						<div id="search-place-results"></div>
					</details>
                </div>
                <div class="mb-3">
					<label for="search-dj">DJ</label>
					<input id="search-dj" type="search" placeholder="DJ 검색" list="dj-list">
					<details id="dj-list"></details>
                </div>
				<div class="mb-3">
					<label for="entrance-fee">입장료</label>
					<input id="entrance-fee" type="text" placeholder="입장료" required autocomplete="on">
                </div>
				<div class="mb-3">
					<label for="description">설명</label>
					<textarea placeholder="설명" id="description" class="w-full rounded border-slate-200" rows="5"></textarea>
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