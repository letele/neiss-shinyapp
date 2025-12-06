import { 
    crossAnalysisPage, ageGroupPage, locationHeatmapPage,overviewPage
} from "./index.js"

// Page switching function
export function switchPage(key){

  document.querySelectorAll('.page-link').forEach(
    link => link.classList[
      link.getAttribute("data-page")===key?"add":"remove"
    ]('active-page-link')
  )

  document.querySelectorAll('.page').forEach(
    page => page.style.display = page.getAttribute("id") === key ? "flex" : "none"
  )
  
  const pages = {
    crossAnalysis:crossAnalysisPage,
    ageGroups:ageGroupPage,
    locationHeatmap:locationHeatmapPage,
    overview:overviewPage,
  }
  
  pages[key]() 
}
