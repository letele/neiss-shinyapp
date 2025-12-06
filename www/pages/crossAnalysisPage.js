import { renderPage } from "./index.js";
import { selectField, customRadioButtons,table } from "../components/index.js";

export function crossAnalysisPage() {
  
  const innerHTML = `
    <div class="flex-col">
      <div>
        ${selectField("cross-selectTag")}
      </div>
      <div id="cross-radiobtns" class="custom-radio-buttons"></div>
    </div>
    <div id="cross-details" class="flex-col gap-05"></div>
    <div id="cross-estimates"></div>
  `
  renderPage("crossAnalysis", innerHTML)

  Shiny.addCustomMessageHandler('crossSelect', res => {
    const id = "cross-radiobtns"
    const stringToArray = val => typeof(val) === "string" ? [val] : val
    
    const labels = stringToArray(res.labels) 
    customRadioButtons(id, labels, res.inputName)
  
    })

    Shiny.addCustomMessageHandler('crossRadioButtons', res => {
      const crossTabs = document.getElementById("cross-details")

      const {summary} =res
      
      const variables = { 
        body_part:{name:"Body Part",width:20}, 
        diag:{name:"Diagnosis",width:30}, 
        products:{name:"Product",width:37}
      }
      
      // Create tab content panels
      const summaryDetails = (key) => {
        
        const {summary:summaryObj} = summary[key]
        
        const { tperc, fperc, mperc, total_n,total_weight } = summaryObj
        const color = c => c > 10 ? "#0063c0" : c > 5 ? "#333333" : "#808080"

        return `
        <div class="sbody scroll-1">${summaryObj[key].map((i, j) => `
            <div class="sr" style="margin-bottom:0.5em;">
            <div style="width:${variables[key].width}.35%; text-align:right; color: ${color(tperc[j])};">${i}</div>
            <div style="width:12%; text-align:center; color: ${color(tperc[j])};">${total_weight[j]}</div>
            <div style="width:10%; text-align:center; color: ${color(tperc[j])};">${total_n[j]}</div>
            <div style="width:10%; text-align:center; color: ${color(tperc[j])};">${tperc[j]}</div>
            <div style=" width: calc(23.7% * ${tperc[j] / Math.max(...tperc)});"> 
              <div style="background:#f8766d; width: ${fperc[j]}%;"> 
                <div style="margin-left:102%; font-size:0.84em;">${Math.round(fperc[j])}% </div> 
              </div>
              <div style="background:#00bfc4; width: ${mperc[j]}%; ">
                <div style="margin-left:102%;font-size:0.84em;">${Math.round(mperc[j])}%</div>   
              </div>
            </div>
            </div>
        `).join("")}</div>
        `
      }

    crossTabs.innerHTML = `
      <style>
        .varName{
          color:var(--color5);
          font-size:1.2em;
          font-weight: 500;
          margin-right:0.5em;
        }
        .varValue{
          color:var(--color5);
          font-size:1.5em;
          font-weight: 600;
          margin-right:0.5em;
        }
        .tab-btn{
          padding: 0.5rem 0.5rem; 
          background:none;
          border:none;
          color: #6c757d;   
          font-size:0.95rem;
          font-weight:100;
        }
        .tab-btn.active{
          color: #0d6efd;   
        }
        .tab-content{
          background: #fff;
          flex-grow:1;
          width: 510px;
          border: 1px solid #649df1ff;
          box-shadow: var(--bxshadow1); 
          border-radius: var(--bradius1);        
          display:flex;
          flex-direction:column;
          min-height:0;
        }
        .summary-title{
          font-size: 1.2em;
          font-weight: 500;
          color: #5f5f5f;
          margin:0.3em;
        }
        .summary-details{
          color: #5f5f5f;
          flex-grow:1;
          border-top: 2px solid #b4b4b4;
          border-bottom: 2px solid #b4b4b4;
          display: flex;
          flex-direction:column;
          overflow:hidden;
        }
        .shead, .sr{
          display:flex;
        }
        .shead{
          width:100%;
          font-size:0.9em;
          margin-top:0.5em;
          flex-shrink: 0;
        }
        .sbody{
          overflow-y:auto; 
          flex-grow:1;
          min-height: 0;
          padding-top:0.5em;
          font-size: 0.85rem;
        }
      </style>
      <div>
        <div style="font-size:0.9rem;">
          ${variables[res.variable].name}: <span class="varName">${res.variableName}</span>
        </div>

        <div style="font-size:0.9rem;">
          Estimated Cases: <span class="varValue">${res.estimate}</span>
        </div>
      </div>
      
      <div class="flex-col fgrow-1" style="min-height: 0;">
        <div>
          ${Object.entries(summary).map(([key, value]) => `
            <button class="tab-btn" data-tab="${key}">
              ${value.name}
            </button>
          `).join("")}
        </div>
        ${Object.entries(summary).map(([key, value]) => `
        <div class="tab-content" id="tab-${key}" >
          <div class="summary-title">${value.title}</div>
          <div class="summary-details ">
            <div class="shead" style="color: #5f5f5f;">
              <div style="width: ${variables[key].width}%; text-align:right;">${value.name}</div>
              <div style="width: 11%; text-align:center;">Weight</div>
              <div style="width: 10%; text-align:center;">Total</div>
              <div style="width: 10%; text-align:center;">Total %</div>
              <div style="width: 25%;">
                <span style="font-weight:500;color:var(--fcolor);">Female %</span> | 
                <span style="font-weight:500;color:var(--mcolor);">Male %</span>
              </div>
            </div>
            ${summaryDetails(key)}
          </div>  
          <div style="margin:0.3em;">
              Total Observations: <strong>${value.summary[key].length}</strong>
          </div>  
        </div>
        `).join("")}
      </div>
    `

    // Store current active tab in DOM data attribute before recreating content
    // const activeButton = crossTabs.querySelector('.tab-btn.active')
    // activeButton && crossTabs.setAttribute(
    //     'data-active-tab', activeButton.getAttribute('data-tab')
    // )
    
    // Restore previously active tab from DOM data attribute
    const activeTab = crossTabs.getAttribute('data-active-tab')
    const condition = activeTab && Object.keys(summary).includes(activeTab) 
    switchTab(condition ? activeTab : Object.keys(summary)[0])
    
    // Add event listener to send selected value back to Shiny
    crossTabs.querySelectorAll(".tab-btn").forEach(tabButton => 
        tabButton.addEventListener('click', 
        () => switchTab(tabButton.getAttribute('data-tab'))
        )
    )
    
    // Tab switching function
    function switchTab(tabKey){

      // Store the selected tab in DOM data attribute
      crossTabs.setAttribute('data-active-tab', tabKey)
        
      document.querySelectorAll('.tab-content').forEach(
        el => el.style.display = el.getAttribute("id") === `tab-${tabKey}` ? "flex" : "none"
      )
        
      // Remove active class from all buttons
      const allButtons = document.querySelectorAll('.tab-btn')
      allButtons.forEach(
        btn => btn.classList[btn.getAttribute("data-tab")===tabKey?"add":"remove"]('active')
      )
    }

    const crossTable = document.getElementById("cross-estimates")
    
    crossTable.innerHTML = `
      <style>
        #cross-estimates h5{
          margin-top:0;
          margin-bottom: 0.5rem;
          font-size: 1rem;
          font-weight: 400;
        }
      </style>
      <h5> Cross Estimated Cases</h5>
      <div id="cross-table"></div>
    `
    let tableID = "cross-table"
    const styles = tableID => `
      #${tableID} .tcontent{
        background: #fff;
        border:1px solid #649df1ff;
        border-radius: var(--bradius1); 
        box-shadow: var(--bxshadow1); 
        font-size:12px;
      }
      #${tableID} table{
        width:330px;
        border-collapse:collapse;
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
        white-space: nowrap;
        max-width:130px;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: all 0.3s ease;
      } 
      #${tableID} td:hover {
        white-space: normal;
        overflow: visible;
      }
      #${tableID} td:nth-child(3){
        text-align:right;  
      }
      #${tableID} button{
        font-size:1em;
      }
    `
    table(tableID, res.estimates, styles(tableID),{nrows:15})
  })

}