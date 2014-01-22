package fr.ece.profile;

import java.sql.SQLException;
import java.text.DateFormat;
import java.util.Date;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.ejb.Schedule;
import javax.ejb.Stateless;

@Stateless
public class PeriodicProfileProcess {
    private DateFormat mediumDateFormat = DateFormat.getDateTimeInstance(DateFormat.MEDIUM,DateFormat.MEDIUM);
    
    @Schedule(minute="*/1", hour="*", persistent = false)
    public void profileTimer() {
        try {
            ProfileManager profileManager = new ProfileManager();
            
            profileManager.actorWeightCalculation();
            profileManager.findArtistPreferences(10);
            profileManager.saveArtistsRecommendations();
            
            System.out.println(mediumDateFormat.format(new Date()));
        } catch (SQLException ex) {
            Logger.getLogger(PeriodicProfileProcess.class.getName()).log(Level.SEVERE, null, ex);
        } catch (ClassNotFoundException ex) {
            Logger.getLogger(PeriodicProfileProcess.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
}

