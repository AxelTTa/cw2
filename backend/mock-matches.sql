-- Mock matches for Clutch community discussion
-- Run this in your Supabase SQL editor after creating the database schema

INSERT INTO matches (
    home_team,
    away_team,
    home_score,
    away_score,
    match_date,
    status,
    league
) VALUES
-- Live matches
('Real Madrid', 'FC Barcelona', 2, 1, NOW() - INTERVAL '45 minutes', 'live', 'La Liga'),
('Manchester City', 'Liverpool', 1, 1, NOW() - INTERVAL '30 minutes', 'live', 'Premier League'),
('Paris Saint-Germain', 'Marseille', 3, 0, NOW() - INTERVAL '15 minutes', 'live', 'Ligue 1'),

-- Upcoming matches (next 7 days)
('Chelsea', 'Arsenal', 0, 0, NOW() + INTERVAL '2 hours', 'scheduled', 'Premier League'),
('Bayern Munich', 'Borussia Dortmund', 0, 0, NOW() + INTERVAL '1 day', 'scheduled', 'Bundesliga'),
('Juventus', 'AC Milan', 0, 0, NOW() + INTERVAL '2 days', 'scheduled', 'Serie A'),
('Atletico Madrid', 'Sevilla', 0, 0, NOW() + INTERVAL '3 days', 'scheduled', 'La Liga'),
('Tottenham', 'Manchester United', 0, 0, NOW() + INTERVAL '4 days', 'scheduled', 'Premier League'),
('Inter Milan', 'AS Roma', 0, 0, NOW() + INTERVAL '5 days', 'scheduled', 'Serie A'),
('Napoli', 'Lazio', 0, 0, NOW() + INTERVAL '6 days', 'scheduled', 'Serie A'),

-- Recently finished matches
('Brighton', 'Newcastle', 2, 3, NOW() - INTERVAL '2 days', 'finished', 'Premier League'),
('Valencia', 'Villarreal', 1, 2, NOW() - INTERVAL '3 days', 'finished', 'La Liga'),
('Bayer Leverkusen', 'RB Leipzig', 0, 1, NOW() - INTERVAL '4 days', 'finished', 'Bundesliga'),
('Atalanta', 'Fiorentina', 3, 1, NOW() - INTERVAL '5 days', 'finished', 'Serie A'),
('Lyon', 'Monaco', 2, 2, NOW() - INTERVAL '6 days', 'finished', 'Ligue 1'),

-- Champions League matches
('Manchester City', 'Real Madrid', 0, 0, NOW() + INTERVAL '1 week', 'scheduled', 'Champions League'),
('Bayern Munich', 'Paris Saint-Germain', 0, 0, NOW() + INTERVAL '1 week 2 days', 'scheduled', 'Champions League'),
('Barcelona', 'Arsenal', 0, 0, NOW() + INTERVAL '1 week 3 days', 'scheduled', 'Champions League'),
('Liverpool', 'Juventus', 0, 0, NOW() + INTERVAL '1 week 4 days', 'scheduled', 'Champions League'),

-- Premier League matches
('Aston Villa', 'West Ham', 0, 0, NOW() + INTERVAL '8 days', 'scheduled', 'Premier League'),
('Crystal Palace', 'Fulham', 0, 0, NOW() + INTERVAL '9 days', 'scheduled', 'Premier League'),
('Everton', 'Leicester City', 0, 0, NOW() + INTERVAL '10 days', 'scheduled', 'Premier League'),
('Wolves', 'Bournemouth', 0, 0, NOW() + INTERVAL '11 days', 'scheduled', 'Premier League'),

-- La Liga matches
('Real Sociedad', 'Athletic Bilbao', 0, 0, NOW() + INTERVAL '12 days', 'scheduled', 'La Liga'),
('Real Betis', 'Celta Vigo', 0, 0, NOW() + INTERVAL '13 days', 'scheduled', 'La Liga'),
('Getafe', 'Osasuna', 0, 0, NOW() + INTERVAL '14 days', 'scheduled', 'La Liga'),

-- Serie A matches
('Torino', 'Udinese', 0, 0, NOW() + INTERVAL '15 days', 'scheduled', 'Serie A'),
('Sassuolo', 'Empoli', 0, 0, NOW() + INTERVAL '16 days', 'scheduled', 'Serie A'),
('Genoa', 'Verona', 0, 0, NOW() + INTERVAL '17 days', 'scheduled', 'Serie A'),

-- Bundesliga matches
('Eintracht Frankfurt', 'Werder Bremen', 0, 0, NOW() + INTERVAL '18 days', 'scheduled', 'Bundesliga'),
('VfL Wolfsburg', 'FC Cologne', 0, 0, NOW() + INTERVAL '19 days', 'scheduled', 'Bundesliga'),
('Borussia Monchengladbach', 'Mainz', 0, 0, NOW() + INTERVAL '20 days', 'scheduled', 'Bundesliga'),

-- Ligue 1 matches
('Lille', 'Rennes', 0, 0, NOW() + INTERVAL '21 days', 'scheduled', 'Ligue 1'),
('Nice', 'Strasbourg', 0, 0, NOW() + INTERVAL '22 days', 'scheduled', 'Ligue 1'),
('Montpellier', 'Nantes', 0, 0, NOW() + INTERVAL '23 days', 'scheduled', 'Ligue 1'),

-- International matches
('England', 'France', 0, 0, NOW() + INTERVAL '1 month', 'scheduled', 'Nations League'),
('Spain', 'Germany', 0, 0, NOW() + INTERVAL '1 month 2 days', 'scheduled', 'Nations League'),
('Italy', 'Portugal', 0, 0, NOW() + INTERVAL '1 month 3 days', 'scheduled', 'Nations League'),
('Netherlands', 'Belgium', 0, 0, NOW() + INTERVAL '1 month 4 days', 'scheduled', 'Nations League'),

-- Cup matches
('Manchester United', 'Chelsea', 0, 0, NOW() + INTERVAL '2 weeks', 'scheduled', 'FA Cup'),
('Barcelona', 'Real Madrid', 0, 0, NOW() + INTERVAL '2 weeks 2 days', 'scheduled', 'Copa del Rey'),
('Juventus', 'Inter Milan', 0, 0, NOW() + INTERVAL '2 weeks 3 days', 'scheduled', 'Coppa Italia'),
('Bayern Munich', 'Borussia Dortmund', 0, 0, NOW() + INTERVAL '2 weeks 4 days', 'scheduled', 'DFB Pokal'),

-- More recent finished matches for discussion history
('Tottenham', 'Aston Villa', 4, 1, NOW() - INTERVAL '1 week', 'finished', 'Premier League'),
('AC Milan', 'Napoli', 2, 1, NOW() - INTERVAL '1 week 1 day', 'finished', 'Serie A'),
('Borussia Dortmund', 'Bayern Munich', 1, 3, NOW() - INTERVAL '1 week 2 days', 'finished', 'Bundesliga'),
('Marseille', 'Lyon', 2, 0, NOW() - INTERVAL '1 week 3 days', 'finished', 'Ligue 1'),
('Sevilla', 'Real Betis', 1, 2, NOW() - INTERVAL '1 week 4 days', 'finished', 'La Liga'),

-- High-profile matches with exciting storylines
('PSG', 'Real Madrid', 0, 0, NOW() + INTERVAL '3 weeks', 'scheduled', 'Champions League'),
('Manchester City', 'Barcelona', 0, 0, NOW() + INTERVAL '3 weeks 2 days', 'scheduled', 'Champions League'),
('Liverpool', 'Bayern Munich', 0, 0, NOW() + INTERVAL '3 weeks 3 days', 'scheduled', 'Champions League'),
('Arsenal', 'Juventus', 0, 0, NOW() + INTERVAL '3 weeks 4 days', 'scheduled', 'Champions League');