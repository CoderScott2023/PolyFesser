import discord
from discord.ext import commands
import json
import re
import logging

# Configure logging
logging.basicConfig(filename='polyelo_bot.log', level=logging.INFO)

# Initialize Discord bot
bot = commands.Bot(command_prefix='!')

# Load configuration (error handling and default values)
try:
  with open('config.json', 'r') as f:
    config = json.load(f)
    YOUR_POLYELO_BOT_ID = config['polyelo_bot_id']
    DATA_FILE = config['data_file']  # Path to the JSON file (change extension)
except FileNotFoundError:
  logging.error("Config file 'config.json' not found. Using default values.")
  YOUR_POLYELO_BOT_ID = "YOUR_BOT_ID_HERE"
  DATA_FILE = 'polyelo_data.json'

@bot.event
async def on_ready():
  logging.info(f'{bot.user} has connected to Discord!')

@bot.event
async def on_message(message):
  # Check sender and message content for game end notification
  if message.author.id == YOUR_POLYELO_BOT_ID and message.content.startswith("Game has ended"):
    try:
      # Extract relevant game data using regex
      match = re.search(r"Map Size: (.*?), Map Type: (.*?), Tribes Involved: (.*?), Winning Player: (.*?), Winning Tribe: (.*?), Winning Elo: (.*?)$", message.content)
      if match:
        map_size, map_type, tribes_involved, winning_player, winning_tribe, winning_elo = match.groups()
      else:
        logging.warning("Failed to extract game data using regex. Skipping message.")
        return

      # Validate if only two tribes are involved (1v1)
      if len(tribes_involved.split(',')) == 2:
        # Store data in JSON file
        store_data(map_size, map_type, tribes_involved, winning_player, winning_tribe, winning_elo)
        logging.info("Successfully processed 1v1 game data and stored in JSON.")
      else:
        logging.info("Skipping message - Not a 1v1 game (more than 2 tribes involved).")
    except Exception as e:
      logging.error(f"Error processing message: {e}")

# Function to store data in a JSON file
def store_data(map_size, map_type, tribes_involved, winning_player, winning_tribe, winning_elo):
  try:
    with open(DATA_FILE, 'a') as jsonfile:  # Use 'a' mode for appending
      data = {
          "map_size": map_size,
          "map_type": map_type,
          "tribes_involved": tribes_involved,
          "winning_player": winning_player,
          "winning_tribe": winning_tribe,
          "winning_elo": winning_elo
      }
      # Optionally enclose data in a list for array-like structure:
      # json.dump([data], jsonfile)  # Uncomment for array-like structure
      json.dump(data, jsonfile)  # Write as a single JSON object per line
      json.write('\n')  # Add a newline for separating multiple objects
  except IOError as e:
    logging.error(f"Error writing to JSON file: {e}")

# Run the bot
bot.run('YOUR_BOT_TOKEN')
