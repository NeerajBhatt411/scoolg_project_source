const ExcelJS = require('exceljs');
const fs = require('fs');

async function generate() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Student Upload');

    const headers = [
        { header: "First Name (Required)", key: "firstName", width: 25 },
        { header: "Last Name (Required)", key: "lastName", width: 20 },
        { header: "Roll Number (Required)", key: "roll", width: 22 },
        { header: "Date of Birth YYYY-MM-DD (Required)", key: "dob", width: 35 },
        { header: "Gender M/F (Required)", key: "gender", width: 22 },
        { header: "Blood Group (Optional)", key: "bloodGroup", width: 22 },
        { header: "Aadhaar Number (Optional)", key: "aadhaar", width: 28 },
        { header: "Father Name (Required)", key: "father", width: 25 },
        { header: "Mother Name (Required)", key: "mother", width: 25 },
        { header: "Primary Contact 10-digits (Required)", key: "contact", width: 35 },
        { header: "Parent Email (Optional)", key: "email", width: 30 },
        { header: "Current Address (Required)", key: "address", width: 40 },
        { header: "Admission Number (Optional)", key: "admission", width: 28 },
        { header: "Date of Admission YYYY-MM-DD (Required)", key: "doa", width: 40 },
        { header: "Class (Read Only)", key: "class", width: 20 },
        { header: "Section (Read Only)", key: "section", width: 20 }
    ];

    sheet.columns = headers;

    const firstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Ayaan", "Krishna", "Ishaan", "Shaurya", "Ananya", "Diya", "Sanya", "Kavya", "Myra", "Aarohi", "Riya", "Aadhya", "Navya", "Kiara"];
    const lastNames = ["Sharma", "Verma", "Gupta", "Singh", "Patel", "Reddy", "Kumar", "Rao", "Jain", "Desai", "Mehta", "Bose", "Nair", "Iyer", "Chauhan", "Bhatia", "Chopra", "Dubey", "Yadav", "Tiwari"];

    for (let i = 0; i < 20; i++) {
        const gender = i < 10 ? 'Male' : 'Female';
        sheet.addRow({
            firstName: firstNames[i],
            lastName: lastNames[i],
            roll: String(i + 1),
            dob: `2015-05-${String((i % 28) + 1).padStart(2, '0')}`,
            gender: gender,
            bloodGroup: 'O+',
            aadhaar: `1234123412${String(i).padStart(2, '0')}`,
            father: `${firstNames[i]}'s Father`,
            mother: `${firstNames[i]}'s Mother`,
            contact: `98765432${String(i).padStart(2, '0')}`,
            email: `parent${i}@test.com`,
            address: `123 Test Street, Building ${i+1}`,
            admission: `ADM-100${i}`,
            doa: '2024-04-01',
            class: '1',
            section: 'A'
        });
    }

    await workbook.xlsx.writeFile('C:/Users/neera/Downloads/Test_20_Students_Class_1A.xlsx');
}

generate();
