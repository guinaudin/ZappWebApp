package fr.ece.profile;

import java.sql.SQLException;
import java.text.ParseException;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

/**Class establishing periodically the dataprofiling for the user*/
public class HistoricQuartzJob implements Job {
    private HistoricManager historicManager;

    public HistoricQuartzJob() {
        try {
            historicManager = new HistoricManager();
        } catch (SQLException ex) {
            Logger.getLogger(ProfileQuartzJob.class.getName()).log(Level.SEVERE, null, ex);
        } catch (ClassNotFoundException ex) {
            Logger.getLogger(ProfileQuartzJob.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        try {
            try {
                //TO DO : modify the userId depending on the box
                historicManager.storeHistoric(5);
            } catch (ParseException ex) {
                Logger.getLogger(HistoricQuartzJob.class.getName()).log(Level.SEVERE, null, ex);
            }
        } catch (SQLException ex) {
            Logger.getLogger(HistoricQuartzJob.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
}
