<%@page contentType="text/html" pageEncoding="UTF-8"%>

<!DOCTYPE html>

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <script language="JavaScript" type="text/JavaScript" src="app_api.js"></script>
        <title>JSP Page</title>
    </head>
   
    
    <body onload="launch()">
        <jsp:useBean id="profileManager" scope="session" class="fr.ece.profile.ProfileManager" />
        <% profileManager.actorWeightCalculation(); %>
        <% profileManager.findArtistPreferences(10); %>
        <% profileManager.saveArtistsRecommendations(); %>
        <p> Storing recommendations... </p> 
        
        <script type="text/javascript">     
           function launch()
           {
            APP.name = 'Google';
            APP.cmd('openApplication');
           }
        </script>

    </body>
</html>
