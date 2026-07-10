import { ObjectId } from 'mongodb';
import { getMongoDb } from '../config/db.js';

export const initListIndexes = async () => {
  const collection = getMongoDb().collection('lists');
  await collection.createIndex({ userId: 1 });
};

export const ListModel = {
  create: async (listData) => {
    const newList = {
      userId: listData.userId,
      title: listData.title.trim(),
      description: listData.description?.trim() || '',
      movies: listData.movies || [], // Expecting an array of numbers [27205, 157336]
      isPublic: listData.isPublic ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return await getMongoDb().collection('lists').insertOne(newList);
  },

  // Easily push a new movie ID into the array using MongoDB's $addToSet (prevents duplicates)
  addMovieToList: async (listId, tmdbId) => {
    
    return await getMongoDb().collection('lists').updateOne(
      { _id: new ObjectId(listId) },
      { 
        $addToSet: { movies: Number(tmdbId) },
        $set: { updatedAt: new Date() }
      }
    );
  },

  deleteMovieFromList: async (listId, tmdbId) => {
    return await getMongoDb().collection('lists').updateOne(
      { _id: new ObjectId(listId) },
      { 
        $pull: { movies: Number(tmdbId) },
        $set: { updatedAt: new Date() }
      }
    );
  },

  updateListDetails: async (listId, updateData) => {
    const fieldsToUpdate = {};
    
    if (updateData.title) fieldsToUpdate.title = updateData.title.trim();
    if (updateData.description !== undefined) fieldsToUpdate.description = updateData.description.trim();
    if (updateData.isPublic !== undefined) fieldsToUpdate.isPublic = !!updateData.isPublic;
    
    fieldsToUpdate.updatedAt = new Date();

    return await getMongoDb().collection('lists').updateOne(
      { _id: new ObjectId(listId) },
      { $set: fieldsToUpdate }
    );
  },

  deleteList: async (listId) => {
    return await getMongoDb().collection('lists').deleteOne(
      { _id: new ObjectId(listId) }
    );
  },

  findById: async (listId) => {
    return await getMongoDb().collection('lists').findOne(
      { _id: new ObjectId(listId) }
    );
  },

  findByUser: async (userId, includePrivate = false) => {
    const query = { userId };
    if (!includePrivate) {
      query.isPublic = true;
    }
    return await getMongoDb().collection('lists').find(query).toArray();
  },

  reorderMoviesInList: async (listId, newMoviesArray) => {
  return await getMongoDb().collection('lists').updateOne(
    { _id: new ObjectId(listId) },
    { 
      $set: { 
        movies: newMoviesArray.map(Number), 
        updatedAt: new Date() 
      } 
    }
  );
}
};