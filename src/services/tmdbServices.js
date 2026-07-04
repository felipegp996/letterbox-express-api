const TMDB_API_URL=process.env.TMDB_API_URL
const TMDB_READ_ACCESS_KEY=process.env.TMDB_READ_ACCESS_KEY

const options = {
	method: 'GET',
	headers: {
		accept: 'application/json',
		Authorizarion: `Bearer ${TMDB_READ_ACCESS_KEY}`
	}
}

/**
 * Fetch movie details by its TMDb ID
 */

export const getMovieById = async (movieID) => {
	try {
		const response = await fetch(`${TMDB_API_URL}/movie/${movieID}/language=en-US`, options)

		if(!response.ok){
			throw new Error(`TMDB API Error ${response.status}`)
		}

		const data = await response.json()
		return data
	} catch (err) {
		console.error("Failed to fetch from TMDB: ", err)
		throw err
	}
}