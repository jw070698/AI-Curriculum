# uvicorn src.App:app --reload --host 0.0.0.0 --port 1350

from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import uvicorn
import json
import sys
import os
import re
with open('apikey.json') as f:
    config = json.load(f)
API_KEY1 = config["API_KEY1"]
client = OpenAI(api_key=API_KEY1)

# Custom file import
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
from components.OpenAI_request import ChatApp
from components.Database import get_recent_messages, store_messages
from components.YouTube_request import get_search_response, get_video_info, info_to_dict
from components.GoogleSearch_request import google_search
from components.Parse import extract_video_list, extract_day_topics

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chat_app = ChatApp()

class MessageRequest(BaseModel):
    user_message: str = None
    user_input: str = None

class InfoRequest(BaseModel):
    info_message: str

class SearchRequest(BaseModel):
    search_message: str

def extract_topic(user_message):
    match = re.search(r'Create a study plan for a .* student on (.+?) using', user_message)
    if match:
        return match.group(1)
    return None

@app.post("/response")
async def generate_response(request: MessageRequest):
    if request.user_message:
        response_text = chat_app.chat(request.user_message)
        store_messages(request.user_message,response_text) # Store user message & study plan
    elif request.user_input:
        response_text = chat_app.chat(request.user_input) 
        store_messages(request.user_input,response_text) # Store user input & study plan
        print("Received user_input")
    else:
        response_text = 'No message'
    return {"response": response_text}

@app.post("/info")
async def generate_info_response(request: InfoRequest):
    print(f"Received info_message: {request.info_message}")
    try: 
        if not request.info_message:
            raise HTTPException(status_code=400, detail="No info message provided")
        else:
            response = client.chat.completions.create(model="gpt-4o", messages=[
                {"role": "system", "content": "You are a helpful assistant. You will let user know about the difference of background knowledge level of 'absolute beginner, beginner, intermediate, advanced' of the topic as a table. Please be concise."},
                {"role": "user", "content": request.info_message}
            ])
            response_received = response.choices[0].message.content
            print(response_received)
            return {"response": response_received}
    except Exception as e:
        print(f"Error: {str(e)}")

@app.post("/search")
async def generate_search_response(request: SearchRequest):
    search_message = request.search_message
    response_resources = get_search_response(search_message)
    print(response_resources)
    return {"response": response_resources}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=1350)
