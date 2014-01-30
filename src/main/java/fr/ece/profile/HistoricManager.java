package fr.ece.profile;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

/**Class storing the user historic in the database*/
public class HistoricManager {
    private Connection myCon;
    private final PreparedStatement addTvProgPreparedStatement;
    private final PreparedStatement addUsersHistoricPreaparedStatement;
    private final PreparedStatement addArtistPlaysInPreparedStatement;
    private Date startTime;
    private Date endTime;
    private SimpleDateFormat df;
    private Boolean infoBool;
    private int actualProgId;
    private int newProgId;
    private String[] artistTab;
    
    /**Class storing the user historic*/
    public HistoricManager() throws ClassNotFoundException, SQLException {
        //Establishing the database connection
        Class.forName("com.mysql.jdbc.Driver");
        myCon = DriverManager.getConnection("jdbc:mysql://ec2-176-34-253-124.eu-west-1.compute.amazonaws.com:3306/zappprofile", "guinaudin", "zappTeam");
        //Pas d'auto commit
        myCon.setAutoCommit(false);
        infoBool = true;
        actualProgId = 0;
        newProgId = 0;
        artistTab = new String[10];
        SimpleDateFormat df = new SimpleDateFormat("MM/dd/YYYY HH:mm");
        
        //Stting up the prepared statement*/
        addTvProgPreparedStatement = myCon.prepareStatement("INSERT INTO TvProg(progId, name, summary, startTime , endTime) VALUES (?, ?, ?, ?, ?)");
        addUsersHistoricPreaparedStatement = myCon.prepareStatement("INSERT INTO UsersHistoric(progId, userId) VALUES (?, ?)");
        addArtistPlaysInPreparedStatement = myCon.prepareStatement("INSERT INTO ArtistPlaysIn(progId, artistId) VALUES(?, ?)");
    }
    
    /**Storing the users historic when he changes a channel*/
    //TO DO : Storing the user's historic when the channel stays the same with different progId
    public void storeHistoric(int userId) throws SQLException, ParseException {
        //newProgId = ??;
        if(infoBool) {
            //take info from json
            //actualProgId = ??;
            infoBool = false;
            //remplir artistTab
        }
        
        //If the actual program is different from the new one
        if(actualProgId != newProgId) {
            endTime = df.parse(df.format(new Date()));
            
            //If the user stayed more than 15 minutes in front of the program
            if(this.calculateTimeDifference(startTime, endTime) > 0.16666667) {
                addTvProgPreparedStatement.setLong(1, 0);
                addTvProgPreparedStatement.setString(2, null);
                addTvProgPreparedStatement.setString(3, null);
                addTvProgPreparedStatement.setTimestamp(4, null);
                addTvProgPreparedStatement.setTimestamp(5, null);
                addTvProgPreparedStatement.executeUpdate();

                addUsersHistoricPreaparedStatement.setLong(1, 0);
                addUsersHistoricPreaparedStatement.setLong(2, 0);
                addUsersHistoricPreaparedStatement.executeUpdate();

                for(int i = 0; i < artistTab.length; i++) {
                    //vérifier si l'artiste existe
                    //si non, ajout à la table artist
                    //verifier si le progid exist dans artistplayin
                    //si non ajout de l'artist et du progid dans artistplayIN
                }
                myCon.commit();
            }
            startTime = df.parse(df.format(new Date()));
            infoBool = true;
        }
    }
    
    /**Class determining the number of hours in front of one specific program*/
    private float calculateTimeDifference(Date startTime, Date endTime) {
        long diff = endTime.getTime() - startTime.getTime();
        return diff / 3600000.0f;
    }
}
