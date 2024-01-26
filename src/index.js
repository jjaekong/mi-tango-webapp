import { html, render } from 'lit-html'
import { cache } from 'lit-html/directives/cache.js'
import { Home } from './home'

const root = document.getElementById('app')

const showPageByHash = () => {
    if (location.hash === '') {
        render(cache(html`${Home()}`), root)
    } else if (location.hash === '#login') {
        render(cache(html`<div><img src=https://picsum.photos/100/100></div><div><a class="font-bold" href=#>login</a></div>`), root)
    } else if (location.hash === '#milonga') {
        render(cache(html`<div><img src=https://picsum.photos/100/100></div><div><a class="font-bold" href=#>milonga</a></div>`), root)
    } else if (location.hash === '#dj') {
        render(cache(html`<div><img src=https://picsum.photos/100/100></div><div><a class="font-bold" href=#>dj</a></div>`), root)
    } else if (location.hash === '#milonga_event') {
        render(cache(html`<div><img src=https://picsum.photos/100/100></div><div><a class="font-bold" href=#>milonga_event</a></div>`), root)
    } else if (location.hash === '#club') {
        render(cache(html`<div><img src=https://picsum.photos/100/100></div><div><a class="font-bold" href=#>club</a></div>`), root)
    } else {
        render(cache(html`<div>404</div>`), root)
    }
}

window.addEventListener('DOMContentLoaded', e => {
    showPageByHash()
})

window.addEventListener("hashchange", e => {
	console.log('hashchange', location)
    showPageByHash()
}, false)