import dayjs from "dayjs/esm"
import { getAuth } from "firebase/auth"
import { arrayUnion, collection, getDocs, getFirestore, query, setDoc, where, doc, getDoc } from "firebase/firestore"
import { getDownloadURL, getStorage, ref as getStorageRef, uploadBytes } from "firebase/storage"
import { html, nothing, render } from "lit-html"
import { UserCircleOutlineIcon } from "../icons"
import { resizeImage } from "../util"

export const AddDJDialog = async (milongaEventData, callback) => {

	console.log('milogna event data of AddDJDialog', milongaEventData)

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
                document.getElementById('add-dj-dialog').close()
				if (typeof callback === 'function') callback()
			})
			.catch(error => {
				console.log(error)
			})
	}

	function djItem(data) {
		return html`<div class="flex w-full items-center">
				<div class="self-start">
					${
						data.photoURL
							? html`<img class="block size-10 rounded-full" src="${data.photoURL}">`
							: UserCircleOutlineIcon({ classList: 'size-10 text-slate-400' })
					}
				</div>
				<div class="mx-2">
					<h6 class="font-semibold">[${data.nationality}] ${data.name}</h6>
				</div>
				<div class="ms-auto">
					<button class="btn-primary p-2 text-sm" @click=${() => { selectDJ(data) }}>선택</button>
				</div>
			</div>`
	}

	function selectTab(e) {
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
			render(html`<p class="text-sm text-slate-500 mb-2 text-center">검색 결과가 없습니다.</p>`, document.getElementById('dj-search-results'))
		}
	}

	function uploadPhoto(e) {

        if (e.target.files.length !== 1) return false;
        const file = e.target.files[0]

        // 이미지인지 확인
        if (file.type.indexOf('image') !== 0) {
            alert('이미지가 아닙니다.')
            return
        }

        const ext = file.type.split('/').at(-1)
		
        resizeImage(file, 300, 300)
            .then(data => {
                const storage = getStorage()
                const storageRef = getStorageRef(storage, `dj/profile/${dayjs().format('YYYYMMDD_HHmmss_SSS')}.${ext}`);
                uploadBytes(storageRef, data)
                    .then(() => {
                        getDownloadURL(storageRef)
                            .then((url) => {
								document.querySelector('input[name=photo-url]').setAttribute('value', url)
								render(html`<img class="block size-full rounded-full" src="${url}">`, document.querySelector('#photo-preview'))
                            })
                    })
            })
            .catch(error => {
                console.log(error)
            })
            
    }

	function deletePhoto() {
		if (!confirm("DJ의 프로필 사진을 삭제하시겠습니까?")) return
		document.querySelector('input[name=photo-url]').setAttribute('value', "")
		render(nothing, document.querySelector('#photo-preview'))
	}

	function addDJ(e) {
		e.preventDefault()
		if (!confirm("입력한 정보로 DJ를 추가하시겠습니까?")) return

		const data = {
			photoURL: document.querySelector('input[name=photo-url]').value,
			name: document.querySelector('input[name=name]').value,
			nationality: document.querySelector('input[name=nationality]').value
		}

		const db = getFirestore()
		const ref = doc(db, `${process.env.MODE}.milonga_events`, milongaEventData.id)
		setDoc(ref, {
			djs: arrayUnion(data),
			updatedAt: new Date(),
			updatedBy: currentUser.uid
		}, { merge: true })
			.then(() => {
				alert('DJ가 추가되었습니다.')
                document.getElementById('add-dj-dialog').close()
				if (typeof callback === 'function') callback()
			})
			.catch(error => {
				console.log(error)
			})
	}

	return html`
		<dialog id="add-dj-dialog" class="card p-4 !shadow-black/50 min-w-80">
			<header class="flex items-center mb-4">
				<h1 class="font-semibold">DJ 추가</h1>
				<button class="ms-auto text-slate-500" type="button" @click=${e => { document.getElementById('add-dj-dialog').close() }}>닫기</button>
			</header>
			<div role="tablist" class="flex mb-4">
				<button class="rounded-none rounded-l-lg flex-1 p-2 bg-slate-100 text-slate-500 aria-selected:bg-indigo-500 aria-selected:text-white" role="tab" aria-controls="dj-tabpanel-1" aria-selected="true" @click=${selectTab}>
					검색/선택
				</button>
				<button class="rounded-none rounded-r-lg flex-1 p-2 bg-slate-100 text-slate-500 aria-selected:bg-indigo-500 aria-selected:text-white" role="tab" aria-controls="dj-tabpanel-2" aria-selected="false" @click=${selectTab}>
					직접 입력
				</button>
			</div>
			<div role="tabpanel" id="dj-tabpanel-1">
				<div class="flex items-center">
					<input type="search" autocomplete="on" id="dj-search-keyword">
					<button type="button" class="btn-secondary !bg-slate-100 flex-none ms-2" @click=${searchDJ}>검색</button>
				</div>
				<div class="mt-4" id="dj-search-results"></div>
			</div>
			<div role="tabpanel" id="dj-tabpanel-2" hidden>
				<form @submit=${ addDJ }>
					<div class="mb-3">
						<div class="rounded-full size-24 empty:bg-slate-200 block mx-auto" id="photo-preview"></div>
					</div>
					<div class="mb-3 flex items-center justify-center">
						<input type="hidden" name="photo-url">
						<button type="button" class="btn-secondary !bg-slate-100 !text-red-500" @click=${ deletePhoto }>삭제</button>
						<label class="m-0 p-0">
							<div class="block btn-secondary ms-2 text-base !bg-slate-100">업로드</div>
							<input type="file" class="sr-only" @input=${ uploadPhoto } accept="image/jpeg, image/gif, image/png, image/jpg">
						</label>
					</div>
					<div class="mb-3">
						<input name="nationality" type="text" placeholder="국적(코드, 예: KR, CN, AR, ...)" maxlength="2" pattern="[A-Z]{2}" required>
					</div>
					<div class="mb-3">
						<input name="name" type="text" placeholder="이름 또는 닉네임" required>
					</div>
					<button type="submit" class="btn-primary w-full">추가</button>
				</form>
			</div>
		</dialog>
	`
}