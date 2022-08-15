var ss

var routes = {
  "GET": {
    "/init": init,
    "/get-table": getTable,
  },
  "POST": {
    "/create-table": createTable,
    '/delete-table': deleteTable,
    "/update-table-name": updateTableName,
    "/add-table-columns": addTableColumns,
    "/delete-table-columns": removeTableColumns,
    "/create-user": createUser,
    "/update-user": updateUser,
    "/delete-user": deleteUser,
  }
}

function route(method, route, routeFunction){
  routes[method][route] = routeFunction
}

function execRoute(method, e){
  const route = e.parameter.route
  delete e.parameter.route
  const apiKey = e.parameter.apiKey
  delete e.parameter.apiKey
  if(!route){
    return {route: false, error: "unspecified route."}
  }
  if(route == "/init"){
    return init()
  }
  if(!apiKey){
    return {route: false, error: "unspecified api key."}
  }
  const user = validateApiKey(apiKey)
  if(!user){
    return {error: "invalid api key."}
  }
  routeFunction = routes[method][route]
  if(!routeFunction){
    return {method, route, routeFunction: !!routeFunction, error: "function not exists."}
  }
  data = routeFunction(e.parameter, user)
  return data
}

function validateApiKey(apiKey){
  var users = read('script-users')
  if(!users) throw new Error("App not initialized.")
  var user = users.find(el => el.apiKey == apiKey)
  return user
}

function init(){
  const ws = ss.getSheetByName('script-users')
  if(!ws){
    return createScriptUsersTable()
  }
}

function getTable({tableName}, user){
  validateParams({tableName})
  if(!user.adm){
    throw new Error("You don't have enough permission.")
  }
  ws = ss.getSheetByName(tableName)
  var lastColumn = ws.getRange("A1").getDataRegion().getLastColumn()
  var data = ws.getRange(1,1,1,lastColumn).getValues()
  var columns = data.splice(0,1)[0]
  return {
    tableName,
    columns
  }
}

function createTable({tableName, columns}, user){
  validateParams({tableName, columns})
  if(!user.adm){
    throw new Error("You don't have enough permission.")
  }
  const ws = ss.insertSheet(tableName)
  columns = ["id", ...columns]
  ws.appendRow(columns)
  return {table: tableName}
}

function deleteTable({tableName},user ){
  validateParams({tableName})
  if(!user.adm){
    throw new Error("You don't have enough permission.")
  }
  const ws = ss.getSheetByName(tableName)
  ss.deleteSheet(ws)
  return true
}

function addTableColumns({tableName, columns}, user){
  validateParams({tableName, columns})
  if(!user.adm){
    throw new Error("You don't have enough permission.")
  }
  var ws = ss.getSheetByName(tableName)
  if(!ws) return false
  var lastColumn = ws.getRange("A1").getDataRegion().getLastColumn() + 1
  columnsSize = columns.length
  ws.getRange(1,lastColumn,1,columnsSize).setValues([columns])
  return getTable({tableName}, user)
}

function removeTableColumns({tableName, columns}, user){
  validateParams({tableName, columns})
  columnsToRemove = columns
  if(!user.adm){
    throw new Error("You don't have enough permission.")
  }
  var ws = ss.getSheetByName(tableName)
  if(!ws) return false
  var lastColumn = ws.getRange("A1").getDataRegion().getLastColumn()
  var data = ws.getRange(1,1,1,lastColumn).getValues()
  var columns = data.splice(0,1)[0]
  indexOfColumnsToRemove = columns.reduce((indexOfColumnsToRemove, column, index) => {
    if(columnsToRemove.includes(column)){
      indexOfColumnsToRemove.push(index + 1)
    }
    return indexOfColumnsToRemove
  }, [])
  indexOfColumnsToRemove.forEach(columnIndex => {
    ws.deleteColumn(columnIndex)
  })
  return getTable({tableName}, user)
}

function updateTableName({tableName, newTableName}, user){
  validateParams({tableName, newTableName})
  if(!user.adm){
    throw new Error("You don't have enough permission.")
  }
  ws = ss.getSheetByName(tableName)
  ws.setName(newTableName)
  return getTable({tableName: newTableName}, user)
}

function createUser({user, password, adm}, requestUser){
  validateParams({user, password, adm})
  if(!requestUser.adm){
    throw new Error("You don't have enough permission.")
  }
  const systemUser = {user, password, apiKey: Utilities.getUuid(), adm}
  return post('script-users', systemUser)
}

function updateUser({user, password, adm, id}, requestUser){
  validateParams({user, password, adm, id})
  if(!requestUser.adm){
    throw new Error("You don't have enough permission.")
  }
  const systemUser = {user, password, adm}
  return update('script-users', id, systemUser)
}

function deleteUser({id}, requestUser){
  validateParams({id})
  if(!requestUser.adm){
    throw new Error("You don't have enough permission.")
  }
  return remove('script-users', id)
}

function setSS(url){
  ss = SpreadsheetApp.openByUrl(url)
  
}

function createScriptUsersTable(){
  const user = {user: "admin", password: "admin", apiKey: Utilities.getUuid(), adm: true}
  createTable({tableName: 'script-users', columns: ["id", "user", "password", "apiKey", "adm"]}, user)
  post('script-users', user)
  return user
}

function validateParams(params){
  let valid = true
  Object.keys(params).forEach(key => {
    if(params[key] == undefined) valid = false
  })
  if(!valid){
    throw new Error("Invalid request.")
  }
  return valid
}

function post(table, data){
  data = {id: Utilities.getUuid(), ...data}
  const ws = ss.getSheetByName(table)
  const dataRow = Object.values(data)
  ws.appendRow(dataRow)
  return data
}

function remove(table, id){
  const ws = ss.getSheetByName(table)
  const data = read(table);
  const dataIndex = data.findIndex(el => el.id == id)
  if(dataIndex >= 0){
    const dataRowIndex = dataIndex + 2
    ws.deleteRow(dataRowIndex)
  }
  return data[dataIndex]
}

function update(table, id, newData){
  const data = read(table);
  const dataIndex = data.findIndex(el => el.id == id)
  if(dataIndex >= 0){
    data[dataIndex] = {...data[dataIndex], ...newData}
    const dataRow = Object.values(data[dataIndex])
    const dataRowIndex = dataIndex + 2
    const columnsSize = dataRow.length
    const ws = ss.getSheetByName(table)
    ws.getRange(dataRowIndex,1,1,columnsSize).setValues([dataRow])
  }
  return data[dataIndex]
}

function read(table){
  var ws = ss.getSheetByName(table)
  if(!ws) return false
  var lastRow = ws.getRange("A1").getDataRegion().getLastRow()
  var lastColumn = ws.getRange("A1").getDataRegion().getLastColumn()
  var data = ws.getRange(1,1,lastRow,lastColumn).getValues()
  var keys = data.splice(0,1)[0]
  var data = data.map(el => {
    element = {}
    keys.forEach((key, index) => {
      element[key] = el[index]
    })
    return element
  })
  return data
}