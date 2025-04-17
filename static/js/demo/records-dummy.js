// Dummy data for frontend testing - to be replaced with real backend data
const dummyExpenses = [
    { ID: 1, Date: "2023-01-01", Category: "Food", Amount: 63 },
    { ID: 2, Date: "2023-01-02", Category: "Transport", Amount: 30 },
    { ID: 3, Date: "2023-01-03", Category: "Entertainment", Amount: 45 },
    { ID: 4, Date: "2023-01-04", Category: "Utilities", Amount: 75 },
    { ID: 5, Date: "2023-01-05", Category: "Groceries", Amount: 120 }
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

$(document).ready(function () {
    loadExpenseTable(dummyExpenses);
});
