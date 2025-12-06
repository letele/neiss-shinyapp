import { renderPage } from "./index.js";
import { 
  checkboxGroup, genderDistribution, table, carousel, summaryDetails
} from "../components/index.js";

export function overviewPage(){
  
  const overview = document.getElementById("overview")

  const innerHTML = `
    <style>
      .total-title{
        text-transform: uppercase;
        font-size: 0.75em;
        color: #333333;
      }
      .total-value{
        font-size: 1.1em;
        font-weight: 600;
        color: var(--color5);
      }
      .overview-filters{
        color: #333333;
      }
      .overview-filters h5{
        margin-bottom: 0.5em;
      }
    </style>
    <div class="flex-col gap-2">
      <div id="gender-counts"></div>
      <div id="population-counts"></div>
      <div id="race-counts"></div>
    </div>
    
    <div>
      <div id="carousel"></div>
      <div id="narratives"></div>
    </div>
   
    <div class="flex-col gap-1 overview-filters">
      
      <div>
        <h5>Sex:</h5>
        <select id="genderInput" class="select-tag">
          <option value="all">All</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      <div>
        <h5>Race:</h5>
        <div id="raceOptions"></div>
      </div>

    </div>
  `
  renderPage("overview", innerHTML)
  

  const races = JSON.parse(overview.dataset.races)
  checkboxGroup('raceOptions',races.map(i => ({id:`overview-${i}`, label:i})))


  Shiny.addCustomMessageHandler('overviewAPI', res => {

    function demCard(containerId, title, totalValue, chartId, femaleValue, maleValue) {
      overview.querySelector(`#${containerId}`).innerHTML = `
        <div>
          <span class="total-title">${title}</span>:
          <span class="total-value">${totalValue}</span>
        </div>
        <div id="${chartId}" style="height:60px;"></div>
      `
      genderDistribution(
        chartId, femaleValue, maleValue, 51, 90, `#${chartId} {font-size:0.8em;}`
      )
    }

    demCard(
      "gender-counts", "Total Visits", res.nvisits, "gender-visits", 
      res.fvisits, res.mvisits
    )
    demCard(
      "population-counts", "Total Population", res.totalPop, "gender-population",
      res.fpop, res.mpop
    )

    let tableID = "race-counts"
    let styles = `
      #${tableID} .tcontent{
        background: #fff;
        border:1px solid #649df1ff;
        border-radius: var(--bradius1); 
        box-shadow: var(--bxshadow1); 
        font-size:12px;
      }
      #${tableID} table{
        border-collapse:collapse;
        width:210px;
      }
      #${tableID} .tsection{
        display: block; 
        min-height: 150px;
      }
      #${tableID} thead{
        background: #649df1ff;
        text-align:left;
      }
      #${tableID} th{
        color: #e6e3e3ff;
        padding-bottom: 0.3em;
        font-weight: 600;
      }
      #${tableID} tbody tr{
        border-bottom:1px solid var(--color6);
      }
      #${tableID} td{
        padding-top: 2px;
        padding-bottom: 2px;
        text-align:right;  
      } 
      #${tableID} td:nth-child(1){
        text-align:left;    
        text-transform: capitalize;
      }
    `
    table(tableID, res.raceCounts,styles)

    const carouselID = 'carousel'
    const bodyPart = summaryDetails(
      carouselID,'body_part',res.bodyPart, "Injured Body Parts","Body Part"
    )
    const diagnosis = summaryDetails(
      carouselID,'diag',res.diagnosis, "Diagnosis Of Patients","Diagnosis"
    )
    const products = summaryDetails(
      carouselID,'products',res.products, "Injuries By Related Product","Products"
    )
    const data = [ 
      {key:"1", value:res.ageDistPlot, title:"Age Distribution"},
      {key:"2", value:res.populationPlot, title:"Population by Age and Sex"},
      {key:"3", value:bodyPart, title:"Body Part Distribution"},
      {key:"4", value:diagnosis, title:"Diagnosis Distribution"},
      {key:"5", value:products, title:"Product Distribution"},
    ]
    
    styles = `
      #${carouselID}{ 
        background: #fff; 
        border: 1px solid #649df1ff; 
        box-shadow: var(--bxshadow1); 
        border-radius: var(--bradius1); 
        overflow:hidden;
      } 
      #${carouselID} .carousel-header{
        display: flex; 
        align-items: center; 
        justify-content: space-between; 
        padding: 3px 10px; 
        background: #649df1ff;
        color: #fff;
        position:relative;
      }
      #${carouselID} .indicators{ 
        display: flex; 
        gap: 10px; 
      } 
      #${carouselID} .indicator{ 
        height: 10px; 
        width: 10px; 
        border-radius: 50%; 
        background: #4e4e4e8c; 
        cursor: pointer; 
      } 
      #${carouselID} .indicator-preview{ 
        display: none; 
        position: absolute; 
        right: 10px; 
        top: 120%; 
        background: #e4e4e4;
        color: #00000077;
        border: 1px solid #00000077; 
        border-radius: 1px; 
      } 
      #${carouselID} .indicator:hover .indicator-preview{ 
        display: flex; 
        justify-content: flex-end; 
      } 
      #${carouselID} .indicator-preview h6{ 
        padding: 5px; 
      } 
      
      #${carouselID} .slide{
        width:600px;
        height:400px;
        display:flex;
        align-items: center;
        justify-content: center;
      
      }
      #${carouselID} .indicator{
        height: 10px; 
        width: 10px; 
        border-radius: 50%; 
        cursor: pointer; 
      } 
    `
    carousel(carouselID,data,styles)

     // Narratives
  document.getElementById("narratives").innerHTML = `
    <style>
      #overview-info{
        overflow-y: auto;
        padding:5px;
      }
      #narratives{
        margin-top: 1em;
        color: #333333;
      }
      #narratives h4{
        margin:0;
      }
      #narratives .flipx{
        display: inline-block;
        transform: scaleX(-1); 
      }
      #narrative {
        width: 600px;
        overflow: hidden;
        background: #fefefe;
        border-top: 2px solid var(--fcolor);
        border-bottom: 2px solid var(--mcolor);
        white-space: nowrap;
        padding:5px 0;
      }
      #narrative-text {
        display: inline-block;
        white-space: nowrap;
        font-weight:500;
        animation: scroll-left 180s linear infinite;
        will-change: transform;
      }
      @keyframes scroll-left {
        0% {
          transform: translateX(0%);
        }
        100% {
          transform: translateX(-50%);
        }
      }
    </style>
    <h4>  BREAKING NEWS 
      <span class="flipx">&#128657;</span>
      <span class="flipx">&#128657;</span>
      <span class="flipx">&#128657;</span>
    </h4>  
    <div id="narrative">
     <div id="narrative-text"></div>
    </div>
  `
  // Narratives ticker
  if (res.narratives.length > 0) {
    const narratives = ` ${res.narratives.join(' 🤕 ')} 🤕`
    const seamlessContent = `${narratives} &nbsp; &nbsp; ${narratives}`
    document.getElementById('narrative-text').innerHTML = seamlessContent
  }

  })
  
}