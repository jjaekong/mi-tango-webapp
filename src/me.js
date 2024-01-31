import { getAuth, signOut } from 'firebase/auth'
import { render, html } from 'lit-html'
import { cache } from 'lit-html/directives/cache.js'
import { ArrowLeftIcon } from './icons.js'
import { MyMilongas } from './me/my_milongas.js'
import { UserProfile } from './me/user_profile.js'

export const Me = async () => {
	
	const auth = getAuth()

	await auth.authStateReady()

	const currentUser = auth.currentUser

	if (!currentUser) {
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
				<div class="flex-1"><h1 class="font-bold text-center">계정</h1></div>
				<div class="min-w-[20%] flex justify-end"></div>
			</header>
			${ UserProfile(currentUser)}
			${ await MyMilongas(currentUser) }
			<button class="text-red-400 bg-white block mt-5 p-3 w-full rounded-xl" type="button" @click=${logout}>로그아웃</button>
		</div>
	`), document.getElementById('app'))
}