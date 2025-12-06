// Custom radio buttons
function customRadioButtons(id,labels,name){
  const container = document.getElementById(id)
  container.innerHTML = `
  <style>
    .custom-radio-buttons{
      margin-top: 5px;
      background: #fff;
      min-height: 0;
      border: 1px solid #649df1ff;
      border-radius: var(--bradius1); 
      box-shadow: var(--bxshadow1); 
      display: flex;
      flex-direction: column;
      font-size: 0.87rem;
    }
    .radio-buttons{
      width: 210px;
      overflow-y: auto;
      flex-grow: 1;
      padding-top: 5px;
    }
    .radio-buttons::-webkit-scrollbar{
      width: 5px;
    }
    .radio-buttons::-webkit-scrollbar-thumb {        
      border-radius: 5px 5px 0 0;
      background: #1976d23b; 
    }
    .radio-buttons::-webkit-scrollbar-track {
      background: #ccc;
    }

    .radio-button{
      border-bottom: 1px solid #ccc;
      display: flex;
      align-items: center;
      
    }
    .radio-button:last-child{
      border: none;
    }
    .radio-button label{
      padding: 3px 5px;
      width: 100%;
      font-weight: normal;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: all 0.3s ease;
      gap: 5px;
      margin: 0;
    }
    .radio-button label:hover{
      white-space: normal;
      overflow: visible;
    }

    .radio-button input[type="radio"]{
      margin: 0;
      margin-left: 5px;
    }
    .radio-buttons-footer{
      padding: 3px 10px;
      border-top: 2px solid #5f5f5f;
    }
  </style>
  <div class="radio-buttons" >
    ${labels.map((label, index) => `
      <div class="radio-button">
        <input 
          type="radio" 
          id="${id}-radio-button-${index}" 
          name=${name}
          value="${label}"
          ${index === 0 ? 'checked' : ''}
        >
        <label for="${id}-radio-button-${index}">
          ${label}
        </label>
      </div>
    `).join("")}
  </div>
  <div class="radio-buttons-footer">
    Total Rows: <strong>${labels.length}</strong>
  </div>
  `

  // Add event listener to send selected value back to Shiny
  const radioButtons = container.querySelectorAll(`input[name=${name}]`)
  radioButtons.forEach(radio => 
    radio.addEventListener('change', 
      () => radio.checked && Shiny.setInputValue(name, radio.value)
    )
  )
  // Trigger initial value for the checked radio button
  const checkedRadio = container.querySelector(`input[name=${name}]:checked`)
  checkedRadio && Shiny.setInputValue( name, checkedRadio.value, {priority: 'event'})
}

export {customRadioButtons}