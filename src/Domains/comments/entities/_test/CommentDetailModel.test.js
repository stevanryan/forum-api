const CommentDetailModel = require('../CommentDetailModel');

describe('a CommentDetailModel entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'user-321',
    };

    // Action and Assert
    expect(() => new CommentDetailModel(payload)).toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'user-321',
      date: new Date().toISOString(),
      content: true,
      isDeleted: false,
    };

    // Action and Assert
    expect(() => new CommentDetailModel(payload)).toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create comment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'user-321',
      date: new Date().toISOString(),
      content: 'nice thread',
      isDeleted: false,
    };

    // Action
    const detailModel = new CommentDetailModel(payload);

    // Assert
    expect(detailModel).toBeInstanceOf(CommentDetailModel);

    const {
      id, username, date, content, isDeleted,
    } = detailModel;

    expect(id).toStrictEqual(payload.id);
    expect(username).toStrictEqual(payload.username);
    expect(date).toStrictEqual(payload.date);
    expect(content).toStrictEqual(payload.content);
    expect(isDeleted).toStrictEqual(payload.isDeleted);
  });
});
