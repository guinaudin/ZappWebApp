package fr.ece.historic;

import commonj.work.Work;
import commonj.work.WorkItem;
import commonj.work.WorkManager;
import java.util.ArrayList;
import java.util.List;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;

public class HistoricServlet extends HttpServlet {
    private WorkManager workManager;
    
    @Override
    public void init(ServletConfig servletConfig) throws ServletException {
        try {
            InitialContext ctx = new InitialContext();
            workManager = (WorkManager)ctx.lookup("java:comp/env/wm/MyWorkManager");
            
            Work work = new WorkTranslatorWrapper(new DummyHistoricMaker(10 * 1000));
            WorkItem workItem = workManager.schedule(work);
        } 
        catch (IllegalArgumentException | NamingException e) {
            throw new ServletException(e);
        }
    }
}
