import { renderPage } from "./index.js";
import { 
  selectField,
  customRadioButtons,summaryCard,
  genderDistribution,ageGroupDistribution,
  table

} from "../components/index.js";

function ageGroupPage() {

  const innerHTML = `
    <div class="flex-col">
      <div>
        ${selectField("age-selectTag")}
      </div>
      <div id="age-radiobtns" class="custom-radio-buttons"></div>
    </div>
    <div class="flex-col gap-1">
      <div class="flex gap-1">
        <div id="field-summary"></div>
        <div id="age-field-gender"></div>
      </div>
      <div class="flex gap-2">
        <div id="field-age-group"></div>
        <div id="field-age-table"></div>
      </div>
    </div>
  `
  renderPage("ageGroups", innerHTML)
  
  Shiny.addCustomMessageHandler('ageSelect', res => {
    const id = "age-radiobtns"
    const stringToArray = val => typeof(val) === "string" ? [val] : val
    const labels = stringToArray(res.labels) 
    customRadioButtons(id, labels, res.inputName)
 
  })

  Shiny.addCustomMessageHandler("ageRadioButtons", function(res) {
    
    const {field,fieldName} = res
    const {n,perc} = res.fieldSummary


    summaryCard("field-summary",fieldName,res.fieldSummary[field][0], n[0], perc[0])

    
    const [genderId, labelWidth,barWidth] = ["age-field-gender",51,90]
    const genderStyles = `#${genderId} {font-size:0.8em;}`
    genderDistribution(genderId,res.femalePerc,res.malePerc,labelWidth,barWidth,genderStyles)
  
    const {ageGroups, raceAgeGroups} = res
    const colors = ["#DAA520","#1E90FF","#FA8072","#3CB371","#FF4500","#8A2BE2"]
    ageGroupDistribution("field-age-group",ageGroups,raceAgeGroups,colors)
    
    const {age, n:frequency} = (res.ageCounts)
    const ageCounts = {age,frequency}

    let tableID = "field-age-table"
    document.getElementById(tableID).innerHTML = `
      <style>
        #${tableID} h5{
          margin-top: 0;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          font-weight: 400;
        }
      </style>
      <h5>Frequency Counts Across Age.</h5>
    `
    const styles = tableID => `
      #${tableID} .tcontent{
        background: #fff;
        border:1px solid var(--color1);
        border-radius: var(--bradius1); 
        box-shadow: var(--bxshadow1); 
        font-size:12px;
      }
      #${tableID} table{
        width: 210px;
        table-layout: fixed;
        border-collapse:collapse;
      }
      #${tableID} .tsection{
        display: block; 
        min-height: 150px;
      }
      #${tableID} th{
        color: #e6e3e3ff;
        padding-bottom: 0.3em;
      }
      #${tableID} th,
      #${tableID} td{
        text-align:center;
        width: auto;
      }
      #${tableID} thead{
        background:var(--color1);
      }
      #${tableID} tbody tr{
        border-bottom:1px solid var(--color6);
        font-weight: 600;
      }
      #${tableID} td{
        padding-top: 2px;
        padding-bottom: 2px;
      }   
      #${tableID} button{
        font-size:1em;
      }
    `
    function colorRows() {
      const tableRows = document.querySelectorAll(`#${tableID} td:first-child`)
      const  colors = ["#DAA520","#1E90FF","#FA8072","#3CB371","#FF4500","#8A2BE2"]
      const ageRangeIdx  = age => {
        const ageNum = parseInt(age)
        
        if (ageNum >= 0 && ageNum <= 5) return 0
        if (ageNum >= 6 && ageNum <= 12) return 1
        if (ageNum >= 13 && ageNum <= 19) return 2
        if (ageNum >= 20 && ageNum <= 35) return 3
        if (ageNum >= 36 && ageNum <= 64) return 4
        if (ageNum >= 65) return 5
      }

      tableRows.forEach(td => {
        td.parentElement.style.color = colors[ageRangeIdx(td.textContent)]
      }) 
    }
    table(tableID, ageCounts, styles(tableID), {nrows:16,colorRows})
    
  })

}

export {ageGroupPage}