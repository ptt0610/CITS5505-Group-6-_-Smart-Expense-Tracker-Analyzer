let shareTable; // Global DataTable instance

$(document).ready(function () {
    // Populate user dropdown
    fetch('/get_users')
        .then(response => response.json())
        .then(users => {
            const selectUser = $('#selectUser');
            selectUser.append('<option value="">-- Choose a User --</option>');
            users.forEach(user => {
                selectUser.append(`<option value="${user.id}">${user.name}</option>`);
            });
        })
        .catch(error => {
            console.error('Error fetching users:', error);
            alert('Failed to load users.');
        });

    // Initialize table with expenses
    loadExpenses();

    function loadExpenses() {
        // Get filter values
        const category = $('#filterCategory').val();
        const minDate = $('#minDate').val();
        const maxDate = $('#maxDate').val();
        const minAmount = $('#minAmount').val();
        const maxAmount = $('#maxAmount').val();

        // Build query string
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (minDate) params.append('min_date', minDate);
        if (maxDate) params.append('max_date', maxDate);
        if (minAmount) params.append('min_amount', minAmount);
        if (maxAmount) params.append('max_amount', maxAmount);

        // Fetch expenses
        fetch('/get_shareable_expenses?' + params.toString())
            .then(response => response.json())
            .then(expenses => {
                initializeShareTable(expenses);
            })
            .catch(error => {
                console.error('Error fetching expenses:', error);
                alert('Failed to load expenses.');
            });
    }

    function initializeShareTable(expenses) {
        if ($.fn.DataTable.isDataTable('#shareTable')) {
            $('#shareTable').DataTable().destroy();
        }

        const tableBody = $('#shareTable tbody');
        tableBody.empty();

        expenses.forEach(item => {
            const row = `
                <tr>
                    <td><input type="checkbox" class="select-expense" data-id="${item.id}"></td>
                    <td>${item.id}</td>
                    <td>${item.date}</td>
                    <td>${item.category}</td>
                    <td>${item.amount}</td>
                </tr>
            `;
            tableBody.append(row);
        });

        // Initialize DataTable with hidden ID column
        shareTable = $('#shareTable').DataTable({
            columnDefs: [
                {
                    targets: 1,
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
    }

    // Apply filters on input change
    $('#filterCategory, #minDate, #maxDate, #minAmount, #maxAmount').on('change input', function () {
        loadExpenses();
    });

    // Reset Filters
    $('#resetFilters').click(function () {
        $('#filterCategory, #minDate, #maxDate, #minAmount, #maxAmount').val('');
        loadExpenses();
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

        // Send sharing request
        fetch('/share_expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                recipient_id: selectedUser,
                expense_ids: selectedIds
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.success);
                    $('.select-expense').prop('checked', false);
                    $('#selectUser').val('');
                    loadExpenses();
                } else {
                    alert(data.error);
                }
            })
            .catch(error => {
                console.error('Error sharing expenses:', error);
                alert('Failed to share expenses.');
            });
    });
});