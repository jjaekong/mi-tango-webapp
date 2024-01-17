import { getAuth, onAuthStateChanged } from "@firebase/auth"
import { render, html } from "lit-html"
import { Bar3Icon, HeadphonesIcon, UserCircleOutlineIcon } from "./icons.js"
import dayjs from 'dayjs/esm'
import localizedFormat from 'dayjs/esm/plugin/localizedFormat'
import advancedFormat from 'dayjs/esm/plugin/advancedFormat'
import 'dayjs/esm/locale/ko'



export const Home = () => {

	dayjs.locale('ko')
	dayjs.extend(localizedFormat)
	dayjs.extend(advancedFormat)
    
    onAuthStateChanged(getAuth(), user => {
        if (user) {
            render(html`<a href="me.html"><img src="${user.photoURL}" class="size-8 rounded-full"></a>`, document.getElementById('user-profile'))
        } else {
            render(html`<a href="login.html">${UserCircleOutlineIcon({classList: 'size-8'})}</a>`, document.getElementById('user-profile'))
        }
    })
	
	// render(html`${Bar3Icon()}`, document.getElementById('menu'))

	render(html`${dayjs().format("MMM Do dddd")}`, document.querySelector('#today-date'))

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
                    <div class="flex items-center text-slate-400">
                        ${ HeadphonesIcon({ classList: 'size-4' }) }
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

    const djList = [10, 100, 1000, 1050, 550]

    const djItem = (item) => {
        return html`
            <a href="dj.html" class="flex w-full items-center">
                <div class="self-start">
                    <img class="block w-10 h-10 rounded-full" src="https://picsum.photos/id/${item}/100/100">
                </div>
                <div class="mx-3">
                    <h6 class="font-bold">에르난</h6>
                </div>
            </a>
    `}

    setTimeout(() => {
        document.querySelector('#dj-list ul').innerHTML = ''
        render(html`${
            djList.map((item) => html`
                <li class="mt-3">${djItem(item)}</li>
            `)
        }`, document.querySelector('#dj-list ul'))
    }, 500)
}