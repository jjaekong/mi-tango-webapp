import { render, html } from "lit-html"
import { cache } from 'lit-html/directives/cache.js'
import { ArrowLeftIcon } from '../icons'
import { getAuth } from "firebase/auth"

export const NewMilonga = async () => {

    const auth = getAuth()

    await auth.authStateReady()

    const currentUser = auth.currentUser
    
    if (!currentUser) {
        location.replace("#")
    }

    function newMilonga(e) {
        e.preventDefault()
    }

    render(cache(html`
        <div class="me new-milonga p-5">
            <header class="flex items-center mb-5 h-10 w-full">
				<div class="min-w-[20%]"><a href="#" @click=${e => {
                    e.preventDefault();
                    history.back()
                }}>${ArrowLeftIcon()}</a></div>
				<div class="flex-1"><h1 class="font-bold text-center">밀롱가 만들기</h1></div>
				<div class="min-w-[20%] flex justify-end"></div>
			</header>
            <form action="#" method="post" @submit=${newMilonga}>
                <div class="mb-3">
                    <label>
                        <div class="sr-only">밀롱가명</div>
                        <input type="text" placeholder="밀롱가명" name="milonga-name" class="rounded-lg border-slate-200 block w-full" required autocomplete="off">
                    </label>
                </div>
                <div class="mb-3">
                    <label>
                        <div class="sr-only">밀롱가 아이디</div>
                        <input type="text" placeholder="밀롱가 아이디" name="milonga-id" class="rounded-lg border-slate-200 block w-full" required pattern="[0-9a-zA-Z_]{8,}" autocomplete="off">
                    </label>
                    <div class="text-slate-500 text-xs mt-1">영문, 숫자, 언더바(_), 대쉬(-)를 이용하여 8자 이상으로 작성하세요.</div>
                </div>
                <div class="mt-4">
                    <button type="submit" class="p-3 bg-purple-500 text-white block w-full rounded-lg">만들기</button>
                </div>
            </form>
        </div>
    `), document.getElementById('app'))
}