const UserJourneyService = require('../Services/UserJourneyService');
const UserProgress = require('../Model/UserProgressModel');

class UserJourneyController {
    
    // Get user's personalized dashboard data
    static async getDashboard(req, res) {
        try {
            const userId = req.params.userId || req.user?.id;
            
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
            }
            
            const dashboardData = await UserJourneyService.getUserDashboardData(userId);
            
            res.json({
                success: true,
                data: dashboardData
            });
            
        } catch (error) {
            console.error('❌ Error getting dashboard:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Update onboarding progress
    static async updateOnboarding(req, res) {
        try {
            const userId = req.params.userId;
            const { currentStep, completedSteps, skipOnboarding } = req.body;
            
            const progress = await UserProgress.findOne({ userId });
            if (!progress) {
                return res.status(404).json({
                    success: false,
                    message: 'User progress not found'
                });
            }
            
            if (skipOnboarding) {
                progress.onboardingStatus.skippedOnboarding = true;
                progress.onboardingStatus.isNewUser = false;
            } else {
                if (currentStep) {
                    progress.onboardingStatus.currentStep = currentStep;
                }
                
                if (completedSteps && Array.isArray(completedSteps)) {
                    progress.onboardingStatus.completedSteps = completedSteps;
                }
                
                // If all steps completed, mark as not new user
                if (completedSteps && completedSteps.length >= progress.onboardingStatus.totalSteps) {
                    progress.onboardingStatus.isNewUser = false;
                    progress.experienceLevel = 'returning';
                }
            }
            
            await progress.save();
            
            res.json({
                success: true,
                data: progress.onboardingStatus
            });
            
        } catch (error) {
            console.error('❌ Error updating onboarding:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Award achievement or milestone
    static async awardAchievement(req, res) {
        try {
            const userId = req.params.userId;
            const { milestoneType, achievementName, description, points } = req.body;
            
            let success = false;
            let message = '';
            
            if (milestoneType) {
                success = await UserJourneyService.awardActivityMilestone(userId, milestoneType);
                message = success ? 'Milestone awarded' : 'Milestone already completed or not found';
            } else if (achievementName) {
                const progress = await UserProgress.findOne({ userId });
                if (progress) {
                    progress.unlockAchievement(achievementName, description, points);
                    await progress.save();
                    success = true;
                    message = 'Achievement unlocked';
                }
            }
            
            if (success) {
                // Get updated dashboard data
                const dashboardData = await UserJourneyService.getUserDashboardData(userId);
                
                res.json({
                    success: true,
                    message,
                    data: dashboardData
                });
            } else {
                res.status(400).json({
                    success: false,
                    message
                });
            }
            
        } catch (error) {
            console.error('❌ Error awarding achievement:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Update activity stats
    static async trackActivity(req, res) {
        try {
            const userId = req.params.userId;
            const { activityType, value } = req.body;
            
            await UserJourneyService.updateActivityStats(userId, activityType, value);
            
            res.json({
                success: true,
                message: 'Activity tracked successfully'
            });
            
        } catch (error) {
            console.error('❌ Error tracking activity:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Get user progress details
    static async getProgress(req, res) {
        try {
            const userId = req.params.userId;
            
            const progress = await UserProgress.findOne({ userId });
            if (!progress) {
                return res.status(404).json({
                    success: false,
                    message: 'User progress not found'
                });
            }
            
            res.json({
                success: true,
                data: progress
            });
            
        } catch (error) {
            console.error('❌ Error getting progress:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Reset user progress (admin only)
    static async resetProgress(req, res) {
        try {
            const userId = req.params.userId;
            
            await UserProgress.findOneAndDelete({ userId });
            const newProgress = await UserJourneyService.initializeUserProgress(userId);
            
            res.json({
                success: true,
                message: 'User progress reset successfully',
                data: newProgress
            });
            
        } catch (error) {
            console.error('❌ Error resetting progress:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
}

module.exports = UserJourneyController;