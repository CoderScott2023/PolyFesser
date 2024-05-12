
var totalGames = 0;

function calculateWinRate(data, tribe1, tribe2 = null, filters) {
  const filteredData = data.filter(entry => {
    // Matchup filter (same as before)
    const isMatchup = tribe2 ?
      ((entry.winning_tribe === tribe1 && entry.opponent_tribe === tribe2) ||
        (entry.winning_tribe === tribe2 && entry.opponent_tribe === tribe1)) :
      (entry.winning_tribe === tribe1 || entry.opponent_tribe === tribe1);

    // Filter based on user-defined criteria
    if (Object.keys(filters).length !== 0) {
      const filterMatch = Object.entries(filters).every(([key, value]) => {
        // If the filter key is 'minElo' or 'maxElo', check if the Elo falls within the specified range
        if (key === 'min_elo') {
          return entry['elo'] !== undefined && entry['elo'] >= value;
        } else if (key === 'max_elo') {
          return entry['elo'] !== undefined && entry['elo'] <= value;
        } else {
          return entry[key] === value;
        }
      });
      return isMatchup && filterMatch;
    } else {
      return isMatchup;
    }
  });

  // Count wins and losses for tribe1
  const tribe1Wins = filteredData.filter(entry => entry.winning_tribe === tribe1).length;
  const totalTribeGames = tribe2 ? filteredData.length : filteredData.filter(entry => entry.winning_tribe === tribe1 || entry.opponent_tribe === tribe1).length;

  totalGames = filteredData.length;
  // Calculate win rate (handle division by zero)
  const winRate = totalTribeGames ? (tribe1Wins / totalTribeGames) * 100 : 0;
  return winRate.toFixed(2); // Format win rate to two decimal places
}




// Function to load game data from a JSON file
function loadGameData(fileName) {
  return fetch(fileName)
    .then(response => response.json())
    .then(data => {
      return data;
    })
    .catch(error => console.log('Error loading game data: Problem with loadGameData function: ', error));
}

function onClick() {
  var tribe1 = document.getElementById("tribe1").value;
  var tribe2 = document.getElementById("tribe2").value;

  // Check if at least one tribe is selected
  if (tribe1 === '' && tribe2 === '') {
    console.log("Please select at least one tribe.");
    return; // Exit function early if no tribe is selected
  }

  loadGameData('polyelo_data.json')
    .then(data => {
      var filters = {};
      var mapSize = document.getElementById("map-size").value;
      var mapType = document.getElementById("map-type").value;
      var minElo = document.getElementById("min-elo").value;
      var maxElo = document.getElementById("max-elo").value;

      if (mapSize !== "") {
        filters["map_size"] = mapSize;
      }
      if (mapType !== "") {
        filters["map_type"] = mapType;
      }
      if (minElo !== "") {
        filters["min_elo"] = parseInt(minElo); // Convert to integer if needed
      }
      if (maxElo !== "") {
        filters["max_elo"] = parseInt(maxElo); // Convert to integer if needed
      }
      console.log(filters);

      let winRate;
      if (tribe1 !== '' && tribe2 !== '') {
        // Calculate win rate for both tribes
        winRate = calculateWinRate(data, tribe1, tribe2, filters);
        console.log(`Win rate for ${tribe1} vs ${tribe2} with filters: ${winRate}%`);
      } else if (tribe1 !== '') {
        // Calculate win rate for just tribe1
        winRate = calculateWinRate(data, tribe1, null, filters);
        console.log(`Win rate for ${tribe1} with filters: ${winRate}%`);
      } else {
        // Calculate win rate for just tribe2
        winRate = calculateWinRate(data, tribe2, null, filters);
        console.log(`Win rate for ${tribe2} with filters: ${winRate}%`);
      }

      // Display the win rate based on selected tribes
      document.getElementById("homePage").classList.remove("buttons");
      document.getElementById("homePage").classList.add("hidden");
      document.getElementById("statPage").classList.remove("hidden");
      document.getElementById("statPage").classList.add("showing");

      if (tribe1 !== '' && tribe2 !== '') {
        document.getElementById(tribe1).classList.add("imgShowing1");
        document.getElementById(tribe2).classList.add("imgShowing2");
        document.getElementById("Swords").classList.remove("hidden");
        document.getElementById("Swords").classList.add("swords");
        document.getElementById("winningText").innerHTML = `Win rate for ${tribe1} vs ${tribe2}:`;
      } else if (tribe1 !== '') {
        document.getElementById(tribe1).classList.add("imgMiddleShowing");
        document.getElementById("winningText").innerHTML = `Win rate for ${tribe1}:`;
      }
      
      document.getElementById("sourcesText").classList.remove("hidden");
      document.getElementById("resetButton").classList.remove("hidden");
      document.getElementById("resetButton").classList.add("reset");
      document.getElementById("sourcesText").classList.add("sources");
      document.getElementById("winrateText").innerHTML = `${winRate}%`;
      document.getElementById("sourcesText").innerHTML = `Based on ${totalGames} total games`;
    })
    .catch(error => console.error('Error fetching game data: Problem with calculateWinRate function', error));
}


function reset() {
  location.reload();
}

const tribe1Select = document.getElementById('tribe1');
const tribe2Select = document.getElementById('tribe2');

const disableTribe = (selectElement, selectedValue) => {
  selectElement.disabled = selectedValue === ''; // Enable if no tribe selected

  for (let option of selectElement.options) {
    option.disabled = option.value === selectedValue;
  }
};

tribe1Select.addEventListener('change', () => {
  disableTribe(tribe2Select, tribe1Select.value);
});

tribe2Select.addEventListener('change', () => {
  disableTribe(tribe1Select, tribe2Select.value);
});

const firstTribeSelect = document.getElementById('tribe1');
const secondTribeSelect = document.getElementById('tribe2');

firstTribeSelect.addEventListener('change', () => {
  secondTribeSelect.disabled = firstTribeSelect.value === ''; // Disable secondTribe select element if firstTribe is not selected
  if (firstTribeSelect.value === '') {
    secondTribeSelect.value = ''; // Clear secondTribe selection when firstTribe goes back to ""
  }
});

secondTribeSelect.addEventListener('change', () => {
  firstTribeSelect.disabled = secondTribeSelect.value === ''; // Disable firstTribe select element if secondTribe is not selected
});
