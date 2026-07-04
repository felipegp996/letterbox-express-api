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
  }
};