import { html } from "lit-html"
import { AtSymbolIcon, CalendarDaysSolidIcon, ChevronRightIcon, ForwardSolidIcon } from "../icons"

export const djItem = (item) => {
    return html`
        <a href="#dj" class="flex w-full items-center px-5 py-2 focus:bg-blue-100 active:bg-blue-100">
            <div class="self-start">
                <img class="block w-10 h-10 rounded-full" src="https://picsum.photos/id/${item}/100/100">
            </div>
            <div class="mx-3">
                <h6 class="font-bold">에르난</h6>
				<dl class="inline-flex items-center flex-wrap text-sm text-slate-500">
					<dt class="me-1">${ CalendarDaysSolidIcon({ classList: 'size-4'}) }</dt>
					<dd class="inline-flex flex-wrap">
						<time class="me-1">1월 14일 수요일</time>
					</dd>
				</dl>
				<dl class="inline-flex items-center flex-wrap text-sm text-slate-500">
					<dt class="me-1">${ AtSymbolIcon({ classList: 'size-4' }) }</dt>
					<dd class="inline-flex flex-wrap">
						IF밀롱가
					</dd>
				</dl>
            </div>
            <div class="ms-auto text-slate-400">
                ${ChevronRightIcon({ classList: 'size-5' })}
            </div>
        </a>
    `
}