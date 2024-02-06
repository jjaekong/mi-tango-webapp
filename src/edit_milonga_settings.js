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
		</div>
	`, document.getElementById('app'))
}