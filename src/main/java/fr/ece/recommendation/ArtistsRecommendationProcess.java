package fr.ece.recommendation;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.apache.mahout.cf.taste.recommender.RecommendedItem;

public class ArtistsRecommendationProcess {
    private final PreparedStatement selectArtistPreparedStatement;
    private final Connection myCon;
    
    public ArtistsRecommendationProcess(Connection myCon) throws SQLException {
        this.myCon = myCon;
        
        selectArtistPreparedStatement = myCon.prepareStatement("SELECT firstName, familyName FROM Artists WHERE artistId = ?");
    }
    
    public ArtistsRecommendation getArtitsReco(int userId , Map<Integer, List<RecommendedItem>> usersArtistRecommendations) throws SQLException {
        List<Long> artistsId = new ArrayList<Long>();
        ArtistsRecommendation artistsRecommendation = null;
        
        List<Artist> artistList = new ArrayList<Artist>();
        
        for(Map.Entry<Integer, List<RecommendedItem>> entry : usersArtistRecommendations.entrySet()) {
            if(userId == entry.getKey()) {
                for(RecommendedItem recommendation : entry.getValue()) {
                    artistsId.add(recommendation.getItemID());
                }
                
                if(!artistsId.isEmpty()) {
                    for(int i = 0; i < artistsId.size(); i++) {
                        selectArtistPreparedStatement.setLong(1, artistsId.get(i));
                        ResultSet resultSet = selectArtistPreparedStatement.executeQuery();
                        myCon.commit();
                        
                        artistList.add(new Artist(resultSet.getString(1), resultSet.getString(2)));
                    }
                    
                    artistsRecommendation = new ArtistsRecommendation(userId, artistList);
                }
                
                return artistsRecommendation;
            }
        }
        
        return null;
    }
}
