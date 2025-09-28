const User = require('../Model/UserModel');
const UserProgress = require('../Model/UserProgressModel');

class UserJourneyService {
    
    // Initialize progress tracking for new user
    static async initializeUserProgress(userId) {
        try {
            console.log('🚀 Initializing user progress for:', userId);
            
            const existingProgress = await UserProgress.findOne({ userId });
            if (existingProgress) {
                console.log('📊 User progress already exists');
                return existingProgress;
            }
            
            const newProgress = new UserProgress({
                userId,
                onboardingStatus: {
                    isNewUser: true,
                    currentStep: 1,
                    totalSteps: 5,
                    completedSteps: []
                }
            });
            
            // Award first login milestone
            newProgress.activityMilestones.firstLogin.completed = true;
            newProgress.activityMilestones.firstLogin.completedAt = new Date();
            newProgress.totalPoints += newProgress.activityMilestones.firstLogin.points;
            
            await newProgress.save();
            console.log('✅ User progress initialized');
            return newProgress;
            
        } catch (error) {
            console.error('❌ Error initializing user progress:', error);
            throw error;
        }
    }
    
    // Get user dashboard data based on their experience level
    static async getUserDashboardData(userId) {
        try {
            const user = await User.findById(userId).select('-password');
            const progress = await UserProgress.findOne({ userId });
            
            if (!user) {
                throw new Error('User not found');
            }
            
            // Initialize progress if it doesn't exist (existing users)
            let userProgress = progress;
            if (!userProgress) {
                userProgress = await this.initializeUserProgress(userId);
                // Mark as existing user if they have been created more than 1 day ago
                const daysSinceCreation = (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
                if (daysSinceCreation > 1) {
                    userProgress.onboardingStatus.isNewUser = false;
                    userProgress.experienceLevel = 'returning';
                    await userProgress.save();
                }
            }
            
            // Update profile completion
            await this.updateProfileCompletion(userId);
            
            // Determine dashboard configuration based on user experience
            const dashboardConfig = this.getDashboardConfig(userProgress);
            
            return {
                user,
                progress: userProgress,
                dashboardConfig,
                isNewUser: userProgress.onboardingStatus.isNewUser,
                experienceLevel: userProgress.experienceLevel,
                nextMilestones: this.getNextMilestones(userProgress)
            };
            
        } catch (error) {
            console.error('❌ Error getting user dashboard data:', error);
            throw error;
        }
    }
    
    // Configure dashboard based on user experience level
    static getDashboardConfig(progress) {
        const { experienceLevel, userLevel, featureAccess, onboardingStatus } = progress;
        
        const config = {
            showWelcomeMessage: experienceLevel === 'new',
            showOnboarding: onboardingStatus.isNewUser && !onboardingStatus.skippedOnboarding,
            showProgressBar: experienceLevel === 'new' || experienceLevel === 'returning',
            showAdvancedStats: featureAccess.advancedAnalytics,
            showMentorOptions: featureAccess.mentorMode,
            showCustomization: featureAccess.customization,
            
            // Widget configuration
            widgets: {
                quickStart: experienceLevel === 'new',
                recentActivity: experienceLevel !== 'new',
                achievements: progress.totalPoints > 0,
                weeklyGoals: experienceLevel === 'returning' || experienceLevel === 'experienced',
                analytics: featureAccess.advancedAnalytics,
                mentoring: featureAccess.mentorMode
            },
            
            // Navigation suggestions
            suggestedActions: this.getSuggestedActions(progress)
        };
        
        return config;
    }
    
    // Get suggested next actions based on user progress
    static getSuggestedActions(progress) {
        const suggestions = [];
        
        if (progress.onboardingStatus.isNewUser) {
            if (progress.profileCompletionPercentage < 50) {
                suggestions.push({
                    title: "Complete Your Profile",
                    description: "Add a profile picture and bio to unlock advanced features",
                    action: "complete_profile",
                    priority: "high"
                });
            }
            
            if (!progress.activityMilestones.firstSession.completed) {
                suggestions.push({
                    title: "Start Your First Session",
                    description: "Join a study session to begin your learning journey",
                    action: "start_session",
                    priority: "medium"
                });
            }
            
            if (!progress.activityMilestones.firstHelp.completed) {
                suggestions.push({
                    title: "Explore Help Center",
                    description: "Get familiar with available resources",
                    action: "visit_help",
                    priority: "low"
                });
            }
        } else {
            // Suggestions for existing users
            if (progress.activityStats.weeklyProgress < progress.activityStats.weeklyGoal) {
                suggestions.push({
                    title: "Complete Weekly Goal",
                    description: `${progress.activityStats.weeklyGoal - progress.activityStats.weeklyProgress} more sessions to reach your weekly goal`,
                    action: "continue_sessions",
                    priority: "medium"
                });
            }
            
            if (progress.userLevel === 'beginner' && progress.activityStats.sessionsCompleted >= 10) {
                suggestions.push({
                    title: "Unlock Mentor Mode",
                    description: "You're ready to help other students!",
                    action: "enable_mentoring",
                    priority: "high"
                });
            }
        }
        
        return suggestions;
    }
    
    // Update profile completion status
    static async updateProfileCompletion(userId) {
        try {
            const user = await User.findById(userId);
            const progress = await UserProgress.findOne({ userId });
            
            if (!user || !progress) return;
            
            // Check completion status for each profile section
            progress.profileCompletionStatus.basicInfo = !!(user.name && user.email && user.age);
            progress.profileCompletionStatus.profilePicture = !!(user.profilePic && user.profilePic.trim() !== '');
            progress.profileCompletionStatus.bio = !!(user.bio && user.bio.trim() !== '');
            progress.profileCompletionStatus.subjects = user.subjects && user.subjects.length > 0;
            progress.profileCompletionStatus.preferences = true; // Default preferences exist
            
            // Calculate percentage
            progress.calculateProfileCompletion();
            
            // Award milestone if profile is completed
            if (progress.profileCompletionPercentage >= 80 && !progress.activityMilestones.completedProfile.completed) {
                progress.activityMilestones.completedProfile.completed = true;
                progress.activityMilestones.completedProfile.completedAt = new Date();
                progress.totalPoints += progress.activityMilestones.completedProfile.points;
                
                progress.unlockAchievement(
                    'Profile Master',
                    'Completed your profile setup',
                    50
                );
            }
            
            await progress.save();
            
        } catch (error) {
            console.error('❌ Error updating profile completion:', error);
        }
    }
    
    // Award milestone for activity
    static async awardActivityMilestone(userId, milestoneType) {
        try {
            const progress = await UserProgress.findOne({ userId });
            if (!progress) return;
            
            const milestone = progress.activityMilestones[milestoneType];
            if (milestone && !milestone.completed) {
                milestone.completed = true;
                milestone.completedAt = new Date();
                progress.totalPoints += milestone.points;
                
                // Update experience level
                progress.updateExperienceLevel();
                
                await progress.save();
                
                console.log(`🎉 Milestone awarded: ${milestoneType} for user ${userId}`);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('❌ Error awarding milestone:', error);
            return false;
        }
    }
    
    // Update activity stats for existing users
    static async updateActivityStats(userId, activityType, value = 1) {
        try {
            const progress = await UserProgress.findOne({ userId });
            if (!progress) return;
            
            switch (activityType) {
                case 'session_completed':
                    progress.activityStats.sessionsCompleted += value;
                    progress.activityStats.weeklyProgress += value;
                    progress.activityStats.lastActiveDate = new Date();
                    
                    // Award first session milestone
                    if (progress.activityStats.sessionsCompleted === 1) {
                        await this.awardActivityMilestone(userId, 'firstSession');
                    }
                    break;
                    
                case 'help_accessed':
                    progress.activityStats.helpRequested += value;
                    
                    // Award first help milestone
                    if (progress.activityStats.helpRequested === 1) {
                        await this.awardActivityMilestone(userId, 'firstHelp');
                    }
                    break;
                    
                case 'resource_accessed':
                    progress.activityStats.resourcesAccessed += value;
                    break;
            }
            
            await progress.save();
            
        } catch (error) {
            console.error('❌ Error updating activity stats:', error);
        }
    }
    
    // Get next milestones for user motivation
    static getNextMilestones(progress) {
        const nextMilestones = [];
        
        Object.entries(progress.activityMilestones).forEach(([key, milestone]) => {
            if (!milestone.completed) {
                nextMilestones.push({
                    type: key,
                    points: milestone.points,
                    description: this.getMilestoneDescription(key)
                });
            }
        });
        
        return nextMilestones.sort((a, b) => b.points - a.points);
    }
    
    static getMilestoneDescription(milestoneType) {
        const descriptions = {
            firstLogin: 'Complete your first login',
            completedProfile: 'Complete your profile setup',
            firstSession: 'Attend your first study session',
            firstHelp: 'Visit the help center',
            weeklyStreak: 'Complete 7 sessions in a week'
        };
        
        return descriptions[milestoneType] || 'Complete milestone';
    }
}

module.exports = UserJourneyService;