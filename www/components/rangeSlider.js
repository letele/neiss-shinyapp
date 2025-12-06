
export function rangeSlider(id, width, endpoints, thumbSize){
  const container = document.getElementById(id)
  
  // Add data attribute for Shiny binding recognition
  container.setAttribute('data-shiny-input-type', 'rangeSlider');
  
  const [min, max] = endpoints
  container.innerHTML = `
    <style>
      .range-wrapper {
        --dim: ${thumbSize}px;
        --fill-bg: #0078d7;
        --track-height: 4px;
        padding: 20px 5px;
        padding-bottom: 12px;
        width: fit-content;
        font-size: 11px;
      }
      .range-slider {
        position: relative;
        height: ${thumbSize}px;
        width: ${width}px;
        display: flex; 
        align-items: center;
      }
      .range-input {
        position: absolute;
        width: 100%;
        pointer-events: none;
        appearance: none;
        background: none;
        margin: 0;
        pointer-events: none;
      } 
      .range-input::-webkit-slider-thumb {
        appearance: none;
      }
      .range-input:focus {
        outline: none;
      }
      .range-input::-webkit-slider-thumb {
        width: var(--dim); 
        height: var(--dim);
        border-radius: 50%;
        background: #dedede;
        border: 1px solid #ababab;
        cursor: pointer;
        pointer-events: all;
      }
      .range-input::-moz-range-thumb {
        width: var(--dim); 
        height: var(--dim);
        border-radius: 50%;
        background: #dedede;
        border: 1px solid #ababab;
        cursor: pointer;
        pointer-events: all;
      }
      .range-input::-webkit-slider-runnable-track {
        height: var(--track-height);
      }
      .range-input::-moz-range-track {
        height: var(--track-height);
      }
      .range-input::-webkit-slider-thumb {
        margin-top: calc((var(--track-height) - var(--dim)) / 2);
      }
      .range-track{
        height: var(--track-height);
        width:100%;
        background: #d3d3d3;
        border: 1px solid #c9c9c9ff;
        border-radius: calc(var(--track-height) / 2);
      }
      .range-fill{
        position: absolute;
        background: var(--fill-bg);
        border: 1px solid var(--fill-bg);
        height: var(--track-height);
        pointer-events: none;
      }
      .range-value{
        position: absolute;
        bottom: calc(100% + ${thumbSize/2}px);
        white-space: nowrap;
        background:var(--fill-bg);
        border-radius:3px;
        padding: 1px 3px;
        line-height: 1.333;
        color: #fff;
      }
     
      .range-scale{
        position: absolute;
        left: ${thumbSize/2}px;
        width: calc(100% - ${thumbSize}px);
        height: calc(${thumbSize/2 + 2}px - var(--track-height));
        bottom:0;
        z-index:-1;
      }
    </style>
    <div class="range-wrapper">
        <div class="range-slider">
        <div class="range-track"></div>
        <div class="range-fill"></div>
        <input type="range" min=${min} max=${max} value=${min} class="range-input" id="rangeMin">
        <input type="range" min=${min} max=${max} value=${max} class="range-input" id="rangeMax">
        <div class="range-scale"></div>
        </div>
   </div>
  `

  const rangeMin = document.getElementById('rangeMin')
  const rangeMax = document.getElementById('rangeMax')
  const rangeFill = document.querySelector('.range-slider .range-fill')

  const trackWidth = width - thumbSize

  function updateRange(e) {
    let [rmin, rmax] = [rangeMin.value, rangeMax.value].map(i => parseInt(i))
    // Ensure min doesn't exceed max
    rmin > rmax && (
      e && e.target === rangeMin ? rangeMax.value = rmin : rangeMin.value = rmax
    )
    // Calculate positions based on the available track width
    const [minPos, maxPos] = [rmin, rmax].map(
      val => (val * trackWidth / max) + (0.5 * thumbSize)
    )
    // Update width of range fill
    rangeFill.style.left = `${minPos}px`
    rangeFill.style.width = `${maxPos - minPos}px` 

    // Add min and max values to slider
    const distance = rangeMax.value - rangeMin.value
   
    if(distance > 5){
      rangeFill.innerHTML = `
        <style>
          #min-value{
            transform: translateX(-50%);
            left: 0;
          }
          #max-value{
            transform: translateX(50%);
            right: 0;
          }
        </style>
        <span class="range-value" id="min-value">${rangeMin.value}</span>
        <span class="range-value" id="max-value">${rangeMax.value}</span>
      `
    }
    if(distance < 5 && distance > 0){
       rangeFill.innerHTML = `
         <style>
          .range-value.concat{
           transform: translateX(-50%);
          }
        </style>
        <span class="range-value concat"> ${rangeMin.value} - ${rangeMax.value} </span>
      `
    }
    if(distance === 0){
      rangeFill.innerHTML = `
        <style>
          .range-value.single{
           transform: translateX(-50%);
          }
        </style>
        <span class="range-value single">${rangeMax.value}</span>
      `
    }
  }

  // Click to move closest thumb
  function moveClosestThumb(e){
    if(!(e.target.classList.contains('range-input'))){
  
      const clickX = e.clientX - e.currentTarget.getBoundingClientRect().left
  
      const relativeX = clickX - (thumbSize / 2)
      const clickedValue = Math.max(0, Math.min(max, (relativeX / trackWidth) * max))

      // Get current thumb positions
      const [minValue, maxValue] = [rangeMin.value, rangeMax.value].map(i => parseInt(i))
      
      // Determine which thumb is closer to the clicked position
      Math.abs(clickedValue - minValue) < Math.abs(clickedValue - maxValue) ? 
      rangeMin.value = Math.round(clickedValue) : rangeMax.value = Math.round(clickedValue)
    
      // Update the visual representation
      updateRange()
    }
  }

  function createScales(){
    const rangeScales = document.querySelector('.range-scale')
    const majorTicks = new Array(Math.ceil(max/10)).fill(0).map((_, j) => j * 10)
    
    const minorTicks = majorTicks.flatMap(start => 
      new Array(4).fill(0).map((_, j) => start + ((j + 1) * 2))
    ).filter(tick => tick <= max) 
    
    rangeScales.innerHTML = `
      <style>
        .scale-tick{
          position: absolute;
          left: 0%;
          height: 100%;
          border-left: 1px solid #000;
        }
        .scale-tick.small{
          height: 50%;
          border-left: 1px solid #00000083;
        }
        .scale-label{
          position: absolute;
          top:100%;
          transform: translateX(-50%);
        }
      </style>
      ${majorTicks.map(
        i => `<div class="scale-tick big" style="left: ${(i / max) * 100}%">
                <div class="scale-label">${i}</div>
              </div>`
      ).join("")}
      ${minorTicks.map(
        i => `<div class="scale-tick small" style="left: ${(i / max) * 100}%"></div>`
      ).join("")}
    `
  }

  // Add listeners to inputs
  container.querySelectorAll('.range-input').forEach(input => {
    input.addEventListener('input', updateRange)

    input.addEventListener('mousedown', () => {
      input.style.zIndex = '10'
      // Reset other input's z-index
      const otherInput = input === rangeMin ? rangeMax : rangeMin
      otherInput.style.zIndex = '1'
    })

  })

  container.querySelector('.range-slider').addEventListener('click', moveClosestThumb)

  // Initialize range
  updateRange()
  createScales()

  const rangeSliderBinding = new Shiny.InputBinding()

Object.assign(rangeSliderBinding, {
  find: function(scope) {
    return scope.querySelectorAll("[data-shiny-input-type='rangeSlider']")
  },

  getId: function(el) {
    return el.id
  },

  getValue: function(el) {
    const minInput = el.querySelector("#rangeMin")
    const maxInput = el.querySelector("#rangeMax")
    if (!minInput || !maxInput) return [0, 100]
    return [parseInt(minInput.value), parseInt(maxInput.value)]
  },

  setValue: function(el, value) {
    if (!Array.isArray(value) || value.length !== 2) return
    const minInput = el.querySelector("#rangeMin")
    const maxInput = el.querySelector("#rangeMax")
    if (minInput && maxInput) {
      minInput.value = value[0]
      maxInput.value = value[1]
      minInput.dispatchEvent(new Event("input", { bubbles: true }))
    }
  },

  subscribe: function(el, callback) {
    el._rangeHandlers = []
    const handler = () => callback()
    const clickHandler = () => setTimeout(callback, 10)

    const minInput = el.querySelector("#rangeMin")
    const maxInput = el.querySelector("#rangeMax")
    const track = el.querySelector(".range-slider")

    if (minInput) {
      minInput.addEventListener("change", handler)
      el._rangeHandlers.push({ node: minInput, fn: handler })
    }
    if (maxInput) {
      maxInput.addEventListener("change", handler)
      el._rangeHandlers.push({ node: maxInput, fn: handler })
    }
    if (track) {
      track.addEventListener("click", clickHandler)
      el._rangeHandlers.push({ node: track, fn: clickHandler })
    }
  },

  unsubscribe: function(el) {
    if (el._rangeHandlers) {
      el._rangeHandlers.forEach(({ node, fn }) => {
        node.removeEventListener("change", fn)
        node.removeEventListener("click", fn)
      })
      delete el._rangeHandlers
    }
  },

  receiveMessage: function(el, data) {
    if (data.hasOwnProperty("value")) {
      this.setValue(el, data.value)
    }
  },

  getState: function(el) {
    return { value: this.getValue(el) }
  }
})

Shiny.inputBindings.register(rangeSliderBinding, "rangeSlider")

  // Return container reference for potential external access
  // return container
}


