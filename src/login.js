import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { render, html } from 'lit-html'
import { cache } from 'lit-html/directives/cache.js'
import { FacebookLogoIcon, GoogleLogoIcon } from './icons'

export const Login = async () => {

	const auth = getAuth()

	await auth.authStateReady()

	function login() {

		const provider = new GoogleAuthProvider()
		
		signInWithPopup(auth, provider)
			.then(() => {
				location.replace('#')
			})
			.catch(error => {
				console.log(error)
			})
	}

	render(cache(html`
		<div class="login p-5" role="document">
			<div class="h-dvh flex flex-col justify-center items-center">
				<h1 class="font-extrabold">LOGIN</h1>
				<ul>
					<li class="mt-4">
						<button type="button" class="border border-slate-100 rounded-lg py-3 px-4 w-full flex items-center justify-center bg-white" @click=${login}>
							${GoogleLogoIcon()}
							<span class="ms-2">구글로 로그인</span>
						</button>
					</li>
					<li class="mt-4">
						<button type="button" class="border border-slate-100 rounded-lg py-3 px-4 w-full flex items-center justify-center bg-white">
							${FacebookLogoIcon()}
							<span class="ms-2">페이스북으로 로그인</span>
						</button>
					</li>
				</ul>
			</div>
		</div>
	`), document.getElementById('app'))
}