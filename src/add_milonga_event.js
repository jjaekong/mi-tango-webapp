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

    function addEvent(e) {
        e.preventDefault()
        console.log('add event')
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
            <form name="add-event-form" @submit=${addEvent}>
                <div class="mb-3">
                    <label>
                        <div class="mb-1 px-2 text-sm">포스터</div>
                        <input class="w-full rounded-lg border-slate-200" type="file">
                    </label>
                </div>
                <div class="mb-3">
                    <label>
                        <div class="mb-1 px-2 text-sm">날짜</div>
                        <input class="w-full rounded-lg border-slate-200" type="date" required min="${dayjs().format('YYYY-MM-DD')}" value="${dayjs().format('YYYY-MM-DD')}">
                    </label>
                </div>
                <div class="mb-3 flex">
                    <label class="flex-1">
                        <div class="mb-1 px-2 text-sm">시작시간</div>
                        <input class="w-full rounded-lg border-slate-200" type="time" step="600" required value="19:00">
                    </label>
                    <label class="flex-1 ms-2">
                        <div class="mb-1 px-2 text-sm">종료시간</div>
                        <input class="w-full rounded-lg border-slate-200" type="time" step="600" required value="00:00">
                    </label>
                </div>
                <div class="mb-3">
                    <label>
                        <div class="mb-1 px-2 text-sm sr-only">디제이</div>
                        <input class="w-full rounded-lg border-slate-200" type="search" placeholder="디제이">
                    </label>
                </div>
                <div class="mb-3">
                    <label>
                        <div class="mb-1 px-2 text-sm sr-only">공연</div>
                        <input class="w-full rounded-lg border-slate-200" type="search" placeholder="공연">
                    </label>
                </div>
                <div class="mb-3">
                    <label class="flex items-center">
                        <input type="checkbox">
                        <div class="ms-1">예약기능 사용</div>
                    </label>
                </div>
                <div class="mt-4">
                    <button type="submit" class="p-3 bg-purple-500 text-white block w-full rounded-lg">추가</button>
                </div>
            </form>
        </div>
	`, document.getElementById('app'))
}