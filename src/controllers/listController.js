import {ListModel} from "../models/listModel.js"

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
    return res.status(200).json(lists);
  } catch (err) {
    console.error("❌ Error in getUserLists:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};