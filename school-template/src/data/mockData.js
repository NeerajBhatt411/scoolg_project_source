export const schoolData = {
    hero: {
        badge: "EDUCATION FOR TOMORROW",
        title: "[School Name Placeholder]",
        description: "Empowering students through innovative learning, state-of-the-art facilities, and a commitment to academic excellence. Join us in shaping the leaders of tomorrow.",
        ctaPrimary: "Admissions Open",
        ctaSecondary: "Learn More",
        mainImage: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop",
        floatingStats: {
            title: "Enrollment",
            value: "2,500+",
            sub: "Active Students"
        }
    },
    leadership: [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2074&auto=format&fit=crop",
            name: "Mr. Satish Adhikari",
            title: "Principal",
            description: "\"Leading with vision and passion to ensure every student reaches their full potential.\""
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2070&auto=format&fit=crop",
            name: "Ms. Anjali Sharma",
            title: "Vice Principal",
            description: "\"Dedicated to academic rigor and creating a nurturing environment for student growth.\""
        },
        {
            id: 3,
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop",
            name: "Mr. Vicky Shah",
            title: "Dean of Academic",
            description: "\"Innovating the curriculum to prepare students for the challenges of the modern world.\""
        }
    ],
    about: {
        title: "About Us",
        description: "Founded in 1995, ScoolG has been at the forefront of education, blending tradition with modern technology to provide a holistic learning experience.",
        cards: [
            {
                title: "Our Mission",
                icon: "Target",
                description: "To foster a spirit of inquiry and empower students with knowledge."
            },
            {
                title: "Our Vision",
                icon: "Star",
                description: "To be a global leader in education, nurturing creative and ethical leaders."
            }
        ]
    },
    levels: [
        { id: 1, title: "Primary School", grade: "Grade 1-5", icon: "BookOpen", desc: "A strong foundation for young minds to explore and develop an interest in learning new things." },
        { id: 2, title: "Middle School", grade: "Grade 6-10", icon: "BookMarked", desc: "Fostering independence, critical thinking skills, and a deeper understanding of core subjects." },
        { id: 3, title: "Senior Secondary", grade: "Grade 11-12", icon: "GraduationCap", desc: "Preparing students for higher education, competitive exams, and their future career pathways." }
    ],
    academics: [
        { id: 1, title: "Holistic Curriculum", icon: "Library", desc: "A comprehensive approach blending academics with real-world skills and future readiness." },
        { id: 2, title: "Board Affiliated", icon: "ShieldCheck", desc: "Recognized by leading educational boards for maintaining global learning standards." },
        { id: 3, title: "Qualified Teachers", icon: "BookUser", desc: "Our faculty comprises certified experts dedicated to nurturing every student's potential." }
    ],
    notices: {
        featured: {
            id: 1,
            title: "Annual Sports Day 2024 Schedule",
            date: "Oct 12, 2024",
            excerpt: "Get ready for the biggest event of the year! Check the schedules for various track and field events. We invite all parents to be a part of this energetic celebration.",
        },
        list: [
            { id: 2, title: "Examination Form Deadlines - Term 1", date: "Oct 05, 2024" },
            { id: 3, title: "Parent Teacher Meeting Guidelines", date: "Oct 02, 2024" },
            { id: 4, title: "Weekend Extra Coaching Classes", date: "Sep 28, 2024" },
            { id: 5, title: "Art Competition - All India Level", date: "Sep 25, 2024" }
        ]
    },
    galleryTabs: ["All", "Lab", "Library", "Sports", "Classroom"],
    gallery: [
        { id: 1, category: "Classroom", url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2064&auto=format&fit=crop", isLarge: true },
        { id: 2, category: "Lab", url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070&auto=format&fit=crop", isLarge: false },
        { id: 3, category: "Library", url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=2070&auto=format&fit=crop", isLarge: false },
        { id: 4, category: "Sports", url: "https://images.unsplash.com/photo-1574629810360-7efbbc0b1e45?q=80&w=2064&auto=format&fit=crop", isLarge: false },
        { id: 5, category: "Classroom", url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2073&auto=format&fit=crop", isLarge: false }
    ],
    pricing: [
        {
            level: "Primary",
            price: "4,500",
            period: "/per year",
            features: ["All Activities", "Doubt Sessions", "Basic Facilities"],
            isFeatured: false
        },
        {
            level: "Secondary",
            price: "6,000",
            period: "/per year",
            features: ["Lab Access", "Specialized Coaches", "Career Mentoring", "Advanced Facilities"],
            isFeatured: true
        },
        {
            level: "Senior Secondary",
            price: "7,500",
            period: "/per year",
            features: ["Competitive Exam Prep", "Digital Library", "Internship Programs"],
            isFeatured: false
        }
    ],
    contact: {
        address: "123 School Street, Education Hub, NY 10001",
        phone: "+1 (555) 123-4567",
        email: "contact@scoolg.com"
    }
};
