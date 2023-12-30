const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(threadId, useCasePayload, owner) {
    await this._threadRepository.verifyThreadIsExist(threadId);
    const newComment = new AddComment(useCasePayload);
    return this._commentRepository.addThreadComment(threadId, newComment, owner);
  }
}

module.exports = AddCommentUseCase;
