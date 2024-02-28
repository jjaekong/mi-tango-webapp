import { html } from "lit-html"
import { AtSymbolIcon, CalendarDaysSolidIcon, ChevronRightIcon } from "../icons"

export const placeItem = () => {
    return html`
        <a href="#dj" class="flex w-full items-center">
            <div class="self-start">
                <img class="block w-10 h-10 rounded-full" src="https://picsum.photos/100/100">
            </div>
            <div class="mx-3">
                <h6 class="font-bold">탱고클럽오초</h6>
				<address>서울시 월드컵북로 100</address>
            </div>
            <div class="ms-auto text-slate-400">
                ${ChevronRightIcon({ classList: 'size-5' })}
            </div>
        </a>
    `
}