# Meetup Scraper using Anakin.io

This project provides a script to scrape upcoming events from Meetup (Bangalore) using the **Anakin.io** AI-powered web scraping API.

## Prerequisites

1. **Node.js** installed on your system.
2. An **Anakin.io API Key**. You can get this from your [Anakin.io Dashboard](https://anakin.io/).

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure API Key**:
   Open the `.env` file and replace `your_api_key_here` with your actual Anakin.io API key:
   ```env
   ANAKIN_API_KEY=your_actual_api_key_here
   ```

## Usage

Run the scraper with the following command:

```bash
node scrape_meetup.js
```

The script will:
- Submit a request to Anakin.io to scrape `https://www.meetup.com/find/in--bangalore/`.
- Use a headless browser to render JavaScript content.
- Use AI to extract structured data (titles, dates, locations, group names, etc.) into a clean JSON format.
- Poll the Anakin.io API until the results are ready.

## Script Details

The script `scrape_meetup.js` uses the following schema for extraction:

```json
{
  "title": "string",
  "date_time": "string",
  "location_name": "string",
  "address": "string",
  "group_name": "string",
  "event_url": "string",
  "attendee_count": "integer"
}
```
# AnakinProject
