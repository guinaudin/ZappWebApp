<%@page contentType="text/html" pageEncoding="UTF-8"%>

<!DOCTYPE html>

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
       <script language="JavaScript" type="text/JavaScript" src="jquery-2.0.3.js"></script>
      <script language="JavaScript" type="text/JavaScript" src="app-api.js"></script>
        <title>JSP Page</title>
    </head>
   
    
    <body onload="launch()">
        
          <script type="text/javascript">     
           function launch(){
           APP.name = 'Google'; // Change global and call command after
            APP.cmd('openApplication');
            console.log("REUSSI");

           }
        </script>
        
      <!--  <jsp:useBean id="profileManager" scope="session" class="fr.ece.profile.ProfileManager" />
        <% profileManager.actorWeightCalculation(); %>
        <% profileManager.findArtistPreferences(10); %>
        <% profileManager.saveArtistsRecommendations(); %>
        <p> Storing recommendations... </p> -->
        
      

    </body>
</html>
