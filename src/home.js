import { getAuth } from 'firebase/auth'
import { render, html } from 'lit-html'
import { cache } from 'lit-html/directives/cache.js'
import { UserCircleOutlineIcon, UserCircleSolidIcon, HeadphonesIcon } from './icons.js'
import { MilongaEventItem } from './components/milonga_event_item.js'
import dayjs from "dayjs/esm"
import 'dayjs/esm/locale/ko'
import localizedFormat from 'dayjs/esm/plugin/localizedFormat'
import advancedFormat from 'dayjs/esm/plugin/advancedFormat'
import { djItem } from './components/dj_item.js'

dayjs.locale('ko')
dayjs.extend(localizedFormat)
dayjs.extend(advancedFormat)

export const Home = async () => {
	
	const auth = getAuth()

	await auth.authStateReady()

	const currentUser = auth.currentUser
	
	render(cache(html`
		<div class="home p-5" role="document">
			<header class="h-10 px-5 flex items-center mb-5">
				<h1 class="font-bold">Mi Vida</h1>
				<div class="ms-auto empty:size-8 empty:bg-slate-300 empty:rounded-full">${
					currentUser
						? html `<a href="#me">${
                                    currentUser.photoURL
                                        ? html`<img src="${currentUser.photoURL}" class="size-8 rounded-full">`
                                        : html`<span class="text-slate-400">${UserCircleSolidIcon({ classList: 'size-8' })}</span>`
                                }</a>`
						: html`<a href="#login" @click=${ navigator.vibrate(200) }>${UserCircleOutlineIcon({classList: 'size-8'})}</a>`
				}</div>
			</header>

			<section id="today-milongas" class="mb-4 rounded-3xl bg-white shadow-xl shadow-slate-100 p-5">
                <header class="mb-4 flex flex-wrap justify-between items-end">
                    <h2 class="text-2xl font-bold">오늘의 밀롱가</h2>
                    <time class="font-bold text-slate-500">${html`${dayjs().format("MMM Do dddd")}`}</time>
                </header>
                <ul>
                    ${
                        [10, 100, 1000, 1050, 550].map(item => html`
                            <li class="mt-3">${MilongaEventItem(item)}</li>
                        `)
                    }
                </ul>
                <a href="#" class="block border-t py-4 text-slate-500 text-center mt-4 -mb-5">더 많은 밀롱가 이벤트 보기</a>
            </section>

			<section id="dj" class="mb-4 rounded-3xl bg-white shadow-xl shadow-slate-100 p-5">
				<header class="mb-4">
					<h2 class="text-xl font-bold">DJ</h2>
					<small class="text-slate-400">DJ의 밀롱가 일정을 확인하세요.</small>
				</header>
				<ul>
                    ${
                        [10, 100, 1000, 1050, 550].map((item) => html`
                            <li class="mt-3">${djItem(item)}</li>
                        `)
                    }
				</ul>
				<a href="#" class="block border-t py-4 text-slate-500 text-center mt-4 -mb-5">더 많은 DJ 보기</a>
			</section>

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
	`), document.getElementById('app'))

    
}