import React, { useState } from 'react';

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

const FeeReceiptPrint = ({ payment, invoices = [], student = {}, schoolName = '', schoolLogo = '', onClose }) => {
    const [layout, setLayout] = useState('duplicate'); // 'duplicate' (2 pages) | 'single' (1 page)
    const [showDiscount, setShowDiscount] = useState(true);

    const handlePrint = () => {
        window.print();
    };

    const invoiceList = invoices.filter(i => String(i.paymentId) === String(payment._id) || i.receiptNo === payment.referenceNo);
    const subtotal = invoiceList.reduce((acc, i) => acc + (i.amount || 0), 0);
    const totalDiscount = invoiceList.reduce((acc, i) => acc + ((i.amount - i.paidAmount) || 0), 0); // difference is discount
    const netPaid = payment.amount;

    const ReceiptContent = ({ typeLabel }) => (
        <div className="receipt-page bg-white w-full max-w-[190mm] min-h-[252mm] p-8 border border-slate-200 rounded-[24px] print:rounded-none flex flex-col select-none">
            {/* School Branding & Logo Header */}
            <div className="flex items-center gap-4 border-b-2 border-slate-200 pb-4 mb-4">
                {schoolLogo ? (
                    <img src={schoolLogo} alt="School Logo" className="w-16 h-16 object-contain rounded-lg bg-slate-50 p-0.5 shrink-0" />
                ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shrink-0">
                        {schoolName ? schoolName.charAt(0).toUpperCase() : 'S'}
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">{schoolName || 'School Name'}</h3>
                    <p className="text-[11px] text-slate-400 font-bold mt-2 uppercase tracking-wider">Quality Education for All · Fee Receipt</p>
                </div>
                <div className="text-right shrink-0">
                    <span className="inline-block text-[11px] font-black uppercase tracking-wider px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">{typeLabel}</span>
                </div>
            </div>

            {/* Receipt Details Box */}
            <div className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-xl border border-slate-100/70 text-sm font-semibold text-slate-500 mb-4">
                <div>Receipt No: <span className="font-mono font-black text-slate-800">{payment.referenceNo}</span></div>
                <div>Date: <span className="font-bold text-slate-800">{fmtDate(payment.verifiedAt || payment.createdAt)}</span></div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm font-semibold text-slate-600 mb-5">
                <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Student Name</span>
                    <span className="font-bold text-slate-800">{student.name || payment.studentName}</span>
                </div>
                <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Class & Section</span>
                    <span className="font-bold text-slate-800">{student.class}-{student.section}</span>
                </div>
                <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Admission No.</span>
                    <span className="font-bold text-slate-800">{student.admissionNumber || student.studentAppId || '—'}</span>
                </div>
                <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Father's Name</span>
                    <span className="font-bold text-slate-800">{student.fatherName || '—'}</span>
                </div>
                <div className="col-span-2">
                    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Mode</span>
                    <span className="font-bold text-slate-800">{payment.method}</span>
                </div>
            </div>

            {/* Fees Breakdown Table — grows to fill the page */}
            <div className="flex-1 flex flex-col min-h-0">
                <table className="w-full text-sm text-left text-slate-500 border-t-2 border-slate-100">
                    <thead>
                        <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <th className="py-3">Fee Particulars</th>
                            <th className="py-3 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {invoiceList.map((inv) => (
                            <tr key={inv._id} className="text-slate-800">
                                <td className="py-3 font-bold">{inv.title}</td>
                                <td className="py-3 text-right font-black">{money(inv.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex-1 border-t border-slate-100" />
            </div>

            {/* Calculations — pinned to the bottom of the page */}
            <div className="mt-4 pt-4 border-t-2 border-slate-100 text-sm font-semibold text-slate-600 space-y-2">
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
                <div className="flex justify-between text-lg font-black text-slate-900 pt-2 border-t border-slate-100">
                    <span>Total Paid</span>
                    <span className="text-xl text-blue-700">{money(netPaid)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-emerald-600 tracking-wider justify-center pt-2">
                    <span className="material-symbols-outlined text-[15px]">check_circle</span> Status: Verified &amp; Paid
                </div>
            </div>

            {/* Signature strip */}
            <div className="flex justify-between items-end mt-8 pt-2">
                <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">This is a computer-generated receipt.</p>
                <div className="text-center">
                    <div className="w-44 border-t border-slate-400 pt-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600">Authorised Signatory</div>
                </div>
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
                                { k: 'duplicate', l: 'Student + Office (2 Pages)', icon: 'auto_stories' },
                                { k: 'single', l: 'Single Copy (A4)', icon: 'description' },
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
                    <div id="print-area" className="w-full">
                        <div className="flex flex-col items-center gap-8 print:block print:gap-0">
                            {layout === 'duplicate' ? (
                                <>
                                    <ReceiptContent typeLabel="STUDENT COPY" />
                                    <ReceiptContent typeLabel="OFFICE COPY" />
                                </>
                            ) : (
                                <ReceiptContent typeLabel="FEE RECEIPT" />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Print-specific style block */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    /* Hide sidebar, dashboard header and tab selector */
                    header, aside, #fees-tabs-container {
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
                        display: block !important;
                        width: 100% !important;
                        max-width: none !important;
                    }

                    /* Each copy = exactly one full A4 page */
                    .receipt-page {
                        width: 100% !important;
                        max-width: none !important;
                        min-height: 262mm !important;
                        box-sizing: border-box !important;
                        display: flex !important;
                        flex-direction: column !important;
                        border: none !important;
                        border-radius: 0 !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        background: white !important;
                    }

                    /* Page break between the two copies, but never a trailing blank page */
                    .receipt-page {
                        break-after: page;
                        page-break-after: always;
                    }
                    .receipt-page:last-child {
                        break-after: auto;
                        page-break-after: auto;
                    }

                    @page {
                        size: A4 portrait;
                        margin: 12mm;
                    }
                }
            `}} />
        </div>
    );
};

export default FeeReceiptPrint;
