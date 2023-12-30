const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestracting the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-345',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.deleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentAccess = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentIsExist = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentUseCase.execute({
      threadId: useCasePayload.threadId,
      commentId: useCasePayload.commentId,
      owner: useCasePayload.userId,
    });

    // Assert
    expect(mockCommentRepository.verifyCommentIsExist).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.verifyCommentAccess).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.userId,
    );
    expect(mockCommentRepository.deleteCommentById).toBeCalledWith(
      useCasePayload.commentId,
    );
  });

  it('should throw error when payload did not contain needed property', async () => {
    // Arrange
    const commentRepositoryMock = {
      verifyCommentIsExist: jest.fn(),
      verifyCommentAccess: jest.fn(),
      deleteCommentById: jest.fn(),
    };
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: commentRepositoryMock,
    });

    // Action and Assert
    await expect(deleteCommentUseCase.execute({})).rejects.toThrowError('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', async () => {
    // Arrange
    const commentRepositoryMock = {
      verifyCommentIsExist: jest.fn(),
      verifyCommentAccess: jest.fn(),
      deleteCommentById: jest.fn(),
    };
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: commentRepositoryMock,
    });

    // Action and Assert
    await expect(deleteCommentUseCase.execute({
      threadId: true, commentId: true, owner: true,
    })).rejects.toThrowError('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
