export function table(tableId, dataObject, styles="",options = {}){
  
  const keys = Object.keys(dataObject)

  const columnNames = keys.map(i =>
    i.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  )
 
  const dataArray = dataObject[keys[0]].map((_, j) => 
    keys.reduce((obj, key) => (obj[key] = dataObject[key][j], obj), {})
  )

  const splitArray = (arr, n) => [
    ...Array(Math.ceil(arr.length / n))
  ].map((_, i) => arr.slice(i * n, (i + 1) * n))

  const rowsPerPage = options.nrows || 10
  const tablePages = splitArray(dataArray, rowsPerPage)
  const totalRows = dataObject[keys[0]].length
  const totalPages = tablePages.length
  let currentPage  = 1
  let pageMenuOn  = false

  const insertRows = page => {

    return tablePages[page-1].map(i => `
      <tr>${keys.map(key => `<td>${i[key]}</td>`).join("")}</tr>  
    `).join("")
  }

  const pagesArray = [...Array(totalPages)].map((_, j) => j + 1)

  const styling  = `
   <style>
      .tcontent{   
        display: flex;
        flex-direction: column;
        overflow: hidden;
        width:fit-content;
      }
      .tsection{
        flex-grow: 1;
      }
      .tcontent th,
      .tcontent td{
        padding:0 10px 0 5px;
        white-space: nowrap;
      }
      .tfooter {
        position:relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 3px 5px;
      }
      .tbutton{
        padding: 0 5px;
        line-height: 1;
      }
      .tmenu{
        position:absolute;
        bottom:100%;
        right:0;
        height: fit-content; width: 100px; 
        max-height: 120px;
        background: #0000001a;
        backdrop-filter: blur(2px);
        border: 1px solid #35343433;
        padding: 3px;
        overflow-y: auto;
        display: flex;
        flex-wrap: wrap;
        gap: 0.5em;
      }
      .tmenu::-webkit-scrollbar{
        width: 5px;
      }
      .tmenu::-webkit-scrollbar-thumb {        
        background: gray; 
      }
      .tmenu .tpage-number{
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid transparent; 
        height: 25px; width: 25px;
      }
      .tmenu .tpage-number:hover{
        cursor: default;
        border: 2px solid #5f5f5f;
      }
      
      ${styles}
    </style>
  `

  document.getElementById(tableId).innerHTML = `
    ${styling}
    <div class="tcontent">
      <div class="tsection">
        <table>
          <thead>
            ${columnNames.map(i => `<th>${i}</th>`).join("")}
          </thead>
          <tbody>${insertRows(currentPage)}</tbody>
        </table>
      </div>
      <div class="tfooter">
        <div class="t-nrows">
          ${currentPage} - ${Math.min(rowsPerPage, totalRows)} of ${totalRows} rows
        </div>
        <div class="tbuttons">
          <button class="tbutton tprev-btn" disabled> < </button>
          <button class="tbutton tmenu-btn">
            ${currentPage}/${totalPages}
          </button>
          <button class="tbutton tnext-btn"> > </button>
        </div> 
        <div class="tmenu">
          ${pagesArray.map(i =>`<div class="tpage-number">${i}</div>`).join("")}
        </div>
      </div>
    </div>
  `
  
  const query = value => document.querySelector(`#${tableId} ${value}`)
  
  const goToPage = page => {
    // Update current page within range [1, totalPages]
    currentPage = Math.max(1, Math.min(page, totalPages))
    // Update table information
    query('tbody').innerHTML = insertRows(currentPage)
    query('.tmenu-btn').textContent = `${currentPage}/${totalPages}`
    const startRow = (currentPage-1) * rowsPerPage + 1
    const endRow = Math.min(currentPage * rowsPerPage, totalRows)
    query(`.t-nrows`).innerHTML = `${startRow} - ${endRow} of ${totalRows} rows`
    // Update button disability
    query('.tprev-btn').disabled = currentPage === 1
    query('.tnext-btn').disabled = currentPage === totalPages

    options.colorRows && options.colorRows()
  }

  const togglePageMenu = () => {
    pageMenuOn = !pageMenuOn
    query('.tmenu').style.display = pageMenuOn ? "" : "none"
  }
  // Bind button events
  query(".tprev-btn").addEventListener('click', () => goToPage(currentPage - 1))
  query(".tnext-btn").addEventListener('click', () => goToPage(currentPage + 1))
  document.querySelectorAll(`#${tableId} .tpage-number`).forEach(
    (i,j) => i.addEventListener('click', () => {
      goToPage(j+1)
      togglePageMenu()
    })
  )
  query(".tmenu-btn").addEventListener('click', togglePageMenu)
  // display buttons when pages are > 1
  query('.tbuttons').style.display = totalPages>1 ? "" : "none"
  // Hide menu when clicking outside and on page load
  query('.tmenu').style.display = "none" 
  document.addEventListener('click', event => {
    const tmenu = query('.tmenu')
    const tmenuBtn = query('.tmenu-btn')
    // Check if click is outside both the menu and the button
    if (!tmenu.contains(event.target) && !tmenuBtn.contains(event.target)) {
      pageMenuOn = false
      tmenu.style.display = "none"
    }
  })

  options.colorRows && options.colorRows()
}