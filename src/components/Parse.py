import re 

def extract_video_list(text):
    pattern = r"- ([^-]+) - https://www\.youtube\.com/watch"

    # Find all matches
    video_names = re.findall(pattern, text)
    
    return video_names

def extract_day_topics(text):
    pattern = r"#### Day \d+[\s\S]*?(?=#### Day \d+|### Week \d+|$)"
    
    # Find all matches
    topics = re.findall(pattern, text)
    return topics