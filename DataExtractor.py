import discord
from discord.ext import commands
import csv
import re
import logging

# Configure logging
logging.basicConfig(filename='polyelo_bot.log', level=logging.INFO)

# Initialize Discord bot
bot = commands.Bot(command_prefix='!')

# Load configuration (replace with your actual configuration logic)
try:
    with open('config.json', 'r') as f:
        config = json.load(f)
        YOUR_POLYELO_BOT_ID = config['polyelo_bot_id']
        DATA_FILE = config['data_file']  # Path to the CSV file
except FileNotFoundError:
    logging.error("Config file 'config.json' not found. Using default values.")
    YOUR_POLYELO_BOT_ID = "YOUR_BOT_ID_HERE"
    DATA_FILE = 'polyelo_data.csv'

@bot.event
async def on_ready():
    logging.info(f'{bot.user} has connected to Discord!')

@bot.event
async def on_message(message):
    # Check if message is from PolyElo bot and signifies game end
    if message.author.id == YOUR_POLYELO_BOT_ID and message.content.startswith("Game has ended"):
        try:
            # Extract game data
            map_size, map_type, tribes_involved, winning_player, winning_tribe, winning_elo = extract_info(message.content)

            # Validate extracted data (optional)
            # Implement logic to check if data is in expected format

            # Store data in CSV file
            store_data(map_size, map_type, tribes_involved, winning_player, winning_tribe, winning_elo)
            logging.info("Successfully processed game data and stored in CSV.")
        except Exception as e:
            logging.error(f"Error processing message: {e}")

# Function to extract relevant information from message content
def extract_info(content):
    # ... (existing logic to extract data using regex)
    return map_size, map_type, tribes_involved, winning_player_info, winning_tribe, winning_elo

# Function to store data in a CSV file
def store_data(map_size, map_type, tribes_involved, winning_player, winning_tribe, winning_elo):
    try:
        with open(DATA_FILE, 'a', newline='') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow([map_size, map_type, tribes_involved, winning_player, winning_tribe, winning_elo])
    except IOError as e:
        logging.error(f"Error writing to CSV file: {e}")

# Run the bot
bot.run('YOUR_BOT_TOKEN')
