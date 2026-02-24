let monthlyAllowance = 0;
let monthlyRent = 0;
let expenses = [];
let chart;

const modal = document.getElementById("setupModal");
const saveSetupBtn = document.getElementById("saveSetup");
const table = document.getElementById("expenseTable");

window.onload = function() {

    const currentMonth = new Date().getMonth();
    const savedMonth = localStorage.getItem("savedMonth");

    if (savedMonth && savedMonth != currentMonth) {
        localStorage.removeItem("expenses");
    }

    localStorage.setItem("savedMonth", currentMonth);

    monthlyAllowance = parseFloat(localStorage.getItem("monthlyAllowance"));
    monthlyRent = parseFloat(localStorage.getItem("monthlyRent"));
    expenses = JSON.parse(localStorage.getItem("expenses")) || [];

    if (!monthlyAllowance || monthlyRent == null) {
        modal.style.display = "flex";
    } else {
        modal.style.display = "none";
    }

    updateUI();
};

saveSetupBtn.addEventListener("click", function() {
    const allowance = document.getElementById("setupAllowance").value;
    const rent = document.getElementById("setupRent").value;

    if (allowance > 0 && rent >= 0) {
        monthlyAllowance = parseFloat(allowance);
        monthlyRent = parseFloat(rent);

        localStorage.setItem("monthlyAllowance", monthlyAllowance);
        localStorage.setItem("monthlyRent", monthlyRent);

        modal.style.display = "none";
        updateUI();
    }
});

document.getElementById("expenseForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const category = document.getElementById("category").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const date = document.getElementById("date").value;

    expenses.push({ title, category, amount, date });
    localStorage.setItem("expenses", JSON.stringify(expenses));

    updateUI();
    this.reset();
});

function updateUI() {

    table.innerHTML = "";
    let totalSpent = 0;

    expenses.forEach((exp, index) => {
        totalSpent += exp.amount;

        table.innerHTML += `
            <tr>
                <td>${exp.date}</td>
                <td>${exp.title}</td>
                <td>${exp.category}</td>
                <td>₹ ${exp.amount}</td>
                <td><button onclick="deleteExpense(${index})">Delete</button></td>
            </tr>
        `;
    });

    const remaining = monthlyAllowance - monthlyRent - totalSpent;

    document.getElementById("allowanceDisplay").textContent = "₹ " + monthlyAllowance;
    document.getElementById("rentDisplay").textContent = "₹ " + monthlyRent;
    document.getElementById("totalSpent").textContent = "₹ " + totalSpent;
    document.getElementById("remainingBalance").textContent = "₹ " + remaining;

    updateProgress(totalSpent);
    renderChart();
}

function deleteExpense(index) {
    expenses.splice(index, 1);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    updateUI();
}

function updateProgress(totalSpent) {
    const used = monthlyRent + totalSpent;
    const percent = (used / monthlyAllowance) * 100;

    const bar = document.getElementById("progressBar");
    bar.style.width = percent + "%";

    if (percent > 85) bar.style.background = "red";
    else if (percent > 60) bar.style.background = "orange";
    else bar.style.background = "green";

    document.getElementById("progressText").textContent =
        "Budget Used: " + percent.toFixed(1) + "%";
}

function renderChart() {

    const categories = {};
    expenses.forEach(exp => {
        categories[exp.category] =
            (categories[exp.category] || 0) + exp.amount;
    });

    const ctx = document.getElementById("expenseChart");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories)
            }]
        }
    });
}

document.getElementById("resetBtn").addEventListener("click", function() {
    localStorage.clear();
    location.reload();
});

document.getElementById("darkModeToggle").addEventListener("click", function() {
    document.body.classList.toggle("dark");
});