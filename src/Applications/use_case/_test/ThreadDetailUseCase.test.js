const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadDetailModel = require('../../../Domains/threads/entities/ThreadDetailModel');
const CommentDetailModel = require('../../../Domains/comments/entities/CommentDetailModel');
const ThreadDetailUseCase = require('../ThreadDetailUseCase');

describe('ThreadDetailUseCase', () => {
  it('should orchestracting the get thread detail by thread id action correctly', async () => {
    // Arrange
    const mockThread = new ThreadDetailModel({
      id: 'thread-123',
      title: 'a thread',
      body: 'a thread body',
      date: '2099-01-01T00:00:00.000Z',
      username: 'dicoding',
    });

    const mockComments = [
      new CommentDetailModel({
        id: 'comment-123',
        username: 'dicoding',
        date: '2099-01-01T00:00:00.000Z',
        content: 'nice thread',
        isDeleted: false,
      }),
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComments));

    /** creating use case instance */
    const threadDetailUseCase = new ThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const threadDetails = await threadDetailUseCase.execute('thread-123');

    // Assert
    const expectedThreadDetails = {
      id: 'thread-123',
      title: 'a thread',
      body: 'a thread body',
      date: '2099-01-01T00:00:00.000Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'dicoding',
          date: '2099-01-01T00:00:00.000Z',
          content: 'nice thread',
        },
      ],
    };

    const { comments, date, ...restThreadDetails } = threadDetails;
    const {
      date: expectedDate, comments: expectedComments, ...restExpectedThreadDetails
    } = expectedThreadDetails;

    expect(restThreadDetails).toStrictEqual(restExpectedThreadDetails);
    expect(date).toEqual(expectedDate);

    const [expectedComment] = expectedComments;

    expect(comments[0]).toStrictEqual(expectedComment);

    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith('thread-123');
  });

  it('should map comments correctly, handling the deleted comments, change the content of the deleted comments', async () => {
    // Arrange
    const mockThread = new ThreadDetailModel({
      id: 'thread-123',
      title: 'a thread',
      body: 'a thread body',
      date: '2199-01-01T00:00:00.000Z',
      username: 'dicoding',
    });

    const mockComments = [
      new CommentDetailModel({
        id: 'comment-123',
        username: 'dicoding',
        date: '2199-01-01T00:00:00.000Z',
        content: 'nice thread',
        isDeleted: true,
      }),
      new CommentDetailModel({
        id: 'comment-456',
        username: 'dicoding',
        date: '2199-01-01T00:00:00.000Z',
        content: 'very nice thread',
        isDeleted: false,
      }),
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComments));

    /** creating use case instance */
    const threadDetailUseCase = new ThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const threadDetails = await threadDetailUseCase.execute('thread-123');

    // Assert
    const expectedThreadDetails = {
      id: 'thread-123',
      title: 'a thread',
      body: 'a thread body',
      date: '2199-01-01T00:00:00.000Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'dicoding',
          date: '2199-01-01T00:00:00.000Z',
          content: '**komentar telah dihapus**',
        },
        {
          id: 'comment-456',
          username: 'dicoding',
          date: '2199-01-01T00:00:00.000Z',
          content: 'very nice thread',
        },
      ],
    };

    expect(threadDetails).toEqual(expectedThreadDetails);
    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith('thread-123');
  });
});
