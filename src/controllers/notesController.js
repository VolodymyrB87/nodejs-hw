import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

export async function getAllNotes(req, res) {
  const { page = 1, perPage = 15, tag, search } = req.query;
  const skip = (page - 1) * perPage;
  const notesQuery = Note.find({ userId: req.user._id });
  if (search) {
    notesQuery.where({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ],
    });
  }
  if (tag) {
    notesQuery.where('tag').equals(tag);
  }
  const [totalNotes, notes] = await Promise.all([
    notesQuery.clone().countDocuments(),
    notesQuery.skip(skip).limit(perPage),
  ]);
  const totalPages = Math.ceil(totalNotes / perPage);
  res.status(200).json({ page, perPage, totalNotes, totalPages, notes });
}

export async function getNoteById(req, res) {
  const { noteId } = req.params;
  const note = await Note.findOne({ _id: noteId, userId: req.user._id });
  if (!note) {
    throw createHttpError(404, 'Note not found');
  }
  res.status(200).json(note);
}

export async function createNote(req, res) {
  const note = await Note.create({
    ...req.body,
    userId: req.user._id,
  });
  res.status(201).json(note);
}

export async function deleteNote(req, res) {
  const { noteId } = req.params;
  const note = await Note.findOneAndDelete({
    _id: noteId,
    userId: req.user._id,
  });

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }
  res.status(200).send(note);
}

export async function updateNote(req, res) {
  const { noteId } = req.params;
  const note = await Note.findOneAndUpdate(
    { _id: noteId, userId: req.user._id },
    req.body,
    {
      returnDocument: 'after',
    },
  );

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }
  res.status(200).json(note);
}
