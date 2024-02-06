import { html, render } from "lit-html"
import { ArrowLeftIcon } from "./icons";

export const EditMilongaSettings = async () => {
	render(html`
		<div class="milonga edit-milonga-settings p-5">
			<header class="flex items-center mb-5 h-10 w-full">
				<div class="min-w-[20%]"><a href="#" @click=${e => {
                    e.preventDefault();
                    history.back()
                }}>${ArrowLeftIcon()}</a></div>
				<div class="flex-1"><h1 class="font-bold text-center">밀롱가 설정</h1></div>
				<div class="min-w-[20%] flex justify-end"></div>
			</header>
			<!-- 
				프로필
				로고, 밀롱가명, 설명, 오거나이저

				편집권한
			-->
            <form name="edit-milonga-profile" @submit="" class="p-5 bg-white rounded-xl shadow-xl shadow-slate-100">
                <h4 class="font-bold text-lg mb-5 px-2">밀롱가 프로필</h4>
                <div class="mb-3">
                    <div class="block mx-auto w-32 h-32 empty:bg-slate-200 rounded-full overflow-hidden"></div>
                    <div class="flex justify-center mt-4 mx-auto">
                        <button type="button" class="text-sm bg-slate-200 p-3 rounded-lg text-slate-700" @click=${""}>삭제</button>
                        <button type="button" class="text-sm cursor-pointer bg-purple-500 p-3 rounded-lg text-white ms-2" @click=${() => { document.getElementById('file').click() }}>
                            <span>업로드</span>
                        </button>
                        <input type="file" class="hidden" accept="image/png, image/gif, image/jpg, image/jpeg" id="file" @input=${""}>
                    </div>
                    <input type="hidden" name="photo-url" value=${""}>
                </div>
                <div class="mb-3">
                    <label class="block mb-1 px-2 text-sm">밀롱가명</label>
                    <input type="text" name="milonga-name" class="rounded-lg border-slate-200 w-full" placeholder="밀롱가명">
                </div>
                <div class="mb-3">
                    <label class="block mb-1 px-2 text-sm">밀롱가 아이디</label>
                    <input type="text" name="milonga-id" class="rounded-lg border-slate-200 w-full disabled:bg-slate-100 disabled:border-slate-400" placeholder="밀롱가 아이디" disabled>
                </div>
                <div class="mb-3">
                    <label class="block mb-1 px-2 text-sm">오거나이저</label>
                    <input type="text" class="rounded-lg border-slate-200 w-full" name="organizers[]" placeholder="오거나이저">
                    <div class="px-2 flex justify-end mt-2">
                        <button type="button" class="text-sm ms-2 p-2 rounded-lg bg-slate-200 text-purple-500">삭제</button>
                        <button type="button" class="text-sm ms-2 p-2 rounded-lg bg-purple-500 text-white">추가</button>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="block mb-1 px-2 text-sm">설명</label>
                    <textarea class="rounded-lg border-slate-200 w-full" rows="5"></textarea>
                </div>
                <div class="mb-3">
                    <button type="submit" class="block p-3 text-white bg-purple-500 w-full rounded-lg">저장</button>
                </div>
            </form>
		</div>
	`, document.getElementById('app'))
}