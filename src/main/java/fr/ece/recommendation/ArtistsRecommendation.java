package fr.ece.recommendation;

import java.util.ArrayList;
import java.util.List;

/**Class which stores the list of recommended artists for a specific user*/
public class ArtistsRecommendation {
    private long userId;
    private List<Artist> artists;
    
    public ArtistsRecommendation() {
        userId = 0;
        artists = new ArrayList<Artist>();
    }
    
    public ArtistsRecommendation(long userId, List<Artist> artists) {
        this.userId = userId;
        this.artists = artists;
    }

    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    public List<Artist> getArtists() {
        return artists;
    }

    public void setArtists(List<Artist> artists) {
        this.artists = artists;
    }
}
