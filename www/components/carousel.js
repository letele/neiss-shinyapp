export function carousel(containerId,data,styles) { 
  const container = document.getElementById(containerId)

  container.innerHTML = `
    <style>
      ${styles}
    </style>
    <div class="carousel-header">
      <h5 id="carousel-title"></h5>
      <div class="indicators">
        ${data.map((i,j) => `
          <div class="indicator" data-slide="${i.key}">
            <div class="indicator-preview"><h6>${i.title}</h6></div>
          </div>
        `).join("")}
      </div>
    </div>
    
    ${data.map(i => `
      <div class="slide" id="slide-${i.key}">
        ${i.value}
      </div>
    `).join("")}
  `
  // Tab switching function
  function changeSlide(slideKey){
    // Store the selected tab in DOM data attribute
    container.setAttribute('data-active-slide', slideKey)
    
    // Change slide 
    container.querySelectorAll('.slide').forEach(
      div => div.style.display = div.getAttribute("id") === `slide-${slideKey}` ? "flex" : "none"
    )
    
    // Remove active class from all indicators
    container.querySelectorAll('.indicator').forEach(span => 
      span.classList[span.getAttribute("data-slide")===slideKey?"add":"remove"]('active')
    )
    
    // Update title of carousel
    const slideTitle = data.find(item => item.key === slideKey)
    container.querySelector("#carousel-title").textContent = slideTitle && slideTitle.title

    // Update the active indicator background
    container.querySelectorAll(`#${containerId} .indicator`).forEach(ind => 
      ind.style.background = ind.dataset.slide === slideKey ? '#fff' : '#4e4e4e8c'
    )
  }

  // Restore previously active tab from DOM data attribute
  const activeSlide = container.getAttribute('data-active-slide')
  const condition = activeSlide && data.map(i => i.key).includes(activeSlide) 
  changeSlide(condition ? activeSlide : data.map(i => i.key)[0])

  // Add event listener 
  container.querySelectorAll(".indicator").forEach(
    span => span.addEventListener('click', () => changeSlide(span.getAttribute('data-slide')))
  )

}