const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepository postgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  const userPayload = {
    id: 'user-345',
    username: 'jack',
  };

  describe('addThreadComment function', () => {
    it('should persist add comment', async () => {
      // Arrange
      const commentPayload = {
        threadId: 'thread-123',
        payload: {
          content: 'nice thread',
        },
        owner: 'user-345',
      };

      await UsersTableTestHelper.addUser({ id: userPayload.id, username: userPayload.username });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'a thread', owner: 'user-345' });

      const fakeIdGenerator = () => '321';

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addComment = await commentRepositoryPostgres
        .addThreadComment(commentPayload.threadId, commentPayload.payload, commentPayload.owner);

      // Assert
      const foundComment = await CommentsTableTestHelper.getCommentById('comment-321');

      expect(foundComment).toBeDefined();
      expect(addComment).toStrictEqual(new AddedComment({
        id: 'comment-321',
        content: 'nice thread',
        owner: 'user-345',
      }));
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const commentPayload = {
        threadId: 'thread-123',
        payload: {
          content: 'nice thread',
        },
        owner: 'user-345',
      };

      await UsersTableTestHelper.addUser({ id: userPayload.id, username: userPayload.username });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'a thread', owner: 'user-345' });

      const fakeIdGenerator = () => '321';

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      const addThreadComment = await commentRepositoryPostgres
        .addThreadComment(commentPayload.threadId, commentPayload.payload, commentPayload.owner);

      expect(addThreadComment).toStrictEqual(new AddedComment({
        id: 'comment-321',
        content: 'nice thread',
        owner: 'user-345',
      }));
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return an empty array when thread has no exist comment', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const commentDetails = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');
      expect(commentDetails).toStrictEqual([]);
    });

    it('should return all comments from a thread', async () => {
      // Arrange
      const threadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: userPayload.id, username: userPayload.username });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: userPayload.id,
      });

      const comment = {
        id: 'comment-123',
        content: 'very nice thread',
        date: '2050-01-01T00:00:00.000Z',
      };

      const expectedCommentDetails = {
        id: 'comment-123',
        username: userPayload.username,
        date: '2050-01-01T00:00:00.000Z',
        content: 'very nice thread',
        isDeleted: false,
      };

      await CommentsTableTestHelper.addThreadComment({
        ...comment, threadId, owner: userPayload.id,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      const commentDetails = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');
      expect(commentDetails).toStrictEqual([
        expectedCommentDetails,
      ]);
    });
  });

  describe('verifyCommentIsExist function', () => {
    it('should throw NotFoundError if comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentIsExist('comment-123', 'thread-123')).rejects.toThrowError(NotFoundError);
    });

    it('should resolve if comment is exist', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: userPayload.id, username: userPayload.username });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: userPayload.id,
      });

      await CommentsTableTestHelper.addThreadComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: userPayload.id,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentIsExist('comment-123', 'thread-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentAccess function', () => {
    it('should throw AuthorizationError if user has no authorization', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: userPayload.id, username: userPayload.username });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: userPayload.id,
      });

      await CommentsTableTestHelper.addThreadComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: userPayload.id,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentAccess('comment-123', 'user-789')).rejects.toThrowError(AuthorizationError);
    });

    it('should resolve if user has authorization', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: userPayload.id, username: userPayload.username });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: userPayload.id,
      });

      await CommentsTableTestHelper.addThreadComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: userPayload.id,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentAccess('comment-123', userPayload.id)).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteCommentById function', () => {
    it('should throw NotFoundError when deleting comment that does not exist', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.deleteCommentById('comment-123')).rejects.toThrowError(NotFoundError);
    });

    it('should be able to delete added comment by comment id', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: userPayload.id, username: userPayload.username });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: userPayload.id,
      });

      await CommentsTableTestHelper.addThreadComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: userPayload.id,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // action
      await commentRepositoryPostgres.deleteCommentById('comment-123');
      const foundComment = await CommentsTableTestHelper.getCommentById('comment-123');

      // assert
      expect(foundComment.comment_is_deleted).toEqual(true);
    });
  });
});
