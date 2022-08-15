appServer.route("POST", "/create-workout", createWorkouts)
function createWorkouts(parameter, user) {
    var data = appServer.post("workouts", parameter)
    return data
}

appServer.route("POST", "/update-workout", updateWorkouts)
function updateWorkouts(parameter, user) {
    var data = appServer.update("workouts", parameter.id, parameter)
    return data
}

appServer.route("POST", "/delete-workout", deleteWorkouts)
function deleteWorkouts(parameter, user) {
    var data = appServer.remove("workouts", parameter.id)
    return data
}

appServer.route("GET", "/get-workouts", getWorkouts)
function getWorkouts(parameter, user) {
    var workouts = appServer.read("workouts")
    var exercises = getExercises(parameter, user)
    workouts = workouts.map(workout => {
        workout.date = workout.date.toISOString().split("T")[0]
        workout.exercise = exercises.find(exercise => exercise.id == workout.exercise_id)
        return workout
    })
    return workouts
}

appServer.route("GET", "/get-workout", getWorkout)
function getWorkout(parameter, user) {
    var workouts = getWorkouts(parameter, user)
    var workout = workouts.find(workout => workout.id == parameter.id)
    return workout
}