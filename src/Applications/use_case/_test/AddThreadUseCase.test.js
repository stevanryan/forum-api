const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'a thread',
      body: 'a thread body',
    };

    const mockAddedThread = new AddedThread({
      id: 'thread-123',
      title: 'a thread',
      owner: 'user-1',
    });

    const expectedAddedThread = {
      id: 'thread-123',
      title: 'a thread',
      owner: 'user-1',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedThread));

    /** creating use case instance */
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedThread = await addThreadUseCase.execute(useCasePayload, 'user-1');
    const newThread = new AddThread(useCasePayload);

    // Assert
    expect(addedThread).toBeDefined();
    expect(newThread).toBeDefined();
    expect(addedThread).toStrictEqual(new AddedThread({
      id: expectedAddedThread.id,
      title: expectedAddedThread.title,
      owner: expectedAddedThread.owner,
    }));

    expect(mockThreadRepository.addThread).toBeCalled();
    expect(mockThreadRepository.addThread).toBeCalledWith(newThread, 'user-1');
  });
});
