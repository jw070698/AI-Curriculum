from openai import OpenAI
import sys
import os
import json
from dotenv import load_dotenv
load_dotenv()
api_key = os.getenv("API_KEY1")
client = OpenAI(api_key=api_key)

class ChatApp:
    def __init__(self):
        self.client = client
        self.messages = [
            {"role": "system", "content": "You are a helpful assistant to create study plans based on user's needs and preference. \
            If user asks creating study plans, try to suggest best possible fit in terms of time limitation, type of resources, their knowledge base.\
            Show the overview of the generated plans, and then detailed daily plans. The recommended resources should be with accessible and available links, and the one that came out before shouldn't come out after that.\
            In addition, match resources with the each day topic, and don't recommend not existing resources.\
            One week consists of 5 days.\
            Depends on user preferences, show the resources, and separate resources' title and link.\
            Please showing results only with json style for future parsing, do not include any other format:\
            studyPlan_Overview = {\"Week1: week1 overview\", ...}\
            studyPlan = {\"Week 1: Introduction to Python\": [\
                            {\
                                day: \"Day 1\",\
                                topic: something, \
                                resources: YouTube\
                                title: \"What is Python & Setting Up Your Environment\",\
                                link: \"https://youtu.be/kqtD5dpn9C8?feature=shared\"\
                            },\
            Else if user asks questions start with why, then give detailed reasons helping users to understand why."}
        ]

    def chat(self, message):
        self.messages.append({"role": "user", "content": message})
        try:
            response = self.client.chat.completions.create(model="gpt-4o", messages=self.messages)
            print(response.choices[0].message.content)
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI API request error: {e}")
            return "Error occurred while communicating with the AI."
