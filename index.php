<?php
$numero_novedad = "0000999";
$fecha = "01/01/2025";

$message = "Hola, hay una nueva novedad en el sistema." . "\n" . "Número de novedad: " . $numero_novedad . "\n" . "Fecha: " . $fecha;

$data = [
    "groupName" => "Grupo de Novedades",
    "message" => $message,
];

$options = [
    "http" => [
        "header"  => "Content-type: application/json\r\n",
        "method"  => "POST",
        "content" => json_encode($data),
    ],
];

$context = stream_context_create($options);
$result = file_get_contents('https://next-duly-treefrog.ngrok-free.app/send-message', false, $context);

echo $result;
?>
