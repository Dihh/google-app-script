appServer.route("POST", "/create-category", createCategory)
function createCategory(parameter, user){
  var data = appServer.post("categories", parameter)
  return data
}

appServer.route("POST", "/update-category", updateCategory)
function updateCategory(parameter, user){
  var data = appServer.update("categories", parameter.id, parameter)
  return data
}

appServer.route("POST", "/delete-category", deleteCategory)
function deleteCategory(parameter, user){
  var data = appServer.remove("categories", parameter.id)
  return data
}

appServer.route("GET", "/get-categories", getCategories)
function getCategories(parameter, user){
  var data = appServer.read("categories")
  return data
}

appServer.route("GET", "/get-category", getCategory)
function getCategory(parameter, user){
  var data = appServer.read("categories")
  data = data.find(ele => ele.id == parameter.id)
  return data
}