export function genderDistribution(id,femalePerc,malePerc,labelWidth,barWidth,styles=""){
   document.getElementById(id).innerHTML = `
    <style>
      .summary-gender{
        display:flex; 
        flex-direction: column;
        justify-content: space-between;
        width: ${labelWidth+barWidth+45}px;
        height:100%;

      }
      .summary-gender div{
        display: flex;
        align-items: center;
      }
      .summary-gender-label{
        width:${labelWidth}px; 
        height:100%; 
        justify-content:right;
        padding-right:5px;
        border-right: 1px solid #5f5f5f;
        color:#5f5f5f;
      }
      .summary-gender-bar{
        border-radius: 0 3px 3px 0;
        height: 80%;  
        margin-right: 1px;
      }
      ${styles}
    </style>
    <div class="summary-gender">
      <div style="display:flex; height: 48%;">
        <div class="summary-gender-label" >Female</div>
        <div class="summary-gender-bar" style="
          background:var(--fcolor); width:${barWidth*(femalePerc/100)}px;" 
        ></div>
        <div style="font-weight:500;  " >${femalePerc}%</div>
      </div>
      <div style="display:flex; height: 48%;">
        <div class="summary-gender-label"  >Male</div>
        <div class="summary-gender-bar" style="
          background:var(--mcolor); width:${barWidth*(malePerc/100)}px;" 
        ></div>
        <div style="font-weight:500; " >${malePerc}%</div>
      </div>
    </div>
  `
}