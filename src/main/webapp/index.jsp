<%@page contentType="text/html" pageEncoding="UTF-8"%>

<!DOCTYPE html>

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
         <%@ include file="app_api.js" %>
        <title>JSP Page</title>
    </head>
   
    
    <body>
        <jsp:useBean id="profileManager" scope="session" class="fr.ece.profile.ProfileManager" />
        <% profileManager.actorWeightCalculation(); %>
        <% profileManager.findArtistPreferences(10); %>
        <% profileManager.saveArtistsRecommendations(); %>
        <p> Storing recommendations... </p> 
        
        <script>
            
            APP.name = 'Google'; // Change global and call command after
            APP.cmd('openApplication');
            
        </script>

    </body>
</html>
