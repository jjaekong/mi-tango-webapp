import { html } from "lit-html"
import { cache } from 'lit-html/directives/cache.js'
import { ChevronRightIcon, UserCircleSolidIcon } from "../../icons"

export const UserProfile = (currentUser) => {
	return cache(html`
		<a class="mb-4 flex items-center bg-white rounded-xl shadow-lg shadow-slate-100 p-5" href="#edit_user_profile">
			<div>
				<div class="size-12 empty:rounded-full empty:bg-slate-200">${
					currentUser?.photoURL
						? html`<img class="rounded-full" src=${currentUser.photoURL}>`
						: html`<span class="text-slate-400">${UserCircleSolidIcon({ classList: 'size-12' })}</span>`
				}</div>
			</div>
			<div class="px-3 flex-1">
				<h4 class="font-bold empty:bg-slate-100 empty:h-6 empty:w-[50%]">${
					currentUser
						? html`${currentUser.displayName}`
						: nothing
				}</h4>
				<div id="user-email" class="text-sm text-slate-400 empty:bg-slate-100 empty:h-4 empty:mt-1">${
					currentUser
						? html`${currentUser.email}`
						: nothing
				}</div>
			</div>
			<div id="edit-profile-icon" class="text-slate-400">
				${ChevronRightIcon()}
			</div>
		</a>
	`)
}