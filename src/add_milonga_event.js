import { getAuth } from "firebase/auth"
import { html, render } from "lit-html"
import { ArrowLeftIcon } from "./icons"
import dayjs from "dayjs/esm"

export const AddMilongaEvent = async () => {

    if (location.hash.indexOf('?') === -1) {
        history.back()
        return
    }

    const searchParams = new URLSearchParams(location.hash.split('?')[1])

    if (!searchParams.get('mid')) {
        history.back()
        return
    }

    const mid = searchParams.get('mid')

    console.log("mid:", mid)

	const auth = getAuth()

	await auth.authStateReady()

	const currentUser = auth.currentUser

	// 권한이 있는지 체크
	// 1. 밀롱가를 생성한 사람인지, 2. 오거나이저 인지, 3. 에디터로 등록된 사람인지

    function addMilongaEvent(e) {
        e.preventDefault()
        console.log('add milonga event')
    }

	let canReserve = false

	function changeCanReserve(e) {
		e.target.checked
			? render(html`ok`, document.getElementById('reserve-items'))
			: render(html`no`, document.getElementById('reserve-items'))
	}

	render(html`
		<div class="add-milonga-event p-5">
            <header class="flex items-center mb-5 h-10 w-full">
				<div class="min-w-[20%]"><a href="#" @click=${e => {
                    e.preventDefault();
                    history.back()
                }}>${ArrowLeftIcon()}</a></div>
				<div class="flex-1"><h1 class="font-bold text-center">밀롱가 이벤트 추가</h1></div>
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
                        <input class="w-full rounded-lg border-slate-200" id="search-place" type="search" placeholder="장소 검색">
					</div>
                </div>
                <div class="mb-3">
                    <div>
                        <label class="block mb-1 px-2 text-sm" for="search-dj">디제이</label>
                        <input class="w-full rounded-lg border-slate-200" id="search-dj" type="search" placeholder="디제이 검색">
					</div>
                </div>
                <div class="mb-3">
                    <div>
                        <label class="block mb-1 px-2 text-sm" for="search-performer">공연</label>
                        <input class="w-full rounded-lg border-slate-200" id="search-performer" type="search" placeholder="공연자 검색">
					</div>
                </div>
				<div class="mb-3">
                    <div>
                        <label class="block mb-1 px-2 text-sm" for="description">설명</label>
						<textarea placeholder="설명" id="description" class="w-full rounded-lg border-slate-200"></textarea>
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