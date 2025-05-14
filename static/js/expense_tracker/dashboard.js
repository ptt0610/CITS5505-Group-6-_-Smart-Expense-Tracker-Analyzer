// Use the globals set in HTML
var totalSpending = window.spending_by_category.reduce((a, b) => a + b, 0);

// Bar Chart
var ctxBar = document.getElementById('categoryBarChart').getContext('2d');
var categoryBarChart = new Chart(ctxBar, {
    type: 'bar',
    data: {
        labels: categories,
        datasets: [{
            label: 'Spending by Category',
            data: spending_by_category,
            backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                '#9966FF', '#FF9F40', '#FF0000', '#00FF00',
                '#0000FF', '#FFFF00',
            ],
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: false
            }
        }
    }
});

// Pie Chart
var ctxPie = document.getElementById('categoryPieChart').getContext('2d');
var categoryPieChart = new Chart(ctxPie, {
    type: 'pie',
    data: {
        labels: window.categories,
        datasets: [{
            data: window.spending_by_category,
            backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                '#9966FF', '#FF9F40', '#FF0000', '#00FF00',
                '#0000FF', '#FFFF00'
            ],
        }]
    },
    options: {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        var label = context.label || '';
                        var value = context.raw;
                        var percentage = ((value / totalSpending) * 100).toFixed(2) + '%';
                        return `${label}: ${percentage}`;
                    }
                }
            },
            datalabels: {
                formatter: (value, context) => {
                    var percentage = (value / totalSpending * 100).toFixed(1) + '%';
                    return percentage;
                },
                color: '#fff',
                font: {
                    weight: 'bold'
                }
            }
        }
    },
    plugins: [ChartDataLabels]
});

// Line Chart - Daily Spending Trend
var ctxLine = document.getElementById('monthlyLineChart').getContext('2d');
var dailyLineChart = new Chart(ctxLine, {
    type: 'line',
    data: {
        labels: window.daily_labels,
        datasets: [{
            label: 'Daily Spending',
            data: window.daily_totals,
            fill: false,
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            tension: 0.3,
            pointRadius: 2,
            pointHoverRadius: 4
        }]
    },
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Daily Expense Trend'
            },
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `$${context.raw.toFixed(2)}`;
                    }
                }
            }
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'day',
                    tooltipFormat: 'MMM dd',
                    displayFormats: {
                        day: 'MMM dd'
                    }
                },
                title: {
                    display: true,
                    text: 'Date'
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Amount ($)'
                }
            }
        }
    }
});

function applyFilters() {
    const selectedCategory = document.getElementById("categoryFilter").value;
    const startDateStr = document.getElementById("startDate").value;
    const endDateStr = document.getElementById("endDate").value;

    const startDate = startDateStr ? new Date(startDateStr + 'T00:00:00') : null;
    const endDate = endDateStr ? new Date(endDateStr + 'T23:59:59') : null;

    // ❗ Show warning if end date is earlier than start date
    if (startDate && endDate && endDate < startDate) {
        alert("End date cannot be earlier than start date.");
        return;
    }

    // Filter transactions based on both category and date
    const filteredTransactions = window.transactions.filter(t => {
        const date = new Date(t.date + 'T12:00:00'); // Prevent timezone issues
        const categoryMatch = selectedCategory === "All" || t.category === selectedCategory;
        const dateMatch =
            (!startDate || date >= startDate) &&
            (!endDate || date <= endDate);
        return categoryMatch && dateMatch;
    });

    // Aggregate spending by category
    const categoryMap = {};
    filteredTransactions.forEach(t => {
        if (!categoryMap[t.category]) categoryMap[t.category] = 0;
        categoryMap[t.category] += t.amount;
    });

    const filteredCategories = Object.keys(categoryMap);
    const filteredSpending = Object.values(categoryMap);

    // Aggregate daily totals
    const dailyMap = {};
    filteredTransactions.forEach(t => {
        if (!dailyMap[t.date]) dailyMap[t.date] = 0;
        dailyMap[t.date] += t.amount;
    });

    const sortedDates = Object.keys(dailyMap).sort();
    const filteredLineLabels = sortedDates;
    const filteredLineData = sortedDates.map(date => dailyMap[date]);

    // Update bar & pie charts
    categoryBarChart.data.labels = filteredCategories;
    categoryBarChart.data.datasets[0].data = filteredSpending;

    categoryPieChart.data.labels = filteredCategories;
    categoryPieChart.data.datasets[0].data = filteredSpending;

    // Update line chart
    dailyLineChart.data.labels = filteredLineLabels;
    dailyLineChart.data.datasets[0].data = filteredLineData;

    categoryBarChart.update();
    categoryPieChart.update();
    dailyLineChart.update();
}
