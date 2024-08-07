# Google Custom Search API
# input: subject with method (e.g., python with blogs)
from googleapiclient.discovery import build
# pylint: disable=maybe-no-member
import json
import os
from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv('API_KEY2')
cse_id = os.getenv('CSE_ID1')

def google_search(search_term, api_key, cse_id, **kwargs):
    service = build("customsearch", "v1", developerKey=api_key)
    try:
        res = service.cse().list(q=search_term, cx=cse_id, **kwargs).execute()
        return res.get('items', [])
    except Exception as e:
        print(f"An error occurred: {e}")
        return []