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

let shareTable; // Global DataTable instance

$(document).ready(function () {
    // Populate user dropdown
    $('#selectUser').append('<option value="">-- Choose a User --</option>');
    users.forEach(user => {
        $('#selectUser').append(`<option value="${user.id}">${user.name}</option>`);
    });

    initializeShareTable(dummyExpenses);

    function initializeShareTable(expenses) {
        if ($.fn.DataTable.isDataTable('#shareTable')) {
            $('#shareTable').DataTable().destroy();
        }

        const tableBody = $('#shareTable tbody');
        tableBody.empty();

        expenses.forEach(item => {
            const row = `
                <tr>
                    <td><input type="checkbox" class="select-expense" data-id="${item.ID}"></td>
                    <td>${item.ID}</td> <!-- Hidden column -->
                    <td>${item.Date}</td>
                    <td>${item.Category}</td>
                    <td>${item.Amount}</td>
                </tr>
            `;
            tableBody.append(row);
        });

        // Initialize DataTable with hidden ID column
        shareTable = $('#shareTable').DataTable({
            columnDefs: [
                {
                    targets: 1, // Hide ID column (2nd column, index starts at 0)
                    visible: false,
                    searchable: false
                }
            ],
            paging: true,
            searching: true,
            info: true,
            pageLength: 5,
            lengthMenu: [5, 10, 25, 50, 100]
        });
        
        applyFiltersLive();
    }

    // Live filters
    function applyFiltersLive() {
        $('#filterCategory').on('input change', function () {
            shareTable.column(3).search(this.value).draw(); // Category
        });

        $('#minDate, #maxDate').on('input change', function () {
            const minDate = $('#minDate').val();
            const maxDate = $('#maxDate').val();

            $.fn.dataTable.ext.search.push(function (settings, data) {
                const date = data[2]; // Date column
                if (
                    (!minDate || date >= minDate) &&
                    (!maxDate || date <= maxDate)
                ) {
                    return true;
                }
                return false;
            });

            shareTable.draw();
            $.fn.dataTable.ext.search.pop(); // Clean up after filter
        });

        $('#minAmount, #maxAmount').on('input change', function () {
            const minAmount = parseFloat($('#minAmount').val()) || 0;
            const maxAmount = parseFloat($('#maxAmount').val()) || Infinity;

            $.fn.dataTable.ext.search.push(function (settings, data) {
                const amount = parseFloat(data[4]) || 0; // Amount column
                return amount >= minAmount && amount <= maxAmount;
            });

            shareTable.draw();
            $.fn.dataTable.ext.search.pop();
        });
    }

    // Reset Filters
    $('#resetFilters').click(function () {
        $('#filterCategory, #minDate, #maxDate, #minAmount, #maxAmount').val('');
        shareTable.search('').columns().search('').draw();
    });

    // Handle Share button
    $('#shareBtn').click(function () {
        const selectedIds = [];
        $('.select-expense:checked').each(function () {
            selectedIds.push($(this).data('id'));
        });

        const selectedUser = $('#selectUser').val();
        if (!selectedUser) {
            alert('Please select a user to share with.');
            return;
        }

        if (selectedIds.length === 0) {
            alert('Please select at least one expense.');
            return;
        }

        console.log('Sharing expenses:', selectedIds, 'with user:', selectedUser);
        const userName = users.find(user => user.id == selectedUser)?.name || 'Unknown User';
        alert(`Shared ${selectedIds.length} expenses with ${userName}.`);

        // TODO: Send selectedIds and selectedUser to backend

        // Clear checkboxes and reset user selection
        $('.select-expense').prop('checked', false);
        $('#selectUser').val('');
    });
});
