
function httpPost(url, params)
{
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open('POST', url, false);
  xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xmlHttp.send(params);
  return xmlHttp.responseText;
}