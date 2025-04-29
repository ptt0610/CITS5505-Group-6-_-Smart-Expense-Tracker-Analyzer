// Mock shared history data
const mySharedHistory = [
    { sharedWith: 2, date: '2023-01-01', expenseRecords: [
        { category: "Food", amount: "$63", date: "2023-01-01" },
        { category: "Transportation", amount: "$30", date: "2023-01-01" }
    ]},
    { sharedWith: 1, date: '2023-02-10', expenseRecords: [
        { category: "Entertainment", amount: "$45", date: "2023-02-10" },
        { category: "Healthcare", amount: "$150", date: "2023-02-10" }
    ]}
];

const sharedWithMeHistory = [
    { sharedBy: 1, date: '2023-01-05', expenseRecords: [
        { category: "Utilities", amount: "$75", date: "2023-01-05" },
        { category: "Groceries", amount: "$120", date: "2023-01-05" }
    ]},
    { sharedBy: 2, date: '2023-03-12', expenseRecords: [
        { category: "Insurance", amount: "$110", date: "2023-03-12" },
        { category: "Investments", amount: "$300", date: "2023-03-12" }
    ]}
];


const users = [
    { id: 1, name: "JohnDoe" },
    { id: 2, name: "JaneSmith" }
];

// Function to load 'My Share History' table
// Will be reused (with minor changes) once the backend is ready and returns real data.
function loadMySharedHistory() {
    const myHistoryTableBody = $('#myShareHistoryTable tbody');
    myHistoryTableBody.empty();

    mySharedHistory.forEach(entry => {
        const sharedWithUserName = users.find(user => user.id === entry.sharedWith).name;

        // Format expense records
        const sharedRecords = entry.expenseRecords.map(record => 
            `${record.category} - ${record.amount} (Date: ${record.date})`
        ).join('<br>');

        const row = `
            <tr>
                <td>${sharedWithUserName}</td>
                <td>${entry.date}</td>
                <td>${sharedRecords}</td>
            </tr>
        `;
        myHistoryTableBody.append(row);
    });
}

// Function to load 'Shared With Me' table
function loadSharedWithMeHistory() {
    const sharedWithMeTableBody = $('#sharedWithMeTable tbody');
    sharedWithMeTableBody.empty();

    sharedWithMeHistory.forEach(entry => {
        const sharedByUserName = users.find(user => user.id === entry.sharedBy).name;

        // Format expense records
        const sharedRecords = entry.expenseRecords.map(record => 
            `${record.category} - ${record.amount} (Date: ${record.date})`
        ).join('<br>');

        const row = `
            <tr>
                <td>${sharedByUserName}</td>
                <td>${entry.date}</td>
                <td>${sharedRecords}</td>
            </tr>
        `;
        sharedWithMeTableBody.append(row);
    });
}

// Run these functions on page load to populate the tables
$(document).ready(function () {
    loadMySharedHistory();
    loadSharedWithMeHistory();
});