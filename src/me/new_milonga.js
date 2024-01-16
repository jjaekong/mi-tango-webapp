import '../firebase_init.js'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { toolbar } from '../components/toolbar.js'
import { arrowLeft } from '../icons.js'
import { html } from 'lit-html'
import { ENV } from '../config.js'

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

document.getElementById('new-milonga-form')?.addEventListener('submit', async function(e) {
    e.preventDefault()
    if (!auth.currentUser) {
        alert('로그인이 필요합니다.')
        return
    }
    
    const docRef = doc(db, `${ENV}.milongas`, document.getElementById('milonga-id').value)
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
    } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
    }
})