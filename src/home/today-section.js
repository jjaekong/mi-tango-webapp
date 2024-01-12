import { html } from "lit-html";

const milongaEventList = [0, 0, 0]

const milongaEventItem = () => html`
    <a href="milonga.html" class="flex w-100 items-center">
        <div class="self-start">
            <time class="flex flex-col rounded-xl justify-center items-center leading-tight size-14 bg-slate-100">
                <span class="font-bold">8</span>
                <span class="text-slate-400 text-xs">PM</span>
            </time>
        </div>
        <div class="mx-3">
            <h6 class="text-md font-extrabold">루미노소</h6>
            <div class="text-xs text-slate-400">@오나다</div>
        </div>
        <div class="ms-auto self-start">
            <img class="block size-14 rounded-xl" src="https://picsum.photos/id/10/100/100">
        </div>
    </a>
`

export const todaySection = () => {
    return html`
        <section class="rounded-[1rem] bg-white shadow-lg shadow-slate-100 p-5">
            <header>
                <h2 class="text-2xl font-black">오늘</h2>
            </header>
            <ul>
                ${ milongaEventList.map(() => html`
                    <li class="mt-5">${milongaEventItem()}</li>
                `) }
            </ul>
        </section>`
}