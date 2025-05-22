# Horse Racing Data Scraping Schedule

## Commands to Run on Timer

### 1. Morning Report (Static Data) - Once Daily
```powershell
$headers = @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdmF2a3pnbXpuamZpcmdmeWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjM4MTQ2MywiZXhwIjoyMDYxOTU3NDYzfQ._9jDuMl6hi8AnPdj_cDCJPDiIm_S8eYIUSOKAdyXFw4"
    "Content-Type" = "application/json"
}
$body = @{
    jobType = "discover-tracks"
} | ConvertTo-Json
Invoke-RestMethod -Uri "https://bqvavkzgmznjfirgfyhd.supabase.co/functions/v1/run-scrape-jobs" -Method Post -Headers $headers -Body $body
```

- **Frequency**: Once per day in the morning (around 6:00 AM ET)
- **What it does**: 
  - Discovers all active tracks from the main schedule page
  - Scrapes entries data for each active track (ML odds, jockey, trainer, post position)
  - Stores data in `race_data` and `race_horses` tables
- **Data Collected**:
  - Race Information:
    - Track
    - Race Time
    - Race Number
    - Number of Runners
    - Horse Age/Condition
    - Distance
    - Surface
    - Race Type
    - Purse Amount
  - Horse Information:
    - Post Position Number
    - Morning Line Odds
    - Horse/Runner Name
    - Jockey
    - Trainer
    - Medication
    - Weight

### 2. Live Odds (Real-time Stream)
```powershell
$headers = @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdmF2a3pnbXpuamZpcmdmeWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjM4MTQ2MywiZXhwIjoyMDYxOTU3NDYzfQ._9jDuMl6hi8AnPdj_cDCJPDiIm_S8eYIUSOKAdyXFw4"
    "Content-Type" = "application/json"
}

# Call the check-active-odds job type to automatically find and scrape active races
$body = @{
    jobType = "check-active-odds"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://bqvavkzgmznjfirgfyhd.supabase.co/functions/v1/run-scrape-jobs" -Method Post -Headers $headers -Body $body
```

- **Frequency**: Every 30 seconds
- **When to Start**: ~40 minutes before race time
- **What it does**:
  - Identifies races that are within 40 minutes of post time
  - Scrapes current odds and pool data for those races
  - Updates the `odds_data` table with the latest information
- **Data Collected**:
  - Current updated odds per horse
  - Pool data:
    - Win pool
    - Place pool
    - Show pool
    - Superfecta pool
    - Trifecta pool
    - Exacta pool
    - Daily Double (DD) pool
    - Pick 3 pool
    - Pick 4 pool
    - Pick 5 pool
    - Pick 6 pool

### 3. Race Results
```powershell
$headers = @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdmF2a3pnbXpuamZpcmdmeWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjM4MTQ2MywiZXhwIjoyMDYxOTU3NDYzfQ._9jDuMl6hi8AnPdj_cDCJPDiIm_S8eYIUSOKAdyXFw4"
    "Content-Type" = "application/json"
}

# Get races that have likely completed (scheduled time was more than 15 minutes ago)
$completedRaces = Invoke-RestMethod -Uri "https://bqvavkzgmznjfirgfyhd.supabase.co/rest/v1/race_data?select=id,track_name,race_number&race_time=lte.$(Get-Date).AddMinutes(-15).ToString('o')" -Method Get -Headers $headers

# For each completed race, check for results
foreach ($race in $completedRaces) {
    $body = @{
        jobType = "results"
        trackName = $race.track_name
        raceNumber = $race.race_number
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "https://bqvavkzgmznjfirgfyhd.supabase.co/functions/v1/run-scrape-jobs" -Method Post -Headers $headers -Body $body
}
```

- **Frequency**: Every 30 minutes
- **When to Start**: After race completion (typically 15+ minutes after scheduled post time)
- **What it does**:
  - Identifies races that have likely completed (scheduled time was more than 15 minutes ago)
  - Scrapes results data for those races
  - Stores the results in the `race_results` table
- **Data Collected**:
  - Finishing positions:
    - 1st position (Win, Place, Show)
    - 2nd position (Place, Show)
    - 3rd position (Show)
  - Payouts:
    - $1 Exacta (e.g., 2/3) payout
    - $0.50 Trifecta (e.g., 2/3/5) payout
    - $0.10 Superfecta (e.g., 2/3/5/1) payout
    - $1 Daily Double (e.g., 7/2) payout
    - $1 Pick-3 (e.g., 8/7/2) payout
    - $1 Pick-4 (e.g., 3/8/7/2) payout

## Important Notes

1. Race pages are "frozen" until approximately 40 minutes before race time
2. Morning Line (ML) odds are available in the morning report
3. Live odds only become relevant ~40 minutes before race time
4. Results should be checked periodically after the scheduled race time

## Scraping Strategy Summary

1. **Morning Discovery (Once Daily)**
   - Run the `discover-tracks` job once in the morning (around 6:00 AM ET)
   - This will find all active tracks and scrape their entries
   - Data is stored in `race_data` and `race_horses` tables
   - **Important**: This step captures the Morning Line (ML) odds for each horse

2. **Live Odds Monitoring (Every 30 seconds during active races)**
   - Run the `check-active-odds` job every 30 seconds
   - Automatically finds races within 40 minutes of post time
   - Scrapes real-time odds data as they change throughout the day
   - Updates the `odds_data` table with the latest information
   - Captures both current odds and pool data (Win/Place/Show and exotics)

3. **Results Collection (Every 30 minutes)**
   - For races that have completed (15+ minutes after scheduled post time)
   - Scrape and store results data in the `race_results` table

This approach ensures we're capturing both morning line odds (static, set by the track) and real-time odds (dynamic, changing based on betting activity). By storing them in separate tables (`race_horses` for ML odds and `odds_data` for real-time odds), we can track how odds change over time and compare final odds to the morning line.

## Implementation Strategy

1. **Morning Scrape** (Daily, early AM):
   - Scrape all races scheduled for the day
   - Collect static data (race info, entries, ML odds)
   - Store in `race_data` and `race_horses` tables

2. **Pre-Race Scrape** (Starting ~40 min before each race):
   - Begin monitoring live odds every 30 seconds
   - Update `odds_data` table with each new set of odds
   - Continue until race start time

3. **Post-Race Scrape** (Every 30 min after scheduled race time):
   - Check for race results
   - Once available, store in `race_results` table
   - Include all payout information

## Database Tables Used

- `race_data`: General race information
- `race_horses`: Information about horses in each race
- `odds_data`: Live odds information
- `race_results`: Race results and payouts
- `scrape_jobs`: Tracks job status and scheduling
- `scrape_attempts`: Logs scraping attempts
- `exotic_will_pays`: Stores exotic bet will-pay information
