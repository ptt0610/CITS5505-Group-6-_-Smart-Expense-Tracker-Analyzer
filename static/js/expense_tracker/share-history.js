$(document).ready(function () {
    // Load share history
    fetch('/get_share_history')
        .then(response => response.json())
        .then(data => {
            console.log('API Response:', data); // Debug
            loadMySharedHistory(data.my_shared || []);
            loadSharedWithMeHistory(data.shared_with_me || []);
        })
        .catch(error => {
            console.error('Error fetching share history:', error);
            alert('Failed to load share history.');
        });

    function loadMySharedHistory(entries) {
        const myHistoryTableBody = $('#myShareHistoryTable tbody');
        myHistoryTableBody.empty();

        if (!entries || entries.length === 0) {
            myHistoryTableBody.append('<tr><td colspan="3">No shared expenses found.</td></tr>');
            return;
        }

        entries.forEach(entry => {
            const sharedRecords = entry.records && entry.records.length > 0
                ? `<ul>${entry.records.map(record => 
                    `<li>Category: ${record.category || 'Unknown'}, Amount: $${parseFloat(record.amount || 0).toFixed(2)}</li>`
                  ).join('')}</ul>`
                : 'No records';

            const row = `
                <tr>
                    <td>${entry.shared_with || 'Unknown'}</td>
                    <td>${entry.date || 'Unknown'}</td>
                    <td>${sharedRecords}</td>
                </tr>
            `;
            myHistoryTableBody.append(row);
        });
    }

    function loadSharedWithMeHistory(entries) {
        const sharedWithMeTableBody = $('#sharedWithMeTable tbody');
        sharedWithMeTableBody.empty();

        if (!entries || entries.length === 0) {
            sharedWithMeTableBody.append('<tr><td colspan="3">No shared expenses found.</td></tr>');
            return;
        }

        entries.forEach(entry => {
            const sharedRecords = entry.records && entry.records.length > 0
                ? `<ul>${entry.records.map(record => 
                    `<li>Category: ${record.category || 'Unknown'}, Amount: $${parseFloat(record.amount || 0).toFixed(2)}</li>`
                  ).join('')}</ul>`
                : 'No records';

            const row = `
                <tr>
                    <td>${entry.shared_by || 'Unknown'}</td>
                    <td>${entry.date || 'Unknown'}</td>
                    <td>${sharedRecords}</td>
                </tr>
            `;
            sharedWithMeTableBody.append(row);
        });
    }
});