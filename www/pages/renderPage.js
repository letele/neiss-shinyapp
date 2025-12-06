
function renderPage(id,innerHTML){
  const shinyApp = document.getElementById("shiny-app")
  
  const page = document.getElementById(id)
  
  if (!page.hasChildNodes()) {
    page.innerHTML = innerHTML

    if (window.Shiny.bindAll && window.Shiny.bindAll) {
      // Unbind all inputs 
      Shiny.unbindAll(shinyApp)
      // Rebind all inputs
      Shiny.bindAll(shinyApp)
    }
  }
}

export {renderPage}