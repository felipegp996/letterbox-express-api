import { getTrendingMovies, getTrendingPeople } from "../services/tmdbServices.js"

export const getMoviesTrending = async (req, res) => {
	try {
		const result = await getTrendingMovies()

		return res.status(200).json(result)
	} catch(err) {
		console.error("Erro ao buscar filmes da semana: ", err.message)
		return res.status(500).json({message: err.message})
	}
}

export const getPeopleTrending = async (req, res) => {
	try {
		const result = await getTrendingPeople()

		return res.status(200).json(result)
	} catch(err) {
		console.error("Erro ao buscar pessoas da semana: ", err.message)
		return res.status(500).json({message: err.message})
	}
}