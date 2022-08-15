appServer.route("POST", "/create-exercise", createExercise)
function createExercise(parameter, user){
  var data = appServer.post("exercises", parameter)
  return data
}

appServer.route("POST", "/update-exercise", updateExercise)
function updateExercise(parameter, user){
  var data = appServer.update("exercises", parameter.id, parameter)
  return data
}

appServer.route("POST", "/delete-exercise", deleteExercise)
function deleteExercise(parameter, user){
  var data = appServer.remove("exercises", parameter.id)
  return data
}

appServer.route("GET", "/get-exercises", getExercises)
function getExercises(parameter, user){
  var exercises = appServer.read("exercises")
  var categories = appServer.read("categories")
  exercises = exercises.map(exercise => {
    exercise.category = categories.find(category => category.id == exercise.category_id)
    return exercise
  })
  return exercises
}

appServer.route("GET", "/get-exercise", getExercise)
function getExercise(parameter, user){
  var exercises = getExercises(parameter, user)
  exercise = exercises.find(ele => ele.id == parameter.id)
  return exercise
}