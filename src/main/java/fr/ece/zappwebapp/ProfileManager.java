package fr.ece.zappwebapp;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.mahout.cf.taste.common.TasteException;
import org.apache.mahout.cf.taste.impl.model.file.FileDataModel;
import org.apache.mahout.cf.taste.impl.neighborhood.NearestNUserNeighborhood;
import org.apache.mahout.cf.taste.impl.recommender.GenericUserBasedRecommender;
import org.apache.mahout.cf.taste.impl.similarity.PearsonCorrelationSimilarity;
import org.apache.mahout.cf.taste.model.DataModel;
import org.apache.mahout.cf.taste.neighborhood.UserNeighborhood;
import org.apache.mahout.cf.taste.recommender.RecommendedItem;
import org.apache.mahout.cf.taste.recommender.Recommender;
import org.apache.mahout.cf.taste.similarity.UserSimilarity;

public class ProfileManager {

    private final Connection myCon;
    private Statement stateListArtistPreferences;
    private Statement stateListNumberUsers;
    private ResultSet result;
    private int numberUsers;
    private Map<Integer, List<RecommendedItem>> usersArtistRecommendations;
    
    public ProfileManager() throws SQLException, ClassNotFoundException {
        //Etablissement de la connection à la BDD
        //System.setProperty("jdbc.drivers", "com.mysql.jdbc.Driver");
        Class.forName("com.mysql.jdbc.Driver");
        myCon = DriverManager.getConnection("jdbc:mysql://ec2-50-19-213-178.compute-1.amazonaws.com:3306/zappprofile", "guinaudin", "zappTeam");
        //Pas d'auto commit
        myCon.setAutoCommit(false);
        
        usersArtistRecommendations = new HashMap<Integer, List<RecommendedItem>>();
        numberUsers = this.getNumberUsers();
    }

    public void actorWeightCalculation() throws SQLException {
        Statement stmt = myCon.createStatement();
        Statement stmt2 = myCon.createStatement();
        Statement stmt3 = myCon.createStatement();

        //récupère tous les id utilisateurs
        ResultSet rs = stmt.executeQuery("SELECT userId FROM Users");
        myCon.commit();

        while (rs.next()) {
            Map<Long, Integer> actorRecurrence = new HashMap<Long, Integer>();
            Map<Long, Float> actorWeight = new HashMap<Long, Float>();
            int row;
            Long userId = rs.getLong("userId");
            String query = "SELECT progId FROM UsersHistoric WHERE userId = " + userId;
            ResultSet rs2 = stmt2.executeQuery(query);
            myCon.commit();

            //récupère le nb de progtv vus par ce user
            rs2.last();
            row = rs2.getRow();
            rs2.beforeFirst();
            
            while (rs2.next()) {
                Long prodId = rs2.getLong("progId");
                //récupère les acteurs qui ont joués dans les progTV vus
                ResultSet rs3 = stmt3.executeQuery(
                        "SELECT artistId FROM ArtistsPlayIn WHERE progId = " + prodId + " "); //TODO PBM ICI car pas de distinction des rôles (je prends tlm, pas seulement les acteurs)

                myCon.commit();

                while (rs3.next()) {
                    if (actorRecurrence.containsKey(rs3.getLong("artistId"))) {
                        int tmp = actorRecurrence.get(rs3.getLong("artistId"));
                        actorRecurrence.put(rs3.getLong("artistId"), tmp + 1); //ajoute 1 au nb d'apparence de l'acteurId
                    } else {
                        actorRecurrence.put(rs3.getLong("artistId"), 1); // créé la ligne de l'acteur avec 1 apparence
                    }
                }
            }

            //calcul de la pondération par acteur
            for (Map.Entry<Long, Integer> entry : actorRecurrence.entrySet()) {
                //calcule le poids pour un acteur donné
                float newWeight = (float) entry.getValue() / row;
                //save le nouveau poids
                actorWeight.put(entry.getKey(), newWeight);
            }

            for (Map.Entry<Long, Float> entryWeight : actorWeight.entrySet()) {
                PreparedStatement ps = myCon.prepareStatement("SELECT count(*) FROM ArtistPreferences WHERE userId = ? AND artistId = ?");
                ps.setLong(1, userId);
                ps.setLong(2, entryWeight.getKey());
                ResultSet resultSet = ps.executeQuery();
                myCon.commit();

                resultSet.next();

                //si la ligne existe déjà on l'actualise
                if (resultSet.getInt(1) == 1) {
                    PreparedStatement update = myCon.prepareStatement("UPDATE ArtistPreferences SET artistWeight = ? WHERE userId = ? AND artistId = ?");
                    update.setFloat(1, entryWeight.getValue());
                    update.setLong(2, userId);
                    update.setLong(3, entryWeight.getKey());
                    update.executeUpdate();
                    myCon.commit();
                } //sinon on la créé
                else {
                    PreparedStatement insert = myCon.prepareStatement("INSERT INTO ArtistPreferences (userId, artistId, artistWeight) VALUES (?,?,?)");

                    insert.setLong(1, userId);
                    insert.setLong(2, entryWeight.getKey());
                    insert.setFloat(3, entryWeight.getValue());
                    insert.executeUpdate();
                    myCon.commit();
                }
            }
            //vide les hashmasp pour le prochain user
            actorRecurrence.clear();
            actorWeight.clear();
        }
    }

    public void saveArtistsRecommendations() throws SQLException {
        String artistsList = "";
        for (Map.Entry<Integer, List<RecommendedItem>> entry : usersArtistRecommendations.entrySet()) {
            if (!entry.getValue().isEmpty()) {
                //System.out.println("entry.getValue.getItemId : " +entry.getValue().get(0));
                PreparedStatement ps = myCon.prepareStatement("SELECT count(*) FROM ArtistsRecommendations WHERE userId = ?");
                ps.setLong(1, entry.getKey());
                ResultSet resultSet = ps.executeQuery();
                myCon.commit();

                resultSet.next();

                //si la ligne existe déjà on l'actualise
                if (resultSet.getInt(1) == 1) {
                    PreparedStatement update = myCon.prepareStatement("UPDATE ArtistsRecommendations SET artistIdList = ? WHERE userId = ?");
                    for (int i = 0; i < entry.getValue().size(); i++) {
                        if(i == entry.getValue().size() - 1)
                            artistsList = artistsList + entry.getValue().get(i).getItemID();
                        else
                            artistsList = artistsList + entry.getValue().get(i).getItemID() + ",";
                    }
                    update.setString(1, artistsList);
                    update.setLong(2, entry.getKey());
                    update.executeUpdate();
                    myCon.commit();
                } //sinon on la créé
                else {
                    PreparedStatement insert = myCon.prepareStatement("INSERT INTO ArtistsRecommendations (userId, artistIdList) VALUES (?,?)");
                    insert.setLong(1, entry.getKey());
                    for (int i = 0; i < entry.getValue().size(); i++) {
                        if(i == entry.getValue().size() - 1)
                            artistsList = artistsList + entry.getValue().get(i).getItemID();
                        else
                            artistsList = artistsList + entry.getValue().get(i).getItemID() + ",";
                    }
                    insert.setString(2, artistsList);
                    insert.executeUpdate();
                    myCon.commit();
                }
            }
        }
    }

    private int getNumberUsers() throws SQLException {
        String query = "SELECT userId FROM Users";

        stateListNumberUsers = myCon.createStatement();
        result = stateListNumberUsers.executeQuery(query);
        myCon.commit();
        result.last();

        return result.getRow();
    }

    public void findArtistPreferences(int recommendationNumber) throws SQLException {
        List<RecommendedItem> artistRecommendations = null;
        boolean nextResult = false;
        String query = "SELECT userId, artistId, artistWeight FROM ArtistPreferences";

        //On créé la statement
        stateListArtistPreferences = myCon.createStatement();
        //On execute la quiery
        result = stateListArtistPreferences.executeQuery(query);
        //On commit pour mettre à jour la BDD
        myCon.commit();

        nextResult = result.next();
        if (nextResult) {
            try {
                String filePath = System.getProperty("user.dir") + "/ArtistPreferences.csv";
                FileWriter fileWriter = new FileWriter(filePath, false);
                BufferedWriter output = new BufferedWriter(fileWriter);

                while (nextResult) {
                    output.write(result.getInt(1) + "," + result.getInt(2) + "," + result.getFloat(3) + "\n");
                    output.flush();
                    nextResult = result.next();
                }

                output.close();
            } catch (IOException ex) {
                Logger.getLogger(ProfileManager.class.getName()).log(Level.SEVERE, null, ex);
            }

            try {
                //faire test si fichier vide
                DataModel model = new FileDataModel(new File("ArtistPreferences.csv"));
                UserSimilarity similarity = new PearsonCorrelationSimilarity(model);
                //how many neighbours ??????? (2)
                UserNeighborhood neighborhood = new NearestNUserNeighborhood(2, similarity, model);
                Recommender recommender = new GenericUserBasedRecommender(model, neighborhood, similarity);
                for (int i = 1; i <= numberUsers; i++) {
                    artistRecommendations = recommender.recommend(i, recommendationNumber);
                    usersArtistRecommendations.put(i, artistRecommendations);
                }
            } catch (IOException ex) {
                Logger.getLogger(ProfileManager.class.getName()).log(Level.SEVERE, null, ex);
            } catch (TasteException ex) {
                Logger.getLogger(ProfileManager.class.getName()).log(Level.SEVERE, null, ex);
            }
        }
        
        for(Map.Entry<Integer, List<RecommendedItem>> entry : usersArtistRecommendations.entrySet()) {
            for(RecommendedItem recommendation : entry.getValue()) {
                System.out.println("recommendation " + entry.getKey() + " = " + recommendation);
            }
            System.out.println("");
        }
    }
}
