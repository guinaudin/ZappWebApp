package fr.ece.historic;

import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

public class SimpleQuartzJob implements Job {

    public SimpleQuartzJob() {
    }

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        System.out.println("hello");
    }
}