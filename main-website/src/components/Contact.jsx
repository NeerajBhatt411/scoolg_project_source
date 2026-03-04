export default function Contact() {
    return (
        <section className="py-24 bg-gray-50 transition-colors duration-300 dark:bg-slate-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 dark:text-white">Still have questions?</h2>
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <button className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95">
                        Book a Demo
                    </button>
                    <button className="bg-white border border-gray-200 text-gray-700 hover:text-primary hover:border-primary px-8 py-3 rounded-xl font-semibold transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-gray-300 dark:hover:text-white">
                        Contact Us
                    </button>
                </div>
            </div>
        </section>
    );
}
