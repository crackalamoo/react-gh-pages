module.exports = {
  getJsonData: function(url) {
    return new Promise((resolve, reject) => {
      var xmlHttp = new XMLHttpRequest();
      console.log("Running main JSON Function");
      xmlHttp.onreadystatechange = function() {
          if (xmlHttp.readyState === 4) {
            if (xmlHttp.status == 200) {
              console.log("Resolve");
              resolve(xmlHttp.responseText);
            } else {
              reject("Invalid JSON");
            }
          }
      }
      xmlHttp.open("GET", url, true); // true for asynchronous
      xmlHttp.send(null);
    })
  }
}
