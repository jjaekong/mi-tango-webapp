import { html, render } from "lit-html";

export const header = (props) => {
    document.getElementById('header').textContent = '';
    render(html`
        <div class="min-w-[20%]">
            ${props.left}
        </div>
        <div class="flex-1"><h1 class="font-bold text-center">${
            props.title
        }</h1></div>
        <div class="min-w-[20%] flex justify-end">
            ${props.right}
        </div>
    `, document.getElementById('header'))
}