const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 401 and persisted comment without authentication', async () => {
      // Arrange
      const server = await createServer(container);

      // add user
      await UsersTableTestHelper.addUser({
        username: 'dicoding',
        password: 'secret_password',
        id: 'user-123',
      });

      // add thread
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'a thread',
        body: 'a thread body',
        owner: 'user-123',
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: {
          content: 'nice thread',
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 if thread not found', async () => {
      // Arrange
      const userPayload = {
        username: 'dicoding',
        password: 'secret_password',
      };

      const threadId = 'thread-123';

      const server = await createServer(container);

      // Add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret_password',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login user
      const loginUser = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload,
      });

      const { accessToken } = await loginUser.result.data;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'nice thread',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 201 and persisted comment with authentication', async () => {
      // Arrange
      const userPayload = {
        username: 'dicoding',
        password: 'secret_password',
      };

      const threadId = 'thread-123';

      const server = await createServer(container);

      // Add user
      const addNewUser = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret_password',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login user
      const loginUser = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload,
      });

      const { accessToken } = await loginUser.result.data;
      const { id } = await addNewUser.result.data.addedUser;

      // Add thread
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'a thread',
        body: 'a thread body',
        owner: id,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'nice thread',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment.id).toBeDefined();
      expect(responseJson.data.addedComment.content).toEqual('nice thread');
      expect(responseJson.data.addedComment.owner).toEqual(id);
    });
  });

  describe('when DELETE /threads/{id}/comments/{commentId}', () => {
    it('should response 401 and persisted comment without authentication', async () => {
      // Arrange
      const server = await createServer(container);

      // Add user
      await UsersTableTestHelper.addUser({
        username: 'dicoding',
        password: 'secret_password',
        id: 'user-123',
      });

      // Add thread
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'a thread',
        body: 'a thread body',
        owner: 'user-123',
      });

      // Add new comment
      await CommentsTableTestHelper.addThreadComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'nice thread',
        owner: 'user-123',
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 if comment not found', async () => {
      // Arrange
      const userPayload = {
        username: 'dicoding',
        password: 'secret_password',
      };

      const server = await createServer(container);

      // Add user
      const addNewUser = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret_password',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login user
      const loginUser = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload,
      });

      const { accessToken } = await loginUser.result.data;
      const { id } = await addNewUser.result.data.addedUser;

      const threadId = 'thread-123';
      const commentId = 'comment-123';

      // Add thread
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'a thread',
        body: 'a thread body',
        owner: id,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should has response code 200 when comment is found and user is authenticated', async () => {
      // Arrange
      const userPayload = {
        username: 'dicoding',
        password: 'secret_password',
      };

      const server = await createServer(container);

      // Add user
      const addNewUser = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret_password',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login user
      const loginUser = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload,
      });

      const { accessToken } = await loginUser.result.data;
      const { id } = await addNewUser.result.data.addedUser;

      const threadId = 'thread-123';
      const commentId = 'comment-123';

      // Add thread
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: id,
      });

      // Add new comment
      await CommentsTableTestHelper.addThreadComment({
        id: commentId,
        threadId,
        owner: id,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
