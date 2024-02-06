import { html, nothing, render } from "lit-html"
import { cache } from 'lit-html/directives/cache.js'
import { ArrowLeftIcon, UserCircleSolidIcon } from "./icons";
import { getAuth, updateProfile } from "firebase/auth";
import { getDownloadURL, getStorage, ref as getStorageRef, uploadBytes } from "firebase/storage";
import { resizeImage } from "./util";
import dayjs from "dayjs/esm";

export const EditUserProfile = async () => {

    const auth = getAuth()
    
    await auth.authStateReady()
    
    const currentUser = auth.currentUser

    console.log('currentUser => ', currentUser.photoURL)

    function editProfile(e) {
        e.preventDefault()
        if (!currentUser) return;
        updateProfile(currentUser, {
            photoURL: document.forms['edit-profile-form'].elements['photo-url'].value,
            displayName: document.forms['edit-profile-form'].elements['display-name'].value
        })
        .then(() => {
            alert('수정되었습니다.')
            // location.reload('#me')
            // location.href = '#me'
            history.back()
        })
        .catch(error => { console.log(error) })
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
                const storageRef = getStorageRef(storage, `users/profile/${dayjs().format('YYYYMMDD_HHmmss_SSS')}_${currentUser.uid}.${ext}`);
                //uploadBytes(storageRef, data, { cacheControl: 'private, max-age=108000' })
                uploadBytes(storageRef, data)
                    .then(() => {
                        getDownloadURL(storageRef)
                            .then((url) => {
                                document.querySelector('#profile-preview img')?.remove()
                                document.querySelector('#profile-preview span')?.remove()
                                render(
                                    html`<img src="${url}" class="rounded-full w-full h-full block">`,
                                    document.querySelector('#profile-preview')
                                )
                                document.querySelector('[name="photo-url"]').setAttribute('value', url)
                            })
                    })
            })
            .catch(error => {
                console.log(error)
            })
            
    }

    function deletePhoto() {
        document.querySelector('#profile-preview img')?.remove()
        render(
            html`<span class="text-slate-400">${ UserCircleSolidIcon({ classList: 'size-32' }) }</span>`,
            document.getElementById('profile-preview')
        )
        document.querySelector('[name="photo-url"]').setAttribute('value', "")
    }

    render((html`
        <div class="me edit-profile p-5">
            <header class="flex items-center mb-5 h-10 w-full">
				<div class="min-w-[20%]"><a href="#" @click=${e => {
                    e.preventDefault();
                    history.back()
                }}>${ArrowLeftIcon()}</a></div>
				<div class="flex-1"><h1 class="font-bold text-center">프로필 수정</h1></div>
				<div class="min-w-[20%] flex justify-end"></div>
			</header>
            <form action="#" method="post" id="edit-profile-form" @submit=${editProfile}>
                <div class="mb-3">
                    <div id="profile-preview" class="block mx-auto w-32 h-32 empty:bg-slate-200 rounded-full overflow-hidden">${
                        currentUser
                            ? currentUser.photoURL
                                ? html`<img src=${currentUser.photoURL} class="rounded-full w-full h-full block">`
                                : html`<span class="text-slate-400">${ UserCircleSolidIcon({ classList: 'size-32' }) }</span>`
                            : html`${nothing}`
                    }</div>
                    <div class="flex justify-center mt-4 mx-auto">
                        <button type="button" class="text-sm bg-slate-200 p-3 rounded-lg text-slate-700" @click=${deletePhoto}>삭제</button>
                        <button type="button" class="text-sm cursor-pointer bg-purple-500 p-3 rounded-lg text-white ms-2" @click=${() => { document.getElementById('file').click() }}>
                            <span>업로드</span>
                        </button>
                        <input type="file" class="hidden" accept="image/png, image/gif, image/jpg, image/jpeg" id="file" @input=${ uploadPhoto }>
                    </div>
                    <input type="hidden" name="photo-url" value="${currentUser.photoURL}">
                </div>
                <div class="mb-3">
                    <label>
                        <input type="text" name="display-name" class="border-slate-200 w-full rounded-lg" placeholder="이름 또는 닉네임" required value="${currentUser.displayName}">
                    </label>
                </div>
                <div class="mb-3">
                    <label>
                        <input type="email" name="email" class="border-slate-200 w-full rounded-lg disabled:bg-slate-100" placeholder="이메일" disabled value="${currentUser.email}">
                    </label>
                </div>
                <div class="mt-5">
                    <button type="submit" class="p-3 bg-purple-500 text-white rounded-lg w-full">저장</button>
                </div>
            </form>
        </div>
    `), document.getElementById('app'))
}