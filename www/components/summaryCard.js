export function summaryCard(id,title,name, count, percentage){
   document.getElementById(id).innerHTML = `
    <style>
      #${id}{
        width: 420px;
        font-size: 0.9em;
      }
      #${id} .sum-name{
        color:var(--color5);
        font-weight: 500;
        font-size: 1.2rem;
      }
      #${id} .sum-value{
        font-size:1.5rem;
        font-weight: 600;
        margin-right:0.5em;
      }   
    </style>
    <div>${title}: <span class="sum-name">${name}</span> </div>
    <div class="flex">
      <div>Count: <span class="sum-name sum-value">${count}</span></div>
      <div>Percentage: <span class="sum-name sum-value">${percentage}%</span></div>
    </div>
  `
}
