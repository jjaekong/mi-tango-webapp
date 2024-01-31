import { html } from "lit-html"
import { AtSymbolIcon, ChevronRightIcon } from "../icons"

export const djItem = (item) => {
    return html`
        <a href="#dj" class="flex w-full items-center">
            <div class="self-start">
                <img class="block w-10 h-10 rounded-full" src="https://picsum.photos/id/${item}/100/100">
            </div>
            <div class="mx-3">
                <h6 class="font-bold">에르난</h6>
                <div class="inline-flex flex-wrap text-sm text-slate-500">
                    <time class="me-1">1월 14일 수요일</time>
                    <span class="inline-flex items-center">${AtSymbolIcon({ classList: 'size-3 me-1' })}IF밀롱가</span>
                </div>
            </div>
            <div class="ms-auto text-slate-400">
                ${ChevronRightIcon({ classList: 'size-4' })}
            </div>
        </a>
    `
}