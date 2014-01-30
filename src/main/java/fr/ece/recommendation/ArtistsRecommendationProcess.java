package fr.ece.recommendation;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**Class which associates artists informations to the recommended artists for a specific user*/
public class ArtistsRecommendationProcess {
    private final PreparedStatement selectArtistPreparedStatement;
    private final PreparedStatement selectArtistIdListPreparedStatement;
    private Connection myCon;
    private ResultSet resultSet;

    public ArtistsRecommendationProcess() throws SQLException, ClassNotFoundException {
        //Setting up the database connection
        Class.forName("com.mysql.jdbc.Driver");
        myCon = DriverManager.getConnection("jdbc:mysql://ec2-176-34-253-124.eu-west-1.compute.amazonaws.com:3306/zappprofile", "guinaudin", "zappTeam");
        myCon.setAutoCommit(false);
        
        //Creating the prepared statement
        selectArtistPreparedStatement = myCon.prepareStatement("SELECT firstName, familyName FROM Artists WHERE artistId = ?");
        selectArtistIdListPreparedStatement = myCon.prepareStatement("SELECT artistIdList FROM ArtistsRecommendations WHERE userId = ?");
    }
    
    /**Function associating the artists informations to the recommended artists' ids*/
    public ArtistsRecommendation getArtitsRecommendation(int userId) throws SQLException {
        ArtistsRecommendation artistsRecommendation = null;
        List<Artist> artistList = new ArrayList<Artist>();
        
        //Re-establishing connection with database if nescessary
        if (myCon.isClosed()) {
            try {
                Class.forName("com.mysql.jdbc.Driver");
            } catch (ClassNotFoundException ex) {
                Logger.getLogger(ArtistsRecommendationProcess.class.getName()).log(Level.SEVERE, null, ex);
                 myCon.setAutoCommit(false);
            }
            myCon = DriverManager.getConnection("jdbc:mysql://ec2-176-34-253-124.eu-west-1.compute.amazonaws.com:3306/zappprofile", "guinaudin", "zappTeam");
        }
        
        //Obtaining the id list of the recommended artists*/
        selectArtistIdListPreparedStatement.setLong(1, userId);
        resultSet = selectArtistIdListPreparedStatement.executeQuery();
        myCon.commit();


        if (resultSet.next()) {
            String temp = resultSet.getString(1);
            //Creation of the id tab artist
            String[] artistTab = temp.split(",");

            if (artistTab.length > 0) {
                for (int i = 0; i < artistTab.length; i++) {
                    selectArtistPreparedStatement.setLong(1, Long.parseLong(artistTab[i]));
                    resultSet = selectArtistPreparedStatement.executeQuery();
                    myCon.commit();
                    
                    //Creating the list which contains artists' informations
                    if (resultSet.next()) {
                        artistList.add(new Artist(resultSet.getString(1), resultSet.getString(2)));
                    }
                }
                artistsRecommendation = new ArtistsRecommendation(userId, artistList);
            }

        }
        //Closing connection
        myCon.close();

        return artistsRecommendation;
    }
}
