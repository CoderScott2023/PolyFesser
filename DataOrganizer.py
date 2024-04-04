import csv


def organize_data(data_file, min_elo=None, max_elo=None, map_size=None, map_type=None):
  """
  Organizes game data from a CSV file based on matchups, calculates win rates for the first tribe specified,
  and allows filtering by Elo range, map size, and map type.

  Args:
      data_file (str): Path to the CSV file containing game data.
      min_elo (int, optional): Minimum Elo for filtering games (defaults to None, including all Elos).
      max_elo (int, optional): Maximum Elo for filtering games (defaults to None, including all Elos).
      map_size (str, optional): Filter data by map size (defaults to None, showing all sizes).
      map_type (str, optional): Filter data by map type (defaults to None, showing all types).

  Returns:
      dict: A dictionary where keys are tuples representing matchups (tribe1, tribe2),
            and values are dictionaries containing information about the matchup:
            - total_games (int): Total number of games played between the two tribes (filtered by provided arguments).
            - wins_by_tribe1 (int): Number of games won by tribe1 (filtered by provided arguments).
            - win_rate_tribe1 (float): Win rate for tribe1 (rounded to 2 decimal places).
            - map_data (dict, optional): A dictionary containing further breakdown by map types
              if multiple map types are present in the data. Keys are map types, and values
              are dictionaries with the same structure as the main dictionary entry.
  """
  matchup_data = {}

  with open(data_file, 'r') as csvfile:
    reader = csv.DictReader(csvfile)

    for row in reader:
      # Extract relevant data
      map_size = row['Map Size']
      map_type = row['Map Type']
      tribe1, tribe2 = row['Winning Tribe'].split(' vs ')  # Assuming winning tribe format "Tribe1 vs Tribe2"
      winner = row['Winning Player']
      winning_elo = int(row['Winning Player Elo'])  # Assuming Elo is stored as a string, convert to integer

      # Filter by Elo range, map size, and map type (if provided)
      if (min_elo is None or winning_elo >= min_elo) and (max_elo is None or winning_elo <= max_elo) and (map_size is None or map_size == row['Map Size']) and (map_type is None or map_type == row['Map Type']):
        # Create matchup key (assuming tribe order matters)
        matchup_key = (tribe1, tribe2)

        # Initialize data for the matchup
        if matchup_key not in matchup_data:
          matchup_data[matchup_key] = {
            'total_games': 0,
            'wins_by_tribe1': 0,
            'win_rate_tribe1': 0.0,
            'map_data': {}  # Optional dictionary for map type breakdown (if needed)
          }

        # Update matchup data (considering tribe order)
        if winner == tribe1:
          matchup_data[matchup_key]['wins_by_tribe1'] += 1
        else:  # Assuming winner is tribe2 based on matchup key order
          pass  # No update for tribe1 wins if tribe2 wins

        # Update total games
        matchup_data[matchup_key]['total_games'] += 1

        # Optional: Breakdown by map type (if applicable)
        if map_type not in matchup_data[matchup_key]['map_data']:
          matchup_data[matchup_key]['map_data'][map_type] = {
            'total_games': 0,
            'wins_by_tribe1': 0,
            'win_rate_tribe1': 0.0
          }

        # Update map type data (if breakdown is used)
        if winner == tribe1:
          matchup_data[matchup_key]['map_data'][map_type]['wins_by_tribe1'] += 1
        else:
          pass  # No update for tribe1 wins if tribe2 wins (within map type)

