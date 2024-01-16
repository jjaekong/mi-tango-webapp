import { getAuth, onAuthStateChanged } from "@firebase/auth"
import { render, html } from "lit-html"
import { UserCircleOutlineIcon } from "./icons.js"

export const Home = () => {
    
    onAuthStateChanged(getAuth(), user => {
        if (user) {
            render(html`<a href="me.html"><img src="${user.photoURL}" class="size-8 rounded-full ring-2 ring-purple-700 ring-offset-2"></a>`, document.getElementById('user-profile'))
        } else {
            render(html`<a href="login.html">${UserCircleOutlineIcon({classList: 'size-8'})}</a>`, document.getElementById('user-profile'))
        }
    })

    const milongaEventList = [10, 100, 1000, 1050, 550]

    const milongaEventItem = (item) => {
        return html`
            <a href="milonga_event.html" class="flex w-100 items-center">
                <div class="self-start">
                    <time class="flex flex-col rounded-xl justify-center items-center leading-tight size-14 bg-slate-100">
                        <span class="font-bold">8</span>
                        <span class="text-slate-400 text-xs">PM</span>
                    </time>
                </div>
                <div class="mx-3">
                    <h6 class="font-extrabold">루미노소</h6>
                    <!-- <div class="text-xs text-slate-400 flex">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25" />
                        </svg>
                        <span>오나다</span>
                    </div> -->
                    <div class="flex items-center text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" class="h-4 w-4">
                            <path d="M8 3a5 5 0 0 0-5 5v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a6 6 0 1 1 12 0v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1V8a5 5 0 0 0-5-5"/>
                        </svg>
                        <span class="ms-1 text-sm">시스루</span>
                    </div>
                </div>
                <div class="ms-auto self-start">
                    <img class="block size-14 rounded-xl" src="https://picsum.photos/id/${item}/100/100">
                </div>
            </a>
    `}

    setTimeout(() => {
        document.querySelector('#today-milongas ul').innerHTML = ''
        render(html`${
            milongaEventList.map((item) => html`
                <li class="mt-3">${milongaEventItem(item)}</li>
            `)
        }`, document.querySelector('#today-milongas ul'))
    }, 500)
}