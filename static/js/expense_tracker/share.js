// Dummy users for example 
const users = [
    { id: 1, name: "JohnDoe" },
    { id: 2, name: "JaneSmith" }
];

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

let shareTable; // Global variable for DataTable instance

$(document).ready(function () {
    // Add the default "-- Choose a User --" option
    $('#selectUser').append('<option value="">-- Choose a User --</option>');

    // Add the users to the dropdown
    users.forEach(user => {
        $('#selectUser').append(`<option value="${user.id}">${user.name}</option>`);
    });

    initializeShareTable(dummyExpenses);

    function initializeShareTable(expenses) {
        // Destroy existing DataTable if it exists
        if ($.fn.DataTable.isDataTable('#shareTable')) {
            $('#shareTable').DataTable().destroy();
        }

        const tableBody = $('#shareTable tbody');
        tableBody.empty();

        expenses.forEach(item => {
            const row = `
                <tr>
                    <td><input type="checkbox" class="select-expense" data-id="${item.ID}"></td>
                    <td>${item.ID}</td>
                    <td>${item.Date}</td>
                    <td>${item.Category}</td>
                    <td>${item.Amount}</td>
                </tr>
            `;
            tableBody.append(row);
        });

        // Reinitialize DataTable with pagination, search, and live filtering options
        shareTable = $('#shareTable').DataTable({
            "paging": true,
            "searching": true,  // Allows searching in the table
            "info": true,
            "pageLength": 5,  // Default to 5 entries per page
            "lengthMenu": [5, 10, 25, 50, 100]  // Dropdown for number of rows per page
        });
    }
});