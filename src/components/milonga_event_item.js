import { html, nothing } from "lit-html"
import { AtSymbolIcon, HashtagIcon, HeadphonesIcon } from "../icons"
import dayjs from "dayjs/esm"
// import advancedFormat from 'dayjs/esm/plugin/advancedFormat'

export const MilongaEventItem = (data, dateType = null) => {
    console.log('data => ', data)
    const startTime = dayjs(data.startAt.seconds*1000)
	const endTime = dayjs(data.endAt.seconds*1000)
    return html`
        <a href="#milonga_event/${data.id}" class="flex w-100 items-center">
            <div class="self-start">
				${
					dateType == 'today'
						?	startTime < dayjs().add(-2, 'hour')
								? html`
									<time class="flex flex-col rounded-xl justify-center items-center leading-tight size-14 bg-slate-100">
										<span class="font-bold">${ endTime.format('m') > 0 ? endTime.format('h:m') : endTime.format('h') }</span>
										<span class="text-slate-400 text-xs">${endTime.locale('en').format('a').toUpperCase()}</span>
									</time>`
								: html`
									<time class="flex flex-col rounded-xl justify-center items-center leading-tight size-14 bg-slate-100">
										<span class="font-bold">${ startTime.format('m') > 0 ? startTime.format('h:m') : startTime.format('h') }</span>
										<span class="text-slate-400 text-xs">${startTime.locale('en').format('a').toUpperCase()}</span>
									</time>`
						:	html`
								<time class="flex flex-col rounded-xl justify-center items-center leading-tight size-14 bg-slate-100">
									<span class="text-xs text-slate-500">${ startTime.format('dddd') }</span>
									<span class="font-bold text-sm">${ startTime.format('M/D') }</span>
								</time>`
				}
            </div>
            <div class="mx-3">
                <h6 class="font-semibold">${data.name}</h6>
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