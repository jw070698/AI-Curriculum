from openai import OpenAI
import sys
import os
import json
with open('apikey.json') as f:
    config = json.load(f)
API_KEY1 = config["API_KEY1"]

client = OpenAI(api_key=API_KEY1)

class ChatApp:
    def __init__(self):
        self.client = client
        self.messages = [
            {"role": "system", "content": "You are a helpful assistant to create study plans. You are suggesting study plan based on user's needs and preference. \
            Try to suggest best possible fit in terms of time limitation, type of resources(should be with accessible and available links), their knowledge base. \
            If user asks creating study plans, show me detailed overview of the generated plan with 'overall score: x/10' first with each score of Comprehensiveness & Accessibility & Time Efficiency along with each reason; all score should be out of 10.\
            In addition, show why plan structures are like this.\
            After that show the results effectively and with detailed of each day with title, topic and related resources. \
            For example, like this; Day 1:\n Topic: Introduction to Exceptions\
            Resource-YouTube videos: Python Exception Handling - https://www.youtube.com/watch?v=NIWwJbo-9_8\
            If users choose study using YouTube video; show Resource-YouTube videos: , else if users choose study using Blogs; show Resource-Blogs: .\
            For example, Resource-YouTube videos: videos' name with accessable link \n Resource-Blogs: blogs' name with accessable link.\
            Else if user asks questions start with why, then give detailed reasons helping users to understand why."}
        ]

    def chat(self, message):
        self.messages.append({"role": "user", "content": message})
        try:
            response = self.client.chat.completions.create(model="gpt-4o", messages=self.messages)
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI API request error: {e}")
            return "Error occurred while communicating with the AI."
