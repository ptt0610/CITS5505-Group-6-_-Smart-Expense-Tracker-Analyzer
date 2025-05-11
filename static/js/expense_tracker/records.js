$(document).ready(function() {
    // Initialize DataTable
    var table = $('#dataTable').DataTable({
        ajax: {
            url: '/get_records',
            dataSrc: '',
            cache: false,
            data: function() {
                return { '_': new Date().getTime() };
            },
            error: function(xhr) {
                if (xhr.status === 401 || xhr.status === 403) {
                    window.location.href = '/login';
                }
            }
        },
        columns: [
            { data: 'id' },
            { data: 'date' },
            { data: 'category' },
            { data: 'amount', render: function(data) { return '$' + parseFloat(data).toFixed(2); } },
            {
                data: null,
                render: function(data, type, row) {
                    return '<button class="btn btn-sm btn-primary edit-btn" data-id="' + row.id + '">Edit</button> ' +
                           '<button class="btn btn-sm btn-danger delete-btn" data-id="' + row.id + '">Delete</button>';
                }
            }
        ],
        order: [[1, 'desc']],
        initComplete: function() {
            var data = this.api().data().toArray();
            console.log('DataTable initialized with data:', data);
        }
    });

    // Clear table on load to prevent stale data
    table.clear().draw();

    // Log AJAX requests
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            console.log('AJAX request:', settings.url, settings.data);
        }
    });

    // Toggle expandable pane
    function togglePane() {
        var content = document.getElementById('expandableContent');
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
    }

    // Handle form submission
    $('#expenseForm').on('submit', function(e) {
        e.preventDefault();
        var formData = {
            record_id: $('#recordId').val(),
            amount: parseFloat($('#amount').val()),
            category: $('#category').val(),
            date: $('#date').val()
        };
        console.log('Submitting form:', formData);

        $.ajax({
            url: '/save_records',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function(response) {
                alert(response.success);
                console.log('Save response:', response);
                table.ajax.reload(null, false);
                $('#expenseForm')[0].reset();
                $('#recordId').val('');
            },
            error: function(xhr) {
                if (xhr.status === 401 || xhr.status === 403) {
                    window.location.href = '/login';
                } else {
                    alert('Error: ' + (xhr.responseJSON.error || 'Failed to save expense'));
                    console.error('Save error:', xhr.responseJSON);
                }
            }
        });
    });

    // Handle edit button click
    $('#dataTable tbody').on('click', '.edit-btn', function() {
        var id = $(this).data('id');
        var rowData = table.row($(this).parents('tr')).data();
        console.log('Editing record:', rowData);
        $('#recordId').val(rowData.id);
        $('#amount').val(rowData.amount);
        $('#category').val(rowData.category);
        $('#date').val(rowData.date);
        document.getElementById('expandableContent').style.display = 'block';
    });

    // Handle delete button click
    $('#dataTable tbody').on('click', '.delete-btn', function() {
        if (confirm('Are you sure you want to delete this record?')) {
            var id = $(this).data('id');
            console.log('Deleting record ID:', id);
            $.ajax({
                url: '/delete_record',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ record_id: id }),
                success: function(response) {
                    alert(response.success);
                    console.log('Delete response:', response);
                    table.ajax.reload(null, false);
                },
                error: function(xhr) {
                    if (xhr.status === 401 || xhr.status === 403) {
                        window.location.href = '/login';
                    } else {
                        alert('Error: ' + (xhr.responseJSON.error || 'Failed to delete expense'));
                        console.error('Delete error:', xhr.responseJSON);
                    }
                }
            });
        }
    });

    // Handle apply filters
    $('#applyFilters').on('click', function() {
        var category = $('#filterCategory').val();
        var minDate = $('#minDate').val();
        var maxDate = $('#maxDate').val();
        var minAmount = parseFloat($('#minAmount').val()) || 0;
        var maxAmount = parseFloat($('#maxAmount').val()) || Infinity;
        console.log('Applying filters:', { category, minDate, maxDate, minAmount, maxAmount });

        table.clear().draw();
        $.ajax({
            url: '/get_records',
            cache: false,
            data: { '_': new Date().getTime() },
            success: function(data) {
                console.log('Filtered data fetched:', data);
                var filteredData = data.filter(function(row) {
                    var date = new Date(row.date);
                    var amount = parseFloat(row.amount);
                    return (!category || row.category === category) &&
                           (!minDate || date >= new Date(minDate)) &&
                           (!maxDate || date <= new Date(maxDate)) &&
                           (amount >= minAmount && amount <= maxAmount);
                });
                table.rows.add(filteredData).draw();
            },
            error: function(xhr) {
                if (xhr.status === 401 || xhr.status === 403) {
                    window.location.href = '/login';
                } else {
                    console.error('Filter error:', xhr.responseJSON);
                }
            }
        });
    });

    // Handle reset filters
    $('#resetFilters').on('click', function() {
        console.log('Resetting filters');
        $('#filterForm')[0].reset();
        table.ajax.reload(null, false);
    });
});

// Expose togglePane globally for onclick
window.togglePane = function() {
    var content = document.getElementById('expandableContent');
    content.style.display = content.style.display === 'none' ? 'block' : 'none';
};