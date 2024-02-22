import { html, nothing } from "lit-html"
import { AtSymbolIcon, HashtagIcon, HeadphonesIcon } from "../icons"
import dayjs from "dayjs/esm"

export const MilongaEventItem = (data) => {
    console.log('data => ', data)
    const datetime = dayjs(data.startAt*1000)
    return html`
        <a href="#milonga_event/${data.id}" class="flex w-100 items-center">
            <div class="self-start">
                <time class="flex flex-col lang:ko:flex-col-reverse rounded-xl justify-center items-center leading-tight size-14 bg-slate-100">
                    <span class="font-bold">
                        ${
                            datetime.format('m') > 0 ? datetime.format('h:m') : datetime.format('h')
                        }
                    </span>
                    <span class="text-slate-400 text-xs">${datetime.locale('en').format('a').toUpperCase()}</span>
                </time>
            </div>
            <div class="mx-3">
                <h6 class="font-semibold">${data.name}</h6>
				<!-- <ul class="inline-flex flex-wrap text-slate-500 text-sm">
					<li class="me-1 inline-flex items-center"><span class="me-1">${ HeadphonesIcon({classList: 'size-4' }) }</span>시스루</li>
					<li class="me-1 inline-flex items-center"><span class="">${ HashtagIcon({classList: 'size-4' }) }</span>예약가능</li>
				</ul> -->
                ${
                    data.djs?.length > 0
                        ? html`
                            <dl class="inline-flex items-center text-sm text-slate-500 me-1">
                                <dt class="me-1">${HeadphonesIcon({ classList: 'size-4' })}</dt>
                                ${data.djs.map(dj => html`<dd class="before:content-[', ']">${dj.name}</dd>`)}
                            </dl>`
                        : nothing
                }
                ${
                    data.place
                        ? html`
                            <dl class="inline-flex items-center text-sm text-slate-500 me-1">
                                <dt class="me-1">${AtSymbolIcon({ classList: 'size-4' })}</dt>
                                <dd>${ data.place.name }</dd>
                            </dl>`
                        : nothing
                }
            </div>
        </a>
    `
}