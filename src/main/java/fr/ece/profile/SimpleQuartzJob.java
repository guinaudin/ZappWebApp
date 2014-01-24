package fr.ece.profile;

import fr.ece.profile.ProfileManager;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

public class SimpleQuartzJob implements Job {
    private ProfileManager profileManager;

    public SimpleQuartzJob() {
        try {
            profileManager = new ProfileManager();
        } catch (SQLException ex) {
            Logger.getLogger(SimpleQuartzJob.class.getName()).log(Level.SEVERE, null, ex);
        } catch (ClassNotFoundException ex) {
            Logger.getLogger(SimpleQuartzJob.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        try {
            /*Date d1 = new Date();
            SimpleDateFormat df = new SimpleDateFormat("MM/dd/YYYY HH:mm a");
            String formattedDate = df.format(d1);
            
            System.out.println(formattedDate);*/
            profileManager.actorWeightCalculation();
            profileManager.findArtistPreferences(10);
            profileManager.saveArtistsRecommendations();
        } catch (SQLException ex) {
            Logger.getLogger(SimpleQuartzJob.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
}