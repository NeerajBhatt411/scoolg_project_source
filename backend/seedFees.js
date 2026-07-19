import 'dotenv/config';
import mongoose from 'mongoose';
import { School } from './models/School.js';
import { Student } from './models/Student.js';
import { FeeStructure } from './models/FeeStructure.js';
import { FeeInvoice } from './models/FeeInvoice.js';
import { FeeDiscount } from './models/FeeDiscount.js';
import { FeePayment } from './models/FeePayment.js';

const seed = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        // 1. Find school by email neerajbhattadx@gmail.com
        let school = await School.findOne({ email: 'neerajbhattadx@gmail.com' });
        if (!school) {
            console.log('⚠️ School neerajbhattadx@gmail.com not found. Fetching first available...');
            school = await School.findOne();
        }
        
        if (!school) {
            console.log('❌ No school found in database.');
            process.exit(1);
        }
        console.log(`Using school: ${school.schoolName || school.email} (${school._id})`);

        // 2. Find students
        const students = await Student.find({ schoolId: school._id, status: 'Active' }).limit(5);
        if (!students.length) {
            console.log('❌ No active students found.');
            process.exit(1);
        }
        console.log(`Found ${students.length} active students.`);

        // 3. Clean old fee data
        console.log('Cleaning up old fee data...');
        await Promise.all([
            FeeStructure.deleteMany({ schoolId: school._id }),
            FeeDiscount.deleteMany({ schoolId: school._id }),
            FeeInvoice.deleteMany({ schoolId: school._id }),
            FeePayment.deleteMany({ schoolId: school._id })
        ]);

        // 4. Create Fee Slabs
        const classesList = [...new Set(students.map(s => s.class))];
        const structuresToCreate = [];
        for (const clsName of classesList) {
            structuresToCreate.push(
                { schoolId: school._id, className: clsName, label: 'Tuition Fee', category: 'Tuition', amount: 1500, frequency: 'Monthly', academicYear: '2026-2027' },
                { schoolId: school._id, className: clsName, label: 'Transport Fee', category: 'Transport', amount: 600, frequency: 'Monthly', academicYear: '2026-2027' },
                { schoolId: school._id, className: clsName, label: 'Exam Fee', category: 'Exam', amount: 350, frequency: 'One-Time', academicYear: '2026-2027' }
            );
        }
        await FeeStructure.insertMany(structuresToCreate);

        // 5. Create Sibling/Tuition Discount for first student
        const targetStudent = students[0];
        await FeeDiscount.create({
            schoolId: school._id,
            studentId: targetStudent._id,
            category: 'Tuition',
            discountAmount: 200,
            academicYear: '2026-2027',
            active: true
        });

        // 6. Generate Invoices
        const invoicesToCreate = [];
        const months = ['April 2026', 'May 2026', 'June 2026'];
        
        for (const student of students) {
            for (const month of months) {
                // Tuition
                invoicesToCreate.push({
                    schoolId: school._id,
                    studentId: student._id,
                    studentName: `${student.firstName} ${student.lastName}`.trim(),
                    studentAppId: student.studentAppId,
                    className: student.class,
                    section: student.section,
                    rollNumber: student.rollNumber || '',
                    title: `Tuition Fee · ${month}`,
                    category: 'Tuition',
                    period: month,
                    amount: 1500,
                    balanceAmount: 1500,
                    dueDate: new Date(2026, months.indexOf(month) + 4, 10),
                    academicYear: '2026-2027',
                    status: 'PENDING'
                });

                // Transport
                invoicesToCreate.push({
                    schoolId: school._id,
                    studentId: student._id,
                    studentName: `${student.firstName} ${student.lastName}`.trim(),
                    studentAppId: student.studentAppId,
                    className: student.class,
                    section: student.section,
                    rollNumber: student.rollNumber || '',
                    title: `Transport Fee · ${month}`,
                    category: 'Transport',
                    period: month,
                    amount: 600,
                    balanceAmount: 600,
                    dueDate: new Date(2026, months.indexOf(month) + 4, 10),
                    academicYear: '2026-2027',
                    status: 'PENDING'
                });
            }

            // Exam fee
            invoicesToCreate.push({
                schoolId: school._id,
                studentId: student._id,
                studentName: `${student.firstName} ${student.lastName}`.trim(),
                studentAppId: student.studentAppId,
                className: student.class,
                section: student.section,
                rollNumber: student.rollNumber || '',
                title: 'Exam Fee · Term 1',
                category: 'Exam',
                period: 'Term 1',
                amount: 350,
                balanceAmount: 350,
                dueDate: new Date(2026, 8, 15),
                academicYear: '2026-2027',
                status: 'PENDING'
            });
        }

        const createdInvoices = await FeeInvoice.insertMany(invoicesToCreate);
        console.log(`Generated ${createdInvoices.length} invoices.`);

        // 7. Create a PAID payment history for the target student (Aarav Sharma)
        // Let's mark April Tuition & April Transport as Paid with the ₹200 discount applied to Tuition!
        const targetInvoices = createdInvoices.filter(
            i => String(i.studentId) === String(targetStudent._id) && i.period === 'April 2026'
        );

        if (targetInvoices.length >= 2) {
            const tuitionInv = targetInvoices.find(i => i.category === 'Tuition');
            const transportInv = targetInvoices.find(i => i.category === 'Transport');

            // Tuition: Original 1500 - Discount 200 = Paid 1300 (balance 0)
            // Transport: Original 600 - Discount 0 = Paid 600 (balance 0)
            // Total Paid = 1900. Total Invoiced = 2100.
            const payment = await FeePayment.create({
                schoolId: school._id,
                studentId: targetStudent._id,
                studentName: `${targetStudent.firstName} ${targetStudent.lastName}`.trim(),
                studentAppId: targetStudent.studentAppId,
                invoiceId: tuitionInv._id,
                invoiceTitle: `${tuitionInv.title}, ${transportInv.title}`,
                amount: 1900,
                method: 'CASH',
                referenceNo: 'REC-000001',
                status: 'VERIFIED',
                verifiedByName: 'Admin',
                verifiedAt: new Date(),
                note: 'Sibling concession applied'
            });

            // Update Tuition Invoice
            tuitionInv.balanceAmount = 0;
            tuitionInv.paidAmount = 1500; // settled
            tuitionInv.status = 'PAID';
            tuitionInv.paidVia = 'CASH';
            tuitionInv.paidAt = new Date();
            tuitionInv.paymentId = payment._id;
            tuitionInv.receiptNo = 'REC-000001';
            await tuitionInv.save();

            // Update Transport Invoice
            transportInv.balanceAmount = 0;
            transportInv.paidAmount = 600;
            transportInv.status = 'PAID';
            transportInv.paidVia = 'CASH';
            transportInv.paidAt = new Date();
            transportInv.paymentId = payment._id;
            transportInv.receiptNo = 'REC-000001';
            await transportInv.save();

            console.log(`🟢 Successfully created PAID receipt REC-000001 for ${targetStudent.firstName} ${targetStudent.lastName}`);
        }

        console.log('🟢 Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seed();
