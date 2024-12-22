
        const menuBtn = document.querySelector(".menu-btn");
        const navigation = document.querySelector(".navigation");
        menuBtn.addEventListener("click", () => {
            menuBtn.classList.toggle("active");
            navigation.classList.toggle("active");
        });
        const btns = document.querySelectorAll(".nav-btn");
        const slides = document.querySelectorAll(".video-slide");
        const contents = document.querySelectorAll(".content");
        var sliderNav = function(manual){
            btns.forEach((btn) => {
                btn.classList.remove("active")
            });

            slides.forEach((slide) => {
                slide.classList.remove("active")
            });

            contents.forEach((content) => {
                content.classList.remove("active")
            });
            btns[manual].classList.add("active");
            slides[manual].classList.add("active");
            contents[manual].classList.add("active");

        }
        btns.forEach((btn, i) => {
            btn.addEventListener("click", () => {
              sliderNav(i); 

            });
        });
    
//features swiper
var swiper = new Swiper(".cardSwiper", {
    slidesPerView: 1,
    spaceBetween: 10,
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      breakpoints: {
        640: {
          slidesPerView: 1.5,
          spaceBetween: 10,
        },
        768: {
          slidesPerView:1.7 ,
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: 2.7,
          spaceBetween: 30,
        },
        
      }
});




