import './firebase_init.js'
import  { Home } from './home.js'
import  { Login } from './login.js'
import  { Me } from './me.js'

window.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('home')) {
        Home()
    } else if (document.body.classList.contains('login')) {
        Login()
    } else if (document.body.classList.contains('me')) {
        Me()
    }
})