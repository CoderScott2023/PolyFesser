var totalGames = 0;
var players = null;

function calculateWinRate(data, tribe1, tribe2 = null, filters) {
  const filteredData = data.filter(entry => {
    // Check if the game involves four or nine players
    const isFourOrNinePlayers = entry.players === "Four" || entry.players === "Nine";

    // Apply the matchup filter conditionally based on the number of players
    const isMatchup = isFourOrNinePlayers || (tribe2 ?
      ((entry.winning_tribe === tribe1 && entry.opponent_tribe === tribe2) ||
        (entry.winning_tribe === tribe2 && entry.opponent_tribe === tribe1)) :
      (entry.winning_tribe === tribe1 || entry.opponent_tribe === tribe1));

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

      return filterMatch && (players === "Two" || isFourOrNinePlayers);
    } else {
      return isMatchup;
    }
  });

  // Count wins and losses for tribe1
  const tribe1Wins = filteredData.filter(entry => entry.winning_tribe === tribe1).length;
  const totalTribeGames = tribe2 ? filteredData.length : filteredData.filter(entry => entry.winning_tribe === tribe1 || entry.opponent_tribe === tribe1).length;

  totalGames = totalTribeGames;
  var winRate = 0;

  // Check if 'players' is defined and has a value
  if (players === "Two") {
    if (tribe2 === null) {
      // Calculate win rate for two players where tribe1 competes against all opponents
      const totalTribeGames = filteredData.filter(entry =>
        entry.winning_tribe === tribe1 || entry.opponent_tribe === tribe1
      ).length;
      winRate = totalTribeGames ? (tribe1Wins / totalTribeGames) * 100 : 0;
    } else {
      // Calculate win rate for two tribes
      const totalTribeGames1 = filteredData.filter(entry => {
        return (
          (entry.winning_tribe === tribe1 && entry.opponent_tribe === tribe2) ||
          (entry.winning_tribe === tribe2 && entry.opponent_tribe === tribe1)
        );
      }).length;
      const tribe1Wins = filteredData.filter(entry =>
        entry.winning_tribe === tribe1 && entry.opponent_tribe === tribe2
      ).length;

      console.log(tribe1Wins);
      console.log(totalTribeGames1);
      totalGames = totalTribeGames1;
      winRate = totalTribeGames1 ? (tribe1Wins / totalTribeGames1) * 100 : 0;
    }
  } else if (players === "Four" || players === "Nine") {
    // Calculate win rate for games with four or nine players involving only tribe1 and tribe2
    const totalTribeGamesFiltered = filteredData.filter(entry =>
      (entry.players === "Four" || entry.players === "Nine") &&
      ((entry.winning_tribe === tribe1 && entry.opponent_tribe === tribe2) ||
        (entry.winning_tribe === tribe2 && entry.opponent_tribe === tribe1))
    ).length;
    const tribe1Wins = filteredData.filter(entry => entry.winning_tribe === tribe1).length;
    winRate = totalTribeGamesFiltered ? (tribe1Wins / totalTribeGamesFiltered) * 100 : 0;
  }



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
      var gameMode = document.getElementById("game-mode").value;
      players = document.getElementById("players").value;

      if (mapSize !== "") {
        filters["map_size"] = mapSize;
      }
      if (mapType !== "") {
        filters["map_type"] = mapType;
      }
      if (gameMode !== "") {
        filters["game_mode"] = gameMode;
      }
      if (players !== "") { // Check if players has a value
        filters["players"] = players;
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
      } else if (tribe1 !== '' && tribe2 === '') {
        // Calculate win rate for just tribe1
        winRate = calculateWinRate(data, tribe1, null, filters);
        console.log(`Win rate for ${tribe1} with filters: ${winRate}%`);
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

const tribe1Dropdown = document.getElementById('tribe1');
const tribe2Dropdown = document.getElementById('tribe2');
const playersDropdown = document.getElementById('players');

const disablePlayersOptions = (disabled) => {
  for (let option of playersDropdown.options) {
    if (option.value !== "Two") {
      option.disabled = disabled;
    }
  }
};

tribe2Dropdown.addEventListener('change', () => {
  const isTribe2Selected = tribe2Dropdown.value !== ''; // Check if a tribe is selected in the second tribe dropdown

  // Disable all options in the players dropdown except for "Two" players option if a tribe is selected in the second tribe dropdown
  disablePlayersOptions(isTribe2Selected);
});

// Initialize player options state
disablePlayersOptions(false); // Initially enable all player options
// Reset playersDropdown to "Two Players" if tribe2 is selected
tribe2Dropdown.addEventListener('change', () => {
  if (tribe2Dropdown.value !== '') {
    playersDropdown.value = "Two";
  }
});
