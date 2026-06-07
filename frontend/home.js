let currentSlide = 0;

function showSlide(index) {
  const carousel = document.querySelector('.carousel');
  const slides = document.querySelectorAll('.carousel-slide');
  const totalSlides = slides.length;

  currentSlide = (index + totalSlides) % totalSlides;

  carousel.style.transition = 'transform 0.5s ease-in-out';
  carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
}

function moveSlide(direction) {
  showSlide(currentSlide + direction);
}

let autoSlide = setInterval(() => {
  moveSlide(1);
}, 2000);

const carouselContainer = document.querySelector('.carousel-container');
carouselContainer.addEventListener('mouseenter', () => {
  clearInterval(autoSlide);
});
carouselContainer.addEventListener('mouseleave', () => {
  autoSlide = setInterval(() => {
    moveSlide(1);
  }, 2000);
});



document.addEventListener('click', function (e) {
    if (e.target.tagName === 'BUTTON' && e.target.textContent.includes('INFO')) { 
      const card = e.target.closest('.slider-card');
      const info = card.querySelector('.hidden-info');
  
      const isExpanded = card.classList.contains('expanded'); 
  
      card.classList.toggle('expanded');

      if (isExpanded) {
        e.target.textContent = 'MORE INFO';
      } else {
        e.target.textContent = 'LESS INFO';
      }
      
    }
});
