import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { render, html } from 'lit-html'
import { FacebookLogoIcon, GoogleLogoIcon, ArrowLeftIcon, ChevronRightIcon } from './icons'

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

	render(html`
		<div class="login p-5 pt-15" role="document">
            <header class="flex items-center h-10 fixed inset-5">
				<div class="min-w-[20%]"><a href="#" @click=${e => { e.preventDefault(); history.back() }}>${ArrowLeftIcon()}</a></div>
				<div class="flex-1"><h1 class="font-bold text-center">로그인</h1></div>
				<div class="min-w-[20%] flex justify-end"></div>
			</header>
			<div class="h-dvh flex justify-center items-center">
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
	`, document.getElementById('app'))
}