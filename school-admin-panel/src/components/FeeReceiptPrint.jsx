import React, { useState } from 'react';

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

const FeeReceiptPrint = ({ payment, invoices = [], student = {}, schoolName = '', schoolLogo = '', onClose }) => {
    const [layout, setLayout] = useState('duplicate'); // 'duplicate' | 'single' | 'thermal'
    const [showDiscount, setShowDiscount] = useState(true);

    const handlePrint = () => {
        window.print();
    };

    const invoiceList = invoices.filter(i => String(i.paymentId) === String(payment._id) || i.receiptNo === payment.referenceNo);
    const subtotal = invoiceList.reduce((acc, i) => acc + (i.amount || 0), 0);
    const totalDiscount = invoiceList.reduce((acc, i) => acc + ((i.amount - i.paidAmount) || 0), 0); // difference is discount
    const netPaid = payment.amount;

    const ReceiptContent = ({ typeLabel }) => (
        <div className="bg-white p-5 border border-slate-200 rounded-2xl print:border print:border-slate-300 print:p-4 print:rounded-xl flex flex-col justify-between h-[340px] max-h-[360px] print:h-[340px] print:max-h-[360px] overflow-hidden print:overflow-hidden select-none">
            <div>
                {/* School Branding & Logo Header */}
                <div className="flex items-center gap-3 border-b border-slate-200 pb-3 mb-3">
                    {schoolLogo ? (
                        <img src={schoolLogo} alt="School Logo" className="w-12 h-12 object-contain rounded-lg bg-slate-50 p-0.5 shrink-0" />
                    ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shrink-0">
                            {schoolName ? schoolName.charAt(0).toUpperCase() : 'S'}
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <h3 className="text-base font-black text-slate-900 tracking-tight leading-none uppercase">{schoolName || 'School Name'}</h3>
                        <p className="text-[9px] text-slate-400 font-bold mt-1.5 uppercase tracking-wider">Quality Education for All · Fee Receipt</p>
                    </div>
                    <div className="text-right shrink-0">
                        <span className="inline-block text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">{typeLabel}</span>
                    </div>
                </div>

                {/* Receipt Details Box */}
                <div className="flex justify-between items-center bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100/70 text-xs font-semibold text-slate-500 mb-3">
                    <div>Receipt No: <span className="font-mono font-black text-slate-800">{payment.referenceNo}</span></div>
                    <div>Date: <span className="font-bold text-slate-800">{fmtDate(payment.verifiedAt || payment.createdAt)}</span></div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs font-semibold text-slate-600 my-3">
                    <div>
                        <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">Student Name</span>
                        <span className="font-bold text-slate-800">{student.name || payment.studentName}</span>
                    </div>
                    <div>
                        <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">Class & Section</span>
                        <span className="font-bold text-slate-800">{student.class}-{student.section}</span>
                    </div>
                    <div>
                        <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">Admission No.</span>
                        <span className="font-bold text-slate-800">{student.admissionNumber || student.studentAppId || '—'}</span>
                    </div>
                    <div>
                        <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">Father's Name</span>
                        <span className="font-bold text-slate-800">{student.fatherName || '—'}</span>
                    </div>
                    <div className="col-span-2">
                        <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">Payment Mode</span>
                        <span className="font-bold text-slate-800">{payment.method}</span>
                    </div>
                </div>

                {/* Fees Breakdown Table */}
                <table className="w-full text-xs text-left text-slate-500 mt-3 border-t border-b border-slate-100">
                    <thead>
                        <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <th className="py-2">Fee Particulars</th>
                            <th className="py-2 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {invoiceList.map((inv) => (
                            <tr key={inv._id} className="text-slate-800">
                                <td className="py-2 font-bold">{inv.title}</td>
                                <td className="py-2 text-right font-black">{money(inv.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Calculations */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600 space-y-1.5">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-slate-800 font-bold">{money(subtotal)}</span>
                </div>
                {showDiscount && totalDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                        <span>Discount / Waiver</span>
                        <span>-{money(totalDiscount)}</span>
                    </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-100">
                    <span>Total Paid</span>
                    <span className="text-base text-blue-700">{money(netPaid)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-600 tracking-wider justify-center pt-3">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span> Status: Verified & Paid
                </div>
            </div>
        </div>
    );

    const ThermalReceipt = () => (
        <div className="bg-white p-4 font-mono text-[11px] text-slate-800 border border-slate-200 w-[2.5in] mx-auto print:border-none print:w-full print:p-0">
            <div className="text-center border-b border-dashed border-slate-300 pb-3">
                <h4 className="font-bold text-sm tracking-tight uppercase">{schoolName || 'SCHOOL FEE RECEIPT'}</h4>
                <p className="text-[9px] uppercase mt-0.5">Verified Payment</p>
            </div>

            <div className="my-3 space-y-1">
                <div>Receipt: {payment.referenceNo}</div>
                <div>Date: {fmtDate(payment.verifiedAt || payment.createdAt)}</div>
                <div>Name: {student.name || payment.studentName}</div>
                <div>Class: {student.class}-{student.section}</div>
                <div>Adm No: {student.admissionNumber || student.studentAppId || '—'}</div>
                <div>Father: {student.fatherName || '—'}</div>
                <div>Mode: {payment.method}</div>
            </div>

            <div className="border-t border-b border-dashed border-slate-300 py-2">
                <div className="flex justify-between font-bold mb-1">
                    <span>Particulars</span>
                    <span>Amount</span>
                </div>
                {invoiceList.map((inv) => (
                    <div key={inv._id} className="flex justify-between">
                        <span>{inv.title.slice(0, 18)}</span>
                        <span>{money(inv.amount)}</span>
                    </div>
                ))}
            </div>

            <div className="mt-3 space-y-1 text-right">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{money(subtotal)}</span>
                </div>
                {showDiscount && totalDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                        <span>Discount:</span>
                        <span>-{money(totalDiscount)}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-xs border-t border-dashed border-slate-300 pt-1 mt-1">
                    <span>Net Paid:</span>
                    <span>{money(netPaid)}</span>
                </div>
            </div>

            <div className="text-center mt-4 text-[9px] uppercase tracking-wider text-slate-500">
                Thank you for the payment!
            </div>
        </div>
    );

    return (
        <div className="print-modal-root fixed inset-0 z-[120] flex items-center justify-center p-4 print:p-0">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md print:hidden" onClick={onClose} />
            <div className="print-modal-content relative z-10 bg-white w-full max-w-4xl rounded-[32px] shadow-2xl print:shadow-none print:rounded-none flex flex-col max-h-[90vh] print:max-h-none overflow-hidden print:overflow-visible">
                
                {/* Print Controls (Hidden on print) */}
                <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 print:hidden">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-blue-600 text-2xl">receipt_long</span>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Print Fee Receipt</h3>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* Layout Selector */}
                        <div className="bg-slate-50 p-1 rounded-xl flex items-center border border-slate-200">
                            {[
                                { k: 'duplicate', l: 'Duplicate (A4)', icon: 'view_quilt' },
                                { k: 'single', l: 'Single (A5)', icon: 'description' },
                                { k: 'thermal', l: 'Thermal (3")', icon: 'tune' },
                            ].map((o) => {
                                return (
                                    <button key={o.k} onClick={() => setLayout(o.k)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${layout === o.k ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>
                                        <span className="material-symbols-outlined text-[15px]">{o.icon}</span> {o.l}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Discount Toggle */}
                        {totalDiscount > 0 && (
                            <button onClick={() => setShowDiscount(!showDiscount)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${showDiscount ? 'border-blue-200 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500'}`}>
                                {showDiscount ? 'Showing Discounts' : 'Hiding Discounts'}
                            </button>
                        )}

                        <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/10">
                            <span className="material-symbols-outlined text-[15px]">print</span> Print
                        </button>
                        <button onClick={onClose} className="w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-800 rounded-full grid place-items-center transition-colors">
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>
                </div>

                {/* Print area */}
                <div className="p-6 md:p-8 bg-slate-50 overflow-y-auto flex-1 print:bg-white print:p-0 print:overflow-visible">
                    <div id="print-area" className="w-full flex justify-center">
                        {layout === 'thermal' ? (
                            <ThermalReceipt />
                        ) : layout === 'duplicate' ? (
                            <div className="grid grid-cols-2 gap-8 w-full max-w-5xl print:gap-4 print:p-2">
                                <ReceiptContent typeLabel="STUDENT COPY" />
                                <ReceiptContent typeLabel="OFFICE COPY" />
                            </div>
                        ) : (
                            <div className="w-full max-w-xl">
                                <ReceiptContent typeLabel="FEE RECEIPT (SINGLE COPY)" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Print-specific style block */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    /* Hide header, sidebar, tab selector, and dashboard layout containers */
                    header, aside, #fees-tabs-container, main > :not(.print-modal-root) {
                        display: none !important;
                    }
                    
                    /* Reset wrappers height and margins */
                    html, body, #root, .min-h-screen, main {
                        height: auto !important;
                        min-height: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        overflow: visible !important;
                    }

                    /* Override modal container styles to display block in print stream */
                    .print-modal-root {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        display: block !important;
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        z-index: auto !important;
                    }

                    .print-modal-content {
                        border: none !important;
                        box-shadow: none !important;
                        width: 100% !important;
                        max-width: none !important;
                        height: auto !important;
                        max-height: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                    }

                    #print-area {
                        position: relative !important;
                        width: 100% !important;
                        display: ${layout === 'duplicate' ? 'grid !important' : 'block !important'};
                        grid-template-columns: ${layout === 'duplicate' ? '1fr 1fr !important' : 'none'};
                        gap: ${layout === 'duplicate' ? '16px !important' : '0'};
                    }

                    @page {
                        size: ${layout === 'duplicate' ? 'A4 landscape' : layout === 'single' ? 'A5 portrait' : 'auto'};
                        margin: ${layout === 'thermal' ? '0.2cm' : '0.5cm'};
                    }
                }
            `}} />
        </div>
    );
};

export default FeeReceiptPrint;
