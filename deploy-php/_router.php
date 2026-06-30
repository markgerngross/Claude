<?php
if (preg_match('#^/api/#', $_SERVER['REQUEST_URI'])) { require __DIR__.'/api.php'; return true; }
return false;
