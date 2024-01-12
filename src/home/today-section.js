import { html } from "lit-html";

const milongaEventList = new Array(5)

const milongaEventItem = () => html`
    <a href="milonga.html" class="flex w-100 items-center text-md">
        <div>
            <time class="flex flex-col rounded-xl justify-center items-center leading-tight size-16 bg-slate-100">
                <span class="font-bold">8</span>
                <span class="text-slate-400 text-xs">PM</span>
            </time>
        </div>
        <div class="mx-3 self-start">
            <h6 class="text-sm">루미노소</h6>
            <div class="text-xs text-slate-400">@오나다</div>
        </div>
        <div class="ms-auto">
            <img class="block size-16 rounded-xl" src="https://picsum.photos/id/10/100/100">
        </div>
    </a>
`

export const todaySection = () => {
    return html`
        <section class="rounded-[1rem] bg-white shadow-lg shadow-slate-100 p-5">
            <header>
                <h2 class="text-xl font-extrabold">Today</h2>
            </header>
            <ul>
                <li>${milongaEventItem()}</li>
            </ul>
        </section>`
}