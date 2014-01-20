<?php
try{
$db = new PDO('mysql:host=localhost;dbname=profile','root','chameau89');
foreach($db->query('SELECT userId from Users') as $row) {
        print(json_encode($row));
    }
$db = null;
}  catch (PDOException $e) {
    print "Erreur !: " . $e->getMessage() . "<br/>";
    die();
}
?>
