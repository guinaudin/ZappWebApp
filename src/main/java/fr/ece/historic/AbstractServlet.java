package fr.ece.historic;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Arrays;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public abstract class AbstractServlet extends HttpServlet {
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse response) 
       throws IOException, ServletException  {
                
        response.setContentType("text/plain");
        PrintWriter writer = response.getWriter();

        long start = System.currentTimeMillis();

        List input = getClientInput();
        List result = null;
        try {
             result = doTranslation(input);
        } 
        catch (Exception e) {
            throw new ServletException(e);
        }

        long stop = System.currentTimeMillis();
        writer.print("done in "+(stop-start)+"\n" + result);
    }
        
    // actual translation logic goes here
    protected abstract List doTranslation(List input) throws Exception;

    // let's hardcode list for our test
    // in real life this method should extract parameters from HttpServletRequest
    private List getClientInput() {
        return Arrays.asList(new String[]{"one", "two", "three", "four", "five"});
    }
}
