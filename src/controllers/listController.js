import {ListModel} from "../models/listModel.js"
import { getMovieById } from '../services/tmdbServices.js'; // Your global service

/**
 * Helper utility to enrich an array of TMDb IDs with live metadata concurrently
 */
const enrichMovieIdsWithDetails = async (movieIdsArray) => {
  if (!movieIdsArray || movieIdsArray.length === 0) return [];

  try {
    // Fire all TMDb API requests simultaneously using Promise.all
    const moviePromises = movieIdsArray.map(async (tmdbId) => {
      try {
        const movie = await getMovieById(tmdbId);
        return {
          tmdbId: movie.id,
          title: movie.title,
          posterPath: movie.poster_path,
          releaseYear: movie.release_date ? movie.release_date.split('-')[0] : null,
          tagline: movie.tagline
        };
      } catch (err) {
        console.warn(`⚠️ Failed to fetch details for movie ID ${tmdbId}:`, err.message);
        // Fallback layout if one specific movie fails to load from TMDb
        return { tmdbId, title: "Unknown Movie", posterPath: null, releaseYear: null, tagline: "" };
      }
    });

    return await Promise.all(moviePromises);
  } catch (error) {
    console.error("❌ Critical breakdown during movie enrichment bundle:", error);
    return [];
  }
};

export const createList = async (req, res) => {
	try {
		const {title, description, movies, isPublic} = req.body

		if (!title) {
	      return res.status(400).json({ error: "O título da lista é obrigatório." });
	    }

		const result = await ListModel.create({
			userId: req.user.userId,
			title,
			description,
			movies,
			isPublic
		})

		return res.status(201).json({message: "List created!", listId: result.insertedId})
	} catch (err) {
		 console.error("Error!", err)
    	return res.status(500).json({ error: "Internal server error" });
	}
}

export const addMovieToList = async (req, res) => {
  try {
    const { id } = req.params; // List ID
    const { tmdbId } = req.body;

    if (!tmdbId) {
      return res.status(400).json({ error: "O ID do filme (tmdbId) é obrigatório." });
    }

    // Authorization Check: Verify the list belongs to the logged-in user
    const list = await ListModel.findById(id);
    if (!list) return res.status(404).json({ error: "Lista não encontrada." });
    if (list.userId !== req.user.userId) {
      return res.status(403).json({ error: "Você não tem permissão para editar esta lista." });
    }

    await ListModel.addMovieToList(id, tmdbId);
    return res.status(200).json({ message: "Filme adicionado à lista com sucesso!" });
  } catch (err) {
    console.error("❌ Error in addMovieToList:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMovieFromList = async (req, res) => {
  try {
    const { id, tmdbId } = req.params;

    const list = await ListModel.findById(id);
    if (!list) return res.status(404).json({ error: "Lista não encontrada." });
    if (list.userId !== req.user.userId) {
      return res.status(403).json({ error: "Você não tem permissão para editar esta lista." });
    }

    const result = await ListModel.deleteMovieFromList(id, tmdbId);
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Filme não encontrado nesta lista." });
    }

    return res.status(200).json({ message: "Filme removido da lista com sucesso!" });
  } catch (err) {
    console.error("❌ Error in deleteMovieFromList:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateListDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, isPublic } = req.body;

    const list = await ListModel.findById(id);
    if (!list) return res.status(404).json({ error: "Lista não encontrada." });
    if (list.userId !== req.user.userId) {
      return res.status(403).json({ error: "Você não tem permissão para atualizar esta lista." });
    }

    await ListModel.updateListDetails(id, { title, description, isPublic });
    return res.status(200).json({ message: "Lista atualizada com sucesso!" });
  } catch (err) {
    console.error("❌ Error in updateListDetails:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteList = async (req, res) => {
  try {
    const { id } = req.params;

    const list = await ListModel.findById(id);
    if (!list) return res.status(404).json({ error: "Lista não encontrada." });
    if (list.userId !== req.user.userId) {
      return res.status(403).json({ error: "Você não tem permissão para deletar esta lista." });
    }

    await ListModel.deleteList(id);
    return res.status(200).json({ message: "Lista deletada com sucesso!" });
  } catch (err) {
    console.error("❌ Error in deleteList:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserLists = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Determine if the person requesting is looking at their own profile dashboard
    // If they are logged in and their token matches the requested profile, show private entries too
    const isOwner = req.user && req.user.userId === userId;

    const lists = await ListModel.findByUser(userId, isOwner);

    if (!lists || lists.length === 0) {
      return res.status(200).json([]);
    }

    let moviesList = []

    let populatedLists = [];

    try {
      // 2. Loop through every list, and return a Promise that resolves to the hydrated list object
      const listPromises = lists.map(async (list) => {
        const fullMoviesMetadata = await enrichMovieIdsWithDetails(list.movies);
        
        // Return the individual list object with its movies replaced by details
        return {
          id: list._id,
          userId: list.userId,
          title: list.title,
          description: list.description,
          isPublic: list.isPublic,
          createdAt: list.createdAt,
          updatedAt: list.updatedAt,
          movies: fullMoviesMetadata // ✅ Swapped raw array [id, id] with [{title, path}, {title, path}]
        };
      });

      // 3. Resolve all list hydrations concurrently
      populatedLists = await Promise.all(listPromises);

    } catch (err) {
      console.warn(`⚠️ Continuous execution without TMDb details for user ${userId}:`, err.message);
      // Fallback: If TMDb fails, return the original lists unhydrated instead of crashing
      populatedLists = lists;
    }
    return res.status(200).json(populatedLists);
  } catch (err) {
    console.error("❌ Error in getUserLists:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getListById = async (req, res) => {
  try {
    const { id } = req.params;

    const list = await ListModel.findById(id);
    if (!list) {
      return res.status(404).json({ error: "Lista não encontrada." });
    }

    // Security Guard: Check if list is private and doesn't belong to the logged-in user
    const isOwner = req.user && req.user.userId === list.userId;
    if (!list.isPublic && !isOwner) {
      return res.status(403).json({ error: "Você não tem permissão para acessar esta lista privada." });
    }

    // 💡 The Magic: Hydrate the array of IDs into full objects
    const populatedMovies = await enrichMovieIdsWithDetails(list.movies);

    // Construct the fully enriched response payload
    const enrichedList = {
      id: list._id,
      userId: list.userId,
      title: list.title,
      description: list.description,
      isPublic: list.isPublic,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
      movies: populatedMovies // Now an array of details, not just raw integers!
    };

    return res.status(200).json(enrichedList);
  } catch (err) {
    console.error("❌ Error in getListById hydration:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};