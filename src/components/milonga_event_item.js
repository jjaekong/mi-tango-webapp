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
				<dl class="flex items-center text-slate-500 text-sm">
					<dt>${ HeadphonesIcon({ classList: 'size-4' }) }<span class="sr-only">디제이</span></dt>
					<dd>
						<ul class="flex flex-wrap">
							<li>시스루</li>
						</ul>		
					</dd>
				</dl>
				<ul class="flex flex-wrap text-slate-400 text-xs">
					<li class="me-1">#예약가능</li>
					<li class="me-1">#공연</li>
					<li class="me-1">#오픈마켓</li>
				</ul>
            </div>
            <div class="ms-auto self-start">
                <img class="block size-14 rounded-xl" src="https://picsum.photos/id/${item}/100/100">
            </div>
        </a>
    `
}