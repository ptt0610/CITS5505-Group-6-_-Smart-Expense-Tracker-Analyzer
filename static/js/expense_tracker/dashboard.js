// Bar Chart
var ctxBar = document.getElementById('categoryBarChart').getContext('2d');
var categoryBarChart = new Chart(ctxBar, {
    type: 'bar',
    data: {
        labels: categories,
        datasets: [{
            label: 'Spending by Category',
            data: spending_by_category,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    }
});

// Pie Chart
var ctxPie = document.getElementById('categoryPieChart').getContext('2d');
var categoryPieChart = new Chart(ctxPie, {
    type: 'pie',
    data: {
        labels: categories,
        datasets: [{
            data: spending_by_category,
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF0000', '#00FF00', '#0000FF', '#FFFF00'],
        }]
    }
});