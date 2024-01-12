import { html } from "lit-html";

export const milongaEventItem = () => html`
    <a href="milonga.html" class="flex">
        <div class="">
            <time>
                <span>8</span>
                <span>PM</span>
            </time>
        </div>
        <div>
            <h6>루미노소</h6>
            <div>@오나다</div>
        </div>
        <div>
            <img src="https://picsum.photos/id/10/100/100">
        </div>
    </a>
`