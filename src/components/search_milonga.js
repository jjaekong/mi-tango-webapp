import { html  } from "lit-html"
import { xCircleOutlineIcon } from "../icons"

export const SearchMilonga = () => {
	function searchMilonga() {
		
	}
    function closeModal() {
        document.getElementById('search-milonga')?.close()
    }
    return html`
        <dialog id="search-milonga" class="p-5 rounded-xl shadow-xl shadow-gray-100">
            <div class="relative">
                <!-- <button type="button" class="absolute top-0 right-0" @click=${closeModal}>${xCircleOutlineIcon()}</button> -->
                <h6 class="font-bold mb-4">밀롱가 검색</h6>
                <form name="search-milonga" class="flex items-center" @submit=${searchMilonga}>
                    <label>
                        <input type="text" class="rounded-lg">
                    </label>
                    <button type="button" class="px-3 py-2 bg-gray-200 border border-gray-300 text-indigo-500 rounded-lg">검색</button>
                </form>
                <form name="select-milonga" method="dialog" class="block">
                    <button class="block p-3 w-full rouned-lg bg-indigo-500 text-white">선택</button>
                </form>
            </div>
		</dialog>
    `
}