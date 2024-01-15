import '../firebase_init.js'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { toolbar } from '../components/toolbar.js'
import { arrowLeft } from '../icons.js'
import { html } from 'lit-html'

const auth = getAuth()
const db = getFirestore()

onAuthStateChanged(auth, user => {
    if (!user) {
        location.href = '/'
    }
})

toolbar({
    left: html`<a href="#" @click="${(e) => {
            e.preventDefault();
            history.back();
        }}">${arrowLeft({size: "size-6"})}</a>`,
    title: '밀롱가 만들기'
})

document.getElementById('new-milonga-form')?.addEventListener('submit', function(e) {
    e.preventDefault()
    if (!auth.currentUser) {
        alert('로그인이 필요합니다.')
        return
    }
    const docRef = doc(db, `${ENV}.milongas`)
    // 밀롱가 아이디 중복 체크
    // const docRef = doc(db, `dev.milongas`, )
})