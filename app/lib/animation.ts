export const infiniteScroller=()=>{
const scrollers = document.querySelectorAll(".scroller");
if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    addAnimation(scrollers);
}

}
const addAnimation = (scrollers:NodeListOf<Element>) => {
scrollers.forEach((scroller)=>{
    scroller.setAttribute("data-animated","true")
    
    const scrollerInner = scroller.querySelector(".scroller__inner")
    const scrollerContent = Array.from(scrollerInner?.children||[]);

    scrollerContent.forEach((item)=>{
        
        const duplicatedItem = item.cloneNode(true)
        duplicatedItem.setAttribute("aria-hidden","true") as Element
        scrollerInner?.appendChild(duplicatedItem)

    })

})
    
}
