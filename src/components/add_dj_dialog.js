import { html } from "lit-html"
import { placeItem } from "./place_item"

export const AddDJDialog = () => {

	function selectAddType(e) {
		document.querySelectorAll('#add-dj-dialog [role=tab][aria-selected=true]').forEach(tab => tab.setAttribute("aria-selected", false))
		document.querySelectorAll('#add-dj-dialog [role=tabpanel]:not([hidden])').forEach(tabpanel => tabpanel.hidden = true)
		e.target.setAttribute("aria-selected", true)
		document.getElementById(`${e.target.getAttribute("aria-controls")}`).removeAttribute('hidden')
	}

	return html`
		<dialog id="add-dj-dialog" class="card p-4 !shadow-black/50">
			<header class="flex items-center mb-4">
				<h1 class="font-semibold">DJ 추가</h1>
				<button class="ms-auto text-slate-500" type="button" @click=${e => { document.getElementById('add-dj-dialog').close() }}>닫기</button>
			</header>
			<div role="tablist" class="flex mb-4">
				<button class="rounded-none rounded-l-lg flex-1 p-2 bg-slate-100 text-slate-500 aria-selected:bg-indigo-500 aria-selected:text-white" role="tab" aria-controls="dj-tabpanel-1" aria-selected="true" @click=${selectAddType}>
					최근 선택
				</button>
				<button class="rounded-none flex-1 p-2 bg-slate-100 text-slate-500 aria-selected:bg-indigo-500 aria-selected:text-white" role="tab" aria-controls="dj-tabpanel-2" aria-selected="false" @click=${selectAddType}>
					검색 선택
				</button>
				<button class="rounded-none rounded-r-lg flex-1 p-2 bg-slate-100 text-slate-500 aria-selected:bg-indigo-500 aria-selected:text-white" role="tab" aria-controls="dj-tabpanel-3" aria-selected="false" @click=${selectAddType}>
					직접 입력
				</button>
			</div>
			<div role="tabpanel" id="dj-tabpanel-1" hidden>
				<form method="dialog">
					<ul class="mb-4">
						<li>
							<label class="!px-0 flex w-full items-center">
								<input type="radio" class="sr-only" value="place-item">
								<div class="self-start">
									<img class="block w-10 h-10 rounded-full" src="https://picsum.photos/100/100">
								</div>
								<div class="mx-3">
									<h6 class="font-bold">에르난</h6>
								</div>
							</label>
						</li>
					</ul>
					<button class="btn-primary w-full">선택</button>
				</form>
			</div>
			<div role="tabpanel" id="dj-tabpanel-2">
				<form method="dialog">
					<div class="flex items-center">
						<input type="search" autocomplete="on" id="dj-search-keyword">
						<button type="button" class="btn-secondary flex-none">검색</button>
					</div>
					<div class="flex items-center mt-4" id="dj-search-results"></div>
					<button class="btn-primary w-full">선택</button>
				</form>
			</div>
			<div role="tabpanel" id="dj-tabpanel-3" hidden>
				<form method="dialog">
					<div>TAB #3</div>
					<button class="btn-primary w-full">선택</button>
				</form>
			</div>
		</dialog>
	`
}