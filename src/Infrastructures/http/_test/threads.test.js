const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestUserPayload = {
        id: 'user-123',
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      };

      const requestPayload = {
        title: 'A thread',
        body: 'A thread body',
      };

      const server = await createServer(container);

      // Action
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: requestUserPayload.username,
          password: requestUserPayload.password,
          fullname: requestUserPayload.fullname,
        },
      });

      const responseAuthentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: requestUserPayload.username,
          password: requestUserPayload.password,
        },
      });

      const responseAuthenticationJson = JSON.parse(responseAuthentication.payload);
      const { accessToken } = responseAuthenticationJson.data;

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.id).toBeDefined();
      expect(responseJson.data.addedThread.title).toBeDefined();
      expect(responseJson.data.addedThread.owner).toBeDefined();
    });

    it('should response 400 when requesting with a bad payload', async () => {
      // Arrange
      const requestUserPayload = {
        id: 'user-123',
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      };

      const requestPayload = {
        title: 'A thread',
        body: 123,
      };

      const server = await createServer(container);

      // Action
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: requestUserPayload.username,
          password: requestUserPayload.password,
          fullname: requestUserPayload.fullname,
        },
      });

      const responseAuthentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: requestUserPayload.username,
          password: requestUserPayload.password,
        },
      });

      const responseAuthenticationJson = JSON.parse(responseAuthentication.payload);
      const { accessToken } = responseAuthenticationJson.data;

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tipe data thread tidak valid');
    });

    it('should response 401 when request without authentication', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toBeDefined();
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response detail thread with comments without authentication', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const userId = 'user-345';

      // Adding new user
      await UsersTableTestHelper.addUser({
        id: userId,
        username: 'dicoding',
        password: 'secret_password',
      });

      // Adding a thread
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: 'a thread',
        body: 'a thread body',
        owner: userId,
      });

      // Add new comment
      await CommentsTableTestHelper.addThreadComment({
        id: commentId,
        threadId,
        owner: userId,
      });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const {
        id, title, body, username, comments,
      } = responseJson.data.thread;

      expect(id).toEqual(threadId);
      expect(title).toEqual('a thread');
      expect(body).toEqual('a thread body');
      expect(username).toEqual('dicoding');
      expect(comments).toBeDefined();
      expect(comments.length).toEqual(1);

      expect(responseJson.data.thread.comments[0].id).toEqual(commentId);
      expect(responseJson.data.thread.comments[0].content).toEqual('nice thread');
      expect(responseJson.data.thread.comments[0].username).toEqual('dicoding');
    });
  });
});
