package fr.ece.recommendation;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.apache.mahout.cf.taste.recommender.RecommendedItem;

public class ArtistsRecommendationProcess {
    private final PreparedStatement selectArtistPreparedStatement;
    private final PreparedStatement selectArtistIdListPreparedStatement;
    private final Connection myCon;
    private ResultSet resultSet;
    
    public ArtistsRecommendationProcess() throws SQLException, ClassNotFoundException {
        Class.forName("com.mysql.jdbc.Driver");
        myCon = DriverManager.getConnection("jdbc:mysql://ec2-50-19-213-178.compute-1.amazonaws.com:3306/zappprofile", "guinaudin", "zappTeam");
        //Pas d'auto commit
        myCon.setAutoCommit(false);
        
        selectArtistPreparedStatement = myCon.prepareStatement("SELECT firstName, familyName FROM Artists WHERE artistId = ?");
        selectArtistIdListPreparedStatement = myCon.prepareStatement("SELECT artistIdList FROM ArtistsRecommendations WHERE userId = ?");
    }
    
    public ArtistsRecommendation getArtitsRecommendation(int userId) throws SQLException {
        ArtistsRecommendation artistsRecommendation = null;
        List<Artist> artistList = new ArrayList<Artist>();
        
        selectArtistIdListPreparedStatement.setLong(1, userId);
        resultSet = selectArtistIdListPreparedStatement.executeQuery();
        myCon.commit();
        
        resultSet.next();
        String temp = resultSet.getString(1);
        String[]artistTab = temp.split(",");

        if(artistTab.length > 0) {
            for(int i = 0; i < artistTab.length; i++) {
                selectArtistPreparedStatement.setLong(1, Long.parseLong(artistTab[i]));
                resultSet = selectArtistPreparedStatement.executeQuery();
                myCon.commit();

                artistList.add(new Artist(resultSet.getString(1), resultSet.getString(2)));
            }
            artistsRecommendation = new ArtistsRecommendation(userId, artistList);
        }

        return artistsRecommendation;
    }
}
