package fr.ece.recommendation;

import com.google.gson.Gson;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.http.HttpServlet;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/WebService")
public class RecommendationService extends HttpServlet {
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String printJsonRecommendation() {
        String gsonRecommendation = null;
        try {
            ArtistsRecommendationProcess artistsRecommendationProcess = new ArtistsRecommendationProcess();
            
            //TO DO modify userID
            ArtistsRecommendation artistsRecommendation = artistsRecommendationProcess.getArtitsRecommendation(2);
            Gson gson = new Gson();
            gsonRecommendation = gson.toJson(artistsRecommendation);
        } 
        catch (SQLException ex) {
            Logger.getLogger(RecommendationService.class.getName()).log(Level.SEVERE, null, ex);
        } 
        catch (ClassNotFoundException ex) {
            Logger.getLogger(RecommendationService.class.getName()).log(Level.SEVERE, null, ex);
        }
        
        return gsonRecommendation;
    }    
}
