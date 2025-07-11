const API_KEY = '5988d0cb597f14f527539f90330aee32'
const BASE_URL = 'https://v3.football.api-sports.io'

const CLUB_WORLD_CUP_2025_LEAGUE_ID = 537

export const apiFootball = {
  async fetchClubWorldCupTeams() {
    try {
      const response = await fetch(`${BASE_URL}/teams?league=${CLUB_WORLD_CUP_2025_LEAGUE_ID}&season=2025`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': 'v3.football.api-sports.io'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.response || []
    } catch (error) {
      console.error('Error fetching Club World Cup teams:', error)
      throw error
    }
  },

  async fetchTeamDetails(teamId) {
    try {
      const response = await fetch(`${BASE_URL}/teams?id=${teamId}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': 'v3.football.api-sports.io'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.response?.[0] || null
    } catch (error) {
      console.error('Error fetching team details:', error)
      throw error
    }
  }
}