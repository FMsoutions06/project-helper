import OpenAI from "https://cdn.jsdelivr.net/npm/openai/+esm";


class WebsiteProjectHelper {
    constructor() {
        this.apiKey = localStorage.getItem('openai_api_key') || '';
        this.client = null;
        this.currentUser = JSON.parse(localStorage.getItem('current_user')) || null;
        
        this.initializeElements();
        this.bindEvents();
        this.initializeOpenAI();
        this.updateAuthUI();
    }

    initializeOpenAI() {
        if (this.apiKey) {
            this.client = new OpenAI({
                apiKey: this.apiKey,
                dangerouslyAllowBrowser: true
            });
        }
    }

    initializeElements() {
        // Navigation elements
        this.navLinks = document.querySelectorAll('.nav-link');
        
        // Category elements
        this.categoryCards = document.querySelectorAll('.category-card');
        
        // Chatbot elements
        this.chatToggle = document.getElementById('chatToggle');
        this.chatContainer = document.getElementById('chatbotContainer');
        this.closeChat = document.getElementById('closeChat');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendMessage = document.getElementById('sendMessage');
        
        // Auth elements
        this.loginBtn = document.getElementById('loginBtn');
        this.signupBtn = document.getElementById('signupBtn');
        this.loginModal = document.getElementById('loginModal');
        this.signupModal = document.getElementById('signupModal');
        this.closeLogin = document.getElementById('closeLogin');
        this.closeSignup = document.getElementById('closeSignup');
        this.loginForm = document.getElementById('loginForm');
        this.signupForm = document.getElementById('signupForm');
        this.showSignup = document.getElementById('showSignup');
        this.showLogin = document.getElementById('showLogin');
    }

    bindEvents() {
        // Navigation events
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(link);
            });
        });

        // Category card events
        this.categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                this.handleCategoryClick(card);
            });
        });

        // Chatbot events
        this.chatToggle.addEventListener('click', () => this.toggleChat());
        this.closeChat.addEventListener('click', () => this.toggleChat());
        this.sendMessage.addEventListener('click', () => this.handleSendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSendMessage();
            }
        });

        // Auth events
        this.loginBtn.addEventListener('click', () => this.showModal('login'));
        this.signupBtn.addEventListener('click', () => this.showModal('signup'));
        this.closeLogin.addEventListener('click', () => this.hideModal('login'));
        this.closeSignup.addEventListener('click', () => this.hideModal('signup'));
        this.showSignup.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('login');
            this.showModal('signup');
        });
        this.showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('signup');
            this.showModal('login');
        });

        // Form events
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.signupForm.addEventListener('submit', (e) => this.handleSignup(e));

        // Close modals on overlay click
        this.loginModal.addEventListener('click', (e) => {
            if (e.target === this.loginModal) this.hideModal('login');
        });
        this.signupModal.addEventListener('click', (e) => {
            if (e.target === this.signupModal) this.hideModal('signup');
        });

        // Search functionality
        const searchInput = document.querySelector('.search-input');
        const searchBtn = document.querySelector('.search-btn');
        
        searchBtn.addEventListener('click', () => this.handleSearch(searchInput.value));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch(searchInput.value);
            }
        });
    }

    handleNavigation(link) {
        // Remove active class from all links
        this.navLinks.forEach(l => l.classList.remove('active'));
        // Add active class to clicked link
        link.classList.add('active');
        
        // Smooth scroll to section
        const target = link.getAttribute('href');
        if (target.startsWith('#')) {
            const section = document.querySelector(target);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    handleCategoryClick(card) {
        const category = card.dataset.category;
        this.showNotification(`Opening ${category} development section...`, 'info');
        
        // Add visual feedback
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);

        // Simulate navigation to category page
        setTimeout(() => {
            this.loadCategoryPage(category);
        }, 500);
    }

    loadCategoryPage(category) {
        const categoryData = {
            web: {
                title: 'Web Development',
                description: 'Build modern web applications',
                tools: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB']
            },
            mobile: {
                title: 'Mobile Development',
                description: 'Create mobile apps for iOS and Android',
                tools: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase']
            },
            game: {
                title: 'Game Development',
                description: 'Design and develop engaging games',
                tools: ['Unity', 'Unreal Engine', 'C#', 'C++', 'Blender']
            },
            ai: {
                title: 'AI & Machine Learning',
                description: 'Build intelligent applications',
                tools: ['Python', 'TensorFlow', 'PyTorch', 'OpenAI', 'Scikit-learn']
            }
        };

        const data = categoryData[category];
        if (data) {
            this.showNotification(`Welcome to ${data.title}! Tools: ${data.tools.join(', ')}`, 'success');
            
            // Auto-open chatbot with category-specific message
            if (!this.chatContainer.classList.contains('active')) {
                this.toggleChat();
            }
            
            setTimeout(() => {
                this.addBotMessage(`I see you're interested in ${data.title}! ${data.description}. I can help you get started with ${data.tools.join(', ')} and answer any questions you have. What would you like to know?`);
            }, 1000);
        }
    }

    toggleChat() {
        this.chatContainer.classList.toggle('active');
        
        if (this.chatContainer.classList.contains('active')) {
            this.chatInput.focus();
        }
    }

    async handleSendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        // Add user message
        this.addUserMessage(message);
        this.chatInput.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            let response;
            if (this.client && this.apiKey) {
                // Use OpenAI API
                response = await this.callOpenAI(message);
            } else {
                // Use fallback responses
                response = this.generateFallbackResponse(message);
            }
            
            this.hideTypingIndicator();
            this.addBotMessage(response);
        } catch (error) {
            this.hideTypingIndicator();
            this.addBotMessage("I'm having trouble connecting right now. Please check your API key in the settings or try again later.");
            console.error('Chat error:', error);
        }
    }

    async callOpenAI(message) {
        const response = await this.client.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful development assistant for a website project helper platform. You specialize in web development, mobile development, game development, and AI/ML. Provide practical, actionable advice and code examples when appropriate.'
                },
                {
                    role: 'user',
                    content: message
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        return response.choices[0].message.content;
    }

    generateFallbackResponse(message) {
        const responses = {
            web: [
                "For web development, I recommend starting with HTML, CSS, and JavaScript fundamentals. Would you like me to suggest a project structure?",
                "Modern web development often uses frameworks like React, Vue, or Angular. What type of website are you planning to build?",
                "Responsive design is crucial for modern websites. I can help you with CSS Grid, Flexbox, and media queries."
            ],
            mobile: [
                "Mobile development has great options like React Native for cross-platform apps or native development with Swift/Kotlin.",
                "For mobile apps, consider your target audience and platform. React Native is great for reaching both iOS and Android users.",
                "Mobile UI/UX is different from web. Focus on touch interactions, navigation patterns, and performance optimization."
            ],
            game: [
                "Game development can start with engines like Unity (C#) or Unreal Engine (C++/Blueprints). What genre interests you?",
                "For beginners, I recommend starting with 2D games using tools like Unity or even web-based games with JavaScript.",
                "Game design involves programming, art, sound, and gameplay mechanics. Which aspect would you like to focus on first?"
            ],
            ai: [
                "AI and ML projects often start with Python and libraries like TensorFlow or PyTorch. What problem are you trying to solve?",
                "Machine learning requires good data. Data collection, cleaning, and preprocessing are crucial first steps.",
                "For AI applications, consider starting with pre-trained models and APIs before building from scratch."
            ],
            general: [
                "I'm here to help with your development projects! I can assist with web development, mobile apps, games, and AI/ML.",
                "What type of project are you working on? I can provide guidance on technologies, best practices, and getting started.",
                "Development can be challenging but rewarding. What specific area would you like help with today?"
            ]
        };

        const lowerMessage = message.toLowerCase();
        let category = 'general';

        if (lowerMessage.includes('web') || lowerMessage.includes('html') || lowerMessage.includes('css') || lowerMessage.includes('javascript')) {
            category = 'web';
        } else if (lowerMessage.includes('mobile') || lowerMessage.includes('app') || lowerMessage.includes('ios') || lowerMessage.includes('android')) {
            category = 'mobile';
        } else if (lowerMessage.includes('game') || lowerMessage.includes('unity') || lowerMessage.includes('unreal')) {
            category = 'game';
        } else if (lowerMessage.includes('ai') || lowerMessage.includes('ml') || lowerMessage.includes('machine learning') || lowerMessage.includes('python')) {
            category = 'ai';
        }

        const categoryResponses = responses[category];
        return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
    }

    addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'user-message';
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
            </div>
            <div class="message-content">
                <p>${message}</p>
            </div>
        `;
        this.chatMessages.appendChild(messageDiv);
        this.scrollChatToBottom();
    }

    addBotMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'bot-message';
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect width="18" height="10" x="3" y="11" rx="2"/>
                    <circle cx="12" cy="5" r="2"/>
                    <path d="m12 7 0 4"/>
                    <path d="m8 12 0 5"/>
                    <path d="m16 12 0 5"/>
                </svg>
            </div>
            <div class="message-content">
                <p>${message}</p>
            </div>
        `;
        this.chatMessages.appendChild(messageDiv);
        this.scrollChatToBottom();
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'bot-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect width="18" height="10" x="3" y="11" rx="2"/>
                    <circle cx="12" cy="5" r="2"/>
                    <path d="m12 7 0 4"/>
                    <path d="m8 12 0 5"/>
                    <path d="m16 12 0 5"/>
                </svg>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        this.chatMessages.appendChild(typingDiv);
        this.scrollChatToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollChatToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    showModal(type) {
        const modal = type === 'login' ? this.loginModal : this.signupModal;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    hideModal(type) {
        const modal = type === 'login' ? this.loginModal : this.signupModal;
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Simulate login process
        if (email && password) {
            const user = {
                id: Date.now(),
                email: email,
                name: email.split('@')[0],
                loginTime: new Date()
            };

            this.currentUser = user;
            localStorage.setItem('current_user', JSON.stringify(user));
            
            this.hideModal('login');
            this.updateAuthUI();
            this.showNotification(`Welcome back, ${user.name}!`, 'success');
        } else {
            this.showNotification('Please fill in all fields', 'error');
        }
    }

    handleSignup(e) {
        e.preventDefault();
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        if (firstName && lastName && email && password) {
            const user = {
                id: Date.now(),
                email: email,
                name: `${firstName} ${lastName}`,
                firstName: firstName,
                lastName: lastName,
                signupTime: new Date()
            };

            this.currentUser = user;
            localStorage.setItem('current_user', JSON.stringify(user));
            
            this.hideModal('signup');
            this.updateAuthUI();
            this.showNotification(`Welcome to DevHelper, ${user.name}!`, 'success');
        } else {
            this.showNotification('Please fill in all fields', 'error');
        }
    }

    updateAuthUI() {
        if (this.currentUser) {
            this.loginBtn.textContent = this.currentUser.name;
            this.loginBtn.onclick = () => this.handleLogout();
            this.signupBtn.style.display = 'none';
        } else {
            this.loginBtn.textContent = 'Login';
            this.loginBtn.onclick = () => this.showModal('login');
            this.signupBtn.style.display = 'block';
        }
    }

    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('current_user');
        this.updateAuthUI();
        this.showNotification('Logged out successfully', 'info');
    }

    handleSearch(query) {
        if (!query.trim()) return;
        
        this.showNotification(`Searching for: "${query}"`, 'info');
        
        // Simulate search results
        setTimeout(() => {
            const searchResults = [
                'React Tutorial for Beginners',
                'Mobile App Development Guide',
                'Game Development with Unity',
                'AI/ML Project Templates'
            ];
            
            const randomResult = searchResults[Math.floor(Math.random() * searchResults.length)];
            this.showNotification(`Found: ${randomResult}`, 'success');
        }, 1000);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            z-index: 3000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            font-weight: 500;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
}

// Add CSS for typing indicator and notifications
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .typing-dots {
        display: flex;
        gap: 4px;
        padding: 8px 0;
    }
    
    .typing-dots span {
        width: 8px;
        height: 8px;
        background: #6b7280;
        border-radius: 50%;
        animation: typing 1.4s infinite;
    }
    
    .typing-dots span:nth-child(2) {
        animation-delay: 0.2s;
    }
    
    .typing-dots span:nth-child(3) {
        animation-delay: 0.4s;
    }
    
    @keyframes typing {
        0%, 60%, 100% {
            transform: translateY(0);
        }
        30% {
            transform: translateY(-10px);
        }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(additionalStyles);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new WebsiteProjectHelper();
});