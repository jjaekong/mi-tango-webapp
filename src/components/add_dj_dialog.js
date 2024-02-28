import { html } from "lit-html"
import { placeItem } from "./place_item"

export const AddDJDialog = () => {

	return html`
		<dialog id="add-dj-dialog" class="card p-4 shadow-black">
			<header class="flex items-center mb-4">
				<h1 class="font-semibold">DJ 추가</h1>
				<button class="ms-auto text-slate-500" type="button" @click=${e => { document.getElementById('add-dj-dialog').close() }}>닫기</button>
			</header>
			<div role="tablist" class="flex mb-4">
				<button class="flex-1 btn-secondary !bg-slate-100 aria-selected:bg-indigo-500 aria-selected:text-white" role="tab" aria-controls="dj-tabpanel-1" aria-selected="true">
					최근 선택
				</button>
				<button class="flex-1 btn-secondary !bg-slate-100 aria-selected:bg-indigo-500 aria-selected:text-white" role="tab" aria-controls="dj-tabpanel-2" aria-selected="false">
					검색 선택
				</button>
				<button class="flex-1 btn-secondary !bg-slate-100 aria-selected:bg-indigo-500 aria-selected:text-white" role="tab" aria-controls="dj-tabpanel-3" aria-selected="false">
					직접 입력
				</button>
			</div>
			<div role="tabpanel" id="dj-tabpanel-1">
				<form method="dialog">
					<ul class="mb-4">
						<li>
							<label class="!px-0 flex w-full items-center">
								<input type="radio" class="sr-only" value="place-item">
								<div class="self-start">
									<img class="block w-10 h-10 rounded-full" src="https://picsum.photos/100/100">
								</div>
								<div class="mx-3">
									<h6 class="font-bold">탱고클럽오초</h6>
									<address>서울시 월드컵북로 100</address>
								</div>
							</label>
						</li>
					</ul>
					<button class="btn-primary w-full">선택</button>
				</form>
			</div>
			<div role="tabpanel" id="dj-tabpanel-2" hidden>
				<form method="dialog">
					TEST
					<button class="btn-primary">선택</button>
				</form>
			</div>
			<div role="tabpanel" id="dj-tabpanel-3" hidden>
				<form method="dialog">
					TEST
					<button class="btn-primary">선택</button>
				</form>
			</div>
		</dialog>
	`
}