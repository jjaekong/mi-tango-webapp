import { html } from "lit-html"
import { ChevronRightIcon } from "../icons"

export const djItem = (item) => {
    return html`
        <a href="#dj" class="flex w-full items-center">
            <div class="self-start">
                <img class="block w-10 h-10 rounded-full" src="https://picsum.photos/id/${item}/100/100">
            </div>
            <div class="mx-3">
                <h6 class="font-bold">에르난</h6>
                <div class="text-slate-500 flex flex-wrap text-sm">
                    <time class="font-bold me-2">1월 14일 수요일</time>
                    <span>까사</span>
                </div>
            </div>
            <div class="ms-auto text-slate-400">
                ${ChevronRightIcon()}
            </div>
        </a>
    `
}