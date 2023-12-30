const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestracting the add comment action correctly', async () => {
    // Arrange
    const payload = {
      content: 'nice thread',
    };

    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: payload.content,
      owner: 'user-345',
    });

    const expectedAddedComment = {
      id: 'comment-123',
      content: 'nice thread',
      owner: 'user-345',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockCommentRepository.addThreadComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));
    mockThreadRepository.verifyThreadIsExist = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute('thread-123', payload, mockAddedComment.owner);
    const newAddComment = new AddComment(payload);

    // Assert
    expect(addedComment).toBeDefined();
    expect(addedComment).toStrictEqual(new AddedComment({
      id: expectedAddedComment.id,
      content: expectedAddedComment.content,
      owner: expectedAddedComment.owner,
    }));

    expect(mockThreadRepository.verifyThreadIsExist).toBeCalledWith('thread-123');
    expect(mockCommentRepository.addThreadComment).toBeCalledWith('thread-123', newAddComment, mockAddedComment.owner);
  });
});
