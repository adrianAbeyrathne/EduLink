const mongoose = require('mongoose');

// Schema for tracking user activity and progress milestones
const UserProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    // Profile completion tracking
    profileCompletionStatus: {
        basicInfo: { type: Boolean, default: false }, // name, email, age filled
        profilePicture: { type: Boolean, default: false },
        bio: { type: Boolean, default: false },
        subjects: { type: Boolean, default: false },
        preferences: { type: Boolean, default: false }
    },
    profileCompletionPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    
    // Activity milestones for new users
    activityMilestones: {
        firstLogin: { 
            completed: { type: Boolean, default: false },
            completedAt: Date,
            points: { type: Number, default: 10 }
        },
        completedProfile: { 
            completed: { type: Boolean, default: false },
            completedAt: Date,
            points: { type: Number, default: 50 }
        },
        firstSession: { 
            completed: { type: Boolean, default: false },
            completedAt: Date,
            points: { type: Number, default: 25 }
        },
        firstHelp: { 
            completed: { type: Boolean, default: false },
            completedAt: Date,
            points: { type: Number, default: 15 }
        },
        weeklyStreak: { 
            completed: { type: Boolean, default: false },
            completedAt: Date,
            points: { type: Number, default: 100 }
        }
    },
    
    // User level based on activity
    userLevel: {
        type: String,
        enum: ['newcomer', 'beginner', 'intermediate', 'advanced', 'expert'],
        default: 'newcomer'
    },
    
    // Points system
    totalPoints: {
        type: Number,
        default: 0
    },
    
    // Activity statistics for existing users
    activityStats: {
        sessionsCompleted: { type: Number, default: 0 },
        helpRequested: { type: Number, default: 0 },
        resourcesAccessed: { type: Number, default: 0 },
        loginStreak: { type: Number, default: 0 },
        lastActiveDate: Date,
        weeklyGoal: { type: Number, default: 3 }, // sessions per week
        weeklyProgress: { type: Number, default: 0 }
    },
    
    // Achievements unlocked
    achievements: [{
        name: String,
        description: String,
        unlockedAt: { type: Date, default: Date.now },
        points: Number
    }],
    
    // Feature access levels (progressive unlocking)
    featureAccess: {
        basicDashboard: { type: Boolean, default: true },
        advancedAnalytics: { type: Boolean, default: false },
        mentorMode: { type: Boolean, default: false },
        customization: { type: Boolean, default: false },
        premiumFeatures: { type: Boolean, default: false }
    },
    
    // New user onboarding progress
    onboardingStatus: {
        isNewUser: { type: Boolean, default: true },
        currentStep: { type: Number, default: 1 },
        totalSteps: { type: Number, default: 5 },
        completedSteps: [Number],
        skippedOnboarding: { type: Boolean, default: false }
    },
    
    // Experience categorization
    experienceLevel: {
        type: String,
        enum: ['new', 'returning', 'experienced', 'veteran'],
        default: 'new'
    }
}, {
    timestamps: true
});

// Calculate profile completion percentage
UserProgressSchema.methods.calculateProfileCompletion = function() {
    const statuses = this.profileCompletionStatus;
    const total = Object.keys(statuses).length;
    const completed = Object.values(statuses).filter(status => status === true).length;
    this.profileCompletionPercentage = Math.round((completed / total) * 100);
    return this.profileCompletionPercentage;
};

// Determine user experience level based on activity
UserProgressSchema.methods.updateExperienceLevel = function() {
    const { totalPoints, activityStats, onboardingStatus } = this;
    
    if (onboardingStatus.isNewUser && totalPoints < 100) {
        this.experienceLevel = 'new';
        this.userLevel = 'newcomer';
    } else if (totalPoints >= 100 && totalPoints < 500) {
        this.experienceLevel = 'returning';
        this.userLevel = 'beginner';
    } else if (totalPoints >= 500 && totalPoints < 1500) {
        this.experienceLevel = 'experienced';
        this.userLevel = 'intermediate';
    } else {
        this.experienceLevel = 'veteran';
        this.userLevel = 'advanced';
    }
    
    // Update feature access based on level
    this.updateFeatureAccess();
};

// Progressive feature unlocking
UserProgressSchema.methods.updateFeatureAccess = function() {
    const { userLevel, profileCompletionPercentage } = this;
    
    // Basic features always available
    this.featureAccess.basicDashboard = true;
    
    // Advanced analytics unlocked at 50% profile completion
    if (profileCompletionPercentage >= 50) {
        this.featureAccess.advancedAnalytics = true;
    }
    
    // Mentor mode for intermediate+ users
    if (userLevel === 'intermediate' || userLevel === 'advanced' || userLevel === 'expert') {
        this.featureAccess.mentorMode = true;
    }
    
    // Customization unlocked after completing profile
    if (profileCompletionPercentage >= 80) {
        this.featureAccess.customization = true;
    }
};

// Add achievement
UserProgressSchema.methods.unlockAchievement = function(achievementName, description, points) {
    const existingAchievement = this.achievements.find(a => a.name === achievementName);
    if (!existingAchievement) {
        this.achievements.push({
            name: achievementName,
            description,
            points
        });
        this.totalPoints += points;
        this.updateExperienceLevel();
    }
};

module.exports = mongoose.model('UserProgress', UserProgressSchema);