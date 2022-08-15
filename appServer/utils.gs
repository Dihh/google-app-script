function include(file) {
    return HtmlService.createHtmlOutputFromFile(file).getContent()
}

function testFetch() {
    // let user = UrlFetchApp.fetch('https://api.github.com/users/defunkt').getContentText()
    // user = JSON.parse(user)
    // console.log(user.login)
    console.log(ScriptApp.getService().getUrl())
}