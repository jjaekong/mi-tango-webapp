import { html } from "lit-html"
import { HeadphonesIcon } from "../icons"

export const MilongaEventItem = (item) => {
    return html`
        <a href="#milonga_event" class="flex w-100 items-center">
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
    `
}