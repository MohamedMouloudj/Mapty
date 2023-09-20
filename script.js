/* eslint-disable no-plusplus */
/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
// prettier-ignore
/* eslint no-underscore-dangle: "off" */
/* eslint no-multi-assign: "off" */

"use strict"

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");
const inputExerciseNum = document.querySelector(".form__input--exercise");

class Workout {
    date = new Date();

    id = Math.floor(Math.random() * Date.now());

    constructor(distance, duration, coords, type) {
        this.type = type;
        this.distance = distance;
        this.duration = duration;
        this.coords = coords;
        this.#description()
    }

    #description() {
        this.description = `on ${
            months[this.date.getMonth()]} ${this.date.getDate()}`
    }
}
class Running extends Workout {
    constructor(distance, duration, coords, cadence) {
        super(distance, duration, coords, "Running");
        this.cadence = cadence;
        this.calcPace();
    }

    calcPace() {
        this.pace = (this.duration / this.distance).toFixed(1);
        return this.pace;
    }
}
class Cycling extends Workout {
    constructor(distance, duration, coords, elevationGain) {
        super(distance, duration, coords, "Cycling");
        this.elevationGain = elevationGain;
        this.calcSpeed()
    }

    calcSpeed() {
        this.speed = (this.distance / (this.duration / 60)).toFixed(1);
        return this.speed
    }
}

class GymWorkout extends Workout {
    constructor(distance, duration, coords, exercisesNum) {
        super(distance, duration, coords, "Gym");
        this.exercisesNum = exercisesNum;
    }
}

class App {
    workouts = [];

    workoutsMarkers = [];

    #map

    #mapEvent

    // eslint-disable-next-line no-useless-constructor, no-empty-function
    constructor() {
        this.#getPosition();
        this.#retreiveFromLocaleStorage()
        form.addEventListener("submit", this.#newWorkout.bind(this))
        inputType.addEventListener("change", this.#changeField)
        containerWorkouts.addEventListener("click", this.#moveToMarker.bind(this))
    }

    #getPosition() {
        if (navigator.geolocation) { // condition check for old browsers
            navigator.geolocation.getCurrentPosition(
            this.#loadMap.bind(this),
            () => {
                alert("Could not get your position")
            },
            )
        }
    }

    #loadMap(position) {
            const { latitude } = position.coords;
            const { longitude } = position.coords;
            const coords = [latitude, longitude]

           this.#map = L.map("map").setView(coords, 13);

            L.tileLayer("https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
                attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors",
            }).addTo(this.#map);

            const userLocationMarker = L.marker(coords).addTo(this.#map);
            userLocationMarker
                .bindPopup("Your current locaton")
                .openPopup();
            userLocationMarker._icon.classList.add("huechange");

            this.#map.on("click", this.#showForm.bind(this))

            this.workouts.forEach((workout) => {
                let message;
                if (workout.type === "Gym") message = "Workout";
                if (workout.type === "Running") message = "Running";
                if (workout.type === "Cycling") message = "Cycling";
                this.#renderWorkoutMarker(workout, message)
});
    }

    #showForm(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove("hidden");
        inputDistance.focus();
    }

    #changeField() {
        const choices = [inputCadence, inputElevation, inputExerciseNum];
        choices.forEach((choice) => {
            if (choice.dataset.type !== inputType.value) {
                choice.closest(".form__row").classList.add("form__row--hidden");
            } else {
                choice.closest(".form__row").classList.remove("form__row--hidden");
            }
            if (inputType.value === "Workout") {
                inputDistance.closest(".form__row").classList.add("form__row--hidden");
            } else {
                inputDistance.closest(".form__row").classList.remove("form__row--hidden");
            }
        })
    }

    // eslint-disable-next-line consistent-return
    #newWorkout(event) {
        event.preventDefault();
        const isNumber = (...inputs) => inputs.every((inp) => Number.isFinite(inp));
        const isPositif = (...inputs) => inputs.every((inp) => inp > 0);

            const { lat, lng } = this.#mapEvent.latlng;

            const message = inputType.value;
            const duration = +inputDuration.value;
            const distance = +inputDistance.value;

            let workout;
            if (message !== "Workout") {
                if (!isNumber(duration, distance) || !isPositif(duration, distance)) return alert("Please enter valid numbers !");
                if (message === "Running") {
                    const cadence = +inputCadence.value;
                    if (!isPositif(cadence) || !isNumber(cadence)) return alert("Please enter a valide cadence !");
                     workout = new Running(distance, duration, [lat, lng], cadence);
                }
                if (message === "Cycling") {
                    const elevation = +inputElevation.value;
                    if (!isNumber(elevation)) return alert("Please enter a valide elevation !");
                     workout = new Cycling(distance, duration, [lat, lng], elevation);
                }
            } else {
                const exercises = +inputExerciseNum.value;
                if (!isNumber(exercises, duration) || !isPositif(exercises, duration)) return alert("Please enter valide numbers !");
                 workout = new GymWorkout(null, duration, [lat, lng], exercises);
            }

            this.workouts.push(workout);

            this.#renderWorkoutMarker(workout, message);

            this.#renderWorkout(workout)

            this.#hideForm();

            this.#sendToLocalStorage()
    }

    #hideForm() {
        inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = inputExerciseNum.value = "";
        form.style.display = "none";
        form.classList.add("hidden");
        setTimeout(() => { form.style.display = "grid" }, 1000)
    }

    #renderWorkoutMarker(obj, message) {
        let emoji;
        if (obj.type === "Running") {
            emoji = "🏃‍♂️";
        }
        if (obj.type === "Cycling") {
            emoji = "🚴‍♀️";
        }
        if (obj.type === "Gym") {
            emoji = "🏋️‍♂️";
        }
        const tempMarker = L.marker(obj.coords).addTo(this.#map);

        tempMarker.bindPopup(
                    L.popup(
                        {
                            maxWidth: 250,
                            minWidth: 100,
                            autoClose: false,
                            closeOnClick: false,
                            className: `${message}-popup`,
                        },
                    ),
                ).setPopupContent(`${emoji} ${message} ${obj.description}`)
                .openPopup();

        const { id } = obj;
        const tempObj = { tempMarker, id }
        this.workoutsMarkers.push(tempObj)
    }

    #renderWorkout(obj) {
        let emojiType; let emojiInfo; let unit; let specialUnit; let specialInfo; let CE; let isGym;
        let stringElement;
        if (obj.type === "Running") {
            emojiType = "🏃‍♂️";
            emojiInfo = "🦶🏼";
            unit = "spm";
            specialUnit = "min/km";
            specialInfo = obj.pace
            CE = obj.cadence;
            isGym = false;
        }
        if (obj.type === "Cycling") {
            emojiType = "🚴‍♀️";
            emojiInfo = "🏞️";
            unit = "m";
            specialUnit = "km/h"
            specialInfo = obj.speed
            CE = obj.elevationGain;
            isGym = false
        }
        if (obj.type === "Gym") {
            emojiInfo = "🏋️‍♂️";
            unit = "exo"
            CE = obj.exercisesNum;
            isGym = true
        }
        if (!isGym) {
            stringElement = ` <li class="workout workout--${obj.type[0].toLowerCase()}${obj.type.slice(1)}" data-id="${obj.id}">
                                <h2 class="workout__title">${obj.type} ${obj.description}</h2>
                                <button class="workout__remove-details">x</button>
                                <div class="workout__details">
                                <span class="workout__icon">${emojiType}</span>
                                <span class="workout__value">${obj.distance}</span>
                                <span class="workout__unit">km</span>
                                </div>
                                <div class="workout__details">
                                <span class="workout__icon">⏱</span>
                                <span class="workout__value">${obj.duration}</span>
                                <span class="workout__unit">min</span>
                                </div>
                                <div class="workout__details">
                                <span class="workout__icon">⚡️</span>
                                <span class="workout__value">${specialInfo}</span>
                                <span class="workout__unit">${specialUnit}</span>
                                </div>
                                <div class="workout__details">
                                <span class="workout__icon">${emojiInfo}</span>
                                <span class="workout__value">${CE}</span>
                                <span class="workout__unit">${unit}</span>
                                </div>
                            </li>`;
        } else {
            stringElement = ` <li class="workout workout--${obj.type[0].toLowerCase()}${obj.type.slice(1)}" data-id="${obj.id}">
                                <h2 class="workout__title">${obj.type} ${obj.description}</h2>
                                <button class="workout__remove-details">x</button>
                                <div class="workout__details">
                                <span class="workout__icon">⏱</span>
                                <span class="workout__value">${obj.duration}</span>
                                <span class="workout__unit">min</span>
                                </div>
                                <div class="workout__details">
                                <span class="workout__icon">${emojiInfo}</span>
                                <span class="workout__value">${CE}</span>
                                <span class="workout__unit">${unit}</span>
                                </div>
                            </li>`;
        }

        const element = document.createRange().createContextualFragment(stringElement);
        containerWorkouts.prepend(element);

        document.querySelector(`[data-id='${obj.id}']`).querySelector(".workout__remove-details").addEventListener("click", (event) => this.#removeWorkout(obj))
    }

    #removeWorkout(obj) {
        document.querySelector(`[data-id='${obj.id}']`).style.display = "none";
        const foundMarker = this.workoutsMarkers.find((el) => el.id === obj.id);
        this.#map.removeLayer(foundMarker.tempMarker)
        let n,i;
        n = this.workoutsMarkers.length;
        i = this.workoutsMarkers.findIndex((marker)=> marker===foundMarker)
        while (i <= n - 1) {
            
            n--;
            i++;
        }
        n = this.workouts.length;
        i = this.workouts.findIndex((workout) => workout === obj)
        while (i <= n - 1) {
            this.workouts[i] = this.workouts[i + 1];
            this.workouts.pop();
            n--;
            i++;
        }

        this.#sendToLocalStorage()
        // eslint-disable-next-line no-restricted-globals
        event.stopPropagation()
    }

    #moveToMarker(event) {
        const targetMarker = event.target.closest(".workout");
        // eslint-disable-next-line no-useless-return
        if (!targetMarker) return;
        const targetWorkout = this.workouts.find(
            (workout) => workout.id === +targetMarker.dataset.id,
            );
        this.#map.setView(targetWorkout.coords, 13, {
            animate: true,
            pan: {
                duration: 1,
            },
        })
    }

    #sendToLocalStorage() {
        localStorage.setItem("workouts", JSON.stringify(this.workouts));
    }

    #retreiveFromLocaleStorage() {
        const data = JSON.parse(localStorage.getItem("workouts"))

        // eslint-disable-next-line no-useless-return
        if (!data) return;

        this.workouts = data;

        this.workouts.forEach((workout) => { this.#renderWorkout(workout) });
    }

    reset() {
        localStorage.clear();
        // eslint-disable-next-line no-restricted-globals
        location.reload()
    }
}

// eslint-disable-next-line no-unused-vars
const app = new App()

window.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
       const doClear = this.confirm("Do you want to remove all the workouts ?");
       // eslint-disable-next-line no-useless-return
       if (!doClear) return;
        app.reset()
    }
})
