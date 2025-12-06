import { renderPage } from "./index.js";
import { customRadioButtons, genderDistribution } from "../components/index.js"

function locationHeatmapPage() {
  const shinyApp = document.getElementById("shiny-app")
  const bodyParts = JSON.parse(shinyApp.dataset.bodyparts) 

  const innerHTML = `
    <style>
      #location-selectTag{
        position: absolute;
      }
      #location-selectTag{
        padding-right: 0;
        padding-left: 0;
        border-radius: 0.2rem;
      }
      #location-selectTag option{
        padding: 0.25rem  0.75rem 0.25rem 0.25rem;
      }
    </style>
    <div class="flex-col">
      <div>
        <h5 style="margin-bottom:5px;"> Body Part: </h5>
        <select id="location-selectTag"  class="select-tag"
          onfocus='this.size=10' 
          onblur='this.size=1' 
          onchange='this.size=1; this.blur()'
        >
          ${bodyParts.map(i => `<option value="${i}">${i}</option>`).join('')}
        </select>
      </div>
      <div class="fgrow-1 flex-col" style="margin-top:30px; overflow:hidden;">
        <h5> Products: </h5>
        <div id="loc-radioButtons" class="custom-radio-buttons fgrow-1"></div>
      </div>
    </div>
    <div class="flex-col gap-1">
      <div id="locheat-summary" class="flex gap-1"></div>
      <div class="flex gap-1">
        <div id="loc-heatmap"></div>
        <div id="loc-narratives"></div>
      </div>
    </div>
  `
  renderPage("locationHeatmap", innerHTML)
  
  Shiny.addCustomMessageHandler('locSelect', res => {
    const id = "loc-radioButtons"
    const stringToArray = val => typeof(val) === "string" ? [val] : val
    const labels = stringToArray(res.labels) 
  
    customRadioButtons(id, labels, res.inputName)
  })

  Shiny.addCustomMessageHandler("locRadioBUtton", res => {
    const locSummary = document.getElementById("locheat-summary")

    locSummary.innerHTML = `
      <style>
        #locheat-value{
          text-align:center;
          font-weight:600;
          font-size: 1.5em;
          color: #457bdfff;
        }
        #locheat-text{
          font-size: 0.8em;
          font-weight:500;
          text-transform: uppercase;
          color: #5f5f5f;
        }
        #locheat-race-table table{
          height:fit-content;
          border-collapse:collapse;
        }
        #locheat-race-table th{
          padding: 1px 5px;
          font-weight:500;
          text-transform: capitalize;
        }
        #locheat-race-table th,
        #locheat-race-table td{
          text-align:center;
          font-size: 0.8em;
        }
        #locheat-race-table th:nth-child(1),
        #locheat-race-table td:nth-child(1){
          border:none;
          padding-right:5px;
          text-align: right;
          font-weight:500;
          color: #5f5f5f;
        }
      </style>
      <div id="locheat-count">
        <div id="locheat-value">${res.count}</div>
        <div id="locheat-text">Total Injuries</div>
      </div>
      <div id="locheat-gender"></div>
      <table id="locheat-race-table">
        <thead>
          <tr>${["Race:",...res.raceCounts.race].map(i => `<th>${i}</th>`).join("")}</tr>
        </thead>
        <tbody>
          <tr>${["Count:",...res.raceCounts.n].map(i => `<td>${i}</td>`).join("")}</tr>
          <tr>${["Percent:",...res.raceCounts.n].map(
            i => `<td>${typeof(i)==="number" ?`${Math.round(i/res.count*100,3)}%`:i}</td>`
          ).join("")}</tr>
        </tbody>
      </table>
    `
    
    const [genderId, labelWidth,barWidth] = ["locheat-gender",51,90]
    const genderStyles = `#${genderId} {font-size:0.8em;}`
    genderDistribution(genderId,res.femalePerc,res.malePerc,labelWidth,barWidth,genderStyles)
 
    const containerStyles = `
      .locheat-container{
        background: #fff; 
        border: 1px solid var(--color1); 
        box-shadow: var(--bxshadow1); 
        border-radius: var(--bradius1); 
        color: #5f5f5f;
      }
      .locheat-container h5{
        margin:0;  
        padding: 3px 10px;   
        background: var(--color1); 
        text-transform: capitalize;
        color: #e6e3e3ff;
      }
      
    `

    document.getElementById("loc-heatmap").innerHTML = `
      <style>
        ${containerStyles}
      </style>
      <div class="locheat-container">
        <h5>Heatmap: ${res.product}</h5>
        <div>${res.locationHeatmap}</div>
      </div>
    `
    const narratives = typeof(res.narratives) === "string" ? [res.narratives] : res.narratives 
    
    document.getElementById("loc-narratives").innerHTML = `
      <style>
        ${containerStyles}
        .locheat-content{
          padding:3px 10px;     
          height: 390px;
          width:300px;
          overflow-y:auto;
          overflow-x:hidden;
          font-size:0.84em;
        }
        .locheat-content div{
          margin-bottom: 10px;
          color: #000;
        }
      </style>
      <div class="locheat-container">
        <h5>Narratives</h5>
        <div class="locheat-content scroll-1">
          ${narratives.map(i => `<div>${i}</div>`).join("")}
        </div>
      </div>
    `
  })
}

export {locationHeatmapPage}