import json

# Get recent messages 
def get_recent_messages():

    # Define file name 
    file_name = "stored_data.json"
    instructions = {"role": "system", "content": "You are suggesting study plan based on user's needs and preference. \
             Try to suggest best possible fit in terms of time limitation, type of resources, their base knowledge. Return the result in json format. \
              Each day title as key, the topic and related resources as values.Do not put anything else in your response. \
             Example of result:{'Day 1': {'topic': 'Variables','content title':'introduction to variables in python', 'link':'link to content'}"}
    
    # Initialize messages
    messages = []
    messages.append(instructions)
    
    #Get last messages
    try:
       with open(file_name, "r") as user_file:
            data = json.load(user_file)
            if data:
                for item in data:
                    messages.append(item)
    except Exception as e:
        print(e)

    return messages


# Store Messages 
def store_messages(request_message, response_message):

  # Define the file name
  file_name = "stored_data.json"

  # Get recent messages
  messages = get_recent_messages()[1:]

  # Add messages to data
  user_message = {"role": "user", "content": request_message}
  assistant_message = {"role": "assistant", "content": response_message}
  messages.append(user_message)
  messages.append(assistant_message)

  # Save the updated file
  with open(file_name, "w") as f:
    json.dump(messages, f)
