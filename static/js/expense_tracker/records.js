function togglePane() {
  $('#expandableContent').slideToggle();
}

// Validate amount input for up to two decimal places
$('#amount').on('keyup', function() {
  let value = $(this).val();
  if (!/^\d+(\.\d{0,2})?$/.test(value)) {
    $(this).val(value.slice(0, -1)); // Remove invalid characters
  }
});

// Validate date input to prevent future dates
var today = new Date().toISOString().split('T')[0];
document.getElementById("date").setAttribute("max", today);

$(function () {
    // 1. Initialize DataTable with an "actions" column
    const table = $('#dataTable').DataTable({
    order: [[1, 'desc']],
    columns: [
      { data: 'id' },
      { data: 'date' },
      { data: 'category' },
      { data: 'amount' },
      { data: 'actions', orderable: false, searchable: false }
    ]
  });

    // 2. Load all records
    function loadRecords() {
        $.getJSON($('#dataTable').data('url'), function (data) {
        table.clear();
        data.forEach(item => {
            item.actions = `
            <button class="btn btn-sm btn-primary edit-btn" data-id="${item.id}">Edit</button>
            <button class="btn btn-sm btn-danger delete-btn" data-id="${item.id}">Delete</button>
            `;
            table.row.add(item);
        });
        table.draw();
        });
    }

    loadRecords();

    // 3. Save (create/update)
    $('#saveBtn').on('click', function () {
        const payload = {
        record_id: $('#recordId').val(),
        amount: parseFloat($('#amount').val()),
        category: $('#category').val(),
        date: $('#date').val()
        };
        $.ajax({
            url: $('#saveBtn').data('url'),
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function (res) {
                alert(res.success);
                $('#recordId,#amount,#category,#date').val('');
                loadRecords();
            }
        });
     });

     // 4. Edit button handler
    $('#dataTable').on('click', '.edit-btn', function () {
        const id = $(this).data('id');
        const row = table.row($(this).closest('tr')).data();
        $('#recordId').val(id);
        $('#amount').val(row.amount);
        $('#category').val(row.category);
        $('#date').val(row.date);
        if (!$('#expandableContent').is(':visible')) togglePane();

        // Scroll to the Add/Edit pane
        $('html, body').animate({
            scrollTop: $('.pane-container').offset().top
        }, 500);
    });

    // 5. Delete button handler
    $('#dataTable').on('click', '.delete-btn', function () {
        if (!confirm('Delete this record?')) return;
        $.ajax({
            url: $('#dataTable').data('delete-url'),
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ record_id: $(this).data('id') }),
            success: function (res) {
                alert(res.success);
                loadRecords();
            }
        });
    });
});
