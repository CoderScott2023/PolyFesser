from flask import Flask, jsonify, request
import csv


app = Flask(__name__)

def organize_data(data_file, tribe1, tribe2, min_elo=None, max_elo=None, map_size=None, map_type=None):
  """
  Organizes game data based on matchups, calculates win rates, and allows filtering.

  Args:
      data_file (str): Path to the CSV file containing game data.
      tribe1 (str): Tribe 1 name.
      tribe2 (str): Tribe 2 name.
      min_elo (int, optional): Minimum Elo (defaults to None, including all Elos).
      max_elo (int, optional): Maximum Elo (defaults to None, including all Elos).
      map_size (str, optional): Filter data by map size (defaults to None, showing all sizes).
      map_type (str, optional): Filter data by map type (defaults to None, showing all types).

  Returns:
      dict: A dictionary containing win rate information for the specified matchup (tribe1 vs tribe2)
            filtered by provided arguments.
  """
  matchup_data = {}

  with open(data_file, 'r') as csvfile:
    reader = csv.DictReader(csvfile)

    for row in reader:
      # Extract relevant data
      map_size = row['Map Size']
      map_type = row['Map Type']
      winning_tribe = row['Winning Tribe']
      winner = row['Winning Player']
      winning_elo = int(row['Winning Player Elo'])  # Assuming Elo is stored as a string, convert to integer

      # Filter by Elo range, map size, and map type (if provided)
      if (min_elo is None or winning_elo >= min_elo) and (max_elo is None or winning_elo <= max_elo) and (map_size is None or map_size == row['Map Size']) and (map_type is None or map_type == row['Map Type']):
        # Create matchup key
        matchup_key = (tribe1, tribe2)

        # Check if data for the specific matchup is needed (based on user input)
        if matchup_key[0] == tribe1 and matchup_key[1] == tribe2:
          # Initialize data for the matchup
          if matchup_key not in matchup_data:
            matchup_data[matchup_key] = {
              'total_games': 0,
              'wins_by_tribe1': 0,
              'win_rate_tribe1': 0.0,
            }

          # Update matchup data (considering tribe order)
          if winner == tribe1:
            matchup_data[matchup_key]['wins_by_tribe1'] += 1
          else:  # Assuming winner is tribe2 based on matchup key order
            pass  # No update for tribe1 wins if tribe2 wins

          # Update total games
          matchup_data[matchup_key]['total_games'] += 1

  # Calculate win rates for the requested matchup (if data exists)
  requested_matchup_data = matchup_data.get((tribe1, tribe2), {})
  if requested_matchup_data:
    total_games = requested_matchup_data['total_games']
    if total_games > 0:
      requested_matchup_data['win_rate_tribe1'] = round(requested_matchup_data['wins_by_tribe1'] / total_games, 2)

  return requested_matchup_data  # Return data for the specific matchup or empty dict

@app.route('/api/winrates', methods=['GET'])
def get_winrates():
  tribe1 = request.args.get('tribe1')
  tribe2 = request.args.get('tribe2')
  min_elo = request.args.get('min_elo', type=int)
  max_elo = request.args.get('max_elo', type=int)
  map_size = request.args.get('map_size')
  map_type = request.args.get('map_type')

  # Call your organize_data function with arguments
  matchup_data = organize_data('polyelo_data.csv', tribe1, tribe2, min_elo, max_elo, map_size, map_type)

  
