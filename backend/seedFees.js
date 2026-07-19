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

        // 1. Find school
        const school = await School.findOne();
        if (!school) {
            console.log('❌ No school found in database. Please onboard a school first.');
            process.exit(1);
        }
        console.log(`Using school: ${school.schoolName} (${school._id})`);

        // 2. Find students
        const students = await Student.find({ schoolId: school._id, status: 'Active' }).limit(5);
        if (!students.length) {
            console.log('❌ No active students found for this school in database.');
            process.exit(1);
        }
        console.log(`Found ${students.length} active students.`);

        // 3. Clear old fee data to start clean
        console.log('Cleaning up old fee structures, discounts, invoices, and payments...');
        await Promise.all([
            FeeStructure.deleteMany({ schoolId: school._id }),
            FeeDiscount.deleteMany({ schoolId: school._id }),
            FeeInvoice.deleteMany({ schoolId: school._id }),
            FeePayment.deleteMany({ schoolId: school._id })
        ]);

        // 4. Create Fee Structures (Slabs)
        const classesList = [...new Set(students.map(s => s.class))];
        console.log(`Creating slabs for classes: ${classesList.join(', ')}`);
        
        const structuresToCreate = [];
        for (const clsName of classesList) {
            structuresToCreate.push(
                { schoolId: school._id, className: clsName, label: 'Tuition Fee', category: 'Tuition', amount: 1500, frequency: 'Monthly', academicYear: '2026-2027' },
                { schoolId: school._id, className: clsName, label: 'Transport Fee', category: 'Transport', amount: 600, frequency: 'Monthly', academicYear: '2026-2027' },
                { schoolId: school._id, className: clsName, label: 'Exam Fee', category: 'Exam', amount: 350, frequency: 'One-Time', academicYear: '2026-2027' }
            );
        }
        const createdSlabs = await FeeStructure.insertMany(structuresToCreate);
        console.log(`Created ${createdSlabs.length} fee slabs.`);

        // 5. Create Student Concession / Discount
        const targetStudent = students[0];
        const discount = await FeeDiscount.create({
            schoolId: school._id,
            studentId: targetStudent._id,
            category: 'Tuition',
            discountAmount: 200,
            academicYear: '2026-2027',
            active: true
        });
        console.log(`Assigned ₹200 Tuition discount to student: ${targetStudent.firstName} ${targetStudent.lastName}`);

        // 6. Generate Pending Fee Invoices (Dues) for April, May, and June 2026
        const invoicesToCreate = [];
        const months = ['April 2026', 'May 2026', 'June 2026'];
        
        for (const student of students) {
            // Check if this student gets a discount (concession)
            const hasTuitionDiscount = String(student._id) === String(targetStudent._id);
            
            // Add monthly Tuition and Transport invoices
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
                    dueDate: new Date(2026, months.indexOf(month) + 4, 10), // e.g. 10th of respective month
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

            // Add one-time Exam fee
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
                dueDate: new Date(2026, 8, 15), // Sept 15, 2026
                academicYear: '2026-2027',
                status: 'PENDING'
            });
        }

        const createdInvoices = await FeeInvoice.insertMany(invoicesToCreate);
        console.log(`Generated ${createdInvoices.length} pending fee bills (dues) across active students.`);

        console.log('🟢 Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed with error:', err);
        process.exit(1);
    }
};

seed();
