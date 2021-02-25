// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
var store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})

		getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
	} catch(error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
		const { target } = event

		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
		}

		// Podracer form field
		if (target.matches('.card.podracer')) {
			handleSelectPodRacer(target)
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()

			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate(target)
		}

	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
	// render starting UI
	const tracks = await getTracks();
	const track = tracks.find(item => item.id === store.track_id);

	renderAt('#race', renderRaceStartView(track))

	// TODO - Get player_id and track_id from the store
	const { track_id, player_id } = store;

	// const race = TODO - invoke the API call to create the race, then save the result
	const race = await createRace(track_id, player_id)
		.then(race => {
			store.race_id = race.ID;
			return runCountdown()
		})
		.then(() => startRace(store.race_id))
		.then(() => runRace(store.race_id))
		.catch(error => alert('We have troubles to start the game:', error))
}

function runRace(raceID) {
	try {
		return new Promise(resolve => {
			const getRaceInfo = () => {
				getRace(raceID)
					.then((response) => {
						 if (response.status === "in-progress") {
							 //TODO - if the race info status property is "in-progress", update the leader board by calling:
							 renderAt('#leaderBoard', raceProgress(response.positions))
						} else if (response.status === "finished") {
							 //TODO - if the race info status property is "finished", run the following:
							 clearInterval(raceInterval) // to stop the interval from repeating
							 renderAt('#race', resultsView(response.positions)) // to render the results view
							 resolve(response) // resolve the promise
						 }
					})
			}
			// TODO - use Javascript's built in setInterval method to get race info every 500ms
			//source: https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setInterval
			const raceInterval = setInterval(() => getRaceInfo(), 500, raceID)
		})
	} catch (error) {
		// remember to add error handling for the Promise
		alert("We can not retrieve race info, sorry:", error)
	}
}

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000)
		let timer = 3

		return new Promise(resolve => {
			// TODO - use Javascript's built in setInterval method to count down once per second
			const countInterval = setInterval(() => count(), 1000)

			const count = () => {
				if (timer > 0) {
					// run this DOM manipulation to decrement the countdown for the user
					document.getElementById('big-numbers').innerHTML = --timer
				} else if (timer === 0) {
					// TODO - if the countdown is done, clear the interval, resolve the promise, and return
					clearInterval(countInterval);
					resolve();
				}
			}
		})
	} catch(error) {
		console.log(error);
	}
}

function handleSelectPodRacer(target) {
	console.log("selected a pod", target.id)

	try {
		const selected = document.querySelector('#racers .selected')
		if(selected) {
			// remove class selected from all racer options
			selected.classList.remove('selected')
		}

		// add class selected to current target
		target.classList.add('selected')

		// TODO - save the selected racer to the store
		store.player_id = parseInt(target.id);

	} catch (error) {
		alert("There is an error with the pod selected:", error)
	}
}

function handleSelectTrack(target) {
	console.log("selected a track", target.id)

	try {
		const selected = document.querySelector('#tracks .selected')
		if(selected) {
			// remove class selected from all track options
			selected.classList.remove('selected')
		}

		// add class selected to current target
		target.classList.add('selected')

		// TODO - save the selected track id to the store
		store.track_id = parseInt(target.id);

	} catch (error) {
		alert("There is an error with the selected track:", error)
	}
}

function handleAccelerate() {
	console.log("accelerate button clicked")
	// TODO - Invoke the API call to accelerate
	try {
		accelerate(store.race_id);
	} catch (error) {
		alert("stop, you can not accelerate:", error)
	}
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer

	return `
		<li class="card podracer" id="${id}">
			<h3>${driver_name}</h3>
			<p>${top_speed}</p>
			<p>${acceleration}</p>
			<p>${handling}</p>
		</li>
	`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const { id, name } = track

	return `
		<li id="${id}" class="card track">
			<h3>${name}</h3>
		</li>
	`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track, racers) {
	return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {
	let userPlayer = positions.find(e => e.id === store.player_id)
	userPlayer.driver_name += " (you)"

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`
	})

	return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints

function getTracks() {
	return fetch(`${SERVER}/api/tracks`)
	.then(response => response.json())
	.catch(error => console.error(`Tracks do not retrieve, please reload: ${error}`))
}

function getRacers() {
	return fetch(`${SERVER}/api/cars`)
	.then(response => response.json())
	.catch(error => console.error(`You have encounter an issue with racers, please reload: ${error}`))
}

function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = { player_id, track_id }

	return fetch(`${SERVER}/api/races`, {
		method: 'POST',
		...defaultFetchOpts(),
		dataType: 'jsonp',
		body: JSON.stringify(body)
	})
	.then(res => res.json())
	.catch(err => console.log("Problem with createRace request::", err))
}

function getRace(id) {
	return fetch(`${SERVER}/api/races/${id - 1}`)
	.then(response => response.json())
	.catch(error => console.error(`You have encounter an issue with racers, please reload: ${error}`))
}

function startRace(id) {
	return fetch(`${SERVER}/api/races/${id - 1}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
	.then(res => res.status)
	.catch(err => console.log("Problem with getRace request:", err))
}

function accelerate(id) {
	return fetch(`${SERVER}/api/races/${id - 1}/accelerate`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
	.then(res => res.status)
	.catch(err => console.log("Problem accelerating:", err))
}

//sources: syntaxes taken from fetch lesson / try-catch / async-await