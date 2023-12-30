const ThreadDetailModel = require('../../Domains/threads/entities/ThreadDetailModel');
const CommentDetailModel = require('../../Domains/comments/entities/CommentDetailModel');

class ThreadDetailUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId) {
    const getThread = await this._threadRepository.getThreadById(threadId);
    const rowComment = await this._commentRepository.getCommentsByThreadId(threadId);

    const thread = new ThreadDetailModel({
      ...getThread,
    });

    const allComments = rowComment.map((comment) => new CommentDetailModel({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.isDeleted ? '**komentar telah dihapus**' : comment.content,
      isDeleted: comment.isDeleted,
    }));

    const mappedComments = allComments.map(({
      id, username, date, content,
    }) => ({
      id, username, date, content,
    }));

    return {
      ...thread, comments: mappedComments,
    };
  }
}

module.exports = ThreadDetailUseCase;
