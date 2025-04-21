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

// Function to toggle the expandable expense entry pane
function togglePane() {
    const content = document.getElementById('expandableContent');
    content.classList.toggle('show');
}

// Function to show the expandable expense entry pane
function showPane() {
    const content = document.getElementById('expandableContent');
    content.classList.add('show');
}

// Function to hide the expandable expense entry pane
function hidePane() {
    const content = document.getElementById('expandableContent');
    content.classList.remove('show');
}

// Function to load data into the DataTable
function loadExpenseTable(data) {
    const tableData = data.map(item => [
        item.ID,          // Hidden from user
        item.Date,
        item.Category,
        item.Amount,
        `<button class="edit-btn btn-secondary" data-id="${item.ID}">Edit</button>
        <button class="delete-btn btn-dark" data-id="${item.ID}">Delete</button>` 
        
    ]);

    $('#dataTable').DataTable({
        data: tableData,
        destroy: true, // Allow reinitialization
        columns: [
            { title: "ID" },
            { title: "Date" },
            { title: "Category" },
            { title: "Amount" },
            { title: "Update" }
        ],
        // Hiding the ID column from the user
        columnDefs: [
            {
                targets: 0,
                visible: false,
                searchable: false
            }
        ]
    });

    // Edit functionality incoporating form fields
    $('#dataTable tbody').off('click', '.edit-btn').on('click', '.edit-btn', function () {

        const id = $(this).data('id');
        const fullRecord = dummyExpenses.find(item => item.ID === id);
        
        $('#recordId').val(fullRecord.ID);
        $('#amount').val(fullRecord.Amount);
        $('#category').val(fullRecord.Category);
        $('#date').val(fullRecord.Date);
        showPane();
        document.getElementById("expandableContent").scrollIntoView({ behavior: "smooth" });
    });

    // Delete functionality
    // This will be updated with an AJAX call to delete the record from the backend
    $('#dataTable tbody').off('click', '.delete-btn').on('click', '.delete-btn', function () {

        const id = $(this).data('id');
        
        // confirmation before deletion
        if(!confirm('Are you sure you want to delete this record?')) {
            return;
        }
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
