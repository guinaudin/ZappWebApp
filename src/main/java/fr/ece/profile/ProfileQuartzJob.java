package fr.ece.profile;

import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

/**Class establishing periodically the recommendations for all users using Mahout*/
public class ProfileQuartzJob implements Job {
    private ProfileManager profileManager;

    public ProfileQuartzJob() {
        try {
            profileManager = new ProfileManager();
        } catch (SQLException ex) {
            Logger.getLogger(ProfileQuartzJob.class.getName()).log(Level.SEVERE, null, ex);
        } catch (ClassNotFoundException ex) {
            Logger.getLogger(ProfileQuartzJob.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
    /**executing and saving the recommendation for all user
     * @param context
     * @throws org.quartz.JobExecutionException*/
    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        try {
            //Calculating the actor preferences
            profileManager.actorWeightCalculation();
            //Finding the top 10 artists recommended
            profileManager.findArtistPreferences(10);
            //Saving recommendations in the database
            profileManager.saveArtistsRecommendations();
        } catch (SQLException ex) {
            Logger.getLogger(ProfileQuartzJob.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
}