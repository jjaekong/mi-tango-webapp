import { getAuth, signOut } from 'firebase/auth'
import { render, html } from 'lit-html'
import { cache } from 'lit-html/directives/cache.js'

export const Me = async () => {
	
	const auth = getAuth()

	await auth.authStateReady()

	document.getElementById('loading')?.remove()

	const user = auth.currentUser

	if (!user) {
		location.replace('/')
		return;
	}

	function logout() {
		if (confirm('로그아웃 하시겠습니까?')) {
            signOut(getAuth())
                .then(() => {
                    location.replace('/')
					return;
                })
                .catch(error => {
                    console.log(error)
                })
        }
	}

	render(cache(html`
		<div class="me main p-5" role="document">
			<header class="mb-5 flex items-center" id="toolbar"></header>
			<a class="flex items-center bg-white rounded-xl shadow-xl shadow-slate-100 p-5" id="user-profile" href="/me/edit_profile.html">
				<div>
					<div id="user-photo" class="size-12 empty:rounded-full empty:bg-slate-200"></div>
				</div>
				<div class="px-3 flex-1">
					<h4 id="user-name" class="font-bold empty:bg-slate-100 empty:h-6 empty:w-[50%]"></h4>
					<div id="user-email" class="text-sm text-slate-400 empty:bg-slate-100 empty:h-4 empty:mt-1"></div>
				</div>
				<div id="edit-profile-icon" class="text-slate-400"></div>
			</a>
			<div class="py-4">
				<a href="/me/new_milonga.html">밀롱가 만들기</a>
			</div>
			<button class="text-red-400 bg-white block mt-5 p-3 w-full rounded-xl" type="button" @click=${logout}>로그아웃</button>
		</div>
	`), document.getElementById('app'))
}