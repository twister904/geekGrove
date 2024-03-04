// Grab elements
const selectElement=(selector) =>{
    const element=document.querySelector(selector);
    if(element) return element;
    throw new Error(`somehting might wrong make sure that ${selector} exists or is typed correctly`);
};
//Nav styles on scroll
const scrollHeader=()=>{
    const headerElement=selectElement(`#header`);
    if(this.scrollY>=15){
        headerElement.classList.add(`activated`);
    }
    else{
        headerElement.classList.remove(`activated`);
    }
};
window.addEventListener('scroll',scrollHeader);
// Open menu & search pop-up
const menuToggleIcon=selectElement('#menu-toggle-icon');
const toggleMenu= ()=>{
    const mobileMenu=selectElement('#menu');
    mobileMenu.classList.toggle('activated');
    menuToggleIcon.classList.toggle('activated');
}
menuToggleIcon.addEventListener('click',toggleMenu);
// Open/Close search form popup
const formOpenBtn=selectElement('#search-icon');
const formcloseBtn=selectElement('#form-close-btn');
const searchFormContainer=selectElement('#search-form-container');
formOpenBtn.addEventListener('click',()=>searchFormContainer.classList.add('activated'));
formcloseBtn.addEventListener('click',()=>searchFormContainer.classList.remove('activated'));
// -- Close the search form popup on ESC keypress
window.addEventListener('keyup',event=>{
    if(event.key==='Escape') searchFormContainer.classList.remove('activated');
});
// Switch theme/add to local storage
const bodyelement=document.body;
const themeToggleBtn=selectElement('#theme-toggle-btn');
const currentTheme=localStorage.getItem('currentTheme');
if(currentTheme){
    bodyelement.classList.add('light-theme');
}
themeToggleBtn.addEventListener('click',()=>{
    bodyelement.classList.toggle('light-theme');
    if(bodyelement.classList.contains('light-theme')){
        localStorage.setItem('currentTheme','themeActive');
    }
    else{
        localStorage.removeItem('currentTheme');
    }
});
const swiper=new Swiper('.swiper',{
    slidesPerView:1,
    spaceBetween:20,
    navigation:{
        nextEl:'.swiper-button-next',
        prevEl:'.swiper-button-prev'
    },
    pagination:{
        el:'.swiper-pagination'
    },
    breakpoints:{
        700:{
            slidesPerView:2
        },
        1200:{
            slidesPerView:3
        }
    }
});

// ... (previous code)

// Sample JavaScript to handle tag clicks


