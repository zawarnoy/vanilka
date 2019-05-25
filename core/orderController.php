<?php

use PHPMailer\PHPMailer\PHPMailer;

require $_SERVER['DOCUMENT_ROOT'] . '/vendor/autoload.php';

$basedir = realpath('./../');
$COMPONENT_LIST[] = 'ComponentTaste';
$COMPONENT_LIST[] = 'ComponentAdditionalStuffing';
$COMPONENT_LIST[] = 'ComponentDecor';
$COMPONENT_LIST[] = 'ComponentSize';
$COMPONENT_LIST[] = 'ComponentImage';
$COMPONENT_LIST[] = 'ComponentNotification';

$subject = 'Номер заказа: '.time();
$boundary = "--".md5(uniqid(time()));
$mailheaders =  "MIME-Version: 1.0;\r\n";
$mailheaders .= "Content-Type: multipart/related; boundary=\"$boundary\"\r\n";
$mailheaders .= "From: <orderbot@vanilka.by>\r\n";
$mailheaders .= "To: zawarnoy@gmail.com\r\n";

if( isset($_POST['personData']) ) {
  $personInfo = json_decode($_POST['personData']);
  $common = '';
  $common .= $subject . '<br>';
  $common .= 'Клиент: <br>';
  $common .= 'Фамилия: '. $personInfo -> lastName .'<br/>';
  $common .= 'Имя: '. $personInfo -> firstName .'<br/>';
  $common .= 'Телефон: '. $personInfo -> phone .'<br/>';
  $common .= 'еMail: '. $personInfo -> email .'<hr/>';
}

if( isset($_POST['orderData']) ){
  $orderData = json_decode( $_POST['orderData'] );
  $taste = '<br>Информация о товаре: <br>';

  if( isTasteSpecified($orderData) )
    $taste .= prepareComponentTasteResponse($orderData -> $COMPONENT_LIST[0]);

  if( isAdditionalStuffingSpecified($orderData) )
    $taste .= prepareComponentAdditionalStuffingResponse($orderData -> $COMPONENT_LIST[1]);

  if( isDecorSpecified($orderData) )
    $taste .= prepareComponentDecorResponse($orderData -> $COMPONENT_LIST[2]);

  if( isSizeSpecified($orderData) )
    $taste .= prepareComponentSizeResponse($orderData -> $COMPONENT_LIST[3]);

  if( isImageSpecified($orderData) )
    $taste .= prepareComponentImageResponse($orderData -> $COMPONENT_LIST[4]);

  if ( isNotificationSpecified($orderData) )
    $taste .= prepareComponentNotificationResponse($orderData -> $COMPONENT_LIST[5]);
}

$multipart = "--$boundary\r\n";
$multipart .= "Content-Type: text/html; charset=utf-8\r\n";
$multipart .= "Content-Transfer-Encoding: 8bit\r\n";
$multipart .= "\r\n";
$multipart .= $common ." ". $taste;
$multipart .= getAttachments($orderData -> $COMPONENT_LIST[4],$boundary);//$message_part;

try {
    $mail = new PhpMailer(true);

    $mail->SMTPDebug = 4;
    $mail->isSMTP();
    $mail->Host = gethostbyname('smtp.gmail.com');
    $mail->SMTPAuth = true;
    $mail->Username = 'vladdemidik@gmail.com';
    $mail->Password = '61199035';
    $mail->SMTPSecure = 'ssl';
    $mail->Timeout = 10;
    $mail->Port = 465;

    $mail->setFrom('vladdemidik@gmail.com');
    $mail->addAddress('zawarnoy@gmail.com');

    $mail->CharSet = 'UTF-8';
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body = $multipart;
    $mail->send();

    echo "<center>".$subject."</center>";

} catch (Exception $e) {
    echo "<center>Заказ не сформирован, приносим извинения</center>";
}


/**
 * Проверить наличие параметра "Вкус" в объекте
 * @param $o
 * @return bool
 */
function isTasteSpecified($o){
  global $COMPONENT_LIST;
  return property_exists($o,$COMPONENT_LIST[0]);
}


/**
 * Проверить наличие параметра "Дополнительные варианты начинки" в объекте
 * @param $o
 * @return bool
 */
function isAdditionalStuffingSpecified($o){
  global $COMPONENT_LIST;
  return property_exists($o,$COMPONENT_LIST[1]);
}


/**
 * Проверить наличие параметра "Декор" в объекте
 * @param $o
 * @return bool
 */
function isDecorSpecified($o){
  global $COMPONENT_LIST;
  return property_exists($o,$COMPONENT_LIST[2]);
}


/**
 * Проверить выбран ли размер изделия
 * @param $o
 * @return bool
 */
function isSizeSpecified($o){
  global $COMPONENT_LIST;
  return property_exists($o,$COMPONENT_LIST[3]);
}


/**
 * Проверить загрузил ли пользователь собственные изображения
 * @param $o
 * @return bool
 */
function isImageSpecified($o){
  global $COMPONENT_LIST;
  return property_exists($o,$COMPONENT_LIST[4]);
}


/**
 * Проверить введены ли комментарии к заказу
 * @param $o
 * @return bool
 */
function isNotificationSpecified($o){
  global $COMPONENT_LIST;
  return property_exists($o,$COMPONENT_LIST[5]);
}


/**
 * Проверить загружены ли дополнительные изображения
/**
 * Подготовить ответ по компоненту "Выбор вкуса"
 * @param {[]} $componentData - данные компонента
 * @return string
 */
function prepareComponentTasteResponse($componentData){
  $result = 'Вкусы: <br/>';
  //если массив
  if (is_array($componentData)) {
    for ($i = 0; $i < count($componentData); $i++) {
      $result .= ' - Вкус: '.$componentData[$i] -> taste;
      $result .= ', вес: '.$componentData[$i] -> weight;
      $result .= ', значение слайдера: '.$componentData[$i] -> value;
      $result .= ', количество порций: '.$componentData[$i]-> rationCount;
      $result .= '<hr/>';
    }
  }
  //
  return $result;
}


/**
 * Подготовить ответ по компоненту "Дополнения к начинке"
 * @param {[]} $componentData - данные компонента
 * @return string
 */
function prepareComponentAdditionalStuffingResponse($componentData){
  $result = 'Дополнить начинкой: <br/>';
  //если массив
  if (is_array($componentData)) {
    for ($i = 0; $i < count($componentData); $i++) {
      $result .= ' - '.$componentData[$i].'<br/>';
    }
  }
  //
  return $result.'<hr/>';
}


/**
 * Подготовить ответ по компоненту "Оформление"
 * @param {[]} $componentData - данные компонента
 * @return string
 */
function prepareComponentDecorResponse($componentData){
  $result = 'Оформить: <br/>';
  //если массив
  if (is_array($componentData)) {
    for ($i = 0; $i < count($componentData); $i++) {
      $result .= ' - '.$componentData[$i].'<br/>';
    }
  }
  //
  return $result;
}


/**
 * Подготовить ответ по компоненту "Выбор размера"
 * @param {string} $componentData
 * @return string
 */
function prepareComponentSizeResponse($componentData){
  $result = 'Указанный размер изделия: <br>';
  return $result .= ' - '.$componentData;
}


/**
 * Подготовить ответ по загруженным изображениям
 * @param {[]} $componentData - загруженные изображения (приходят в base64 либо ссылкой на источник)
 * @return string
 */
function prepareComponentImageResponse($componentData){
  $result = 'Загруженные изображения: <br/>';
  if (is_array($componentData)) {
    for ($i = 0; $i < count($componentData); $i++) {
      $result .= "<img width='400' style='margin: 10px; border:3px solid gray' src='cid:img_" . $i . "'> \r\n";
    }
  }
  $result .= '<br/>';
  return $result;
}


/**
 * Прикрепить изображения к письму
 * @param {[]} $componentData - загруженные изображения (приходят в base64 либо ссылкой на источник)
 * @return string
 */
function getAttachments($componentData){
  global $basedir,$boundary;
  $result = '';
  if (is_array($componentData)) {
    for ($i = 0; $i < count($componentData); $i++) {
      if( !is_base64_encoded($componentData[$i]) ){
        if( is_self_image($componentData[$i]) ) {
          $fb = file_get_contents($basedir . '/' . $componentData[$i], 'r');
        }else {
          $fb = file_get_contents($componentData[$i], 'r');
        }
        $componentData[$i] = base64_encode($fb);
      }
      $result .= "\r\n--$boundary\r\n";
      $result .= "Content-Type: image/png; name=\"attachment_$i\"\r\n";
      $result .= "Content-Transfer-Encoding:base64\r\n";
      $result .= "Content-ID: img_".$i."\r\n";
      $result .= "\r\n";
      $result .= chunk_split($componentData[$i]);
    }
  }
  $result .= "\r\n--$boundary--\r\n";
  return $result;
}
/**
 * Подготовить ответ по коментариям к заказу
 * @param {string} $componentData
 * @return string
 */
function prepareComponentNotificationResponse($componentData){
  $result = 'Комментарий к заказу: <br/>';
  return $result . $componentData;
}

/**
 * Проверить является ли входящая строка закодированной в base64
 * @param {string} $data
 * @return bool
 */
function is_base64_encoded($data){
  if (preg_match('%^[a-zA-Z0-9/+]*={0,2}$%', $data)) {
    return TRUE;
  } else {
    return FALSE;
  }
};

function is_self_image($data){
  return stripos($data,'img/') !== false;
}
