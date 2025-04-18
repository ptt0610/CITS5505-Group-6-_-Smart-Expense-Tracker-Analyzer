// Dummy data for frontend testing - to be replaced with real backend data
const dummyExpenses = [
    { ID: 1, Date: "2023-01-01", Category: "Food", Amount: 63 },
    { ID: 2, Date: "2023-01-02", Category: "Transportation", Amount: 30 },
    { ID: 3, Date: "2023-01-03", Category: "Entertainment", Amount: 45 },
    { ID: 4, Date: "2023-01-04", Category: "Utilities", Amount: 75 },
    { ID: 5, Date: "2023-01-05", Category: "Groceries", Amount: 120 },
    { ID: 6, Date: "2023-01-06", Category: "Clothing", Amount: 85 },
    { ID: 7, Date: "2023-01-07", Category: "Education", Amount: 200 },
    { ID: 8, Date: "2023-01-08", Category: "Healthcare", Amount: 150 },
    { ID: 9, Date: "2023-01-09", Category: "Housing", Amount: 950 },
    { ID: 10, Date: "2023-01-10", Category: "Insurance", Amount: 110 },
    { ID: 11, Date: "2023-01-11", Category: "Investments", Amount: 300 },
    { ID: 12, Date: "2023-01-12", Category: "Personal Care", Amount: 40 },
    { ID: 13, Date: "2023-01-13", Category: "Other", Amount: 25 },
    { ID: 14, Date: "2023-01-14", Category: "Food", Amount: 70 },
    { ID: 15, Date: "2023-01-15", Category: "Transportation", Amount: 45 },
    { ID: 16, Date: "2023-01-16", Category: "Entertainment", Amount: 60 },
    { ID: 17, Date: "2023-01-17", Category: "Utilities", Amount: 80 },
    { ID: 18, Date: "2023-01-18", Category: "Groceries", Amount: 130 },
    { ID: 19, Date: "2023-01-19", Category: "Clothing", Amount: 95 },
    { ID: 20, Date: "2023-01-20", Category: "Education", Amount: 210 }
];

function loadExpenseTable(data) {
    const $tbody = $('#dataTable tbody');
    $tbody.empty();

    data.forEach(item => {
        const row = `
            <tr>
                <td>${item.ID}</td>
                <td>${item.Date}</td>
                <td>${item.Category}</td>
                <td>${item.Amount}</td>
            </tr>
        `;
        $tbody.append(row);
    });
}

// Initialize DataTable with custom search and filter options

$(document).ready(function () {
    // Load dummy data (or real data from backend)
    loadExpenseTable(dummyExpenses);

    const table = $('#dataTable').DataTable();

    // Reset filters
    $('#resetFilters').on('click', function () {
        $('#filterCategory').val('');
        $('#minDate').val('');
        $('#maxDate').val('');
        $('#minAmount').val('');
        $('#maxAmount').val('');
        table.search('').columns().search('').draw();
    });

    // Custom Category Filter
    $('#filterCategory').on('change', function () {
        table.column(2).search(this.value).draw(); // column index 2 = Category
    });

    // Custom Date Range Filter
    $.fn.dataTable.ext.search.push(function (settings, data) {
        const minDate = $('#minDate').val();
        const maxDate = $('#maxDate').val();
        const date = data[1]; // column index 1 = Date

        if ((!minDate && !maxDate) || 
            (!minDate && date <= maxDate) || 
            (minDate <= date && !maxDate) || 
            (minDate <= date && date <= maxDate)) {
            return true;
        }
        return false;
    });

    // Custom Amount Range Filter
    $.fn.dataTable.ext.search.push(function (settings, data) {
        const min = parseFloat($('#minAmount').val()) || 0;
        const max = parseFloat($('#maxAmount').val()) || Infinity;
        const amount = parseFloat(data[3]) || 0; // column index 3 = Amount

        return amount >= min && amount <= max;
    });

    // Trigger filtering on change
    $('#minDate, #maxDate, #minAmount, #maxAmount').on('change', function () {
        table.draw();
    });
});
