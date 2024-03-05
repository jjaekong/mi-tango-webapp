import { getAuth } from "firebase/auth"
import { arrayUnion, collection, getDocs, getFirestore, query, setDoc, where, doc } from "firebase/firestore"
import { html, render } from "lit-html"
import { UserCircleOutlineIcon } from "../icons"

export const AddDJDialog = async (milongaEventData) => {

	console.log('milogna event data', milongaEventData)

	const auth = getAuth()
	await auth.authStateReady()
	const currentUser = auth.currentUser

	function selectDJ(data) {
		const db = getFirestore()
		const ref = doc(db, `${process.env.MODE}.milonga_events`, milongaEventData.id)
		setDoc(ref, {
			djs: arrayUnion(data),
			updatedAt: new Date(),
			updatedBy: currentUser.uid
		}, { merge: true })
			.then(() => {
				alert('DJ가 추가되었습니다.')
			})
			.catch(error => {
				console.log(error)
			})
	}

	function djItem(data) {
		console.log('djItem data', data)
		return html`<div class="flex w-full items-center">
				<div class="self-start">
					${
						data.photoURL
							? html`<img class="block size-10 rounded-full" src="${data.photoURL}">`
							: UserCircleOutlineIcon({ classList: 'size-12 text-slate-500' })
					}
				</div>
				<div class="mx-3">
					<h6 class="font-semibold">[${data.nationality}] ${data.name}</h6>
				</div>
				<div class="ms-auto">
					<button class="btn-primary p-2" @click=${() => { selectDJ(data) }}>선택</button>
				</div>
			</div>`
	}

	function selectAddType(e) {
		document.querySelectorAll('#add-dj-dialog [role=tab][aria-selected=true]').forEach(tab => tab.setAttribute("aria-selected", false))
		document.querySelectorAll('#add-dj-dialog [role=tabpanel]:not([hidden])').forEach(tabpanel => tabpanel.hidden = true)
		e.target.setAttribute("aria-selected", true)
		document.getElementById(`${e.target.getAttribute("aria-controls")}`).removeAttribute('hidden')
	}

	async function searchDJ() {
		const keyword = document.getElementById('dj-search-keyword')
		if (!keyword.value) {
			alert("검색어를 입력하세요.")
			keyword.focus()
			return
		}
		const db = getFirestore()
		const q = query(
			collection(db, `${process.env.MODE}.djs`),
			where('nameToArray', 'array-contains-any', keyword.value.split(""))
		)
		const snap = await getDocs(q)
		const results = snap.docs.filter(doc => {
			const data = { id: doc.id, ...doc.data() }
			return data.name.indexOf(keyword.value) > -1
		})
		if (results.length > 0) {
			render(html`<ul>
				${results.map(result => {
					return html`<li class="mb-2">${ djItem({ id: result.id, ...result.data() }) }</li>`
				})}
			</ul>`, document.getElementById('dj-search-results'))
		} else {
			render(html`<p class="mt-3 text-sm text-slate-500">검색 결과가 없습니다.</p>`, document.getElementById('dj-search-results'))
		}
	}

	return html`
		<dialog id="add-dj-dialog" class="card p-4 !shadow-black/50">
			<header class="flex items-center mb-4">
				<h1 class="font-semibold">DJ 추가</h1>
				<button class="ms-auto text-slate-500" type="button" @click=${e => { document.getElementById('add-dj-dialog').close() }}>닫기</button>
			</header>
			<div role="tablist" class="flex mb-4">
				<button class="rounded-none rounded-l-lg flex-1 p-2 bg-slate-100 text-slate-500 aria-selected:bg-indigo-500 aria-selected:text-white" role="tab" aria-controls="dj-tabpanel-1" aria-selected="true" @click=${selectAddType}>
					최근 선택
				</button>
				<button class="rounded-none flex-1 p-2 bg-slate-100 text-slate-500 aria-selected:bg-indigo-500 aria-selected:text-white" role="tab" aria-controls="dj-tabpanel-2" aria-selected="false" @click=${selectAddType}>
					검색/선택
				</button>
				<button class="rounded-none rounded-r-lg flex-1 p-2 bg-slate-100 text-slate-500 aria-selected:bg-indigo-500 aria-selected:text-white" role="tab" aria-controls="dj-tabpanel-3" aria-selected="false" @click=${selectAddType}>
					직접 입력
				</button>
			</div>
			<div role="tabpanel" id="dj-tabpanel-1">
				<div class="flex w-full items-center">
					<div class="self-start">
						<img class="block w-10 h-10 rounded-full" src="https://picsum.photos/100/100">
					</div>
					<div class="mx-3">
						<h6 class="font-semibold">에르난</h6>
					</div>
					<div class="ms-auto">
						<button class="btn-primary p-2">선택</button>
					</div>
				</div>
			</div>
			<div role="tabpanel" id="dj-tabpanel-2" hidden>
				<div class="flex items-center">
					<input type="search" autocomplete="on" id="dj-search-keyword">
					<button type="button" class="btn-secondary !bg-slate-100 flex-none ms-2" @click=${searchDJ}>검색</button>
				</div>
				<div class="mt-4" id="dj-search-results"></div>
			</div>
			<div role="tabpanel" id="dj-tabpanel-3" hidden>
				<div class="mb-2">
					<input type="file">
				</div>
				<div class="mb-2">
					<input type="text" placeholder="국적 코드">
				</div>
				<div class="mb-2">
					<input type="text" placeholder="이름 또는 닉네임">
				</div>
				<button type="button" class="btn-primary w-full">선택</button>
			</div>
		</dialog>
	`
}