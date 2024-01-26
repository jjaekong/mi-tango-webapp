/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,i$1=t$1.trustedTypes,s$1=i$1?i$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,e$2="$lit$",h$1=`lit$${(Math.random()+"").slice(9)}$`,o="?"+h$1,n=`<${o}>`,r$1=document,l$1=()=>r$1.createComment(""),c=t=>null===t||"object"!=typeof t&&"function"!=typeof t,a=Array.isArray,u$1=t=>a(t)||"function"==typeof t?.[Symbol.iterator],d$1="[ \t\n\f\r]",f=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,v=/-->/g,_=/>/g,m$1=RegExp(`>|${d$1}(?:([^\\s"'>=/]+)(${d$1}*=${d$1}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),p$1=/'/g,g=/"/g,$=/^(?:script|style|textarea|title)$/i,y=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),x=y(1),w=Symbol.for("lit-noChange"),T=Symbol.for("lit-nothing"),A=new WeakMap,E=r$1.createTreeWalker(r$1,129);function C(t,i){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==s$1?s$1.createHTML(i):i}const P=(t,i)=>{const s=t.length-1,o=[];let r,l=2===i?"<svg>":"",c=f;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,y=0;for(;y<s.length&&(c.lastIndex=y,u=c.exec(s),null!==u);)y=c.lastIndex,c===f?"!--"===u[1]?c=v:void 0!==u[1]?c=_:void 0!==u[2]?($.test(u[2])&&(r=RegExp("</"+u[2],"g")),c=m$1):void 0!==u[3]&&(c=m$1):c===m$1?">"===u[0]?(c=r??f,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?m$1:'"'===u[3]?g:p$1):c===g||c===p$1?c=m$1:c===v||c===_?c=f:(c=m$1,r=void 0);const x=c===m$1&&t[i+1].startsWith("/>")?" ":"";l+=c===f?s+n:d>=0?(o.push(a),s.slice(0,d)+e$2+s.slice(d)+h$1+x):s+h$1+(-2===d?i:x);}return [C(t,l+(t[s]||"<?>")+(2===i?"</svg>":"")),o]};class V{constructor({strings:t,_$litType$:s},n){let r;this.parts=[];let c=0,a=0;const u=t.length-1,d=this.parts,[f,v]=P(t,s);if(this.el=V.createElement(f,n),E.currentNode=this.el.content,2===s){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=E.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(e$2)){const i=v[a++],s=r.getAttribute(t).split(h$1),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:c,name:e[2],strings:s,ctor:"."===e[1]?k:"?"===e[1]?H:"@"===e[1]?I:R}),r.removeAttribute(t);}else t.startsWith(h$1)&&(d.push({type:6,index:c}),r.removeAttribute(t));if($.test(r.tagName)){const t=r.textContent.split(h$1),s=t.length-1;if(s>0){r.textContent=i$1?i$1.emptyScript:"";for(let i=0;i<s;i++)r.append(t[i],l$1()),E.nextNode(),d.push({type:2,index:++c});r.append(t[s],l$1());}}}else if(8===r.nodeType)if(r.data===o)d.push({type:2,index:c});else {let t=-1;for(;-1!==(t=r.data.indexOf(h$1,t+1));)d.push({type:7,index:c}),t+=h$1.length-1;}c++;}}static createElement(t,i){const s=r$1.createElement("template");return s.innerHTML=t,s}}function N(t,i,s=t,e){if(i===w)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=c(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(!1),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=N(t,h._$AS(t,i.values),h,e)),i}class S{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??r$1).importNode(i,!0);E.currentNode=e;let h=E.nextNode(),o=0,n=0,l=s[0];for(;void 0!==l;){if(o===l.index){let i;2===l.type?i=new M(h,h.nextSibling,this,t):1===l.type?i=new l.ctor(h,l.name,l.strings,this,t):6===l.type&&(i=new L(h,this,t)),this._$AV.push(i),l=s[++n];}o!==l?.index&&(h=E.nextNode(),o++);}return E.currentNode=r$1,e}p(t){let i=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class M{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=T,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??!0;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=N(this,t,i),c(t)?t===T||null==t||""===t?(this._$AH!==T&&this._$AR(),this._$AH=T):t!==this._$AH&&t!==w&&this._(t):void 0!==t._$litType$?this.g(t):void 0!==t.nodeType?this.$(t):u$1(t)?this.T(t):this._(t);}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t));}_(t){this._$AH!==T&&c(this._$AH)?this._$AA.nextSibling.data=t:this.$(r$1.createTextNode(t)),this._$AH=t;}g(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=V.createElement(C(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new S(e,this),s=t.u(this.options);t.p(i),this.$(s),this._$AH=t;}}_$AC(t){let i=A.get(t.strings);return void 0===i&&A.set(t.strings,i=new V(t)),i}T(t){a(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new M(this.k(l$1()),this.k(l$1()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){for(this._$AP?.(!1,!0,i);t&&t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class R{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=T,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=T;}_$AI(t,i=this,s,e){const h=this.strings;let o=!1;if(void 0===h)t=N(this,t,i,0),o=!c(t)||t!==this._$AH&&t!==w,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=N(this,e[s+n],i,n),r===w&&(r=this._$AH[n]),o||=!c(r)||r!==this._$AH[n],r===T?t=T:t!==T&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.O(t);}O(t){t===T?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class k extends R{constructor(){super(...arguments),this.type=3;}O(t){this.element[this.name]=t===T?void 0:t;}}class H extends R{constructor(){super(...arguments),this.type=4;}O(t){this.element.toggleAttribute(this.name,!!t&&t!==T);}}class I extends R{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=N(this,t,i,0)??T)===w)return;const s=this._$AH,e=t===T&&s!==T||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==T&&(s===T||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class L{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){N(this,t);}}const z={j:e$2,P:h$1,A:o,C:1,M:P,L:S,R:u$1,V:N,D:M,I:R,H,N:I,U:k,B:L},Z=t$1.litHtmlPolyfillSupport;Z?.(V,M),(t$1.litHtmlVersions??=[]).push("3.1.1");const j$1=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new M(i.insertBefore(l$1(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e$1=t=>(...e)=>({_$litDirective$:t,values:e});class i{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i;}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}

/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const {D:t}=z,e=(o,t)=>void 0===t?void 0!==o?._$litType$:o?._$litType$===t,l=o=>null!=o?._$litType$?.h,s=()=>document.createComment(""),r=(o,i,n)=>{const e=o._$AA.parentNode,l=void 0===i?o._$AB:i._$AA;if(void 0===n){const i=e.insertBefore(s(),l),c=e.insertBefore(s(),l);n=new t(i,c,o,o.options);}else {const t=n._$AB.nextSibling,i=n._$AM,c=i!==o;if(c){let t;n._$AQ?.(o),n._$AM=o,void 0!==n._$AP&&(t=o._$AU)!==i._$AU&&n._$AP(t);}if(t!==l||c){let o=n._$AA;for(;o!==t;){const t=o.nextSibling;e.insertBefore(o,l),o=t;}}}return n},u={},m=(o,t=u)=>o._$AH=t,p=o=>o._$AH,j=o=>{o._$AR();};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const d=t=>l(t)?t._$litType$.h:t.strings,h=e$1(class extends i{constructor(t){super(t),this.tt=new WeakMap;}render(t){return [t]}update(s,[e$1]){const u=e(this.et)?d(this.et):null,h=e(e$1)?d(e$1):null;if(null!==u&&(null===h||u!==h)){const e=p(s).pop();let o=this.tt.get(u);if(void 0===o){const s=document.createDocumentFragment();o=j$1(T,s),o.setConnected(!1),this.tt.set(u,o);}m(o,[e]),r(o,void 0,e);}if(null!==h){if(null===u||u!==h){const t=this.tt.get(h);if(void 0!==t){const i=p(t).pop();j(s),r(s,void 0,i),m(s,[i]);}}this.et=e$1;}else this.et=void 0;return this.render(e$1)}});

const Club = () => {
	j$1(h(x`
		Club
	`), document.getElementById('app'));
};

const DJ = () => {
	j$1(h(x`
		DJ
	`), document.getElementById('app'));
};

const Home = () => {
	j$1(h(x`
		<div class="p-5">
			<header class="h-10 px-5 flex items-center mb-5">
				<h1 class="font-bold">Mi Vada</h1>
				<div id="user-profile" class="ms-auto empty:size-8 empty:bg-slate-300 empty:rounded-full"></div>
			</header>
			<section id="today-milongas" class="mb-4 rounded-[1rem] bg-white shadow-lg shadow-slate-100 p-5">
				<header class="mb-4 flex flex-wrap justify-between items-end">
					<h2 class="text-2xl font-bold">오늘의 밀롱가</h2>
					<time class="font-bold text-slate-500" id="today-date"></time>
				</header>
				<ul>
					<li class="mt-3">
						<div class="flex w-100 items-center">
							<div class="self-start">
								<div class="size-14 rounded-xl bg-slate-100"></div>
							</div>
							<div class="mx-3 flex-1">
								<h6 class="h-4 w-full bg-slate-100"></h6>
								<div class="h-4 w-[50%] mt-1 bg-slate-100"></div>
							</div>
							<div class="ms-auto self-start">
								<div class="size-14 rounded-xl bg-slate-100"></div>
							</div>
						</div>
					</li>
					<li class="mt-3">
						<div class="flex w-100 items-center">
							<div class="self-start">
								<div class="size-14 rounded-xl bg-slate-100"></div>
							</div>
							<div class="mx-3 flex-1">
								<h6 class="h-4 w-full bg-slate-100"></h6>
								<div class="h-4 w-[50%] mt-1 bg-slate-100"></div>
							</div>
							<div class="ms-auto self-start">
								<div class="size-14 rounded-xl bg-slate-100"></div>
							</div>
						</div>
					</li>
					<li class="mt-3">
						<div class="flex w-100 items-center">
							<div class="self-start">
								<div class="size-14 rounded-xl bg-slate-100"></div>
							</div>
							<div class="mx-3 flex-1">
								<h6 class="h-4 w-full bg-slate-100"></h6>
								<div class="h-4 w-[50%] mt-1 bg-slate-100"></div>
							</div>
							<div class="ms-auto self-start">
								<div class="size-14 rounded-xl bg-slate-100"></div>
							</div>
						</div>
					</li>
				</ul>
				<a href="#" class="block border-t py-4 text-slate-500 text-center mt-4 -mb-5">더 많은 밀롱가 이벤트 보기</a>
			</section>
			<section id="djs" class="mb-4 rounded-[1rem] bg-white shadow-lg shadow-slate-100 p-5">
				<header class="mb-4">
					<h2 class="text-xl font-bold">DJs</h2>
					<small class="text-slate-400">DJ의 일정을 확인하세요.</small>
				</header>
				<ul>
					<li class="mt-3">
						<div class="flex w-full items-center">
							<div class="self-start">
								<div class="size-14 rounded-full bg-slate-100"></div>
							</div>
							<div class="mx-3 flex-1">
								<h6 class="h-4 w-full bg-slate-100"></h6>
							</div>
						</div>
					</li>
					<li class="mt-3">
						<div class="flex w-full items-center">
							<div class="self-start">
								<div class="size-14 rounded-full bg-slate-100"></div>
							</div>
							<div class="mx-3 flex-1">
								<h6 class="h-4 w-full bg-slate-100"></h6>
							</div>
						</div>
					</li>
					<li class="mt-3">
						<div class="flex w-full items-center">
							<div class="self-start">
								<div class="size-14 rounded-full bg-slate-100"></div>
							</div>
							<div class="mx-3 flex-1">
								<h6 class="h-4 w-full bg-slate-100"></h6>
							</div>
						</div>
					</li>
				</ul>
				<a href="#" class="block border-t py-4 text-slate-500 text-center mt-4 -mb-5">더 많은 DJ 보기</a>
			</section>
			<section id="places" class="mb-4 rounded-[1rem] bg-white shadow-lg shadow-slate-100 p-5">
				<header class="mb-4">
					<h2 class="text-xl font-bold">Places</h2>
					<small class="text-slate-400">장소의 이벤트 일정을 확인하세요.</small>
				</header>
				<ul>
					<li class="mt-3">
						<div class="flex w-full items-center">
							<div class="self-start">
								<div class="size-14 rounded-lg bg-slate-100"></div>
							</div>
							<div class="mx-3 flex-1">
								<h6 class="h-4 w-full bg-slate-100"></h6>
							</div>
						</div>
					</li>
				</ul>
				<a href="#" class="block border-t py-4 text-slate-500 text-center mt-4 -mb-5">더 많은 장소 보기</a>
			</section>
			<!-- <section id="poll" class="mb-4 rounded-[1rem] bg-white shadow-lg shadow-slate-100 p-5">
				<header class="mb-4">
					<h2 class="text-xl font-bold">Poll</h2>
				</header>
				<div id="poll-question">
					<div>당신은 아브라소 파? 피구라 파?</div>
				</div>
				<ul id="poll-answers">
					<li class="mt-3">
						<label class="border p-3 flex items-center rounded-lg">
							<input type="radio" name="poll-answer">
							<span class="ms-2">아브라소 파</span>
						</label>
					</li>
					<li class="mt-3">
						<label class="border p-3 flex items-center rounded-lg">
							<input type="radio" name="poll-answer">
							<span class="ms-2">피구라 파</span>
						</label>
					</li>
				</ul>
				<a href="#" class="block border-t py-4 text-slate-500 text-center mt-4 -mb-5">더 많은 Poll 보기</a>
			</section> -->
		</div>
	`), document.getElementById('app'));
};

const Login = () => {
	j$1(h(x`
		LOGIN
	`), document.getElementById('app'));
};

const Me = () => {
	j$1(h(x`
		ME
	`), document.getElementById('app'));
};

const Milonga = () => {
	j$1(h(x`
		milonga
	`), document.getElementById('app'));
};

const MilongaEvent = () => {
	j$1(h(x`
		MilongaEvent
	`), document.getElementById('app'));
};

const NotFound = () => {
	j$1(h(x`
		not found
	`), document.getElementById('app'));
};

const showPageByHash = () => {
	console.log('showPageByHash');
    if (location.hash === '') {
        Home();
    } else if (location.hash === '#login') {
		Login();
	} else if (location.hash === '#me') {
		Me();
    } else if (location.hash === '#milonga') {
        Milonga();
    } else if (location.hash === '#dj') {
		DJ();
    } else if (location.hash === '#milonga_event') {
		MilongaEvent();
    } else if (location.hash === '#club') {
        Club();
    } else {
		NotFound();
    }
};

window.addEventListener('DOMContentLoaded', e => {
    showPageByHash();
});

window.addEventListener("hashchange", e => {
	console.log('hashchange', location);
    showPageByHash();
}, false);
