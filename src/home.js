import { getAuth } from 'firebase/auth'
import { render, html } from 'lit-html'
import { cache } from 'lit-html/directives/cache.js'
import { UserCircleOutlineIcon, UserCircleSolidIcon } from './icons.js'
import dayjs from 'dayjs/esm'
import localizedFormat from 'dayjs/esm/plugin/localizedFormat'
import advancedFormat from 'dayjs/esm/plugin/advancedFormat'
import 'dayjs/esm/locale/ko'

export const Home = async () => {

	dayjs.locale('ko')
	dayjs.extend(localizedFormat)
	dayjs.extend(advancedFormat)
	
	const auth = getAuth()

	await auth.authStateReady()

	const user = auth.currentUser
	
	render(cache(html`
		<div class="home p-5" role="document">
			<header class="h-10 px-5 flex items-center mb-5">
				<h1 class="font-bold">Mi Vida</h1>
				<div class="ms-auto empty:size-8 empty:bg-slate-300 empty:rounded-full">${
					user
						? html `<a href="#me">${
                                    user.photoURL
                                        ? html`<img src="${user.photoURL}" class="size-8 rounded-full">`
                                        : html`<span class="text-slate-400">${UserCircleSolidIcon({ classList: 'size-8' })}</span>`
                                }</a>`
						: html`<a href="#login">${UserCircleOutlineIcon({classList: 'size-8'})}</a>`
				}</div>
			</header>
			<section id="today-milongas" class="mb-4 rounded-[1rem] bg-white shadow-lg shadow-slate-100 p-5">
				<header class="mb-4 flex flex-wrap justify-between items-end">
					<h2 class="text-2xl font-bold">오늘의 밀롱가</h2>
					<time class="font-bold text-slate-500">${html`${dayjs().format("MMM Do dddd")}`}</time>
				</header>
				<ul>
					<li class="mt-3">
						<div class="flex w-100 items-center">
							<div class="self-start">
								<div class="size-14 rounded-xl bg-slate-100"></div>
							</div>
							<div class="mx-3 flex-1">
								<h6 class="h-4 w-full bg-slate-100"></h6>
								<div class="h-4 w-[50%] mt-1 bg-slate-100"></div>
							</div>
							<div class="ms-auto self-start">
								<div class="size-14 rounded-xl bg-slate-100"></div>
							</div>
						</div>
					</li>
					<li class="mt-3">
						<div class="flex w-100 items-center">
							<div class="self-start">
								<div class="size-14 rounded-xl bg-slate-100"></div>
							</div>
							<div class="mx-3 flex-1">
								<h6 class="h-4 w-full bg-slate-100"></h6>
								<div class="h-4 w-[50%] mt-1 bg-slate-100"></div>
							</div>
							<div class="ms-auto self-start">
								<div class="size-14 rounded-xl bg-slate-100"></div>
							</div>
						</div>
					</li>
					<li class="mt-3">
						<div class="flex w-100 items-center">
							<div class="self-start">
								<div class="size-14 rounded-xl bg-slate-100"></div>
							</div>
							<div class="mx-3 flex-1">
								<h6 class="h-4 w-full bg-slate-100"></h6>
								<div class="h-4 w-[50%] mt-1 bg-slate-100"></div>
							</div>
							<div class="ms-auto self-start">
								<div class="size-14 rounded-xl bg-slate-100"></div>
							</div>
						</div>
					</li>
				</ul>
				<a href="#" class="block border-t py-4 text-slate-500 text-center mt-4 -mb-5">더 많은 밀롱가 이벤트 보기</a>
			</section>
			<section id="djs" class="mb-4 rounded-[1rem] bg-white shadow-lg shadow-slate-100 p-5">
				<header class="mb-4">
					<h2 class="text-xl font-bold">DJ</h2>
					<small class="text-slate-400">DJ의 디제잉 일정을 확인하세요.</small>
				</header>
				<ul>
					<li class="mt-3">
						<div class="flex w-full items-center">
							<div class="self-start">
								<div class="size-14 rounded-full bg-slate-100"></div>
							</div>
							<div class="mx-3 flex-1">
								<h6 class="h-4 w-full bg-slate-100"></h6>
							</div>
						</div>
					</li>
					<li class="mt-3">
						<div class="flex w-full items-center">
							<div class="self-start">
								<div class="size-14 rounded-full bg-slate-100"></div>
							</div>
							<div class="mx-3 flex-1">
								<h6 class="h-4 w-full bg-slate-100"></h6>
							</div>
						</div>
					</li>
					<li class="mt-3">
						<div class="flex w-full items-center">
							<div class="self-start">
								<div class="size-14 rounded-full bg-slate-100"></div>
							</div>
							<div class="mx-3 flex-1">
								<h6 class="h-4 w-full bg-slate-100"></h6>
							</div>
						</div>
					</li>
				</ul>
				<a href="#" class="block border-t py-4 text-slate-500 text-center mt-4 -mb-5">더 많은 DJ 보기</a>
			</section>
			<section id="places" class="mb-4 rounded-[1rem] bg-white shadow-lg shadow-slate-100 p-5">
				<header class="mb-4">
					<h2 class="text-xl font-bold">Club</h2>
					<small class="text-slate-400">탱고클럽의 밀롱가 일정을 확인하세요.</small>
				</header>
				<ul>
					<li class="mt-3">
						<div class="flex w-full items-center">
							<div class="self-start">
								<div class="size-14 rounded-lg bg-slate-100"></div>
							</div>
							<div class="mx-3 flex-1">
								<h6 class="h-4 w-full bg-slate-100"></h6>
							</div>
						</div>
					</li>
				</ul>
				<a href="#" class="block border-t py-4 text-slate-500 text-center mt-4 -mb-5">더 많은 장소 보기</a>
			</section>
			<!-- <section id="poll" class="mb-4 rounded-[1rem] bg-white shadow-lg shadow-slate-100 p-5">
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