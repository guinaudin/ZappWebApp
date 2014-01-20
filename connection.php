<?php
try{
$db = new PDO('ec2-50-19-213-178.compute-1.amazonaws.com:3306;dbname=zappprofile','guinaudin','zappTeam');
foreach($db->query('SELECT userId from Users') as $row) {
        print(json_encode($row));
    }
$db = null;
}  catch (PDOException $e) {
    print "Erreur !: " . $e->getMessage() . "<br/>";
    die();
}
?>
