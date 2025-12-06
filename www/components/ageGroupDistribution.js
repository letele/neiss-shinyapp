export function ageGroupDistribution(id,ageGroups,raceList,colors){
  
  const races = Object.keys(raceList)
  const color = val => colors[ageGroups.indexOf(val)]
  const ticks = [0,20,40,60,80,100]

  const ageGroupLabels = labels => `
    <style>
      .age-group-labels{
        display:grid;
        grid-template-columns: repeat(${labels.length},1fr)
      }
      .age-group-labels > div {
        text-align: center; 
        border-right: 1px solid #3d3d3d;
        font-weight: 600;
      }
      .age-group-labels > div:last-child{
        border:none;
      }
    </style>
    <div class="age-group-labels">${labels.map((i,j) => 
      `<div style="color:${colors[j]};">${i}</div>`
    ).join("")}</div>
  `

  const raceDist = dist => dist.ageGroup.map((k,l) => `
    <div style="
      background:${color(k)}; 
      width:${dist.percentage[l]}%;
    "></div>  
  `).join("")
  
  document.getElementById(id).innerHTML = `
    <style>
      #${id}{ 
        width: 600px;
      }
      #${id} h5{
        margin-top: 0;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        font-weight: 400;
      }
      #${id} #age-dist-agegroup{
        margin-left: 120px;
      }
      #${id} .race-row{
        height: 36px;
        margin-top: 10px;
        display: flex;
        cursor: pointer;
      }
      #${id} .race-label{
        width: 120px;
        display: flex;
        align-items: center;
        justify-content: end;
        padding-right: 6px;
        font-size:0.84em;
        text-transform: capitalize;
        color: #646464ff;
        transition: all 0.4s ease;
      }
      #${id} .race-label:hover{
        color: #0078fa;
        text-shadow: 2px 2px 4px #00000056;
      }
      #${id} .race-label.active {
        color: #0078fa;
      }
      #${id} .race-bar{
        flex-grow: 1;
        display: flex;
        border:1px solid transparent;
        border-radius: 5px;
        overflow: hidden;
      }
 
      #${id} .race-bar .age-group-labels{
        width:100%;
        height:36%;
        align-self:center;
      }
      #${id} .scale-line{
        height: 20px;
        margin-top: 10px;
        margin-left: 120px;
        border-top: 1px solid #353535ff;
        position: relative;
      }
      #${id} .tick{
        position: absolute;
        border-left: 1px solid #353535ff;
        height: 8px;
        font-size: 8pt;
      }
      #${id} .scale-line span{
        position: absolute;
        top: 100%; 
        transform: translateX(-50%);
      }
      #${id} #perc-total{
        position: absolute;
        top: 130%;
        font-size: 8pt;
      }
    </style>
    <h5>Age Distribution By Race.</h5>
    <div id="age-dist-agegroup">
      ${ageGroupLabels(ageGroups)}
    </div>
    <div>${races.map(i =>`
      <div class="race-row">
        <div class="race-label">${i}</div>
        <div class="race-bar">${raceDist(raceList[i])}</div>
      </div>
    `).join("")}</div>
    <div class="scale-line">
      <div id='perc-total'>Percent Of Total</div>
      ${ticks.map((i,j) =>`
        <div class="tick" style="left: ${j===5?i-0.15:i}%">
          <span class='tickLabel'>${i}%</span>
        </div>
      `).join("")}
    </div>  
  `
  // Bind button events
  const activeStates = {}
  document.querySelectorAll(`#${id} .race-row`).forEach(
    row => row.addEventListener('click', () => {
      const el = row.querySelector(`.race-label`)
      const race = el.textContent
      const races = raceList[race]
      
      activeStates[race] = !activeStates[race]
      if (activeStates[race]) {
        el.classList.add('active')
        const ageGroup = races.ageGroup
        const perc = races.percentage.map(i => i.toFixed(2))
        const percToAgeGroups = ageGroups.map(i => 
          ageGroup.indexOf(i) !== -1 ? `${perc[ageGroup.indexOf(i)]}%` : '-'
        )
        el.nextElementSibling.innerHTML = ageGroupLabels(percToAgeGroups)

      }
      
      if (!activeStates[race]) {
        el.classList.remove('active')
        el.nextElementSibling.innerHTML = raceDist(races)
      }
    })
  )
}
