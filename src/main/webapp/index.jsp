<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>

<html>
    <head>
        <title>JSP Page</title>
    </head>
   
    <body>
        <jsp:useBean id="profileManager" scope="session" class="fr.ece.profile.ProfileManager" />
        <% profileManager.actorWeightCalculation(); %>
        <% profileManager.findArtistPreferences(30); %>
        <% profileManager.saveArtistsRecommendations(); %>
        
        <p> Storing recommendations... </p> 
    </body>
</html>
