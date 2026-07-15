// ======================================
// Investment Dashboard
// ======================================

let portfolio = [];
let chart;

// ===============================
// Cargar Portfolio
// ===============================

async function loadPortfolio() {

    try {

        const response = await fetch("data/portfolio.json");

        const data = await response.json();

        portfolio = data.stocks;

        createSidebar();

        if (portfolio.length > 0) {

            selectStock(0);

        }

    }

    catch (error) {

        console.error(error);

    }

}

// ===============================
// Crear tarjetas del sidebar
// ===============================

function createSidebar() {

    const container = document.getElementById("stockList");

    container.innerHTML = "";

    portfolio.forEach((stock, index) => {

        const card = document.createElement("div");

        card.className = "stock-card";

        card.dataset.index = index;

        card.innerHTML = `

            <h3>${stock.company}</h3>

            <p>${stock.ticker}</p>

            <div class="price">

                $${stock.price.toFixed(2)}

            </div>

        `;

        card.addEventListener("click", () => {

            selectStock(index);

        });

        container.appendChild(card);

    });

}

// ===============================
// Seleccionar acción
// ===============================

function selectStock(index) {

    document
        .querySelectorAll(".stock-card")
        .forEach(card => card.classList.remove("active"));

    document
        .querySelector(`.stock-card[data-index="${index}"]`)
        .classList.add("active");

    const stock = portfolio[index];

    updateHeader(stock);

    updateKPIs(stock);

    updateChart(stock);

    updateTable(stock);

}

// ===============================
// Header
// ===============================

function updateHeader(stock) {

    document.getElementById("company").textContent =
        stock.company;

    document.getElementById("ticker").textContent =
        stock.ticker;

    document.getElementById("price").textContent =
        "$" + stock.price.toFixed(2);

    const change = document.getElementById("change");

    const symbol = stock.change >= 0 ? "▲" : "▼";

    change.textContent =
        `${symbol} ${Math.abs(stock.changePercent).toFixed(2)}%`;

    change.className = "";

    if (stock.change >= 0) {

        change.classList.add("positive");

    }

    else {

        change.classList.add("negative");

    }

}

// ===============================
// KPIs
// ===============================

function updateKPIs(stock) {

    document.getElementById("open").textContent =
        "$" + stock.open.toFixed(2);

    document.getElementById("high").textContent =
        "$" + stock.high.toFixed(2);

    document.getElementById("low").textContent =
        "$" + stock.low.toFixed(2);

    document.getElementById("volume").textContent =
        Number(stock.volume).toLocaleString();

}

// ===============================
// Tabla
// ===============================

function updateTable(stock) {

    const tbody = document.getElementById("historyTable");

    tbody.innerHTML = "";

    [...stock.history]
        .reverse()
        .forEach(item => {

            const row = document.createElement("tr");

            row.innerHTML = `

                <td>${formatDate(item.date)}</td>

                <td>$${item.close.toFixed(2)}</td>

            `;

            tbody.appendChild(row);

        });

}

// ===============================
// Gráfica
// ===============================

function updateChart(stock) {

    const ctx = document
        .getElementById("stockChart")
        .getContext("2d");

    if (chart) {

        chart.destroy();

    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);

    gradient.addColorStop(0, "rgba(37,99,235,.35)");
    gradient.addColorStop(1, "rgba(37,99,235,0)");

    chart = new Chart(ctx, {

        type: "line",

        data: {

            labels: stock.history.map(item => formatDate(item.date)),

            datasets: [{

                label: stock.ticker,

                data: stock.history.map(item => item.close),

                borderColor: "#2563EB",

                backgroundColor: gradient,

                fill: true,

                pointRadius: 0,

                pointHoverRadius: 6,

                tension: .35,

                borderWidth: 3

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            interaction: {

                intersect: false,

                mode: "index"

            },

            plugins: {

                legend: {

                    display: false

                }

            },

            scales: {

                x: {

                    grid: {

                        display: false

                    }

                },

                y: {

                    beginAtZero: false,

                    grid: {

                        color: "#E5E7EB"

                    }

                }

            }

        }

    });

}

// ===============================
// Formatear fecha
// ===============================

function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString("es-MX", {

        day: "2-digit",

        month: "short",

        year: "numeric"

    });

}

// ===============================
// Iniciar aplicación
// ===============================

loadPortfolio();