document.addEventListener("DOMContentLoaded", function () {
    // Initialize charts with server-provided data
    const categories = window.categories || [];
    const spending_by_category = window.spending_by_category || [];
    const monthly_labels = window.monthly_labels || [];
    const monthly_spending = window.monthly_spending || [];

    const categoryBarChart = new Chart(document.getElementById('categoryBarChart'), {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Categorical Spending ($)',
                data: spending_by_category,
                backgroundColor: 'rgba(78, 115, 223, 0.5)',
                borderColor: 'rgba(78, 115, 223, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    const categoryPieChart = new Chart(document.getElementById('categoryPieChart'), {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: spending_by_category,
                backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e']
            }]
        },
        options: { responsive: true }
    });

    const monthlyLineChart = new Chart(document.getElementById('monthlyLineChart'), {
        type: 'line',
        data: {
            labels: monthly_labels,
            datasets: [{
                label: 'Monthly Spend',
                data: monthly_spending,
                fill: false,
                borderColor: '#4e73df',
                tension: 0.1
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

    // Store charts globally
    window.categoryBarChart = categoryBarChart;
    window.categoryPieChart = categoryPieChart;
    window.monthlyLineChart = monthlyLineChart;
});

function applyFilters() {
    // Get filter values
    const category = document.getElementById('categoryFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    // Build query string
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    // Fetch filtered data
    fetch('/dashboard?' + params.toString())
        .then(response => response.text())
        .then(html => {
            // Parse HTML to extract data
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const script = doc.querySelector('script:not([src])');
            if (script) {
                // Extract data from script
                const scriptContent = script.textContent;
                const dataMatch = scriptContent.match(/var categories = (.*?);[\s\S]*?var spending_by_category = (.*?);[\s\S]*?var monthly_labels = (.*?);[\s\S]*?var monthly_spending = (.*?);/);
                if (dataMatch) {
                    const categories = JSON.parse(dataMatch[1]);
                    const spending_by_category = JSON.parse(dataMatch[2]);
                    const monthly_labels = JSON.parse(dataMatch[3]);
                    const monthly_spending = JSON.parse(dataMatch[4]);

                    // Update KPIs
                    document.getElementById('totalSpending').innerText = `$${doc.getElementById('totalSpending').innerText.replace('$', '')}`;
                    document.getElementById('avgSpending').innerText = `$${doc.getElementById('avgSpending').innerText.replace('$', '')}`;
                    document.getElementById('topCategory').innerText = doc.getElementById('topCategory').innerText;
                    document.getElementById('numTransactions').innerText = doc.getElementById('numTransactions').innerText;

                    // Update Bar Chart
                    window.categoryBarChart.data.labels = categories;
                    window.categoryBarChart.data.datasets[0].data = spending_by_category;
                    window.categoryBarChart.update();

                    // Update Pie Chart
                    window.categoryPieChart.data.labels = categories;
                    window.categoryPieChart.data.datasets[0].data = spending_by_category;
                    window.categoryPieChart.update();

                    // Update Line Chart
                    window.monthlyLineChart.data.labels = monthly_labels;
                    window.monthlyLineChart.data.datasets[0].data = monthly_spending;
                    window.monthlyLineChart.update();
                }
            }
        })
        .catch(error => {
            console.error('Error fetching filtered data:', error);
            alert('Failed to apply filters. Please try again.');
        });
}