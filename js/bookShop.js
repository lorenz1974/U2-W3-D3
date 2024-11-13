// ***********************************************************************//
// FUNCTIONS DEFINITIONS
//
// ***********************************************************************
//

// FUNZIONE che prende il JSON e lo restituisce come array
const getBooks = (fetchUrl) => {
    return fetch(fetchUrl)
        .then((response) => {
            _D(3, 'RESPONSE', response)

            if (response.ok) {
                return response.json()
            } else {

                throw new Error('Errore nella response dal server!')
            }
        })
        .then((books) => {
            return books;
        })
        .catch((err) => {
            console.log(err)
        })
}

// Funzione che rimuove la card dalla pagina
const removeCard = (asin) => {
    _D(1, `removeCard: card-${asin}`)
    //document.getElementById(`card-${asin}`).remove()
    document.getElementById(`card-${asin}`).classList.add('opacity-25')
}


// Funzione che disegna la tabella del carrello
// e disattiva i bottoni del libri acquistati
const drawChart = () => {
    let tableHTML = ``
    let chartTotal = 0
    // Utilizza la variabile globale chartListArray
    chartListArray.forEach((asin) => {
        const book = booksArray.filter((item) => item.asin === asin)
        _D(3, 'book')

        tableHTML += `
            <tr class="">
                <td class="chartListTitle" colspan="2">${book[0].title}</td>
            </tr>
            <tr class="border border-0 border-bottom">
                <td></td>
                <td class="chartListPrice ps-2">${book[0].price.toFixed(2)}&euro;</td>
                <td class="chartListRemove ps-2">
                    <i id="removeFromChart-${book[0].asin}" class="fa-regular fa-trash-can"></i>
                </td>
            </tr>
            `
        chartTotal += book[0].price

        // Disattiva i bottoni dei libri acquistati
        document.getElementById(`remove-${asin}`).classList.add('disabled')
        document.getElementById(`buy-${asin}`).classList.add('disabled')

    })
    _D(1, 'chartTotal', chartTotal)

    tableHTML += `
            <tr class="border border-0 border-2 border-top chartTotal">
                <td class="fw-bold">Totale</td>
                <td class="chartListPrice fw-bold">${chartTotal.toFixed(2)}&euro;</td>
                <td class=""></td>
            </tr>
            `

    _D(3, 'drawChart tableHTML', tableHTML)
    document.getElementById('chartListTbody').innerHTML = tableHTML

}

// Funzione che mette il libro nel carrello e rigenera il carrello
const buyBook = (asin) => {
    _D(1, `buyBook: ${asin}`)

    // Se c'è qualcosa accodo
    chartListArray.length === 0 ? chartListArray[0] = asin : chartListArray[chartListArray.length] = asin
    _W(chartListArray)

    // Setto nuovamente il local storage
    localStorage.setItem('chartList', JSON.stringify(chartListArray))

    // Ridisegno il carrello ad ogni libro acquistato
    drawChart()
}

// Funzione che svuota il carrello
const emptyChart = () => {
    _D(1, `emptyChart`)

    // Distruggo l'array globale
    let chartListArray = []

    localStorage.clear()

    // Ricarico la pagina se il cestino è svuotato
    // in questo modo vengono riattivati anche tutti i bottoni
    location.reload()
    _D(1, `Now the chart is empty`)
}

const removeFromChart = (asinToRemove) => {
    _D(1, `removeFromChart: ${asinToRemove}`)

    chartListArray = chartListArray.filter((asinInChart) => asinToRemove !== asinInChart)
    _D(3, chartListArray)

    // Setto il localstorage
    localStorage.setItem('chartList', JSON.stringify(chartListArray))

    //Riattiva i bottoni deri libri tolti dal carrello
    document.getElementById(`remove-${asinToRemove}`).classList.remove('disabled')
    document.getElementById(`buy-${asinToRemove}`).classList.remove('disabled')

    // Ridisegno il carrello
    drawChart()
}

//
// ***********************************************************************
//
// VARIABLE DEFINITIONS
//
// ***********************************************************************
//

const debugLevel = 1
const apiBaseUrl = 'https://striveschool-api.herokuapp.com/books'
let booksArray = {}
let chartListArray = []


//
// ***********************************************************************
//
// MAIN ROUTINE
//
// ***********************************************************************
//

document.addEventListener('DOMContentLoaded', async () => {

    _D(1, 'DOM Loaded')

    const booksRow = document.getElementById('booksRow')
    booksArray = await getBooks(apiBaseUrl)

    _D(3, 'bookArray', booksArray)

    booksArray.forEach((book) => {

        const newCol = document.createElement('div')
        _D(2, `creating card for: ${book.asin} - ${book.title}`)

        newCol.classList.add('col-12', 'col-md-6', 'col-lg-4', 'mt-3')
        newCol.innerHTML = `
        <div id="card-${book.asin}" class= "card h-100" >
            <img id="#${book.asin}"
                src="${book.img}"
                class="card-img-top w-100 object-fit-cover"
                alt="${book.title}"
            />
            <div class="card-body">
                <h5 class="card-title">${book.title}</h5>
                <p class="card-text">
                    Prezzo: <span id="price-${book.asin}" class="priceText">${book.price}</span>
                </p>
                <p class ="card-text">
                    ASIN : ${book.asin}
                </p>
                <a href="#${book.asin}" id="remove-${book.asin}" class="btn btn-danger mx-auto">Elimina</a>
                <a href="#${book.asin}" id="buy-${book.asin}" class="btn btn-primary mx-auto">Compra</a>
            </div>
        </div>
        `

        _D(3, `card HTML: ${newCol.innerHTML}`)
        booksRow.appendChild(newCol)
    })


    // Poppolo la variabile globale chartiLstArray in modo da poter diseganre il carrello
    let chartList = localStorage.getItem('chartList')
    // Verifico se c'è qualcosa nel local storage e nel caso lo converto
    // chartListArray è definito a livello cglobale per passare da una funzioje all'altra
    chartList ? chartListArray = JSON.parse(localStorage.getItem('chartList')) : {}

    _D(2, `chartListArray is:`, chartListArray)

    // Disegno il carrello al caricamento della pagina
    drawChart()


    // Collega un listener a tutto il body così non devo attaccarlo ad ogni songolo componente
    document.getElementsByTagName('body')[0].addEventListener('click', (e) => {
        const target = e.target.id
        _D(3, `event is:`, e)

        const targetType = target.slice(0, target.indexOf('-'))
        _D(1, `targetType is: ${targetType}`)

        const targetBook = target.slice(target.indexOf('-') + 1)
        _D(1, `targetBook is: ${targetBook}`)

        switch (targetType) {
            case 'remove': {
                removeCard(targetBook)
                break
            }
            case 'buy': {
                buyBook(targetBook)
                break
            }
            /// ATTENTION: remove the 't' from 'emptyChart'
            case 'emptyChar': {
                emptyChart()
                break
            }
            case 'removeFromChart': {
                removeFromChart(targetBook)
                break
            }
            default: { break }
        }
    })

})