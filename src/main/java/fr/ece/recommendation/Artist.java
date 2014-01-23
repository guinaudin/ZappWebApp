package fr.ece.recommendation;

public class Artist {
    //Test GuillaumeT
    private String firstName;
    private String familyName;
    
    public Artist() {
        firstName = "";
        familyName = "";
    }
    
    public Artist(String firstName, String familyName) {
        this.firstName = firstName;
        this.familyName = familyName;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getFamilyName() {
        return familyName;
    }

    public void setFamilyName(String familyName) {
        this.familyName = familyName;
    }
}
