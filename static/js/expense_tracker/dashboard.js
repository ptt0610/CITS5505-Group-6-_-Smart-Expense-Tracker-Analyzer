function applyFilters() {
    const filteredData = {
        total: 1200,
        average: 312.5,
        topCategory: 'Food',
        transactions: 20,
        categoryBarChart: {
            labels: ['Food', 'Transport', 'Health'],
            values: [480, 300, 420]
        },
        pieData: {
            labels: ['Food', 'Transport', 'Health'],
            values: [40, 25, 35]
        },
        lineData: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr'],
            values: [200, 350, 400, 300]
        }
    };

    document.getElementById('totalSpending').innerText = `$${filteredData.total}`;
    document.getElementById('avgSpending').innerText = `$${filteredData.average}`;
    document.getElementById('topCategory').innerText = filteredData.topCategory;
    document.getElementById('numTransactions').innerText = filteredData.transactions;

    // Update Category Bar Chart
    window.categoryBarChart.data.labels = filteredData.categoryBarChart.labels;
    window.categoryBarChart.data.datasets[0].data = filteredData.categoryBarChart.values;
    window.categoryBarChart.update();

    // Update Pie Chart
    window.categoryPieChart.data.labels = filteredData.pieData.labels;
    window.categoryPieChart.data.datasets[0].data = filteredData.pieData.values;
    window.categoryPieChart.update();

    // Update Line Chart
    window.monthlyLineChart.data.labels = filteredData.lineData.labels;
    window.monthlyLineChart.data.datasets[0].data = filteredData.lineData.values;
    window.monthlyLineChart.update();
}


document.addEventListener("DOMContentLoaded", function () {
    // Initialize charts
    const categoryBarChart = new Chart(document.getElementById('categoryBarChart'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Categorical Spending ($)',
                data: [],
                backgroundColor: 'rgba(78, 115, 223, 0.5)'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } }
        }
    });

    const categoryPieChart = new Chart(document.getElementById('categoryPieChart'), {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e']
            }]
        },
        options: { responsive: true }
    });

    const monthlyLineChart = new Chart(document.getElementById('monthlyLineChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Monthly Spend',
                data: [],
                fill: false,
                borderColor: '#4e73df'
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: 'Month' } },
                y: { beginAtZero: true }
            }
        }
    });

    // Store charts globally so applyFilters can access them
    window.categoryBarChart = categoryBarChart;
    window.categoryPieChart = categoryPieChart;
    window.monthlyLineChart = monthlyLineChart;

    // Run filters to populate data
    applyFilters();
});
