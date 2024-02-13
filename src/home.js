import { getAuth } from 'firebase/auth'
import { render, html } from 'lit-html'
import { GlobaAltOutlineIcon, PlusCircleOutlineIcon, UserCircleOutlineIcon, UserCircleSolidIcon } from './icons.js'
import dayjs from "dayjs/esm"
import { TodayMilongas } from './home/today_milongas.js'
import { DJs } from './home/djs.js'
import { getCountryName } from './country.js'
import { LocalMilongas } from './home/local_milongas.js'

export const Home = async () => {
	
	const auth = getAuth()

	await auth.authStateReady()

	const currentUser = auth.currentUser

	const countryCode = localStorage.getItem('country_code')
	
	render(html`
		<div class="home p-5" role="document">
			<header class="h-10 flex items-center mb-5 flex-wrap">
				<div class="flex ai">
					<h1 class="font-bold">Mi Vida</h1>
					<a href="#choose_country" class="ms-2"><span class="font-bold underline underline-offset-4">${getCountryName(countryCode)}</span></a>
				</div>
				<div class="ms-auto empty:size-8 empty:bg-slate-300 empty:rounded-full">${
					currentUser
						? html `<a href="#me">${
                                    currentUser.photoURL
                                        ? html`<img src="${currentUser.photoURL}" class="size-8 rounded-full">`
                                        : html`<span class="text-slate-400">${UserCircleSolidIcon({ classList: 'size-8' })}</span>`
                                }</a>`
						: html`<a href="#login">${UserCircleOutlineIcon({classList: 'size-8'})}</a>`
				}</div>
			</header>

			<div class="flex mb-4">
				<a href="#new_milonga" class="shadow-2xl flex-1 rounded-lg p-3 bg-indigo-500 text-sm text-white text-center flex items-center justify-center font-bold text-wrap break-words">
					밀롱가 만들기
				</a>
				<a href="#add_milonga_event" class="shadow-2xl flex-1 ms-2 rounded-lg p-3 bg-indigo-500 text-sm text-white text-center flex items-center justify-center font-bold text-wrap break-words">
					밀롱가 이벤트 추가
				</a>
			</div>

			${ await TodayMilongas() }

			${ DJs() }

			${ await LocalMilongas() }

			<!-- <section id="poll" class="mb-4 rounded-lg bg-white shadow-lg shadow-slate-100 p-5">
				<header class="mb-4">
					<h2 class="text-xl font-bold">Poll</h2>
				</header>
				<div id="poll-question">
					<div>당신은 아브라소 파? 피구라 파?</div>
				</div>
				<ul id="poll-answers">
					<li class="mt-3">
						<label class="border p-3 flex items-center rounded-lg">
							<input type="radio" name="poll-answer">
							<span class="ms-2">아브라소 파</span>
						</label>
					</li>
					<li class="mt-3">
						<label class="border p-3 flex items-center rounded-lg">
							<input type="radio" name="poll-answer">
							<span class="ms-2">피구라 파</span>
						</label>
					</li>
				</ul>
				<a href="#" class="block border-t py-4 text-slate-500 text-center mt-4 -mb-5">더 많은 Poll 보기</a>
			</section> -->
		</div>
	`, document.getElementById('app'))

    
}