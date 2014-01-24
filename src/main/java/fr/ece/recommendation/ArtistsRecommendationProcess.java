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

public class ArtistsRecommendationProcess {

    private final PreparedStatement selectArtistPreparedStatement;
    private final PreparedStatement selectArtistIdListPreparedStatement;
    private Connection myCon;
    private ResultSet resultSet;

    public ArtistsRecommendationProcess() throws SQLException, ClassNotFoundException {
        Class.forName("com.mysql.jdbc.Driver");
        myCon = DriverManager.getConnection("jdbc:mysql://ec2-176-34-253-124.eu-west-1.compute.amazonaws.com:3306/zappprofile", "guinaudin", "zappTeam");
        //Pas d'auto commit
        myCon.setAutoCommit(false);

        selectArtistPreparedStatement = myCon.prepareStatement("SELECT firstName, familyName FROM Artists WHERE artistId = ?");
        selectArtistIdListPreparedStatement = myCon.prepareStatement("SELECT artistIdList FROM ArtistsRecommendations WHERE userId = ?");
    }

    public ArtistsRecommendation getArtitsRecommendation(int userId) throws SQLException {


        ArtistsRecommendation artistsRecommendation = null;
        List<Artist> artistList = new ArrayList<Artist>();

        if (myCon.isClosed()) {
            try {
                Class.forName("com.mysql.jdbc.Driver");
            } catch (ClassNotFoundException ex) {
                Logger.getLogger(ArtistsRecommendationProcess.class.getName()).log(Level.SEVERE, null, ex);
                 myCon.setAutoCommit(false);
            }
            myCon = DriverManager.getConnection("jdbc:mysql://ec2-176-34-253-124.eu-west-1.compute.amazonaws.com:3306/zappprofile", "guinaudin", "zappTeam");
        }

        selectArtistIdListPreparedStatement.setLong(1, userId);
        resultSet = selectArtistIdListPreparedStatement.executeQuery();
        myCon.commit();


        if (resultSet.next()) {
            String temp = resultSet.getString(1);
            String[] artistTab = temp.split(",");

            if (artistTab.length > 0) {
                for (int i = 0; i < artistTab.length; i++) {
                    selectArtistPreparedStatement.setLong(1, Long.parseLong(artistTab[i]));
                    resultSet = selectArtistPreparedStatement.executeQuery();
                    myCon.commit();

                    if (resultSet.next()) {
                        artistList.add(new Artist(resultSet.getString(1), resultSet.getString(2)));
                    }
                }
                artistsRecommendation = new ArtistsRecommendation(userId, artistList);
            }

        }
        myCon.close();

        return artistsRecommendation;
    }
}
