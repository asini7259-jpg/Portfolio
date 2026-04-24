// DOM Elements
const html = document.documentElement;
const themeToggleBtn = document.getElementById('theme-toggle');
const autofillBtn = document.getElementById('autofill-btn');
const form = document.getElementById('analyzer-form');
const resetBtn = document.getElementById('reset-form-btn');
const reanalyzeBtn = document.getElementById('reanalyze-btn');
const uiuxRatingSlider = document.getElementById('uiuxRating');
const ratingVal = document.getElementById('rating-val');
const fileInput = document.getElementById('resumeUpload');
const fileNameDisplay = document.getElementById('file-name');
const downloadPdfBtn = document.getElementById('download-pdf-btn');

// Sections
const formSection = document.getElementById('form-section');
const loadingSection = document.getElementById('loading-section');
const resultsSection = document.getElementById('results-section');

// Chart instance
let breakdownChartInstance = null;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Load preferred theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Form inputs real-time validation highlights
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            if(input.validity.valid) {
                input.style.borderColor = 'var(--success)';
            } else {
                input.style.borderColor = '';
            }
        });
    });
});

// Theme Toggle Logic
themeToggleBtn.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    
    // Update chart colors if chart exists
    if(breakdownChartInstance) {
        updateChartTheme();
    }
});

function updateThemeIcon(theme) {
    const icon = themeToggleBtn.querySelector('i');
    if(theme === 'dark') {
        icon.className = 'fa-solid fa-moon';
    } else {
        icon.className = 'fa-solid fa-sun';
    }
}

// Slider update logic
uiuxRatingSlider.addEventListener('input', (e) => {
    ratingVal.textContent = e.target.value;
});

// File input update logic
fileInput.addEventListener('change', (e) => {
    if(e.target.files.length > 0) {
        fileNameDisplay.textContent = e.target.files[0].name;
    } else {
        fileNameDisplay.textContent = 'Choose a file...';
    }
});

// Autofill Demo Data
autofillBtn.addEventListener('click', () => {
    const demoProfiles = [
        {
            name: "Jane Doe",
            email: "jane.dev@example.com",
            skills: "HTML, CSS, JavaScript, React, Node.js",
            techs: ['git', 'figma'],
            projectCount: "4",
            projectDesc: "1. E-commerce dashboard using React.\n2. RESTful API with Node.js and Express.\n3. Personal portfolio.\n4. Weather app using APIs.",
            github: "https://github.com/janedoe",
            portfolio: "https://janedoe.dev",
            rating: 8
        },
        {
            name: "Alex Smith",
            email: "alex.python@example.com",
            skills: "Python, Django, SQL, PostgreSQL, Docker",
            techs: ['git', 'docker', 'linux'],
            projectCount: "3",
            projectDesc: "1. Data scraping tool using Python.\n2. E-learning backend API with Django.\n3. Server automation scripts on AWS.",
            github: "https://github.com/alexsmith",
            portfolio: "",
            rating: 6
        },
        {
            name: "Sam Wilson",
            email: "sam.uiux@example.com",
            skills: "HTML, CSS, Figma, UI/UX, Tailwind",
            techs: ['figma'],
            projectCount: "5",
            projectDesc: "1. SaaS app landing page mockups.\n2. Mobile app wireframes.\n3. CSS design system.\n4. Bakery website re-design.\n5. Custom portfolio themes.",
            github: "",
            portfolio: "https://samdesigns.co",
            rating: 9
        },
        {
            name: "Chris Lee",
            email: "chris.fs@example.com",
            skills: "MongoDB, Express, React, Node.js, TypeScript",
            techs: ['git', 'docker', 'aws', 'linux', 'jest'],
            projectCount: "6",
            projectDesc: "1. Real-time chat app.\n2. Full-stack MERN task system.\n3. React Native expense tracker.\n4. Stripe payment integration.\n5. Dockerized deployment.",
            github: "https://github.com/chrislee",
            portfolio: "https://chris.dev",
            rating: 7
        }
    ];

    const randomProfile = demoProfiles[Math.floor(Math.random() * demoProfiles.length)];

    document.getElementById('fullName').value = randomProfile.name;
    document.getElementById('email').value = randomProfile.email;
    document.getElementById('skills').value = randomProfile.skills;
    
    const techSelect = document.getElementById('techKnown');
    Array.from(techSelect.options).forEach(opt => {
        opt.selected = randomProfile.techs.includes(opt.value);
    });

    document.getElementById('projectCount').value = randomProfile.projectCount;
    document.getElementById('projectDesc').value = randomProfile.projectDesc;
    document.getElementById('githubLink').value = randomProfile.github;
    document.getElementById('portfolioLink').value = randomProfile.portfolio;
    
    uiuxRatingSlider.value = randomProfile.rating;
    ratingVal.textContent = randomProfile.rating;
    
    // Clear error borders if previously triggered
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => input.style.borderColor = '');

    showToast('Randomized demo data inserted!', 'success');
});

// Reset Form
resetBtn.addEventListener('click', () => {
    form.reset();
    ratingVal.textContent = "5";
    fileNameDisplay.textContent = 'Choose a file...';
    
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => input.style.borderColor = '');
    
    showToast('Form cleared.', 'warning');
});

// Re-analyze
reanalyzeBtn.addEventListener('click', () => {
    resultsSection.classList.add('hidden');
    formSection.classList.remove('hidden');
    window.scrollTo(0,0);
});

// Toast notification function
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass = 'fa-circle-check';
    if(type === 'error') iconClass = 'fa-circle-exclamation';
    if(type === 'warning') iconClass = 'fa-triangle-exclamation';
    
    toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${message}</span>`;
    
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove after 3s
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Form Submission -> Analysis Logic
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const emailInput = document.getElementById('email');
    const emailValue = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
        showToast('Please enter a valid email address.', 'error');
        emailInput.style.borderColor = 'var(--danger)';
        return;
    }
    
    const rawSkills = document.getElementById('skills').value;
    const skills = rawSkills.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
    
    // Validate custom skills to ensure they aren't gibberish like "abc"
    const validSkillsDB = ['html', 'css', 'javascript', 'js', 'react', 'node.js', 'node', 'python', 'java', 'c++', 'c#', 'c', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust', 'typescript', 'ts', 'angular', 'vue', 'vue.js', 'sql', 'mysql', 'postgresql', 'mongodb', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'github', 'gitlab', 'linux', 'bash', 'figma', 'ui/ux', 'machine learning', 'ai', 'data science', 'django', 'flask', 'spring', 'spring boot', 'express', 'sass', 'tailwind', 'bootstrap', 'firebase', 'graphql', 'rest api', 'api', 'jenkins', 'ci/cd', 'agile', 'scrum', 'react native', 'flutter', 'dart', 'solidity', 'web3', 'blockchain', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'excel', 'powerbi', 'tableau', 'jest', 'cypress', 'mocha', 'next', 'next.js', 'nest', 'nestjs', 'svelte', 'redis', 'elasticsearch'];
    
    let recognizedCount = 0;
    for (const s of skills) {
        if (validSkillsDB.includes(s)) {
            recognizedCount++;
        }
    }

    if (recognizedCount === 0 && skills.length > 0) {
        showToast('Please enter valid technical skills (e.g., React, Python).', 'error');
        document.getElementById('skills').style.borderColor = 'var(--danger)';
        return; // Prevent further execution
    }
    
    // Switch to loading view
    formSection.classList.add('hidden');
    loadingSection.classList.remove('hidden');
    window.scrollTo(0,0);
    
    // Extract Form Data
    const data = {
        name: document.getElementById('fullName').value.trim(),
        skills: document.getElementById('skills').value.split(',').map(s => s.trim()).filter(s => s),
        techs: Array.from(document.getElementById('techKnown').selectedOptions).map(opt => opt.value),
        projectCount: parseInt(document.getElementById('projectCount').value, 10),
        projectDesc: document.getElementById('projectDesc').value.trim(),
        github: document.getElementById('githubLink').value.trim(),
        portfolio: document.getElementById('portfolioLink').value.trim(),
        hasResume: fileInput.files.length > 0,
        uiuxRating: parseInt(uiuxRatingSlider.value, 10)
    };

    // Simulate network delay for effect
    setTimeout(() => {
        analyzePortfolio(data);
    }, 1500);
});


// Analysis Engine
function analyzePortfolio(data) {
    let scores = {
        completeness: 0,
        skills: 0,
        projects: 0,
        links: 0,
        presentation: 0
    };
    
    let feedback = [];

    // 1. Completeness (Max 20)
    let filledFields = 0;
    const optionalFieldsCount = 2; // github, portfolio
    if(data.github) filledFields++;
    if(data.portfolio) filledFields++;
    
    // Assume base fields are filled due to HTML required validation
    scores.completeness = 10 + (filledFields * 5); // Base 10 + 5 per optional link
    if (scores.completeness < 20) {
        if(!data.github) feedback.push({ type: 'warning', icon: 'fa-github', title: 'Missing GitHub', msg: 'Adding a GitHub link significantly improves your profile visibility.' });
        if(!data.portfolio) feedback.push({ type: 'warning', icon: 'fa-globe', title: 'Missing Portfolio Link', msg: 'A live portfolio link serves as the best proof of your skills.' });
    } else {
        feedback.push({ type: 'success', icon: 'fa-check', title: 'Great Profile Completeness', msg: 'You have provided all the crucial links.' });
    }

    // 2. Skills Diversity (Max 20)
    const totalSkills = data.skills.length + data.techs.length;
    if (totalSkills >= 8) {
        scores.skills = 20;
        feedback.push({ type: 'success', icon: 'fa-layer-group', title: 'Strong Skillset', msg: 'Your array of skills and technologies shows great versatility.' });
    } else if (totalSkills >= 4) {
        scores.skills = 15;
        feedback.push({ type: 'warning', icon: 'fa-book', title: 'Expand Your Skills', msg: 'Consider learning and listing a few more modern tools or frameworks.' });
    } else {
        scores.skills = 8;
        feedback.push({ type: 'error', icon: 'fa-triangle-exclamation', title: 'Limited Technologies', msg: 'You should definitely add more relevant skills to be competitive.' });
    }

    // 3. Project Quality (Max 25)
    // Based on quantity and keyword density/length
    let projectScore = 0;
    if (data.projectCount >= 4) projectScore += 12;
    else if (data.projectCount >= 2) projectScore += 8;
    else projectScore += 4;

    const descWords = data.projectDesc.split(/\s+/).length;
    if (descWords > 80) projectScore += 13;
    else if (descWords > 30) projectScore += 8;
    else projectScore += 3;

    scores.projects = projectScore;
    if (data.projectCount < 3) {
        feedback.push({ type: 'warning', icon: 'fa-folder-open', title: 'Add More Real-World Projects', msg: 'Aim for at least 3-4 solid projects to showcase your abilities.'});
    }
    if (descWords < 40) {
        feedback.push({ type: 'warning', icon: 'fa-pen-to-square', title: 'Elaborate Project Descriptions', msg: 'Detail the problem, your solution, and the tech stack used in your projects.'});
    }

    // 4. Links & Resume Availability (Max 20)
    let linksScore = 0;
    if (data.github) linksScore += 8;
    if (data.portfolio) linksScore += 8;
    if (data.hasResume) linksScore += 4;
    scores.links = linksScore;
    
    if (!data.hasResume) {
        feedback.push({ type: 'warning', icon: 'fa-file-pdf', title: 'Include a Resume', msg: 'Always have a downloadable resume available for recruiters.' });
    }

    // 5. Presentation / UI UX Rating (Max 15)
    // Convert 1-10 slider to max 15 points
    scores.presentation = Math.round((data.uiuxRating / 10) * 15);
    if(data.uiuxRating < 7) {
        feedback.push({ type: 'warning', icon: 'fa-palette', title: 'Enhance UI/UX Design', msg: 'Your self-rating for UI is low. Consider referring to SaaS dashboards for design inspiration.'});
    } else {
        feedback.push({ type: 'success', icon: 'fa-star', title: 'Confident Design', msg: 'You rated your UI/UX highly. Great job prioritizing aesthetics.'});
    }

    // 6. Determine Suggested Role
    const role = determineRole(data.skills, data.techs, data.projectDesc);
    const roleBadge = document.getElementById('role-badge');
    const roleText = document.getElementById('role-text');
    roleText.textContent = role;
    roleBadge.classList.remove('hidden');

    // Calculate Total
    const totalScore = scores.completeness + scores.skills + scores.projects + scores.links + scores.presentation;

    // Save to localStorage
    const reportData = {
        timestamp: new Date().toISOString(),
        score: totalScore,
        breakdown: scores
    };
    localStorage.setItem('lastAnalysis', JSON.stringify(reportData));

    // Render Results
    renderResults(totalScore, scores, feedback);
}

function renderResults(total, breakdowns, feedback) {
    loadingSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');

    // 1. Setup Circular Progress animation
    const circle = document.getElementById('score-circle');
    const scoreText = document.getElementById('total-score');
    const scoreMsg = document.getElementById('score-message');
    
    // Animate score from 0 to total
    let currentScore = 0;
    let stepTime = 15;
    let duration = 1000;
    let steps = duration / stepTime;
    let increment = total / steps;

    circle.style.background = `conic-gradient(var(--input-bg) 360deg, var(--input-bg) 0deg)`;

    let timer = setInterval(() => {
        currentScore += increment;
        if(currentScore >= total) {
            currentScore = total;
            clearInterval(timer);
        }
        scoreText.innerText = Math.round(currentScore);
        
        // Define color based on score
        let colorCode = 'var(--accent-color)';
        if(total >= 80) colorCode = 'var(--success)';
        else if(total < 50) colorCode = 'var(--danger)';
        else if(total < 70) colorCode = 'var(--warning)';

        scoreText.style.color = colorCode;
        circle.style.background = `conic-gradient(${colorCode} ${currentScore * 3.6}deg, var(--input-bg) 0deg)`;
    }, stepTime);

    // Set Message
    if(total >= 85) scoreMsg.textContent = "Outstanding Profile! You represent a top-tier candidate.";
    else if(total >= 65) scoreMsg.textContent = "Good Profile. A few tweaks will make you stand out.";
    else scoreMsg.textContent = "Needs Improvement. Please focus on the feedback below.";

    // 2. Render Chart
    renderChart(breakdowns);

    // 3. Render Feedback
    const feedbackList = document.getElementById('feedback-list');
    feedbackList.innerHTML = '';
    
    // Sort feedback: place errors/warnings first
    feedback.sort((a,b) => {
        if(a.type === 'error') return -1;
        if(a.type === 'warning' && b.type === 'success') return -1;
        return 1;
    });

    feedback.forEach(item => {
        const li = document.createElement('li');
        
        let colorVar = 'var(--accent-color)';
        if(item.type === 'success') colorVar = 'var(--success)';
        if(item.type === 'warning') colorVar = 'var(--warning)';
        if(item.type === 'error') colorVar = 'var(--danger)';
        
        li.style.borderLeftColor = colorVar;

        li.innerHTML = `
            <i class="fa-solid ${item.icon}" style="color: ${colorVar}"></i>
            <div class="text">
                <h4 style="color: ${colorVar}">${item.title}</h4>
                <p>${item.msg}</p>
            </div>
        `;
        feedbackList.appendChild(li);
    });
}

function renderChart(breakdowns) {
    const ctx = document.getElementById('breakdownChart').getContext('2d');
    
    // Destroy previous instance to avoid overlap
    if(breakdownChartInstance) {
        breakdownChartInstance.destroy();
    }

    const { completeness, skills, projects, links, presentation } = breakdowns;

    const dataValues = [completeness, skills, projects, links, presentation];
    const labels = [
        'Completeness (20)', 
        'Skills (20)', 
        'Projects (25)', 
        'Links/Ref (20)', 
        'Presentation (15)'
    ];

    const isDark = html.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#f8fafc' : '#334155';
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    breakdownChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Points Earned',
                data: dataValues,
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: '#6366F1',
                pointBackgroundColor: '#6366F1',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#6366F1',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: gridColor },
                    grid: { color: gridColor },
                    pointLabels: {
                        color: textColor,
                        font: { family: "'Inter', sans-serif", size: 12, weight: '500' }
                    },
                    ticks: {
                        color: textColor,
                        backdropColor: 'transparent',
                        max: 25,
                        min: 0,
                        stepSize: 5
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: isDark ? '#1E293B' : '#fff',
                    titleColor: isDark ? '#fff' : '#000',
                    bodyColor: isDark ? '#cbd5e1' : '#475569',
                    borderColor: gridColor,
                    borderWidth: 1,
                    padding: 10,
                    boxPadding: 4,
                    usePointStyle: true,
                    titleFont: { family: 'Poppins', size: 14 }
                }
            }
        }
    });
}

function updateChartTheme() {
    if(!breakdownChartInstance) return;
    
    const isDark = html.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#f8fafc' : '#334155';
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const tooltipBg = isDark ? '#1E293B' : '#fff';
    const tooltipTitle = isDark ? '#fff' : '#000';
    const tooltipBody = isDark ? '#cbd5e1' : '#475569';

    // Update scales
    const rScale = breakdownChartInstance.options.scales.r;
    rScale.angleLines.color = gridColor;
    rScale.grid.color = gridColor;
    rScale.pointLabels.color = textColor;
    rScale.ticks.color = textColor;

    // Update tooltip
    const tooltip = breakdownChartInstance.options.plugins.tooltip;
    tooltip.backgroundColor = tooltipBg;
    tooltip.titleColor = tooltipTitle;
    tooltip.bodyColor = tooltipBody;
    tooltip.borderColor = gridColor;

    breakdownChartInstance.update();
}

// Role Evaluation Engine
function determineRole(skills, techs, desc) {
    const combinedText = [...skills, ...techs, desc].join(' ').toLowerCase();
    
    const roles = {
        'Frontend Developer': ['html', 'css', 'react', 'vue', 'angular', 'figma', 'tailwind', 'sass', 'frontend', 'ui/ux'],
        'Backend Developer': ['node', 'express', 'python', 'django', 'java', 'spring', 'sql', 'mongodb', 'backend', 'api', 'postgres'],
        'Full Stack Developer': ['fullstack', 'full-stack', 'mern', 'mean', 'stack'],
        'Data Scientist / ML Engineer': ['python', 'pandas', 'machine learning', 'tensorflow', 'pytorch', 'data', 'numpy', 'ai', 'scikit'],
        'DevOps Engineer': ['docker', 'kubernetes', 'aws', 'linux', 'ci/cd', 'jenkins', 'devops', 'cloud', 'azure', 'deployment'],
        'Mobile App Developer': ['react native', 'flutter', 'swift', 'kotlin', 'android', 'ios', 'mobile']
    };

    let roleScores = {};
    for (let role in roles) {
        roleScores[role] = 0;
        roles[role].forEach(keyword => {
            if (combinedText.includes(keyword)) {
                roleScores[role]++;
            }
        });
    }

    // Boost Full Stack if both Frontend and Backend keywords are high
    if (roleScores['Frontend Developer'] >= 2 && roleScores['Backend Developer'] >= 2) {
        roleScores['Full Stack Developer'] += 3;
    }

    let maxScore = 0;
    let bestRole = 'Software Developer';

    for (let role in roleScores) {
        if (roleScores[role] > maxScore) {
            maxScore = roleScores[role];
            bestRole = role;
        }
    }

    return maxScore > 0 ? bestRole : 'Software Developer';
}

// PDF Download Logic
downloadPdfBtn.addEventListener('click', () => {
    // Hide buttons for cleaner PDF
    const actions = document.querySelector('.dashboard-actions');
    actions.style.display = 'none';
    
    // Optional: Switch briefly to light mode for better PDF export if preferred
    // ...

    const element = document.getElementById('results-section');
    const opt = {
        margin:       0.5,
        filename:     'Portfolio_Analysis_Report.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // Use html2pdf
    html2pdf().set(opt).from(element).save().then(() => {
        // Restore buttons
        actions.style.display = 'flex';
        showToast('PDF Downloaded successfully!', 'success');
    });
});
