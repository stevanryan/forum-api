const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, id) {
    const newThread = new AddThread(useCasePayload);
    return this._threadRepository.addThread(newThread, id);
  }
}

module.exports = AddThreadUseCase;
