function calculateWinRate(data, tribe1, tribe2, filters) {
  const filteredData = data.filter(entry => {
    // Matchup filter (same as before)
    const isMatchup = (entry.winning_tribe === tribe1 && entry.opponent_tribe === tribe2) ||
      (entry.winning_tribe === tribe2 && entry.opponent_tribe === tribe1);

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
  const totalGames = filteredData.length;

  // Calculate win rate (handle division by zero)
  const winRate = totalGames ? (tribe1Wins / totalGames) * 100 : 0;
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
  loadGameData('polyelo_data.json') // Replace with your actual file path
    .then(data => {
      // Game data loaded successfully
      var tribe1 = document.getElementById("tribe1").value;
      var tribe2 = document.getElementById("tribe2").value;
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

      const winRate = calculateWinRate(data, tribe1, tribe2, filters);

      console.log(`Win rate for ${tribe1} vs ${tribe2} with filters: ${winRate}%`);

      document.getElementById("homePage").classList.remove("buttons");
      document.getElementById("homePage").classList.add("hidden");
      document.getElementById("statPage").classList.remove("hidden");
      document.getElementById("statPage").classList.add("showing");
      if (Object.keys(filters).length !== 0) {
        document.getElementById("winningText").innerHTML = `Win rate for ${tribe1} vs ${tribe2} with filters: ${winRate}%`;
      }
      else {
        document.getElementById("winningText").innerHTML = `Win rate for ${tribe1} vs ${tribe2}: ${winRate}%`;

      }
    })
    .catch(error => console.error('Error fetching game data: Problem with calculateWinRate function', error));
}
