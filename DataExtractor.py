#POSSIBLE SCRIPT, NOT USED CURRENTLY

import requests
from bs4 import BeautifulSoup

def scrape_polyopia():
    url = 'https://www.challengermode.com/polyopia'
    response = requests.get(url)
    
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        games = soup.find_all('div', class_='match-item')
        
        for game in games:
            map_size = game.find('span', class_='map-size').text.strip()
            map_type = game.find('span', class_='map-type').text.strip()
            tribes = game.find('span', class_='tribes').text.strip()
            elos = game.find_all('span', class_='elo')
            elo_values = [elo.text.strip() for elo in elos]
            
            print("Map Size:", map_size)
            print("Map Type:", map_type)
            print("Tribes:", tribes)
            print("ELOs:", ", ".join(elo_values))
            print("\n")
    else:
        print("Failed to fetch data from Polyopia.")

if __name__ == "__main__":
    scrape_polyopia()
