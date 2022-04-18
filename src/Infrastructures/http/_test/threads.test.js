const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');

const login = async (username) => {
	const server = await createServer(container);
	// add user
	const registerResponse = await server.inject({
		method: 'POST',
		url: '/users',
		payload: {
			username: username || 'dicoding',
			password: 'secret',
			fullname: 'Dicoding Indonesia',
		},
	});
	const registerData = JSON.parse(registerResponse.payload).data;

	// login
	const loginResponse = await server.inject({
		method: 'POST',
		url: '/authentications',
		payload: {
			username: username || 'dicoding',
			password: 'secret',
		},
	});
	const loginData = JSON.parse(loginResponse.payload).data;

	return [registerData, loginData];
};

describe('/threads endpoint', () => {
	afterAll(async () => {
		await pool.end();
	});

	afterEach(async () => {
		await UsersTableTestHelper.cleanTable();
		await ThreadsTableTestHelper.cleanTable();
		await AuthenticationsTableTestHelper.cleanTable();
	});

	describe('when POST /threads', () => {
		it('should response 401 if no auth', async () => {
			// Arrange
			const requestPayload = {
				title: 'New Thread',
				body: 'Thread Body'
			};
			const server = await createServer(container);

			// Action
			const response = await server.inject({
				method: 'POST',
				url: '/threads',
				payload: requestPayload,
			});

			// Assert
			expect(response.statusCode).toEqual(401);
		});

		describe('with authentication', () => {
			let registerData, loginData;
			beforeEach(async () => {
				[registerData, loginData] = await login();
			});

			it('should response 201 and new thread', async () => {
				// Arrange
				const requestPayload = {
					title: 'New Thread',
					body: 'Thread Body'
				};
				const server = await createServer(container);
	
				// Action
				const response = await server.inject({
					method: 'POST',
					url: '/threads',
					payload: requestPayload,
					headers: {
						'Authorization': `Bearer ${loginData.accessToken}`
					}
				});
	
				// Assert
				const responseJson = JSON.parse(response.payload);
				expect(response.statusCode).toEqual(201);
				expect(responseJson).toHaveProperty('status');
				expect(responseJson).toHaveProperty('data');
				expect(responseJson.status).toEqual('success');
				expect(responseJson.data).toHaveProperty('addedThread');
				expect(responseJson.data.addedThread).toHaveProperty('id', 'title', 'owner');
				expect(typeof responseJson.data.addedThread.id).toEqual('string');
				expect(responseJson.data.addedThread.title).toEqual('New Thread');
				expect(responseJson.data.addedThread.owner).toEqual(registerData.addedUser.id);
			});
	
			it('should response 400 if thread payload wrong/not contain needed property', async () => {
				// Arrange
				const requestPayload = {
					title: 'New Thread'
				};
				const server = await createServer(container);
	
				const expectedResponse = {
					status: 'fail',
					message: 'tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada/tidak sesuai'
				};
				// Action
				const response = await server.inject({
					method: 'POST',
					url: '/threads',
					payload: requestPayload,
					headers: {
						'Authorization': `Bearer ${loginData.accessToken}`
					}
				});
	
				// Assert
				const responseJson = JSON.parse(response.payload);
				expect(responseJson).toStrictEqual(expectedResponse);
				expect(response.statusCode).toEqual(400);
			});
		});
		
	});

	describe('when POST /threads/{threadId}/comments', () => {
		it('should response 401 if no auth', async () => {
			// Arrange
			const requestPayload = {
				content: 'Thread Comment'
			};
			const server = await createServer(container);

			// Action
			const response = await server.inject({
				method: 'POST',
				url: '/threads/thread-123/comments',
				payload: requestPayload,
			});

			// Assert
			expect(response.statusCode).toEqual(401);
		});

		describe('with authentication', () => {
			let registerData, loginData;
			beforeEach(async () => {
				[registerData, loginData] = await login();
			});

			it('should response 201 and new comment', async () => {
				// Arrange
				const threadId = 'thread-123';
				await ThreadsTableTestHelper.addThread({ id: threadId, owner: registerData.addedUser.id });
				const requestPayload = {
					content: 'Thread Comment'
				};
				const server = await createServer(container);
				
				// Action
				const response = await server.inject({
					method: 'POST',
					url: `/threads/${threadId}/comments`,
					payload: requestPayload,
					headers: {
						'Authorization': `Bearer ${loginData.accessToken}`
					}
				});
	
				// Assert
				const responseJson = JSON.parse(response.payload);
				expect(response.statusCode).toEqual(201);
				expect(responseJson).toHaveProperty('status');
				expect(responseJson).toHaveProperty('data');
				expect(responseJson.status).toEqual('success');
				expect(responseJson.data).toHaveProperty('addedComment');
				expect(responseJson.data.addedComment).toHaveProperty('id', 'content', 'owner');
				expect(typeof responseJson.data.addedComment.id).toEqual('string');
				expect(responseJson.data.addedComment.content).toEqual('Thread Comment');
				expect(responseJson.data.addedComment.owner).toEqual(registerData.addedUser.id);
			});

			it('should response 404 if thread not exist', async () => {
				// Arrange
				const requestPayload = {
					content: 'Thread Comment'
				};
				const server = await createServer(container);
				
				const expectedResponse = {
					status: 'fail',
					message: 'thread tidak dapat ditemukan'
				};
				// Action
				const response = await server.inject({
					method: 'POST',
					url: '/threads/thread-123/comments',
					payload: requestPayload,
					headers: {
						'Authorization': `Bearer ${loginData.accessToken}`
					}
				});
	
				// Assert
				const responseJson = JSON.parse(response.payload);
				expect(response.statusCode).toEqual(404);
				expect(responseJson).toStrictEqual(expectedResponse);
			});

			it('should response 400 if thread comment payload wrong/not contain needed property', async () => {
				// Arrange
				const requestPayload = {};
				const server = await createServer(container);
				
				const expectedResponse = {
					status: 'fail',
					message: 'tidak dapat menambahkan komentar karena properti yang dibutuhkan tidak ada/tidak sesuai'
				};
				// Action
				const response = await server.inject({
					method: 'POST',
					url: '/threads/thread-123/comments',
					payload: requestPayload,
					headers: {
						'Authorization': `Bearer ${loginData.accessToken}`
					}
				});
	
				// Assert
				const responseJson = JSON.parse(response.payload);
				expect(response.statusCode).toEqual(400);
				expect(responseJson).toStrictEqual(expectedResponse);
			});
		});
	});

	describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
		it('should response 401 if no auth', async () => {
			// Arrange
			const server = await createServer(container);

			// Action
			const response = await server.inject({
				method: 'DELETE',
				url: '/threads/thread-123/comments/comment-123',
			});

			// Assert
			expect(response.statusCode).toEqual(401);
		});

		describe('with authentication', () => {
			let registerData, loginData;
			beforeEach(async () => {
				[registerData, loginData] = await login();
			});

			it('should response 200 and soft delete the comment', async () => {
				// Arrange
				const server = await createServer(container);
				const threadId = 'thread-123';
				const commentId = 'comment-123';
				const owner = registerData.addedUser.id;
				await ThreadsTableTestHelper.addThread({ id: threadId, owner });
				await ThreadsTableTestHelper.addComment({ id: commentId, owner });
				
				const expectedResponse = {
					status: 'success'
				};

				// Action
				const response = await server.inject({
					method: 'DELETE',
					url: `/threads/${threadId}/comments/${commentId}`,
					headers: {
						'Authorization': `Bearer ${loginData.accessToken}`
					}
				});
	
				// Assert
				const responseJson = JSON.parse(response.payload);
				expect(response.statusCode).toEqual(200);
				expect(responseJson).toStrictEqual(expectedResponse);
			});

			it('should response 403 if not the comment owner', async () => {
				// Arrange
				const server = await createServer(container);
				
				const threadId = 'thread-123';
				const commentId = 'comment-123';
				const owner = registerData.addedUser.id;
				await ThreadsTableTestHelper.addThread({ id: threadId, owner });
				await ThreadsTableTestHelper.addComment({ id: commentId, owner });

				const otherLoginData = (await login('otherdicoding'))[1];
				
				const expectedResponse = {
					status: 'fail',
					message: 'kamu tidak memiliki akses'
				};
				
				// Action
				const response = await server.inject({
					method: 'DELETE',
					url: `/threads/${threadId}/comments/${commentId}`,
					headers: {
						'Authorization': `Bearer ${otherLoginData.accessToken}`
					}
				});
	
				// Assert
				const responseJson = JSON.parse(response.payload);
				expect(response.statusCode).toEqual(403);
				expect(responseJson).toStrictEqual(expectedResponse);
			});
	
			it('should response 404 if comment not exist', async () => {
				// Arrange
				const server = await createServer(container);
				const expectedResponse = {
					status: 'fail',
					message: 'komentar tidak dapat ditemukan'
				};
	
				// Action
				const response = await server.inject({
					method: 'DELETE',
					url: '/threads/thread-123/comments/comment-123',
					headers: {
						'Authorization': `Bearer ${loginData.accessToken}`
					}
				});
	
				// Assert
				const responseJson = JSON.parse(response.payload);
				expect(response.statusCode).toEqual(404);
				expect(responseJson).toStrictEqual(expectedResponse);
			});
		});
	});

	describe('when GET /threads/{threadId}', () => {
		it('should response 200 and return thread detail', async () => {
			// Arrange
			const server = await createServer(container);
			const user = {
				id: 'user-123',
				username: 'dicoding'
			};
			const thread = {
				id: 'thread-123',
				title: 'Thread Title',
				body: 'Thread Body',
				owner: user.id,
				date: '2022-08-04T19:20:33.555Z'
			};
			const comment = {
				id: 'comment-123',
				content: 'Thread Comment 1',
				owner: user.id,
				threadId: thread.id,
				date: '2022-08-04T19:20:33.555Z'
			};
			await UsersTableTestHelper.addUser(user);
			await ThreadsTableTestHelper.addThread(thread);
			await ThreadsTableTestHelper.addComment(comment);
			const expectedResponse = {
				status: 'success',
				data: {
					thread: {
						id: thread.id,
						title: thread.title,
						body: thread.body,
						date: thread.date,
						username: user.username,
						comments: [
							{
								id: comment.id,
								content: comment.content,
								date: comment.date,
								username: user.username,
								replies: [],
								likeCount: 0
							}
						]
					}
				}
			};
			// Action
			const response = await server.inject({
				method: 'GET',
				url: `/threads/${thread.id}`
			});
	
			// Assert
			const responseJson = JSON.parse(response.payload);
			expect(response.statusCode).toEqual(200);
			expect(responseJson).toStrictEqual(expectedResponse);
		});
	
		it('should response 404 if thread does not exists', async () => {
			// Arrange
			const server = await createServer(container);
			const expectedResponse = {
				status: 'fail',
				message: 'thread tidak dapat ditemukan'
			};
	
			// Action
			const response = await server.inject({
				method: 'GET',
				url: '/threads/thread-123',
			});
	
			// Assert
			const responseJson = JSON.parse(response.payload);
			expect(response.statusCode).toEqual(404);
			expect(responseJson).toStrictEqual(expectedResponse);
		});
	});

	describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
		it('should response 401 if no auth', async () => {
			// Arrange
			const requestPayload = {
				content: 'Thread Reply'
			};
			const server = await createServer(container);

			// Action
			const response = await server.inject({
				method: 'POST',
				url: '/threads/thread-123/comments/comment-123/replies',
				payload: requestPayload,
			});

			// Assert
			expect(response.statusCode).toEqual(401);
		});

		describe('with authentication', () => {
			let registerData, loginData;
			beforeEach(async () => {
				[registerData, loginData] = await login();
			});

			it('should response 201 and new reply', async () => {
				// Arrange
				const threadId = 'thread-123';
				const commentId = 'comment-123';
				await ThreadsTableTestHelper.addThread({ id: threadId, owner: registerData.addedUser.id });
				await ThreadsTableTestHelper.addComment({ id: commentId, threadId, owner: registerData.addedUser.id });
				const requestPayload = {
					content: 'Thread Reply'
				};
				const server = await createServer(container);
				
				// Action
				const response = await server.inject({
					method: 'POST',
					url: `/threads/${threadId}/comments/${commentId}/replies`,
					payload: requestPayload,
					headers: {
						'Authorization': `Bearer ${loginData.accessToken}`
					}
				});
	
				// Assert
				const responseJson = JSON.parse(response.payload);
				expect(response.statusCode).toEqual(201);
				expect(responseJson).toHaveProperty('status');
				expect(responseJson).toHaveProperty('data');
				expect(responseJson.status).toEqual('success');
				expect(responseJson.data).toHaveProperty('addedReply');
				expect(responseJson.data.addedReply).toHaveProperty('id', 'content', 'owner');
				expect(typeof responseJson.data.addedReply.id).toEqual('string');
				expect(responseJson.data.addedReply.content).toEqual('Thread Reply');
				expect(responseJson.data.addedReply.owner).toEqual(registerData.addedUser.id);
			});

			it('should response 404 if thread not exist', async () => {
				// Arrange
				const requestPayload = {
					content: 'Thread Reply'
				};
				const server = await createServer(container);
				
				const expectedResponse = {
					status: 'fail',
					message: 'thread tidak dapat ditemukan'
				};
				// Action
				const response = await server.inject({
					method: 'POST',
					url: '/threads/thread-123/comments/comment-123/replies',
					payload: requestPayload,
					headers: {
						'Authorization': `Bearer ${loginData.accessToken}`
					}
				});
	
				// Assert
				const responseJson = JSON.parse(response.payload);
				expect(response.statusCode).toEqual(404);
				expect(responseJson).toStrictEqual(expectedResponse);
			});

			it('should response 404 if comment not exist', async () => {
				// Arrange
				const threadId = 'thread-123';
				const owner = registerData.addedUser.id;
				await ThreadsTableTestHelper.addThread({ id: threadId, owner });
				const requestPayload = {
					content: 'Thread Reply'
				};
				const server = await createServer(container);
				
				const expectedResponse = {
					status: 'fail',
					message: 'komentar tidak dapat ditemukan'
				};
				// Action
				const response = await server.inject({
					method: 'POST',
					url: `/threads/${threadId}/comments/comment-123/replies`,
					payload: requestPayload,
					headers: {
						'Authorization': `Bearer ${loginData.accessToken}`
					}
				});
	
				// Assert
				const responseJson = JSON.parse(response.payload);
				expect(response.statusCode).toEqual(404);
				expect(responseJson).toStrictEqual(expectedResponse);
			});

			it('should response 400 if thread reply payload wrong/not contain needed property', async () => {
				// Arrange
				const requestPayload = {};
				const server = await createServer(container);
				
				const expectedResponse = {
					status: 'fail',
					message: 'tidak dapat memberikan balasan karena properti yang dibutuhkan tidak ada/tidak sesuai'
				};
				// Action
				const response = await server.inject({
					method: 'POST',
					url: '/threads/thread-123/comments/comment-123/replies',
					payload: requestPayload,
					headers: {
						'Authorization': `Bearer ${loginData.accessToken}`
					}
				});
	
				// Assert
				const responseJson = JSON.parse(response.payload);
				expect(response.statusCode).toEqual(400);
				expect(responseJson).toStrictEqual(expectedResponse);
			});
		});
	});

	describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
		it('should response 401 if no auth', async () => {
			// Arrange
			const server = await createServer(container);

			// Action
			const response = await server.inject({
				method: 'DELETE',
				url: '/threads/thread-123/comments/comment-123/replies/reply-123',
			});

			// Assert
			expect(response.statusCode).toEqual(401);
		});

		describe('with authentication', () => {
			let registerData, loginData;
			beforeEach(async () => {
				[registerData, loginData] = await login();
			});

			it('should response 200 and soft delete the reply', async () => {
				// Arrange
				const server = await createServer(container);
				const threadId = 'thread-123';
				const commentId = 'comment-123';
				const newCommentId = 'comment-234';
				const replyId = 'reply-123';
				const owner = registerData.addedUser.id;
				await ThreadsTableTestHelper.addThread({ id: threadId, owner });
				await ThreadsTableTestHelper.addComment({ id: commentId, threadId, owner });
				await ThreadsTableTestHelper.addReply({ id: replyId, threadId, newCommentId, commentId, owner });
				
				const expectedResponse = {
					status: 'success'
				};

				// Action
				const response = await server.inject({
					method: 'DELETE',
					url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
					headers: {
						'Authorization': `Bearer ${loginData.accessToken}`
					}
				});
	
				// Assert
				const responseJson = JSON.parse(response.payload);
				expect(response.statusCode).toEqual(200);
				expect(responseJson).toStrictEqual(expectedResponse);
			});

			it('should response 403 if not the reply owner', async () => {
				// Arrange
				const server = await createServer(container);
				
				const threadId = 'thread-123';
				const commentId = 'comment-123';
				const newCommentId = 'comment-234';
				const replyId = 'reply-123';
				const owner = registerData.addedUser.id;
				await ThreadsTableTestHelper.addThread({ id: threadId, owner });
				await ThreadsTableTestHelper.addComment({ id: commentId, threadId, owner });
				await ThreadsTableTestHelper.addReply({ id: replyId, threadId, newCommentId, commentId, owner });

				const otherLoginData = (await login('otherdicoding'))[1];
				
				const expectedResponse = {
					status: 'fail',
					message: 'kamu tidak memiliki akses'
				};
				
				// Action
				const response = await server.inject({
					method: 'DELETE',
					url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
					headers: {
						'Authorization': `Bearer ${otherLoginData.accessToken}`
					}
				});
	
				// Assert
				const responseJson = JSON.parse(response.payload);
				expect(response.statusCode).toEqual(403);
				expect(responseJson).toStrictEqual(expectedResponse);
			});
	
			it('should response 404 if reply not exist', async () => {
				// Arrange
				const server = await createServer(container);
				const expectedResponse = {
					status: 'fail',
					message: 'balasan tidak dapat ditemukan'
				};
	
				// Action
				const response = await server.inject({
					method: 'DELETE',
					url: '/threads/thread-123/comments/comment-123/replies/reply-123',
					headers: {
						'Authorization': `Bearer ${loginData.accessToken}`
					}
				});
	
				// Assert
				const responseJson = JSON.parse(response.payload);
				expect(response.statusCode).toEqual(404);
				expect(responseJson).toStrictEqual(expectedResponse);
			});
		});
	});
	
	describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
		it('should response 401 if no auth', async () => {
			// Arrange
			const server = await createServer(container);

			// Action
			const response = await server.inject({
				method: 'PUT',
				url: '/threads/thread-123/comments/comment-123/likes'
			});

			// Assert
			expect(response.statusCode).toEqual(401);
		});

		describe('with authentication', () => {
			let registerData, loginData;
			beforeEach(async () => {
				[registerData, loginData] = await login();
			});

			it('should response 200 and add/remove like', async () => {
				// Arrange
				const threadId = 'thread-123';
				const commentId = 'comment-123';
				await ThreadsTableTestHelper.addThread({ id: threadId, owner: registerData.addedUser.id });
				await ThreadsTableTestHelper.addComment({ id: commentId, threadId, owner: registerData.addedUser.id });
				const server = await createServer(container);
				const expectedResponse = {
					status: 'success'
				};
				
				// Action
				const response = await server.inject({
					method: 'PUT',
					url: `/threads/${threadId}/comments/${commentId}/likes`,
					headers: {
						'Authorization': `Bearer ${loginData.accessToken}`
					}
				});
	
				// Assert
				const responseJson = JSON.parse(response.payload);
				expect(response.statusCode).toEqual(200);
				expect(responseJson).toStrictEqual(expectedResponse);
			});

			it('should response 404 if thread not exist', async () => {
				// Arrange
				const server = await createServer(container);
				
				const expectedResponse = {
					status: 'fail',
					message: 'thread tidak dapat ditemukan'
				};
				// Action
				const response = await server.inject({
					method: 'PUT',
					url: '/threads/thread-123/comments/comment-123/likes',
					headers: {
						'Authorization': `Bearer ${loginData.accessToken}`
					}
				});
	
				// Assert
				const responseJson = JSON.parse(response.payload);
				expect(response.statusCode).toEqual(404);
				expect(responseJson).toStrictEqual(expectedResponse);
			});

			it('should response 404 if comment not exist', async () => {
				// Arrange
				const threadId = 'thread-123';
				const owner = registerData.addedUser.id;
				await ThreadsTableTestHelper.addThread({ id: threadId, owner });
				const server = await createServer(container);
				
				const expectedResponse = {
					status: 'fail',
					message: 'komentar tidak dapat ditemukan'
				};
				// Action
				const response = await server.inject({
					method: 'PUT',
					url: `/threads/${threadId}/comments/comment-123/likes`,
					headers: {
						'Authorization': `Bearer ${loginData.accessToken}`
					}
				});
	
				// Assert
				const responseJson = JSON.parse(response.payload);
				expect(response.statusCode).toEqual(404);
				expect(responseJson).toStrictEqual(expectedResponse);
			});
		});
	});
});
