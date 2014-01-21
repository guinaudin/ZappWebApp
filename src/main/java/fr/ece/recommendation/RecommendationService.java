package fr.ece.recommendation;

import com.google.gson.Gson;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

@Path("/WebService")
public class RecommendationService {
    @GET
    @Path("/getArtitsRecommendation")
    @Produces("application/json")
    public void printJsonRecommendation() {
        try {
            ArtistsRecommendationProcess artistsRecommendationProcess = new ArtistsRecommendationProcess();
            
            //TO DO modify userID
            ArtistsRecommendation artistsRecommendation = artistsRecommendationProcess.getArtitsRecommendation(1);
            Gson gson= new Gson();
            gson.toJson(artistsRecommendation);
        } 
        catch (SQLException ex) {
            Logger.getLogger(RecommendationService.class.getName()).log(Level.SEVERE, null, ex);
        } 
        catch (ClassNotFoundException ex) {
            Logger.getLogger(RecommendationService.class.getName()).log(Level.SEVERE, null, ex);
        }
    }    
}
