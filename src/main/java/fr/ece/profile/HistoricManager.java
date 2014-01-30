package fr.ece.profile;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Timer;

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
    
    public HistoricManager() throws ClassNotFoundException, SQLException {
        //Etablissement de la connection à la BDD
        Class.forName("com.mysql.jdbc.Driver");
        myCon = DriverManager.getConnection("jdbc:mysql://ec2-176-34-253-124.eu-west-1.compute.amazonaws.com:3306/zappprofile", "guinaudin", "zappTeam");
        //Pas d'auto commit
        myCon.setAutoCommit(false);
        infoBool = true;
        actualProgId = 0;
        newProgId = 0;
        artistTab = new String[10];
        SimpleDateFormat df = new SimpleDateFormat("MM/dd/YYYY HH:mm a");
        
        addTvProgPreparedStatement = myCon.prepareStatement("INSERT INTO TvProg(progId, name, summary, startTime , endTime) VALUES (?, ?, ?, ?, ?)");
        addUsersHistoricPreaparedStatement = myCon.prepareStatement("INSERT INTO UsersHistoric(progId, userId) VALUES (?, ?)");
        addArtistPlaysInPreparedStatement = myCon.prepareStatement("INSERT INTO ArtistPlaysIn(progId, artistId) VALUES(?, ?)");
    }
    
    public void storeHistoric(int userId) throws SQLException, ParseException {
        //newProgId = ??;
        if(infoBool) {
            //take info from json
            //actualProgId = ??;
            infoBool = false;
            //remplir artistTab
        }
                
        if(actualProgId != newProgId) {
            Timer timer = new Timer();
            endTime = df.parse(df.format(new Date()));
            
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
    
    private float calculateTimeDifference(Date startTime, Date endTime) {
        long diff = endTime.getTime() - startTime.getTime();
        return diff / 3600000.0f;
    }
}
