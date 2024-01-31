import { getAuth } from "firebase/auth"
import { html, render } from "lit-html"
import { ArrowLeftIcon } from "./icons"

export const AddMilongaEvent = async () => {

	const auth = getAuth()

	await auth.authStateReady()

	const currentUser = auth.currentUser

    const url = new URL(location.href)

    console.log(url)

    console.log('mid', url.searchParams.get('mid'))

	// 권한이 있는지 체크
	// 1. 밀롱가를 생성한 사람인지, 2. 오거나이저 인지, 3. 에디터로 등록된 사람인지

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
        </div>
	`, document.getElementById('app'))
}