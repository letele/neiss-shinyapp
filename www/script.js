import {  
  switchPage,
  crossAnalysisPage, ageGroupPage, locationHeatmapPage,overviewPage 
} from "./pages/index.js"

async function preloadPages(pageids) {
  const pages = {
    overview: overviewPage,
    crossAnalysis: crossAnalysisPage,
    ageGroups: ageGroupPage,
    locationHeatmap: locationHeatmapPage
  }

  for (const id of pageids) {
    // Render page content into the hidden page container
    pages[id]()

    // Yield to browser so UI doesn’t freeze
    await new Promise(resolve => setTimeout(resolve, 10))
  }
}


document.addEventListener('DOMContentLoaded', async () => {

  const shinyApp = document.getElementById("shiny-app")
 
  const pageids = JSON.parse(shinyApp.dataset.pageids)
 
  // Header
  document.getElementById("app-header").innerHTML = `
    <div class="brand">NEISS Decision Intelligence |</div>
    <div class="flex align-c gap-1">
      <span class="page-link" data-page=${pageids[0]}>Overview</span>
      <span class="page-link" data-page=${pageids[1]}>Cross Analysis</span>
      <span class="page-link" data-page=${pageids[2]}>Age Groups</span>
      <span class="page-link" data-page=${pageids[3]}>Location Heatmap</span>
    </div>
  `
  shinyApp.querySelectorAll(".page-link").forEach(link => 
    link.addEventListener('click', () => switchPage(link.getAttribute('data-page')))
  )

  await preloadPages(pageids)
  
  switchPage(pageids[0])

  document.getElementById("loading-overlay").style.display = "none"
})


