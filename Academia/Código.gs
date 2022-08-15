appServer.setSS("https://docs.google.com/spreadsheets/d/19WGZiyM6ZZIcID7VgzQV2I9JD7Cuzb8Xir_pC_JDN4o/edit#gid=0")

function doPost(e) {
  if (e.postData && e.postData.contents) {
    e.parameter = { ...e.parameter, ...JSON.parse(e.postData.contents) }
  }
  const data = appServer.execRoute("POST", e)
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON)
}

function doGet(e) {
  const data = appServer.execRoute("GET", e)
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON)
}