import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime
import time
import random

def scrape_hku_events():
    base_url = "https://www.hku.hk/event/category.html"
    
    categories = [
        "category_A",
        "category_B",
        "category_C",
        "category_E",
        "category_L",
        "category_M",
        "category_SC",
        "category_SO",
        "category_SR",
        "category_O"
    ]
    
    category_names = {
        "category_A": "Architecture & Engineering",
        "category_B": "Business & Economics",
        "category_C": "Culture and Arts",
        "category_E": "Education",
        "category_L": "Law and Politics",
        "category_M": "Medical & Health Care",
        "category_SC": "Science & Technology",
        "category_SO": "Social Development & Welfare",
        "category_SR": "Sports and Recreation",
        "category_O": "Others"
    }
    
    required_fields = ['title', 'summary', 'description', 'date', 'time', 'organization', 'type']
    
    print("Fetching main event page...")
    response = requests.get(base_url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    all_events = []
    event_id_counter = 101
    
    for category in categories:
        print(f"Processing category: {category_names[category]}...")
        category_anchor = soup.find('a', {'name': category})
        if not category_anchor:
            print(f"  Warning: Category {category} not found on page")
            continue
            
        category_table = category_anchor.find_next('table')
        if not category_table:
            print(f"  Warning: No table found for category {category}")
            continue
            
        event_rows = category_table.find_all('tr')[1:]
        
        print(f"  Found {len(event_rows)} events in category {category_names[category]}")
        
        for row in event_rows:
            cells = row.find_all('td')
            if len(cells) < 4:
                continue
                
            date_time_text = cells[0].text.strip()
            venue = cells[1].text.strip()
            event_link = cells[3].find('a')
            
            if not event_link:
                continue
                
            event_title = event_link.text.strip()
            event_url = event_link['href']
            
            print(f"  Fetching details for event: {event_title}")
            
            try:
                time.sleep(random.uniform(1, 3))
                
                if event_url.startswith("http"):
                    full_event_url = event_url
                else:
                    full_event_url = f"https://hkuems1.hku.hk/hkuems/{event_url}"
                
                event_response = requests.get(full_event_url)
                event_soup = BeautifulSoup(event_response.text, 'html.parser')
                
                event_description = ""
                event_details_span = event_soup.find('span', class_='UEViewHeader', string='Event Details')
                
                if event_details_span:
                    next_elem = event_details_span.find_next()
                    while next_elem and next_elem.name != 'span' and 'UEViewHeader' not in next_elem.get('class', []):
                        if next_elem.name == 'p':
                            event_description += next_elem.text.strip() + " "
                        next_elem = next_elem.find_next()
                
                event_description = re.sub(r'[^\x00-\x7F]+', '', event_description).strip()
                
                date_time = ""
                date_cell = None
                venue_cell = None
                
                for tr in event_soup.find_all('tr'):
                    tds = tr.find_all('td')
                    if len(tds) >= 2:
                        if "Date/Time" in tds[0].text:
                            date_cell = tds[1]
                        elif "Venue" in tds[0].text:
                            venue_cell = tds[1]
                
                formatted_date = ""
                formatted_time = ""
                
                if date_cell:
                    date_time = date_cell.text.strip()
                    
                    date_pattern = r'(\d{2}/\d{2}/\d{4})'
                    time_pattern = r'(\d{1,2}:\d{2}-\d{1,2}:\d{2})'
                    
                    date_matches = re.findall(date_pattern, date_time)
                    time_match = re.search(time_pattern, date_time)
                    
                    if date_matches:
                        if len(date_matches) == 1:
                            date_str = date_matches[0]
                            day, month, year = date_str.split('/')
                            formatted_date = f"{day}-{month}-{year}"
                        elif len(date_matches) >= 2:
                            start_date = date_matches[0]
                            end_date = date_matches[1]
                            
                            day1, month1, year1 = start_date.split('/')
                            day2, month2, year2 = end_date.split('/')
                            
                            formatted_date = f"{day1}-{month1}-{year1} to {day2}-{month2}-{year2}"
                    
                    elif "to" in date_time:
                        date_parts = date_time.split("to")
                        if len(date_parts) >= 2:
                            start_date_match = re.search(r'(\d{2}/\d{2}/\d{4})', date_parts[0])
                            end_date_match = re.search(r'(\d{2}/\d{2}/\d{4})', date_parts[1])
                            
                            if start_date_match and end_date_match:
                                start_date = start_date_match.group(1)
                                end_date = end_date_match.group(1)
                                
                                day1, month1, year1 = start_date.split('/')
                                day2, month2, year2 = end_date.split('/')
                                
                                formatted_date = f"{day1}-{month1}-{year1} to {day2}-{month2}-{year2}"
                    
                    if time_match:
                        time_text = time_match.group(1)
                        if "-" in time_text:
                            start_time, end_time = time_text.split("-")
                            
                            start_hours, start_minutes = map(int, start_time.split(":"))
                            start_am_pm = "AM" if start_hours < 12 else "PM"
                            if start_hours == 0:
                                start_hours = 12
                            elif start_hours > 12:
                                start_hours -= 12
                            start_formatted = f"{start_hours}:{start_minutes:02d} {start_am_pm}"
                            
                            end_hours, end_minutes = map(int, end_time.split(":"))
                            end_am_pm = "AM" if end_hours < 12 else "PM"
                            if end_hours == 0:
                                end_hours = 12
                            elif end_hours > 12:
                                end_hours -= 12
                            end_formatted = f"{end_hours}:{end_minutes:02d} {end_am_pm}"
                            
                            formatted_time = f"{start_formatted} - {end_formatted}"
                
                if not formatted_date or not formatted_time:
                    print(f"  Trying to extract date/time from category page: {date_time_text}")
                    
                    date_range_match = re.search(r'(\d{1,2}\s+[A-Za-z]{3}\s+-\s+\d{1,2}\s+[A-Za-z]{3}\s+\d{4})', date_time_text)
                    if date_range_match:
                        formatted_date = date_range_match.group(1)
                    
                    date_match = re.search(r'(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})', date_time_text)
                    if date_match and not formatted_date:
                        formatted_date = date_match.group(1)
                    
                    time_match = re.search(r'(\d{1,2}:\d{2}-\d{1,2}:\d{2})', date_time_text)
                    if time_match and not formatted_time:
                        time_text = time_match.group(1)
                        if "-" in time_text:
                            start_time, end_time = time_text.split("-")
                            
                            start_hours, start_minutes = map(int, start_time.split(":"))
                            start_am_pm = "AM" if start_hours < 12 else "PM"
                            if start_hours == 0:
                                start_hours = 12
                            elif start_hours > 12:
                                start_hours -= 12
                            start_formatted = f"{start_hours}:{start_minutes:02d} {start_am_pm}"
                            
                            end_hours, end_minutes = map(int, end_time.split(":"))
                            end_am_pm = "AM" if end_hours < 12 else "PM"
                            if end_hours == 0:
                                end_hours = 12
                            elif end_hours > 12:
                                end_hours -= 12
                            end_formatted = f"{end_hours}:{end_minutes:02d} {end_am_pm}"
                            
                            formatted_time = f"{start_formatted} - {end_formatted}"
                
                organization = "HKU"
                if category == "category_O":
                    organizer_span = event_soup.find('span', class_='UEViewOrganizer')
                    if organizer_span and "organized by" in organizer_span.text:
                        org_text = organizer_span.text.strip()
                        org_match = re.search(r'organized by\s+(.+)', org_text)
                        if org_match:
                            organization = org_match.group(1).strip()
                            organization = re.sub(r'[^\x00-\x7F]+', '', organization).strip()
                
                location = venue
                if venue_cell:
                    location = venue_cell.text.strip()
                
                location = re.sub(r'[^\x00-\x7F]+', '', location).strip()
                
                location = re.sub(r'\.+$', '.', location.strip())
                
                event_title = re.sub(r'[^\x00-\x7F]+', '', event_title).strip()
                
                summary = event_description[:100] + "..." if len(event_description) > 100 else event_description
                
                event = {
                    "eventId": str(event_id_counter),
                    "title": event_title,
                    "image": "https://example.com/event5.jpg",
                    "summary": summary,
                    "description": event_description,
                    "date": formatted_date,
                    "time": formatted_time,
                    "organization": organization,
                    "type": "University Event" if organization == "HKU" else "External Event",
                    "subtype": category_names[category],
                    "location": location
                }
                
                missing_fields = [field for field in required_fields if not event.get(field)]
                if missing_fields:
                    print(f"  Skipping event ID {event_id_counter} due to missing required fields: {', '.join(missing_fields)}")
                    continue
                
                all_events.append(event)
                
                event_id_counter += 1
                print(f"  Added event with ID: {event_id_counter-1}")
                
            except Exception as e:
                print(f"  Error fetching event details: {str(e)}")
                continue
    
    with open('hku_events.json', 'w', encoding='utf-8') as f:
        json.dump({"events": all_events}, f, ensure_ascii=False, indent=2)
    
    print(f"Scraped {len(all_events)} events and saved to hku_events.json")
    return all_events

def convert_to_js_format(events):
    """Convert the events to the required JavaScript format"""
    
    events.sort(key=lambda x: int(x["eventId"]))
    
    js_content = "const hkuEvents = [\n"
    
    for event in events:
        js_content += "  {\n"
        for key, value in event.items():
            if isinstance(value, str):
                value = value.replace('"', '\\"').replace('\n', ' ').replace('\r', '')
                js_content += f'    {key}: "{value}",\n'
            else:
                js_content += f"    {key}: {value},\n"
        js_content += "  },\n"
    
    js_content += "];\n\nmodule.exports = hkuEvents;\n"
    
    with open('hkuEvents.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"Converted events to JavaScript format and saved to hkuEvents.js")
    
    ids = [int(event["eventId"]) for event in events]
    print(f"ID range: {min(ids)} to {max(ids)}")
    print(f"Total events: {len(events)}")
    
    expected_ids = set(range(min(ids), max(ids) + 1))
    actual_ids = set(ids)
    if expected_ids != actual_ids:
        missing = expected_ids - actual_ids
        print(f"Warning: Missing IDs in sequence: {missing}")

if __name__ == "__main__":
    events = scrape_hku_events()
    
    convert_to_js_format(events)