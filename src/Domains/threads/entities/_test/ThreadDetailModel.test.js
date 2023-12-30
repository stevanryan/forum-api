const ThreadDetailModel = require('../ThreadDetailModel');

describe('a ThreadDetailModel entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'a thread',
      body: 'a thread body',
      date: new Date().toISOString(),
    };

    // Action and Assert
    expect(() => new ThreadDetailModel(payload)).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'a thread',
      body: 111,
      date: true,
      username: 'user-321',
    };

    // Action and Assert
    expect(() => new ThreadDetailModel(payload)).toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create thread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'a thread',
      body: 'a thread body',
      date: new Date().toISOString(),
      username: 'user-321',
    };

    // Action
    const detailModel = new ThreadDetailModel(payload);

    // Assert
    expect(detailModel).toBeInstanceOf(ThreadDetailModel);

    const {
      id, title, body, date, username,
    } = detailModel;

    expect(id).toStrictEqual(payload.id);
    expect(title).toStrictEqual(payload.title);
    expect(body).toStrictEqual(payload.body);
    expect(date).toStrictEqual(payload.date);
    expect(username).toStrictEqual(payload.username);
  });
});
