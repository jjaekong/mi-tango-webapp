import { getAuth } from 'firebase/auth'
import { collection, doc, getDoc, getDocs, getFirestore, query, where } from 'firebase/firestore'
import { render, html, nothing } from 'lit-html'
import { MilongaEventItem } from './components/milonga_event_item'
import { ArrowLeftIcon, AtSymbolIcon, HeadphonesIcon } from './icons'
import dayjs from 'dayjs/esm'

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

	render((html`
        <div class="milonga p-5" role="document">
            <header class="flex items-center mb-5 h-10 w-full">
				<div class="min-w-[20%]"><a href="#" @click=${e => { e.preventDefault(); history.back() }}>${ArrowLeftIcon()}</a></div>
				<div class="flex-1"><h1 class="font-bold text-center sr-only">밀롱가</h1></div>
				<div class="min-w-[20%] flex justify-end"></div>
			</header>
            <div class="milonga-profile flex mb-4">
                <div class="flex-none">
                    <!-- <img src="https://picsum.photos/100/100" class="block size-24 rounded-3xl"> -->
                    <div class="size-24 rounded-3xl empty:bg-slate-200" id="milonga-logo"></div>
                </div>
                <div class="mx-3 flex-1">
					<h4 class="font-bold text-lg empty:bg-slate-200 empty:h-6 empty:w-[50%]" id="milonga-name"></h4>
				</div>
            </div>
            <section class="p-5 mb-4 rounded-xl bg-white shadow-xl shadow-slate-100" id="upcoming-milonga-events">
                <header class="mb-5 flex items-center justify-between">
                    <h4 class="font-bold text-lg">다가오는 이벤트</h4>
                </header>
            </section>
        </div>
	`), document.getElementById('app'))

    const milongaId = location.hash.split('/')[1]

    console.log('milonga id ', milongaId)

    const db = getFirestore()
    const milongaRef = doc(db, `${process.env.MODE}.milongas`, milongaId)
    getDoc(milongaRef)
        .then(doc => {
            if (doc.exists()) {
                const milongaData = doc.data()
                render(html`${milongaData.name}`, document.getElementById('milonga-name'))
            } else {
                location.replace('#')     
            }
        })
    const milongaEventsQuery = query(collection(db, `${process.env.MODE}.milonga_events`), where('milongaId', '==', milongaId), where("startAt", ">=", dayjs().hour(6).minute(0).second(0).toDate()))
    getDocs(milongaEventsQuery)
        .then(snap => {
            if (snap.empty) {
                render(html`<p class="text-slate-500">등록된 밀롱가 이벤트가 없습니다.</p>`, document.getElementById('upcoming-milonga-events'))
            } else {
                const milongaEvents = []
                snap.forEach(doc => {
                    const data = doc.data()
                    console.log(data.startAt.seconds)
                    milongaEvents.push(html`
                        <li>
                            <a href=#milonga_event/${doc.id} class="mt-3 flex items-center">
                                <div class="self-start">
                                    ${
                                        data.posters?.length > 0
                                            ? html`<img class="block size-14 bg-slate-100 rounded-xl" src="${data.posters[0]}">`
                                            : html`<div class="size-14 bg-slate-100 rounded-xl"></div>`
                                    }    
                                </div>
                                <div class="px-3">
                                    <h6 class="font-bold"><time>${dayjs(data.startAt.seconds*1000).format("MMM Do dddd a h:mm")}</time></h6>
                                    <ul class="inline-flex flex-wrap text-slate-500 text-sm">
                                        <li class="me-1 inline-flex items-center">${ HeadphonesIcon({classList: 'size-4 me-1' }) }시스루</li>
                                        <li class="me-1 inline-flex items-center">${ AtSymbolIcon({classList: 'size-4 me-1' }) }오나다</li>
                                    </ul>
                                </div>
                            </a>
                        </li>
                    `)
                })
                render(html`<ul>${milongaEvents}</ul>`, document.getElementById('upcoming-milonga-events'))
            } 
        })
        .catch(error => {
            console.log(error)
        })

    hasPermitToEditMilonga(milongaId)
        .then(has => {
            if (has) {
                render(html`<a class="text-blue-500 font-bold" href="#add_milonga_event?mid=${milongaId}">이벤트 추가</a>`, document.querySelector('#upcoming-milonga-events header'))
            }
        })
}