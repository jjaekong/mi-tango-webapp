import { html } from "lit-html"

export const djItem = (item) => {
    return html`
        <a href="#dj" class="flex w-full items-center">
            <div class="self-start">
                <img class="block w-10 h-10 rounded-full" src="https://picsum.photos/id/${item}/100/100">
            </div>
            <div class="mx-3">
                <h6 class="font-bold">에르난</h6>
            </div>
            <div class="ms-auto flex flex-col justify-end items-end">
                <b class="text-sm text-slate-500">루미노소</b>
                <time class="text-xs text-slate-500">1월 14일 수요일</time>
            </div>
        </a>
    `
}