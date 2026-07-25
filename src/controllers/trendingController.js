import { getTrendingMovies, getTrendingPeople } from "../services/tmdbServices.js"

export const getMoviesTrending = async (req, res) => {
	try {
		const result = await getTrendingMovies()

		const cleanMovies = result.results.map(movie => ({
	      tmdbId: movie.id,
	      title: movie.title,
	      posterPath: movie.poster_path,
	      releaseYear: movie.release_date ? movie.release_date.split('-')[0] : null,
	      overview: movie.overview
	    }));

		return res.status(200).json(cleanMovies)
	} catch(err) {
		console.error("Erro ao buscar filmes da semana: ", err.message)
		return res.status(500).json({message: err.message})
	}
}

export const getPeopleTrending = async (req, res) => {
	try {
		const result = await getTrendingPeople()

		const cleanPeople = result.results.map(person => ({
	      id: person.id,
	      name: person.name,
	      known_for_department: person.known_for_department,
	      profile_path: person.profile_path,
	    }));

		return res.status(200).json(cleanPeople)
	} catch(err) {
		console.error("Erro ao buscar pessoas da semana: ", err.message)
		return res.status(500).json({message: err.message})
	}
}