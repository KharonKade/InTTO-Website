document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed. Running main.js");

    // --- 1. DEFAULT PROJECT DATA ---
    const defaultProjects = [
        {
            id: 15, views: 204, inquiries: 15, title: "FarmConnect", type: "Thesis", industry: "Agritech", college: "College of Business", trl: "TRL 4",
            shortDescription: "Digital cooperative management system for highland farmers.", userId:"default",
            imageUrls: ["https://via.placeholder.com/500x350.png?text=FarmConnect+Image"],
            detailedDescription: "This innovative project addresses critical challenges in the agritech sector through cutting-edge technology and research. Developed by students and faculty from the College of Business, the initiative showcases the University of the Cordilleras' commitment to innovation and community impact. The project demonstrates significant potential for commercialization and has garnered interest from industry partners and potential investors. With its current Technology Readiness Level (TRL) of 4, the team is actively seeking collaboration opportunities to advance the project toward market deployment.",
            problemStatement: "Communities in the Cordillera region face unique challenges in agritech, requiring localized solutions that account for geographical, cultural, and economic factors. Traditional approaches have proven insufficient in addressing these complex needs.",
            solution: "FarmConnect leverages innovative technology to provide a sustainable, scalable solution tailored to the unique needs of the Cordillera region. By combining local insights with cutting-edge research, the project delivers measurable impact while remaining accessible and affordable for the target community.",
            features: [
                {title: "Innovation", description: "Novel approach combining technology with local knowledge"},
                {title: "Sustainability", description: "Environmentally conscious design with long-term viability"},
                {title: "Scalability", description: "Designed for expansion across similar communities"},
                {title: "Community Impact", description: "Direct benefits to local stakeholders and communities"}
            ],
            startDate: "October 2025", teamSize: "4-6 members",
            founderName: "Dr. Maria Santos", founderRole: "Project Lead & Principal Investigator", founderAffiliation: "College of Business, University of the Cordilleras", founderEmail: "maria.santos@uc-bcf.edu.ph", founderPhone: "+63 917 123 4567"
        },
        {
            id: 14, views: 150, inquiries: 10, title: "VeggieTrack", type: "Capstone", industry: "Agritech", college: "College of Computer Studies", trl: "TRL 5",
            shortDescription: "IoT-based supply chain monitoring for vegetable produce from farm to.", userId:"default",
            imageUrls: ["https://via.placeholder.com/500x350.png?text=VeggieTrack+Image"],
            detailedDescription: "VeggieTrack ensures transparency and quality in the vegetable supply chain through real-time IoT monitoring from harvest to consumer. The project demonstrates significant potential for commercialization and has garnered interest from industry partners and potential investors. With its current Technology Readiness Level (TRL) of 5, the team is actively seeking collaboration opportunities to advance the project toward market deployment.",
            problemStatement: "Vegetable farmers face significant post-harvest losses and price uncertainty due to lack of supply chain visibility and quality degradation during transport.",
            solution: "IoT sensors and blockchain technology track produce conditions throughout the supply chain, providing traceability, quality assurance, and fair pricing mechanisms.",
            features: [
                {title: "Real-Time Tracking", description: "GPS and condition monitoring during transport"},
                {title: "Quality Sensors", description: "Temperature and humidity tracking"},
                {title: "Blockchain Ledger", description: "Immutable record of supply chain journey"},
                {title: "Price Transparency", description: "Fair market pricing information"}
            ],
            startDate: "February 2025", teamSize: "4-6 members",
            founderName: "Prof. Antonio Bautista", founderRole: "Capstone Project Adviser", founderAffiliation: "College of Computer Studies, University of the Cordilleras", founderEmail: "a.bautista@uc-bcf.edu.ph", founderPhone: "+63 917 890 1234"
        },
        {
            id: 13, views: 301, inquiries: 25, title: "SafeCity", type: "Capstone", industry: "Crimintech", college: "College of Computer Studies", trl: "TRL 5",
            shortDescription: "Community-based crime reporting and prevention mobile application.", userId:"default",
            imageUrls: ["https://via.placeholder.com/500x350.png?text=SafeCity+Image"],
            detailedDescription: "SafeCity aims to enhance community safety by providing a user-friendly mobile platform for reporting incidents and receiving timely alerts. Developed by students from the College of Computer Studies, this project leverages technology to foster a more connected and secure environment.",
            problemStatement: "Delayed crime reporting and lack of real-time safety information can hinder effective prevention and response efforts within communities. Existing channels may be slow or inaccessible to some residents.",
            solution: "A mobile application allowing residents to quickly report incidents (anonymously if desired), view a map of recent activity, and receive official safety alerts, empowering community members and aiding local authorities.",
            features: [
                {title: "Incident Reporting", description: "Easy submission of crime or safety concerns"},
                {title: "Safety Alerts", description: "Push notifications for official warnings"},
                {title: "Activity Map", description: "Visual representation of reported incidents"},
                {title: "Optional Anonymity", description: "Users can choose to submit reports anonymously"}
            ],
            startDate: "March 2025", teamSize: "3-5 members",
            founderName: "Prof. Juan Dela Cruz", founderRole: "Capstone Adviser", founderAffiliation: "College of Computer Studies, University of the Cordilleras", founderEmail: "j.delacruz@uc-bcf.edu.ph", founderPhone: "+63 917 111 2222"
        },
        {
            id: 12, views: 220, inquiries: 12, title: "MediCord", type: "Capstone", industry: "Healthtech", college: "College of Nursing", trl: "TRL 4",
            shortDescription: "AI-powered health monitoring for rural clinics.", userId:"default",
            imageUrls: ["https://via.placeholder.com/500x350.png?text=MediCord+Image"],
            detailedDescription: "MediCord brings advanced diagnostic capabilities to rural health centers through AI-powered health monitoring and decision support systems. The project demonstrates significant potential for commercialization and has garnered interest from industry partners and potential investors. With its current Technology Readiness Level (TRL) of 4, the team is actively seeking collaboration opportunities to advance the project toward market deployment.",
            problemStatement: "Rural clinics lack diagnostic equipment and specialist expertise, leading to delayed or inaccurate diagnoses and patient referrals to distant hospitals.",
            solution: "AI-powered diagnostic tools that analyze symptoms, vital signs, and medical images to provide decision support for rural healthcare workers.",
            features: [
                {title: "AI Diagnosis", description: "Machine learning diagnostic assistance"},
                {title: "Vital Signs Monitoring", description: "Continuous patient monitoring"},
                {title: "Image Analysis", description: "X-ray and ultrasound interpretation"},
                {title: "Referral System", description: "Smart patient triage and referrals"}
            ],
            startDate: "December 2024", teamSize: "4-6 members",
            founderName: "Prof. Grace Ramos", founderRole: "Project Supervisor", founderAffiliation: "College of Nursing, University of the Cordilleras", founderEmail: "g.ramos@uc-bcf.edu.ph", founderPhone: "+63 917 224 5501"
        },
        {
            id: 11, views: 88, inquiries: 5, title: "CraftConnect", type: "Thesis", industry: "Fintech", college: "College of Architecture", trl: "TRL 4",
            shortDescription: "Digital marketplace connecting indigenous craftspeople with global.", userId:"default",
            imageUrls: ["https://via.placeholder.com/500x350.png?text=CraftConnect+Image"],
            detailedDescription: "CraftConnect preserves and promotes indigenous craftsmanship while providing economic opportunities for artisans in the Cordillera region through a modern e-commerce platform. The project demonstrates significant potential for commercialization and has garnered interest from industry partners and potential investors. With its current Technology Readiness Level (TRL) of 4, the team is actively seeking collaboration opportunities to advance the project toward market deployment.",
            problemStatement: "Indigenous craftspeople struggle to access broader markets due to geographical isolation and lack of digital infrastructure, resulting in limited income opportunities and potential loss of traditional skills.",
            solution: "A dedicated marketplace platform that showcases indigenous crafts to global audiences while providing fair trade mechanisms, cultural storytelling, and logistical support for artisan communities.",
            features: [
                {title: "Cultural Storytelling", description: "Rich narratives behind each craft and artisan"},
                {title: "Fair Trade", description: "Transparent pricing ensuring artisan benefits"},
                {title: "Quality Assurance", description: "Authentication and quality verification system"},
                {title: "Logistics Support", description: "Streamlined shipping and payment processing"}
            ],
            startDate: "September 2024", teamSize: "4-6 members",
            founderName: "Dr. Patricia Gomez", founderRole: "Project Coordinator", founderAffiliation: "College of Architecture, University of the Cordilleras", founderEmail: "p.gomez@uc-bcf.edu.ph", founderPhone: "+63 917 557 8901"
        },
        {
            id: 10, views: 450, inquiries: 30, title: "NutriTrack", type: "Startup", industry: "Healthtech", college: "College of Nursing", trl: "TRL 5",
            shortDescription: "AI-powered nutrition monitoring app for maternal and child health.", userId:"default",
            imageUrls: ["https://via.placeholder.com/500x350.png?text=NutriTrack+Image"],
            detailedDescription: "NutriTrack revolutionizes maternal and child healthcare through advanced AI technology. This comprehensive nutrition monitoring platform provides real-time insights and personalized recommendations to improve health outcomes in underserved communities. The project demonstrates significant potential for commercialization and has garnered interest from industry partners and potential investors. With its current Technology Readiness Level (TRL) of 5, the team is actively seeking collaboration opportunities to advance the project toward market deployment.",
            problemStatement: "Maternal and child malnutrition remains a critical challenge in the Cordillera region, with limited access to professional nutrition monitoring and guidance. Healthcare workers struggle to track and manage multiple cases efficiently.",
            solution: "Using artificial intelligence and mobile technology, NutriTrack enables healthcare workers and mothers to monitor nutritional status, receive alerts for concerning trends, and access evidence-based feeding recommendations tailored to local dietary practices.",
            features: [
                {title: "AI Analysis", description: "Machine learning algorithms for nutrition assessment"},
                {title: "Mobile Access", description: "Easy-to-use smartphone interface for all users"},
                {title: "Real-time Alerts", description: "Immediate notifications for health concerns"},
                {title: "Cultural Adaptation", description: "Localized recommendations based on regional foods"}
            ],
            startDate: "August 2024", teamSize: "3-5 members",
            founderName: "Prof. Jennifer Dela Cruz", founderRole: "Research Adviser", founderAffiliation: "College of Nursing, University of the Cordilleras", founderEmail: "j.delacruz@uc-bcf.edu.ph", founderPhone: "+63 917 234 5678"
        },
        {
            id: 9, views: 120, inquiries: 8, title: "CrimSight", type: "Research", industry: "Crimintech", college: "College of Arts & Sciences", trl: "TRL 5",
            shortDescription: "Digital forensic analysis toolkit for local law enforcement.", userId:"default",
            imageUrls: ["https://via.placeholder.com/500x350.png?text=CrimSight+Image"],
            detailedDescription: "CrimSight provides affordable digital forensic capabilities to local law enforcement agencies, enabling them to investigate cybercrimes and digital evidence effectively. The project demonstrates significant potential for commercialization and has garnered interest from industry partners and potential investors. With its current Technology Readiness Level (TRL) of 5, the team is actively seeking collaboration opportunities to advance the project toward market deployment.",
            problemStatement: "Local police units lack the tools and expertise for digital forensics, limiting their ability to investigate modern crimes involving digital evidence.",
            solution: "A user-friendly toolkit that automates common digital forensic procedures and provides guided workflows for non-expert investigators.",
            features: [
                {title: "Automated Analysis", description: "Pre-configured forensic procedures"},
                {title: "User Friendly", description: "Interface designed for non-specialists"},
                {title: "Evidence Chain", description: "Maintains legal chain of custody"},
                {title: "Training Modules", description: "Built-in investigator training"}
            ],
            startDate: "August 2024", teamSize: "3-5 members",
            founderName: "Prof. Diana Santiago", founderRole: "Research Director", founderAffiliation: "College of Arts & Sciences, University of the Cordilleras", founderEmail: "d.santiago@uc-bcf.edu.ph", founderPhone: "+63 917 456 0123"
        },
        {
            id: 8, views: 95, inquiries: 7, title: "EcoBlock", type: "Thesis", industry: "Sustainability", college: "College of Engineering", trl: "TRL 3",
            shortDescription: "Sustainable concrete blend using local bio-waste materials.", userId:"default",
            imageUrls: ["https://via.placeholder.com/500x350.png?text=EcoBlock+Image"],
            detailedDescription: "EcoBlock develops environmentally sustainable construction materials by incorporating local agricultural waste into concrete production. The project demonstrates significant potential for commercialization and has garnered interest from industry partners and potential investors. With its current Technology Readiness Level (TRL) of 3, the team is actively seeking collaboration opportunities to advance the project toward market deployment.",
            problemStatement: "Traditional concrete production is carbon-intensive, while agricultural waste disposal creates environmental problems in the region.",
            solution: "A novel concrete blend incorporating rice husks, coffee grounds, and other local bio-waste materials, reducing environmental impact while maintaining structural integrity.",
            features: [
                {title: "Carbon Reduction", description: "Lower CO2 emissions than traditional concrete"},
                {title: "Waste Utilization", description: "Converts agricultural waste to value"},
                {title: "Local Materials", description: "Uses readily available regional biomass"},
                {title: "Cost Effective", description: "Competitive pricing with traditional concrete"}
            ],
            startDate: "July 2024", teamSize: "2-4 members",
            founderName: "Engr. Carlos Mendoza", founderRole: "Thesis Adviser", founderAffiliation: "College of Engineering, University of the Cordilleras", founderEmail: "c.mendoza@uc-bcf.edu.ph", founderPhone: "+63 917 113 4560"
        },
        {
            id: 7, views: 180, inquiries: 11, title: "WaterSense", type: "Research", industry: "Sustainability", college: "College of Engineering", trl: "TRL 4",
            shortDescription: "Smart water quality monitoring system for Baguio's watershed areas.", userId:"default",
            imageUrls: ["https://via.placeholder.com/500x350.png?text=WaterSense+Image"],
            detailedDescription: "WaterSense addresses critical water quality concerns in Baguio's watershed areas through IoT-enabled monitoring and early warning systems. The project demonstrates significant potential for commercialization and has garnered interest from industry partners and potential investors. With its current Technology Readiness Level (TRL) of 4, the team is actively seeking collaboration opportunities to advance the project toward market deployment.",
            problemStatement: "Watershed areas face increasing pollution threats, but traditional monitoring methods are labor-intensive and provide delayed results, limiting effective intervention.",
            solution: "Deployed sensor networks continuously monitor water quality parameters, providing real-time data and automated alerts to authorities and communities when contamination is detected.",
            features: [
                {title: "IoT Sensors", description: "Continuous monitoring of key water parameters"},
                {title: "Early Warning", description: "Automated alerts for contamination events"},
                {title: "Data Analytics", description: "Trend analysis and predictive insights"},
                {title: "Community Access", description: "Public dashboard for transparency"}
            ],
            startDate: "June 2024", teamSize: "3-5 members",
            founderName: "Engr. Thomas Aquino", founderRole: "Research Supervisor", founderAffiliation: "College of Engineering, University of the Cordilleras", founderEmail: "t.aquino@uc-bcf.edu.ph", founderPhone: "+63 917 878 9012"
        },
        {
            id: 6, views: 75, inquiries: 3, title: "LearnHub CAR", type: "Research", industry: "Edutech", college: "College of Teacher Education", trl: "TRL 5",
            shortDescription: "Adaptive learning platform for indigenous communities in the.", userId:"default",
            imageUrls: ["https://via.placeholder.com/500x350.png?text=LearnHub+CAR+Image"],
            detailedDescription: "LearnHub CAR creates culturally responsive educational content and adaptive learning experiences for indigenous learners in the Cordillera Administrative Region. The project demonstrates significant potential for commercialization and has garnered interest from industry partners and potential investors. With its current Technology Readiness Level (TRL) of 5, the team is actively seeking collaboration opportunities to advance the project toward market deployment.",
            problemStatement: "Indigenous students face educational disadvantages due to curriculum that doesn't reflect their cultural context and language, leading to lower engagement and achievement.",
            solution: "An adaptive learning platform that incorporates indigenous languages, cultural knowledge, and learning styles while meeting national curriculum standards.",
            features: [
                {title: "Cultural Content", description: "Curriculum aligned with indigenous knowledge"},
                {title: "Multi-language", description: "Supports Cordillera indigenous languages"},
                {title: "Adaptive Learning", description: "Personalized learning paths"},
                {title: "Offline Access", description: "Works in low-connectivity areas"}
            ],
            startDate: "May 2024", teamSize: "5-7 members",
            founderName: "Dr. Elena Cordero", founderRole: "Principal Investigator", founderAffiliation: "College of Teacher Education, University of the Cordilleras", founderEmail: "e.cordero@uc-bcf.edu.ph", founderPhone: "+63 917 901 2345"
        },
        {
            id: 5, views: 512, inquiries: 45, title: "HealthBridge", type: "Startup", industry: "Healthtech", college: "College of Nursing", trl: "TRL 6",
            shortDescription: "Telemedicine platform connecting rural patients with urban healthcare", userId:"default",
            imageUrls: ["https://via.placeholder.com/500x350.png?text=HealthBridge+Image"],
            detailedDescription: "HealthBridge breaks down geographical barriers to healthcare access by connecting rural patients with qualified medical professionals through an integrated telemedicine platform. The project demonstrates significant potential for commercialization and has garnered interest from industry partners and potential investors. With its current Technology Readiness Level (TRL) of 6, the team is actively seeking collaboration opportunities to advance the project toward market deployment.",
            problemStatement: "Rural communities face severe healthcare access challenges due to distance from medical facilities, shortage of healthcare workers, and high transportation costs.",
            solution: "A comprehensive telemedicine platform enabling video consultations, digital prescriptions, and remote monitoring, bringing quality healthcare to underserved rural areas.",
            features: [
                {title: "Video Consultation", description: "HIPAA-compliant secure video calls"},
                {title: "E-Prescriptions", description: "Digital prescription and pharmacy integration"},
                {title: "Health Records", description: "Centralized patient health information"},
                {title: "Local Partnerships", description: "Network of rural health units and clinics"}
            ],
            startDate: "April 2024", teamSize: "6-8 members",
            founderName: "Dr. Sarah Fernandez", founderRole: "Startup Mentor & Co-founder", founderAffiliation: "College of Nursing, University of the Cordilleras", founderEmail: "s.fernandez@uc-bcf.edu.ph", founderPhone: "+63 917 789 0123"
        },
        {
            id: 4, views: 60, inquiries: 2, title: "GreenArch", type: "Research", industry: "Sustainability", college: "College of Architecture", trl: "TRL 3",
            shortDescription: "Passive cooling design framework for tropical highland architecture.", userId:"default",
            imageUrls: ["https://via.placeholder.com/500x350.png?text=GreenArch+Image"],
            detailedDescription: "GreenArch pioneers sustainable architectural solutions for the unique climate conditions of tropical highland regions. This research-based framework integrates traditional knowledge with modern design principles. The project demonstrates significant potential for commercialization and has garnered interest from industry partners and potential investors. With its current Technology Readiness Level (TRL) of 3, the team is actively seeking collaboration opportunities to advance the project toward market deployment.",
            problemStatement: "High-land tropical architecture faces unique challenges in maintaining comfortable indoor temperatures without excessive energy consumption. Current building designs often rely heavily on mechanical cooling systems.",
            solution: "A comprehensive passive cooling framework that leverages natural ventilation, thermal mass, and strategic building orientation to reduce energy consumption while maintaining thermal comfort.",
            features: [
                {title: "Energy Efficiency", description: "Reduce cooling energy needs by up to 40%"},
                {title: "Local Materials", description: "Utilizes readily available regional building materials"},
                {title: "Traditional Integration", description: "Incorporates indigenous architectural wisdom"},
                {title: "Climate Responsive", description: "Adapted to highland tropical conditions"}
            ],
            startDate: "March 2024", teamSize: "2-4 members",
            founderName: "Arch. Roberto Villanueva", founderRole: "Lead Researcher", founderAffiliation: "College of Architecture, University of the Cordilleras", founderEmail: "r.villanueva@uc-bcf.edu.ph", founderPhone: "+63 917 345 6780"
        },
        {
            id: 3, views: 333, inquiries: 22, title: "Agrilera", type: "Startup", industry: "Agritech", college: "College of Engineering", trl: "TRL 6",
            shortDescription: "Automated tray-seeding and smart farming solution for Benguet farmers.", userId:"default",
            imageUrls: ["https://via.placeholder.com/500x350.png?text=Agrilera+Image"],
            detailedDescription: "Agrilera introduces an automated tray-seeding system designed to significantly improve efficiency and reduce labor costs for vegetable farmers. Coupled with smart farming sensors, this solution aims to optimize crop yields and resource management.",
            problemStatement: "Traditional tray seeding is a labor-intensive and time-consuming process for Benguet farmers. Additionally, optimizing irrigation and fertilization often relies on manual methods, leading to potential resource waste and inconsistent yields.",
            solution: "An automated seeding machine that precisely plants seeds into trays, dramatically increasing speed and consistency. Integrated sensors provide real-time data on soil moisture and nutrient levels, enabling data-driven smart farming decisions.",
            features: [
                {title: "Automated Seeding", description: "High-speed, precise planting in seedling trays"},
                {title: "Smart Sensors", description: "Real-time soil moisture and nutrient monitoring"},
                {title: "Labor Reduction", description: "Significantly decreases manual labor required"},
                {title: "Resource Optimization", description: "Efficient water and fertilizer use"}
            ],
            startDate: "January 2024", teamSize: "4-5 members",
            founderName: "Engr. Isabella Reyes", founderRole: "Project Lead & Co-founder", founderAffiliation: "College of Engineering, University of the Cordilleras", founderEmail: "i.reyes@uc-bcf.edu.ph", founderPhone: "+63 917 333 4444"
        },
        {
            id: 2, views: 210, inquiries: 19, title: "SunShare", type: "Startup", industry: "Sustainability", college: "College of Engineering", trl: "TRL 6",
            shortDescription: "Peer-to-peer solar energy trading platform connecting Baguio", userId:"default",
            imageUrls: ["https://via.placeholder.com/500x350.png?text=SunShare+Image"],
            detailedDescription: "SunShare enables households with solar panels to sell excess energy to neighbors, creating a decentralized and sustainable local energy grid. The project demonstrates significant potential for commercialization and has garnered interest from industry partners and potential investors. With its current Technology Readiness Level (TRL) of 6, the team is actively seeking collaboration opportunities to advance the project toward market deployment.",
            problemStatement: "Households with solar panels have no way to monetize excess energy production, while neighbors without solar continue to rely entirely on traditional power sources.",
            solution: "A blockchain-based platform for peer-to-peer energy trading within microgrids, allowing solar households to sell excess power to nearby residents.",
            features: [
                {title: "P2P Trading", description: "Direct energy transactions between neighbors"},
                {title: "Smart Metering", description: "Real-time energy production and consumption"},
                {title: "Blockchain Settlement", description: "Automated and transparent payments"},
                {title: "Carbon Credits", description: "Track and trade environmental impact"}
            ],
            startDate: "January 2024", teamSize: "5-7 members",
            founderName: "Engr. Luis Navarro", founderRole: "Startup Co-founder", founderAffiliation: "College of Computer Studies, University of the Cordilleras", founderEmail: "l.navarro@uc-bcf.edu.ph", founderPhone: "+63 917 567 0124"
        },
        {
            id: 1, views: 490, inquiries: 51, title: "FinGuard", type: "Startup", industry: "Fintech", college: "College of Business", trl: "TRL 7",
            shortDescription: "Blockchain-based microfinance platform for SMEs in the Cordillera", userId:"default",
            imageUrls: ["https://via.placeholder.com/500x350.png?text=FinGuard+Image"],
            detailedDescription: "FinGuard revolutionizes access to capital for small and medium enterprises through blockchain-enabled microfinance and transparent lending mechanisms. The project demonstrates significant potential for commercialization and has garnered interest from industry partners and potential investors. With its current Technology Readiness Level (TRL) of 7, the team is actively seeking collaboration opportunities to advance the project toward market deployment.",
            problemStatement: "SMEs in the region struggle to access traditional financing due to lack of collateral, credit history, and formal business documentation.",
            solution: "A blockchain-based platform that uses alternative credit scoring, peer-to-peer lending, and smart contracts to provide accessible, transparent microfinance.",
            features: [
                {title: "Alternative Credit", description: "AI-based scoring using business data"},
                {title: "Smart Contracts", description: "Automated and transparent loan agreements"},
                {title: "P2P Lending", description: "Community-funded loan opportunities"},
                {title: "Financial Literacy", description: "Built-in business training resources"}
            ],
            startDate: "November 2023", teamSize: "7-9 members",
            founderName: "Prof. Ramon Torres", founderRole: "Business Adviser & Mentor", founderAffiliation: "College of Business, University of the Cordilleras", founderEmail: "r.torres@uc-bcf.edu.ph", founderPhone: "+63 917 012 3456"
        }
    ];

    // --- 2. GLOBAL VARIABLES ---
    let allProjectsData = [];

    // --- 3. DOM ELEMENT REFERENCES (COMBINED) ---
    
    // --- Project Grid / Filter Elements ---
    const projectGrid = document.getElementById('project-list');
    const projectsCountHeader = document.getElementById('projects-count');
    const searchInput = document.getElementById('search-input');
    const industryFilter = document.getElementById('filter-industry');
    const collegeFilter = document.getElementById('filter-college');
    const trlFilter = document.getElementById('filter-trl');
    const typeFilter = document.getElementById('filter-type');
    const sortFilter = document.getElementById('filter-sort');
    const allDropdowns = document.querySelectorAll('.custom-dropdown');
    
    // --- Auth Modal Elements ---
    const authModalOverlay = document.getElementById('auth-modal-overlay');
    const signinPanel = document.getElementById('signin-panel');
    const signupPanel = document.getElementById('signup-panel');
    const openSigninBtn = document.getElementById('open-signin-btn');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const showSignupLink = document.getElementById('show-signup-link');
    const showSigninLink = document.getElementById('show-signin-link');
    const signoutBtnMain = document.getElementById('signout-btn-main');
    const userInfoContainer = document.getElementById('user-info-container');
    const userDisplayMain = document.getElementById('user-display-main');
    const submitProjectBtn = document.getElementById('submit-project-btn');

    // --- Alert Modal Elements ---
    const alertModalOverlay = document.getElementById('alert-modal-overlay');
    const alertModalOkBtn = document.getElementById('alert-modal-ok-btn');
    const alertModalMessage = document.getElementById('alert-modal-message');

    // --- Auth Form Elements ---
    const signinForm = document.getElementById('signin-form');
    const signinEmailInput = document.getElementById('signin-email-input');
    const signinPasswordInput = document.getElementById('signin-password-input');
    const signupForm = document.getElementById('signup-form');
    const signupFirstNameInput = document.getElementById('signup-first-name-input');
    const signupLastNameInput = document.getElementById('signup-last-name-input');
    const signupEmailInput = document.getElementById('signup-email-input');
    const signupPasswordInput = document.getElementById('signup-password-input');
    const signupPassword2Input = document.getElementById('signup-password2-input');
    const signupAffiliationInput = document.getElementById('signup-affiliation-input');
    const googleSigninBtn = document.getElementById('google-signin-btn');
    const googleSignupBtn = document.getElementById('google-signup-btn');

    // --- 4. FIREBASE PROVIDER ---
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    const ADMIN_EMAIL = "admin@ucolab.com";
    // --- 5. AUTH UI FUNCTIONS ---

    /**
     * Shows the main authentication modal.
     * @param {string} panelId - 'signin-panel' or 'signup-panel' to show initially.
     */
    function openAuthModal(panelId = 'signin-panel') {
        if (!authModalOverlay || !signinPanel || !signupPanel) return;
        signinPanel.classList.toggle('hidden', panelId !== 'signin-panel');
        signupPanel.classList.toggle('hidden', panelId !== 'signup-panel');
        authModalOverlay.classList.remove('modal-hidden');
        clearFormErrors();
    }

    /**
     * Hides the main authentication modal.
     */
    function closeAuthModal() {
        if (authModalOverlay) authModalOverlay.classList.add('modal-hidden');
    }

    /**
     * Shows a custom alert modal for errors or warnings.
     * @param {string} message - The message to display.
     */
    function showAlertModal(message) {
        if (!alertModalOverlay || !alertModalMessage) return;
        alertModalMessage.textContent = message;
        alertModalOverlay.classList.remove('modal-hidden');
    }

    /**
     * Hides the custom alert modal.
     */
    function closeAlertModal() {
        if (alertModalOverlay) alertModalOverlay.classList.add('modal-hidden');
    }

    /**
     * Displays an error message inside the specified form.
     * @param {HTMLElement} formElement - The sign-in or sign-up form.
     * @param {string} message - The error message.
     */
    function displayFormError(formElement, message) {
        if (!formElement) return;
        let errorElement = formElement.querySelector('.form-error-message');
        if (!errorElement) {
            errorElement = document.createElement('p');
            errorElement.className = 'form-error-message';
            const primaryBtn = formElement.querySelector('.btn-form-primary');
            const googleBtn = formElement.querySelector('.btn-google');
            const insertBeforeElement = primaryBtn || googleBtn || formElement.lastElementChild;
            if (insertBeforeElement) {
                formElement.insertBefore(errorElement, insertBeforeElement);
            } else {
                formElement.appendChild(errorElement);
            }
        }
        errorElement.textContent = `Error: ${message}`;
        errorElement.style.color = '#dc3545';
        errorElement.style.marginTop = '10px';
    }

    /**
     * Clears any error messages in both sign-in and sign-up forms.
     */
    function clearFormErrors() {
        document.querySelectorAll('.form-error-message').forEach(el => el.remove());
    }

    // --- 6. PROJECT AUTH ALERT ---
    /**
     * Prevents navigation and shows an alert if the user is not signed in.
     * @param {Event} e 
     */
    function showProjectAuthAlert(e) {
        e.preventDefault(); // Stop the link from navigating
        showAlertModal('You must be signed in to submit a project. Please sign in or create an account.');
    }

    /**
     * Handles submit project button click - either navigates or shows auth alert
     * @param {Event} e 
     */
    function handleSubmitProjectClick(e) {
        e.preventDefault();
        const currentUser = auth.currentUser;
        if (currentUser) {
            // User is signed in, navigate to submit page
            window.location.href = 'submit-project.html';
        } else {
            // User is not signed in, show alert
            showAlertModal('You must be signed in to submit a project. Please sign in or create an account.');
        }
    }

    // --- 7. MAIN UI UPDATE FUNCTION (COMBINED) ---
    /**
     * Updates the header UI based on the user's authentication state.
     * @param {firebase.User|null} user - The currently authenticated Firebase user.
     */
    function updateUI(user) {
        if (user) {
            // --- User is SIGNED IN ---
            if (openSigninBtn) openSigninBtn.classList.add('hidden');
            if (userInfoContainer) userInfoContainer.classList.remove('hidden');
            if (userDisplayMain) {
                const displayName = user.displayName || user.email;
                userDisplayMain.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    ${displayName.split('@')[0]}
                `;
            }
        } else {
            // --- User is SIGNED OUT ---
            if (openSigninBtn) openSigninBtn.classList.remove('hidden');
            if (userInfoContainer) userInfoContainer.classList.add('hidden');
        }
        
        // --- !! CRITICAL FIX !! ---
        // Re-render projects to show/hide edit/delete buttons
        renderProjects(); 
    }

    // --- 8. FIREBASE AUTH FUNCTIONS ---

    /**
     * Handles user registration with Email/Password.
     */
    async function handleSignUp(email, password, firstName, lastName) {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            await user.updateProfile({
                displayName: `${firstName} ${lastName}`
            });
            // Optional: Save additional user data (like affiliation) to Firestore
            // e.g., db.collection('users').doc(user.uid).set({ ... });
            closeAuthModal();
            console.log('User signed up and profile updated:', user);
        } catch (error) {
            displayFormError(signupForm, error.message);
            console.error('Sign Up Error:', error.code, error.message);
        }
    }

    /**
     * Handles user sign-in with Email/Password.
     */
    async function handleSignIn(email, password) {
    try {
        await auth.signInWithEmailAndPassword(email, password);
        console.log('User signed in successfully.');

        // --- NEW: Check if user is admin ---
        if (email === ADMIN_EMAIL) {
            // Admin user, redirect to admin page
            window.location.href = 'admin.html';
        } else {
            // Normal user, just close modal
            closeAuthModal();
        }
        // --- End of new code ---

    } catch (error) {
        displayFormError(signinForm, error.message);
        console.error('Sign In Error:', error.code, error.message);
    }
}

    /**
     * Handles Google Sign-In/Sign-Up using a pop-up window.
     */
    async function handleGoogleSignIn() {
    clearFormErrors();
    try {
        const result = await auth.signInWithPopup(googleProvider);
        const user = result.user;
        console.log("Google Sign-in successful:", user.displayName, user.email);

        // --- NEW: Check if user is admin ---
        if (user.email === ADMIN_EMAIL) {
            // Admin user, redirect to admin page
            window.location.href = 'admin.html';
        } else {
            // Normal user, just close modal
            closeAuthModal();
            if (result.additionalUserInfo.isNewUser) {
                console.log("New user signed up with Google.");
                setTimeout(() => {
                    showAlertModal("Welcome! Please complete your profile (Affiliation) to submit a project.");
                }, 500); 
            }
        }
        // --- End of new code ---

    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === 'auth/popup-closed-by-user') {
            console.log('Google Sign-In popup closed by user.');
            return;
        }
        console.error('Google Sign-In Error:', errorCode, errorMessage);
        const activeForm = signinPanel.classList.contains('hidden') ? signupForm : signinForm;
        displayFormError(activeForm, `Google Sign-In Failed: ${errorMessage}`);
    }
}

    /**
     * Handles user sign-out.
     */
    async function handleSignOut() {
        try {
            await auth.signOut();
            console.log('User signed out successfully.');
        } catch (error) {
            showAlertModal('Error signing out. Please try again.');
            console.error('Sign Out Error:', error.code, error.message);
        }
    }

    // --- 9. PROJECT RENDERING FUNCTIONS ---

    /**
     * Creates the HTML for a single project card.
     */
    function createProjectCardHTML(project) {
        if (!project || typeof project !== 'object') {
            console.error("Invalid project data for createProjectCardHTML:", project); return '';
        }
        
        const trlNumMatch = project.trl?.match(/TRL (\d+)/); const trlNum = trlNumMatch ? parseInt(trlNumMatch[1], 10) : 0; let trlClass = 'grey'; let trlText = project.trl || 'TRL ?'; if (trlNum <= 3) { trlClass = 'blue'; trlText = `TRL ${trlNum} – Proof of Concept`; } else if (trlNum <= 4) { trlClass = 'yellow'; trlText = `TRL ${trlNum} – Laboratory Testing`; } else if (trlNum <= 6) { trlClass = 'orange'; trlText = `TRL ${trlNum} – Prototype/Pilot`; } else if (trlNum <= 9) { trlClass = 'green'; trlText = `TRL ${trlNum} – System Prototype/Demo`; }
        let typeClass = 'grey'; if (project.type?.toLowerCase() === 'thesis') typeClass = 'blue'; else if (project.type?.toLowerCase() === 'capstone') typeClass = 'green'; else if (project.type?.toLowerCase() === 'research') typeClass = 'blue'; else if (project.type?.toLowerCase() === 'startup') typeClass = 'purple';
        let iconClass = 'icon-default'; if (project.industry?.toLowerCase() === 'agritech') iconClass = 'icon-agritech'; else if (project.industry?.toLowerCase() === 'healthtech') iconClass = 'icon-health'; else if (project.industry?.toLowerCase() === 'fintech') iconClass = 'icon-fintech'; else if (project.industry?.toLowerCase() === 'sustainability') iconClass = 'icon-sustainability'; else if (project.industry?.toLowerCase() === 'edutech') iconClass = 'icon-edutech'; else if (project.industry?.toLowerCase() === 'crimintech') iconClass = 'icon-security';

        const detailPageLink = (`project-detail.html?id=${project.id}`);

        // --- !! CRITICAL FIX !! ---
        // Check against the global Firebase auth object, NOT localStorage
        const currentUser = auth.currentUser;
        let showActions = false;
        if (currentUser) {
            // Check against email OR display name for flexibility
            showActions = (project.userId === currentUser.email || project.userId === currentUser.displayName);
        }

        return `
            <article class="project-card animate-on-scroll" data-id="${project.id}" data-views="${project.views || 0}" data-inquiries="${project.inquiries || 0}" data-title="${project.title || ''}" data-type="${project.type || ''}" data-industry="${project.industry || ''}" data-college="${project.college || ''}" data-trl="TRL ${trlNum}" data-user-id="${project.userId || ''}">
                <div class="card-icon ${iconClass}">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        ${iconClass === 'icon-agritech' ? '<path d="M17.2 9.2C17.2 9.2 16.4 14.8 12 14.8C7.6 14.8 6.8 9.2 6.8 9.2C6.8 6.2 9.1 4 12 4C14.9 4 17.2 6.2 17.2 9.2Z"></path><path d="M12 14.8V20"></path><path d="M10 18H14"></path><path d="M12 4C10.9 2.8 9.1 2 7 2"></path><path d="M12 4C13.1 2.8 14.9 2 17 2"></path>' : ''}
                        ${iconClass === 'icon-security' ? '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>' : ''}
                        ${iconClass === 'icon-health' ? '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>' : ''}
                        ${iconClass === 'icon-fintech' ? '<line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>' : ''}
                        ${iconClass === 'icon-sustainability' ? '<path d="M2 12s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z"></path><path d="M12 12s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z"></path><path d="M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"></path>' : ''}
                        ${iconClass === 'icon-edutech' ? '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 1 4 14.5V4.5A2.5 2.5 0 0 1 6.5 2z"></path>' : ''}
                        ${(iconClass === 'icon-default' || !iconClass.includes('icon-')) ? '<circle cx="12" cy="12" r="10"></circle>' : ''}
                    </svg>
                </div>
                <h3>${project.title || 'Untitled Project'}</h3>
                <div class="card-tags">${project.type ? `<span class="tag tag-${typeClass}">${project.type}</span>` : ''} ${project.industry ? `<span class="tag tag-grey">${project.industry}</span>` : ''}</div>
                <p class="card-college">${project.college || 'N/A'}</p>
                <p class="card-trl trl-${trlClass}">${trlText}</p>
                <p class="card-description">${project.shortDescription || 'No description available.'}</p>
                <div class="card-footer">
                    <a href="${detailPageLink}" class="card-link">View Details →</a>
                    ${showActions ? `<div class="card-actions"><button class="btn-edit" data-id="${project.id}">Edit</button><button class="btn-delete" data-id="${project.id}">Delete</button></div>` : ''}
                </div>
            </article>`;
    }

    /**
     * Loads all projects from localStorage or initializes with defaults.
     */
    function loadProjects() {
        console.log("Attempting to load projects...");
        try {
            const storedProjects = localStorage.getItem('ucolabProjects');
            if (!storedProjects || storedProjects === '[]' || storedProjects === 'null' || !storedProjects.startsWith('[')) {
                console.log("No valid projects found in localStorage. Loading default projects.");
                localStorage.setItem('ucolabProjects', JSON.stringify(defaultProjects));
                allProjectsData = [...defaultProjects];
            } else {
                allProjectsData = JSON.parse(storedProjects);
                if (!Array.isArray(allProjectsData)) {
                    console.warn("Parsed data is not an array. Falling back to defaults.");
                    localStorage.setItem('ucolabProjects', JSON.stringify(defaultProjects));
                    allProjectsData = [...defaultProjects];
                }
            }
            if (!Array.isArray(allProjectsData)) {
                console.error("allProjectsData is still not an array after loading!");
                allProjectsData = [];
            }
            console.log("Finished loading. Project count:", allProjectsData.length);
        } catch (error) {
            console.error("Error loading or initializing projects from localStorage:", error);
            console.log("Falling back to default projects due to error.");
            allProjectsData = [...defaultProjects];
            try {
                localStorage.setItem('ucolabProjects', JSON.stringify(defaultProjects));
            } catch (saveError) {
                console.error("Failed to save default projects after error:", saveError);
            }
        }
    }

    /**
     * Filters, sorts, and renders the projects to the grid.
     */
    function renderProjects() {
        console.log("renderProjects called");
        if (!projectGrid || !projectsCountHeader) {
            console.error("Missing project-list or projects-count element.");
            return;
        }

        if (!Array.isArray(allProjectsData)) {
            console.error("allProjectsData is not an array! Cannot render. Data:", allProjectsData);
            projectGrid.innerHTML = '<p class="no-projects-message">Error loading project data.</p>';
            projectsCountHeader.textContent = `0 Projects Found`;
            return;
        }

        const filters = {
            search: searchInput ? searchInput.value.toLowerCase() : '',
            industry: industryFilter?.querySelector('span:not(.visually-hidden)').textContent || 'All Industries',
            college: collegeFilter?.querySelector('span:not(.visually-hidden)').textContent || 'All Colleges',
            trl: trlFilter?.querySelector('span:not(.visually-hidden)').textContent || 'All TRL Levels',
            type: typeFilter?.querySelector('span:not(.visually-hidden)').textContent || 'All Types'
        };
        const sortByElement = sortFilter?.querySelector('span:not(.visually-hidden)');
        const sortBy = sortByElement ? sortByElement.textContent : 'Newest';


        const filteredData = allProjectsData.filter(project => {
            if (!project) return false;
            const searchMatch = (project.title?.toLowerCase().includes(filters.search) || project.shortDescription?.toLowerCase().includes(filters.search));
            const industryMatch = (filters.industry === 'All Industries') || (project.industry === filters.industry);
            const collegeMatch = (filters.college === 'All Colleges') || (project.college === filters.college);
            const trlMatch = (filters.trl === 'All TRL Levels') || (project.trl && project.trl.startsWith(filters.trl.split(' ')[0]));
            const typeMatch = (filters.type === 'All Types') || (project.type === filters.type);
            return searchMatch && industryMatch && collegeMatch && trlMatch && typeMatch;
        });

        filteredData.sort((a, b) => {
            switch (sortBy) {
                case 'Most Viewed': return (b.views || 0) - (a.views || 0);
                case 'Most Inquiries': return (b.inquiries || 0) - (a.inquiries || 0);
                case 'Newest': default: return (b.id || 0) - (a.id || 0);
            }
        });

        projectGrid.innerHTML = '';
        if (filteredData.length === 0) {
            console.log("No projects match filters.");
            projectGrid.innerHTML = '<p class="no-projects-message">No projects match the current filters.</p>';
        } else {
            filteredData.forEach(project => {
                if (project && project.id) {
                    projectGrid.innerHTML += createProjectCardHTML(project);
                } else {
                    console.warn("Skipping invalid project object during render:", project);
                }
            });
        }

        const count = filteredData.length;
        projectsCountHeader.textContent = `${count} Project${count === 1 ? '' : 's'} Found`;
        addEditDeleteListeners();
        setupScrollAnimations(); // Re-run observer setup
    }

    /**
     * Adds click listeners for edit/delete buttons.
     */
    function addEditDeleteListeners() {
        const editButtons = projectGrid.querySelectorAll('.btn-edit');
        const deleteButtons = projectGrid.querySelectorAll('.btn-delete');
        editButtons.forEach(button => button.addEventListener('click', handleEditClick));
        deleteButtons.forEach(button => button.addEventListener('click', handleDeleteClick));
    }

    function handleEditClick(event) {
        const projectId = event.target.dataset.id;
        console.log(`Edit clicked for project ID: ${projectId}`);
        window.open(`edit-project.html?id=${projectId}`, '_blank');
    }

    function handleDeleteClick(event) {
        const projectId = event.target.dataset.id;
        console.log(`Delete clicked for project ID: ${projectId}`);
        if (confirm(`Are you sure you want to delete this project? This action cannot be undone.`)) {
            deleteProject(projectId);
        }
    }

    function deleteProject(idToDelete) {
        try {
            let projects = JSON.parse(localStorage.getItem('ucolabProjects') || '[]');
            projects = projects.filter(project => String(project.id) !== String(idToDelete));
            localStorage.setItem('ucolabProjects', JSON.stringify(projects));
            loadProjects(); // Reload data array
            renderProjects(); // Re-render the grid
            console.log(`Project ID: ${idToDelete} deleted.`);
            alert("Project deleted successfully.");
        } catch(error) {
            console.error("Error deleting project:", error);
            alert("Could not delete the project.");
        }
    }

    // --- 10. OTHER UI FUNCTIONS ---

    /**
     * Closes all dropdowns except the current one.
     */
    function closeOtherDropdowns(currentDropdown) {
        allDropdowns.forEach(dropdown => {
            if (dropdown !== currentDropdown) {
                const menu = dropdown.querySelector('.dropdown-menu');
                if (menu) menu.classList.remove('show');
            }
        });
    }

    /**
     * Creates decorative background circles.
     */
    function createRandomCircles() {
        const body = document.body; if (!body) return;
        const circleCount = Math.floor(Math.random() * 6) + 5;
        const colors = ['#B9F8CF', '#cff8b9', '#b9eef8', '#f8b9d4', '#f8e0b9'];
        for (let i = 0; i < circleCount; i++) {
            const circle = document.createElement('div'); circle.classList.add('blur-circle');
            const size = Math.floor(Math.random() * 401) + 200;
            circle.style.width = `${size}px`; circle.style.height = `${size}px`;
            circle.style.top = `${Math.random() * 140 - 20}vh`; circle.style.left = `${Math.random() * 140 - 20}vw`;
            circle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            circle.style.filter = `blur(${Math.floor(Math.random() * 101) + 100}px)`;
            circle.style.opacity = Math.random() * 0.4 + 0.3;
            body.prepend(circle);
        }
    }

    /**
     * Sets up the Intersection Observer for scroll animations.
     */
    function setupScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        if ("IntersectionObserver" in window) {
            if (window.scrollObserver) {
                window.scrollObserver.disconnect();
            }
            window.scrollObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1 
            });
            animatedElements.forEach(el => {
                if (!el.classList.contains('is-visible')) {
                    window.scrollObserver.observe(el);
                }
            });
        } else {
            animatedElements.forEach(el => {
                el.classList.add('is-visible');
            });
        }
    }

    // --- 11. INITIALIZATION & EVENT LISTENERS ---
    
    // --- Filter/Search Listeners ---
    allDropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        if (toggle && menu) {
            toggle.addEventListener('click', () => {
                closeOtherDropdowns(dropdown);
                menu.classList.toggle('show');
            });
            menu.querySelectorAll('li').forEach(item => {
                item.addEventListener('click', () => {
                    const spanToUpdate = toggle.querySelector('span:not(.visually-hidden)');
                    if (spanToUpdate) spanToUpdate.textContent = item.textContent;
                    menu.classList.remove('show');
                    renderProjects();
                });
            });
        }
    });
    window.addEventListener('click', function(e) {
        if (!e.target.closest('.custom-dropdown')) {
            closeOtherDropdowns(null);
        }
    });
    if (searchInput) searchInput.addEventListener('input', renderProjects);

    // --- Auth Modal Listeners ---
    if (openSigninBtn) {
        openSigninBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openAuthModal('signin-panel');
        });
    }
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeAuthModal);
    }
    if (alertModalOkBtn) {
        alertModalOkBtn.addEventListener('click', closeAlertModal);
    }
    if (authModalOverlay) {
        authModalOverlay.addEventListener('click', (e) => {
            if (e.target === authModalOverlay) {
                closeAuthModal();
            }
        });
    }
    if (alertModalOverlay) {
        alertModalOverlay.addEventListener('click', (e) => {
            if (e.target === alertModalOverlay) {
                closeAlertModal();
            }
        });
    }
    if (showSignupLink) {
        showSignupLink.addEventListener('click', (e) => {
            e.preventDefault();
            clearFormErrors();
            signinPanel.classList.add('hidden');
            signupPanel.classList.remove('hidden');
        });
    }
    if (showSigninLink) {
        showSigninLink.addEventListener('click', (e) => {
            e.preventDefault();
            clearFormErrors();
            signupPanel.classList.add('hidden');
            signinPanel.classList.remove('hidden');
        });
    }
    if (signinForm) {
        signinForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearFormErrors();
            handleSignIn(signinEmailInput.value, signinPasswordInput.value);
        });
    }
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearFormErrors();
            if (signupPasswordInput.value !== signupPassword2Input.value) {
                displayFormError(signupForm, 'Passwords do not match.');
                return;
            }
            if (signupPasswordInput.value.length < 6) {
                displayFormError(signupForm, 'Password must be at least 6 characters.');
                return;
            }
            handleSignUp(signupEmailInput.value, signupPasswordInput.value, signupFirstNameInput.value, signupLastNameInput.value);
        });
    }
    if (signoutBtnMain) {
        signoutBtnMain.addEventListener('click', (e) => {
            e.preventDefault();
            handleSignOut();
        });
    }
    if (googleSigninBtn) {
        googleSigninBtn.addEventListener('click', handleGoogleSignIn);
    }
    if (googleSignupBtn) {
        googleSignupBtn.addEventListener('click', handleGoogleSignIn);
    }

    // --- Submit Project Button Listener ---
    if (submitProjectBtn) {
        submitProjectBtn.addEventListener('click', handleSubmitProjectClick);
    }
if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', handleGoogleSignIn);
}

// --- NEW: Add this listener for the admin link ---
const adminLoginLink = document.getElementById('admin-login-link');
if (adminLoginLink) {
    adminLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        // Just open the normal sign-in modal
        openAuthModal('signin-panel'); 
    });
}
// --- End of new code ---
    // --- CRITICAL: FIREBASE AUTH STATE LISTENER ---
    // This is the "controller" that runs on page load and on auth changes.
    auth.onAuthStateChanged((user) => {
        console.log("Auth state changed, user:", user);
        updateUI(user); // This updates the header and ATTACHES/REMOVES the 'Submit Project' listener
        
        if (!user) {
            // Ensure sign-in panel is default when modal opens
            if(signinPanel && signupPanel) {
                signinPanel.classList.remove('hidden');
                signupPanel.classList.add('hidden');
            }
        }
        // updateUI() already calls renderProjects(), so it's handled.
    });

    // --- INITIAL PAGE LOAD ---
    console.log("Running initial load sequence...");
    loadProjects();         // Load project data from localStorage
    createRandomCircles();  // Create decorative circles
    
    // Note: We don't call renderProjects() or updateUI() here.
    // The `auth.onAuthStateChanged` listener above will fire automatically
    // on page load and will call `updateUI(user)`, which in turn
    // calls `renderProjects()`. This ensures everything happens
    // in the correct order.
    
    console.log("Initial load sequence complete. Waiting for auth state change.");

}); // --- END OF DOMCONTENTLOADED ---