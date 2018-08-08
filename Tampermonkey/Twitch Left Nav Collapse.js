// ==UserScript==
// @name         Twitch Left Nav Collapse
// @version      0.2018.8.8
// @author       tino
// @match        https://www.twitch.tv/*
// @grant        GM_addStyle
// ==/UserScript==
window.onload = () => {
    GM_addStyle ( `
    .tw-theme--dark .left_btn {
        color: #dad8de;
        background: #201c2b;
    }
    .left_btn {
        top: 2rem;
        right: -2rem;
        width: 2rem;
        height: 2rem;
        color: #19171c;
        background: #fff;
        opacity: .25;
    }
    .left_btn:hover {
        opacity: .5;
    }
    ` );

    let tmp = document.createElement('div');
    tmp.innerHTML = `<button class="left_btn tw-absolute tw-flex tw-flex-grow-0 tw-flex-shrink-0 tw-z-above">
            <figure class="tw-svg">
                <svg class="tw-svg__asset tw-svg__asset--glypharrleft tw-svg__asset--inherit" width="20px" height="20px" version="1.1" viewBox="0 0 20 20" x="0px" y="0px">
                    <path d="M12.537 14.946a.714.714 0 0 0 .463-.66V5.714a.715.715 0 0 0-.463-.66.777.777 0 0 0-.817.155l-4.5 4.286A.696.696 0 0 0 7 10a.7.7 0 0 0 .22.505l4.5 4.286a.777.777 0 0 0 .817.155"></path>
                </svg>
            </figure>
        </button>`;
    let left_btn = tmp.firstChild;
    let nav = document.querySelector('.side-nav');

    left_btn.addEventListener('click', () => {
        nav.style.width = nav.style.width == '0px' ? '' : '0px';
        left_btn.style.transform = left_btn.style.transform == 'rotate(180deg)' ? '': 'rotate(180deg)';
    }, false);

    nav.append(left_btn);
}





