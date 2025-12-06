export function summaryDetails(id,key, data,title,col){

    const variables = data[key]
    const widths = {
      body_part:20,
      diag:30,
      products:35
    }
    const { tperc, fperc, mperc, total } = data
    const color = c => c > 10 ? "#0063c0" : c > 5 ? "#333333" : "#808080"
    const widthCSS = (perc) => `calc(1px + ${perc}%)`
    
    return `
      <style>
        #${id} .chart-container{
          height: 100%;
          width: 100%;
          padding: 0.5em 1em;
          overflow:hidden;
          display: flex;
          flex-direction: column;
        }
        #${id} .chart-title{
          font-size: 1.1em;
          font-weight: 500;
          color: #5f5f5f;
          flex-shrink: 0;
        }
        #${id} .chart-body{
          font-size: 0.9em;
          display:flex;
          flex-direction:column;
          flex-grow:1;
          min-height:0;
          border-top: 2px solid #b4b4b4;
          border-bottom: 2px solid #b4b4b4;
        }
        #${id} .thead,#${id} .tr{
          display:flex;
        }
        #${id} .tr div:nth-child(1){
          font-weight:500;
        }
        #${id} .thead{
          font-size:0.9em;
          margin-top:0.5em;
          flex-shrink: 0;
        }
        #${id} .tbody{
          overflow-y:auto; 
          flex-grow:1;
          min-height: 0;
          padding-top:0.5em;
        }
        #${id} .chart-footer{
          margin:0.3em;
          font-size: 0.9em;
        }
        #${id} .tbody::-webkit-scrollbar{
          width: 5px;
        }
        #${id} .tbody::-webkit-scrollbar-thumb {        
          background: #1976d23b; 
        }
        #${id} .tbody::-webkit-scrollbar-track {
          background: #ccc;
        }
      </style>
      <div class="chart-container">
        <div class="chart-title">${title}</div>
        <div class="chart-body">
          <div class="thead" style="color: #5f5f5f;">
            <div style="width: ${widths[key]}%; text-align:right;">${col}</div>
            <div style="width: 15%; text-align:center; ">Total Counts</div>
            <div style="width: 10%; text-align:center;">Total %</div>
            <div style="width: 35%;">
              <span style=" font-weight:500;color:#f8766d;">Female %</span> | 
              <span style=" font-weight:500;color:#00bfc4;">Male %</span>
            </div>
          </div>
          <div class="tbody ">${variables.map((i, j) => `
            <div class="tr" style="margin-bottom:0.5em;">
              <div style="
                width:${widthCSS(widths[key])}; text-align:right; color: ${color(tperc[j])};"
              >${i}</div>
              <div style="width:${widthCSS(15)}; text-align:center; color: ${color(tperc[j])};">${total[j]}</div>
              <div style="width:${widthCSS(10)}; text-align:center; color: ${color(tperc[j])};">${tperc[j]}</div>
              <div style=" width: calc(35% * ${tperc[j] / Math.max(...tperc)});"> 
                <div style="background:#f8766d; width: ${fperc[j]}%;"> 
                  <div style="margin-left:102%; font-size:0.84em;">${Math.round(fperc[j])}% </div> 
                  </div>
                <div style="background:#00bfc4; width: ${mperc[j]}%; ">
                  <div style="margin-left:102%;font-size:0.84em;">${Math.round(mperc[j])}%</div>   
                </div>
              </div>
            </div>
          `).join("")}</div>
        </div>
        <div class="chart-footer">Total Observations: <strong>${variables.length}</strong></div>
      </div>
    `
}