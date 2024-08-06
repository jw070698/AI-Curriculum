# YouTube Data API v3
# Input: subject from previous stage
# Output: videoId, title, description, thumbnails, channelTitle, publishtime
import json
from googleapiclient.discovery import build
with open('apikey.json') as f:
    config = json.load(f)
API_KEY2 = config["API_KEY2"]

youtube = build('youtube', 'v3', developerKey = API_KEY2)
# pylint: disable=maybe-no-member

def get_search_response(query):
    search_response = youtube.search().list(
        q = query,
        order = "relevance",
        part = "snippet",
        maxResults = 10
    ).execute()
    return search_response

def get_video_info(search_response):
    result_json = {}
    idx = 0
    for item in search_response['items']:
        if item['id']['kind'] == 'youtube#video':
            result_json[idx] = info_to_dict(item['id']['videoId'], item['snippet']['title'], item['snippet']['description'], item['snippet']['thumbnails']['medium']['url'], item['snippet']['channelTitle'], item['snippet']['publishTime'])
            idx += 1
    return result_json

def info_to_dict(videoId, title, description, thumbnails, channelTitle, publishtime):
    result = {
        "videoId": videoId,
        "title": title,
        "description": description,
        "thumbnails": thumbnails,
        "channelTitle": channelTitle,
        "publishtime": publishtime
        }
    return result