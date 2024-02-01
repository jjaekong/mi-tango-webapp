import { getAuth } from 'firebase/auth'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { render, html, nothing } from 'lit-html'
import { cache } from 'lit-html/directives/cache.js'
import { map } from 'lit-html/directives/map.js'
import { MilongaEventItem } from './components/milonga_event_item'
import { ArrowLeftIcon, AtSymbolIcon } from './icons'

export const hasPermitToEditMilonga = async (milongaId) => {
	const auth = getAuth()
	await auth.authStateReady()
	const currentUser = auth.currentUser;
	if (!currentUser) {
		return false;
	}
	const db = getFirestore()
	const milongaRef = doc(db, `${process.env.MODE}.milongas`, milongaId)
	const milongaSnap = await getDoc(milongaRef)
	if (milongaSnap.exists()) {
		const milongaData = milongaSnap.data()
		if (milongaData?.createdBy === currentUser.uid) {
			return true
		}
		if (milongaData?.createdBy?.organizers.findIndex(organizer => organizer === currentUser.uid) > -1) {
			return true;
		}
		if (milongaData?.createdBy?.editors.findIndex(editor => editor === currentUser.uid) > -1) {
			return true;
		}
	}
	return false;
}

export const Milonga = async () => {

    const milongaId = location.hash.split('/')[1]

    console.log('milonga id ', milongaId)

    const db = getFirestore()
    const milongaRef = doc(db, `${process.env.MODE}.milongas`, milongaId)
    const milongaSnap = await getDoc(milongaRef)

    if (!milongaSnap.exists()) {
        location.replace('#')
    }

    const milongaData = milongaSnap.data()

	render(cache(html`
        <div class="milonga p-5" role="document">
            <header class="flex items-center mb-5 h-10 w-full">
				<div class="min-w-[20%]"><a href="#" @click=${e => { e.preventDefault(); history.back() }}>${ArrowLeftIcon()}</a></div>
				<div class="flex-1"><h1 class="font-bold text-center">밀롱가</h1></div>
				<div class="min-w-[20%] flex justify-end"></div>
			</header>
            <div class="milonga-profile flex mb-4">
                <div class="flex-none">
                    <img src="https://picsum.photos/100/100" class="block size-24 rounded-3xl">
                </div>
                <div class="mx-3 flex-1">
					<h4 class="font-bold">${milongaData.name}</h4>
					<span class="text-slate-500 text-sm flex items-center">${AtSymbolIcon({ 'classList': 'size-4 me-1'})} ${milongaId}</span>
				</div>
            </div>
            <section class="p-5 mb-4 rounded-xl bg-white shadow-xl shadow-slate-100">
                <header class="mb-5 flex items-center justify-between">
                    <h4 class="font-bold">다가오는 이벤트</h4>
					${
						await hasPermitToEditMilonga(milongaId)
							? html`<a href="#add_milonga_event?mid=${milongaId}" class="text-purple-500">이벤트 추가</a>`
							: nothing
					}
                </header>
				<ul>
					${
						map([10], item => html`<li class="mt-3">${MilongaEventItem(item)}</li>`)
					}
				</ul>
            </section>
        </div>
	`), document.getElementById('app'))
}