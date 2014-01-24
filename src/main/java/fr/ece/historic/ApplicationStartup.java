package fr.ece.historic;

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
            
            // current time
            long ctime = System.currentTimeMillis();
            
            // Initiate JobDetail with job name, job group, and executable job class
            JobDetail jobDetail =
                    new JobDetail("jobDetail2", "jobDetailGroup2", SimpleQuartzJob.class);
            // Initiate CronTrigger with its name and group name
            CronTrigger cronTrigger = new CronTrigger("cronTrigger", "triggerGroup2");
            try {
                // setup CronExpression
                CronExpression cexp = new CronExpression("0 25 5 ? * THU");
                // Assign the CronExpression to CronTrigger
                cronTrigger.setCronExpression(cexp);
            } catch (Exception e) {
                e.printStackTrace();
            }
            // schedule a job with JobDetail and Trigger
            scheduler.scheduleJob(jobDetail, cronTrigger);
            
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
