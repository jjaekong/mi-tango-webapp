import { getAuth, signOut } from 'firebase/auth'
import { render, html } from 'lit-html'
import { cache } from 'lit-html/directives/cache.js'
import { ArrowLeftIcon, ChevronRightIcon, UserCircleSolidIcon, UserCircleOutlineIcon } from './icons.js'

export const Me = async () => {
	
	const auth = getAuth()

	await auth.authStateReady()

	const user = auth.currentUser

	if (!user) {
		location.replace('#')
		return;
	}

	function logout() {
		if (confirm('로그아웃 하시겠습니까?')) {
            signOut(getAuth())
                .then(() => {
                    location.replace('#')
					return;
                })
                .catch(error => {
                    console.log(error)
                })
        }
	}

	render(cache(html`
		<div class="me main p-5" role="document">
			<header class="flex items-center mb-5 h-10 w-full">
				<div class="min-w-[20%]"><a href="#" @click=${e => { e.preventDefault(); history.back() }}>${ArrowLeftIcon()}</a></div>
				<div class="flex-1"><h1 class="font-bold text-center">프로필</h1></div>
				<div class="min-w-[20%] flex justify-end"></div>
			</header>
			<a class="flex items-center bg-white rounded-xl shadow-xl shadow-slate-100 p-5" href="#me/edit_profile">
				<div>
					<div class="size-12 empty:rounded-full empty:bg-slate-200">${
						user?.photoURL
							? html`<img class="rounded-full" src=${user.photoURL}>`
							: html`<span class="text-slate-400">${UserCircleSolidIcon({ classList: 'size-12' })}</span>`
					}</div>
				</div>
				<div class="px-3 flex-1">
					<h4 class="font-bold empty:bg-slate-100 empty:h-6 empty:w-[50%]">${
						user
							? html`${user.displayName}`
							: html ``
					}</h4>
					<div id="user-email" class="text-sm text-slate-400 empty:bg-slate-100 empty:h-4 empty:mt-1">${
						user
							? html`${user.email}`
							: html ``
					}</div>
				</div>
				<div id="edit-profile-icon" class="text-slate-400">
                    ${ChevronRightIcon()}
                </div>
			</a>
			<div class="py-4">
				<a href="#me/new_milonga">밀롱가 만들기</a>
			</div>
			<button class="text-red-400 bg-white block mt-5 p-3 w-full rounded-xl" type="button" @click=${logout}>로그아웃</button>
		</div>
	`), document.getElementById('app'))
}