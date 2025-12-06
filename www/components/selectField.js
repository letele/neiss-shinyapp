function selectField(id){
  const shinyApp = document.getElementById("shiny-app")
  const fields = JSON.parse(shinyApp.dataset.fields)
  return `
    <select id=${id} class="select-tag">
      ${Object.entries(fields).map(
        ([value, option]) => `<option value="${value}">${option}</option>`
      ).join('')}
    </select>
  `
}

export {selectField}