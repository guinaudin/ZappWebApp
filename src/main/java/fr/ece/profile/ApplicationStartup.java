package fr.ece.profile;

import java.text.ParseException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import org.quartz.CronExpression;
import org.quartz.CronTrigger;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.SchedulerFactory;
import org.quartz.impl.StdSchedulerFactory;

public class ApplicationStartup implements ServletContextListener{
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        try {
            // Initiate a Schedule Factory
            SchedulerFactory schedulerFactory = new StdSchedulerFactory();
            // Retrieve a scheduler from schedule factory
            Scheduler scheduler = schedulerFactory.getScheduler();
            
            // Initiate JobDetail with job name, job group, and executable job class
            JobDetail profileJob =
                    new JobDetail("profileJob", "profileJobGroup", ProfileQuartzJob.class);
            JobDetail historicJob =
                    new JobDetail("historicJob", "historicJobGroup", HistoricQuartzJob.class);
            // Initiate CronTrigger with its name and group name
            CronTrigger cronProfileTrigger = new CronTrigger("cronProfileTrigger", "profileTriggerGroup");
            CronTrigger cronHistoricTrigger = new CronTrigger("cronHistoricTrigger", "historicTriggerGroup");
            try {
                // setup CronExpression
                CronExpression profileCron = new CronExpression("0 0 12 ? * FRI");
                CronExpression historicCron = new CronExpression("0/25 * * * * *");
                // Assign the CronExpression to CronTrigger
                cronProfileTrigger.setCronExpression(profileCron);
                cronHistoricTrigger.setCronExpression(historicCron);
            } 
            catch (ParseException e) {
                e.printStackTrace();
            }
            // schedule a job with JobDetail and Trigger
            scheduler.scheduleJob(profileJob, cronProfileTrigger);
            scheduler.scheduleJob(historicJob, cronHistoricTrigger);
            
            // start the scheduler
            scheduler.start();
        } catch (SchedulerException ex) {
            Logger.getLogger(ApplicationStartup.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        System.out.println("Application Stopped !");
    }
}
