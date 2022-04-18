const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
	afterEach(async () => {
		await ThreadsTableTestHelper.cleanTable();
		await UsersTableTestHelper.cleanTable();
	});

	afterAll(async () => {
		await pool.end();
	});

	describe('addThread function', () => {
		it('should persist new thread and return added thread correctly', async () => {
			// Arrange
			await UsersTableTestHelper.addUser({});
			const id = 'thread-123';
			const owner = 'user-123';
			const title = 'New Thread';
			const body = 'Thread Body';
			const fakeIdGenerator = () => '123';
			const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

			// Action
			const addedThread = await threadRepositoryPostgres.addThread({ title, body }, owner);

			// Assert
			expect(addedThread).toStrictEqual({ id, title, owner });
			const thread = await ThreadsTableTestHelper.findThreadById(id);
			expect(thread).toHaveLength(1);
		});
	});

	describe('addComment function', () => {
		it('should persist new comment and return added comment correctly', async () => {
			// Arrange
			await UsersTableTestHelper.addUser({});
			await ThreadsTableTestHelper.addThread({});
			const threadId = 'thread-123';
			const owner = 'user-123';
			const content = 'New Thread';
			const commentId = 'comment-123';
			const fakeIdGenerator = () => '123';
			const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

			// Action
			const addedComment = await threadRepositoryPostgres.addComment({ content }, owner, threadId);

			// Assert
			expect(addedComment).toStrictEqual({ id: commentId, owner, content });
			const comment = await ThreadsTableTestHelper.findCommentById(commentId);
			expect(comment).toHaveLength(1);
		});
	});

	describe('deleteComment function', () => {
		it('should successfully soft delete comment from a thread', async () => {
			// Arrange
			const commentId = 'comment-123';
			await UsersTableTestHelper.addUser({});
			await ThreadsTableTestHelper.addThread({});
			await ThreadsTableTestHelper.addComment({ id: commentId });
			const fakeIdGenerator = () => '123';
			const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

			// Action
			await threadRepositoryPostgres.deleteComment(commentId);

			// Assert
			const comment = await ThreadsTableTestHelper.findCommentById(commentId);
			expect(comment[0].isDelete).toEqual(true);
		});
	});

	describe('verifyThreadExists function', () => {
		it('should resolve when thread is exist', async () => {
			// Arrange
			const threadId = 'thread-123';
			const userId = 'user-123';
			await UsersTableTestHelper.addUser({ id: userId });
			await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
			
			const fakeIdGenerator = () => '123';
			const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

			// Action and Assert
			await expect(threadRepositoryPostgres.verifyThreadExists(threadId)).resolves.not.toThrowError();
		});

		it('should reject when thread is not exist', async () => {
			// Arrange
			const id = 'thread-123';
			const fakeIdGenerator = () => '123';
			const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

			// Action and Assert
			await expect(threadRepositoryPostgres.verifyThreadExists(id)).rejects.toThrow(NotFoundError);
		});
	});

	describe('verifyThreadExists function', () => {
		it('should resolve when comment is exist', async () => {
			// Arrange
			const threadId = 'thread-123';
			const userId = 'user-123';
			const commentId = 'comment-123';
			await UsersTableTestHelper.addUser({ id: userId });
			await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
			await ThreadsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
			
			const fakeIdGenerator = () => '123';
			const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

			// Action and Assert
			await expect(threadRepositoryPostgres.verifyCommentExists(commentId)).resolves.not.toThrowError();
		});

		it('should reject when comment is not exist', async () => {
			// Arrange
			const id = 'comment-123';
			const fakeIdGenerator = () => '123';
			const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

			// Action and Assert
			await expect(threadRepositoryPostgres.verifyCommentExists(id)).rejects.toThrow(NotFoundError);
		});
	});

	describe('verifyReplyExists function', () => {
		it('should resolve when reply is exist', async () => {
			// Arrange
			const threadId = 'thread-123';
			const userId = 'user-123';
			const commentId = 'comment-123';
			const replyId = 'reply-id';
			const newCommentId = 'comment-234';
			await UsersTableTestHelper.addUser({ id: userId });
			await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
			await ThreadsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
			await ThreadsTableTestHelper.addReply({ id: replyId, threadId, newCommentId, commentId, owner: userId });
			const fakeIdGenerator = () => '123';
			const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

			// Action and Assert
			await expect(threadRepositoryPostgres.verifyReplyExists(replyId)).resolves.toEqual(newCommentId);
		});

		it('should reject when reply is not exist', async () => {
			// Arrange
			const id = 'reply-123';
			const fakeIdGenerator = () => '123';
			const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

			// Action and Assert
			await expect(threadRepositoryPostgres.verifyReplyExists(id)).rejects.toThrow(NotFoundError);
		});
	});

	describe('verifyCommentOwner function', () => {
		it('should resolve when accessed by owner', async () => {
			// Arrange
			const threadId = 'thread-123';
			const commentId = 'comment-123';
			const userId = 'user-123';
			await UsersTableTestHelper.addUser({ id: userId });
			await ThreadsTableTestHelper.addThread({ id: threadId });
			await ThreadsTableTestHelper.addComment({ id: commentId });
			const fakeIdGenerator = () => '123';
			const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

			// Action and Assert
			await expect(threadRepositoryPostgres.verifyCommentOwner(commentId, userId)).resolves.not.toThrowError();
		});

		it('should reject when accessed by other user', async () => {
			// Arrange
			const threadId = 'thread-123';
			const commentId = 'comment-123';
			const userId = 'user-123';
			await UsersTableTestHelper.addUser({ id: userId });
			await ThreadsTableTestHelper.addThread({ id: threadId });
			await ThreadsTableTestHelper.addComment({ id: commentId });
			const fakeIdGenerator = () => '123';
			const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

			// Action and Assert
			await expect(threadRepositoryPostgres.verifyCommentOwner(threadId, commentId, 'user-234')).rejects.toThrow(AuthorizationError);
		});
	});

	describe('getThread function', () => {
		it('should return thread detail correctly', async () => {
			// Arrange
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
			await UsersTableTestHelper.addUser(user);
			await ThreadsTableTestHelper.addThread(thread);
			const expectedThread = {
				id: thread.id,
				title: thread.title,
				body: thread.body,
				date: thread.date,
				username: user.username
			};
			const fakeIdGenerator = () => '123';
			const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

			// Action
			const threadDetail = await threadRepositoryPostgres.getThread(thread.id);
			// Assert
			expect(threadDetail).toStrictEqual(expectedThread);
		});
	});

	describe('getThreadComments function', () => {
		it('should return thread comments correctly', async () => {
			// Arrange
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
			const comment1 = {
				id: 'comment-123',
				content: 'Thread Comment 1',
				owner: user.id,
				threadId: thread.id,
				date: '2022-08-04T19:20:33.555Z',
				isDelete: false
			};
			const comment2 = {
				id: 'comment-234',
				content: 'Thread Comment 2',
				owner: user.id,
				threadId: thread.id,
				date: '2022-08-05T19:20:33.555Z',
				isDelete: true
			};
			const reply1 = {
				id: 'reply-123',
				content: 'Thread Reply 1',
				commentId: comment1.id,
				newCommentId: 'comment-345',
				owner: user.id,
				threadId: thread.id,
				date: '2022-08-05T19:20:33.555Z',
				isDelete: false
			};
			const reply2 = {
				id: 'reply-234',
				content: 'Thread Reply 2',
				commentId: comment1.id,
				newCommentId: 'comment-456',
				owner: user.id,
				threadId: thread.id,
				date: '2022-08-06T19:20:33.555Z',
				isDelete: true
			};
			await UsersTableTestHelper.addUser(user);
			await ThreadsTableTestHelper.addThread(thread);
			await ThreadsTableTestHelper.addComment(comment1);
			await ThreadsTableTestHelper.addComment(comment2);
			await ThreadsTableTestHelper.addReply(reply1);
			await ThreadsTableTestHelper.addReply(reply2);
			await ThreadsTableTestHelper.addLike({ commentId: comment1.id, userId: comment1.owner });
			const expectedComments = [
				{
					id: comment1.id,
					content: comment1.content,
					date: comment1.date,
					username: user.username,
					isDelete: comment1.isDelete,
					replies: [
						{
							id: reply1.id,
							content: reply1.content,
							date: reply1.date,
							username: user.username,
							isDelete: reply1.isDelete
						},
						{
							id: reply2.id,
							content: reply2.content,
							date: reply2.date,
							username: user.username,
							isDelete: reply2.isDelete
						}
					],
					likeCount: 1
				},
				{
					id: comment2.id,
					content: comment2.content,
					date: comment2.date,
					username: user.username,
					isDelete: comment2.isDelete,
					replies: [],
					likeCount: 0
				},
			];
			const fakeIdGenerator = () => '123';
			const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

			// Action
			const comments = await threadRepositoryPostgres.getThreadComments(thread.id);
			// Assert
			expect(comments).toStrictEqual(expectedComments);
		});
	});

	describe('addReply function', () => {
		it('should persist new reply and return added reply correctly', async () => {
			// Arrange
			const threadId = 'thread-123';
			const owner = 'user-123';
			const commentId = 'comment-123';
			const replyId = 'reply-234';
			await UsersTableTestHelper.addUser({ id: owner });
			await ThreadsTableTestHelper.addThread({ id: threadId, owner });
			await ThreadsTableTestHelper.addComment({ id: commentId, threadId, owner });
			const content = 'Comment Reply';
			const fakeIdGenerator = () => '234';
			const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

			// Action
			const addedReply = await threadRepositoryPostgres.addReply({ content }, owner, threadId, commentId);

			// Assert
			expect(addedReply).toStrictEqual({ id: replyId, content, owner });
			const reply = await ThreadsTableTestHelper.findReplyById(replyId);
			expect(reply).toHaveLength(1);
		});
	});

	describe('deleteReply function', () => {
		it('should successfully soft delete reply from a comment', async () => {
			// Arrange
			const owner = 'user-123';
			const threadId = 'thread-123';
			const commentId = 'comment-123';
			const replyId = 'reply-123';
			const commentReplyId = 'comment-234';
			await UsersTableTestHelper.addUser({ id: owner });
			await ThreadsTableTestHelper.addThread({ id: threadId, owner });
			await ThreadsTableTestHelper.addComment({ id: commentId, threadId, owner });
			await ThreadsTableTestHelper.addReply({ id: replyId, threadId, commentId, newCommentId: commentReplyId, owner });
			const fakeIdGenerator = () => '123';
			const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

			// Action
			await threadRepositoryPostgres.deleteComment(commentReplyId);

			// Assert
			const reply = await ThreadsTableTestHelper.findCommentById(commentReplyId);
			expect(reply[0].isDelete).toEqual(true);
		});
	});

	describe('isLiked function', () => {
		it('should return true when liked', async () => {
			// Arrange
			const owner = 'user-123';
			const threadId = 'thread-123';
			const commentId = 'comment-123';
			await UsersTableTestHelper.addUser({ id: owner });
			await ThreadsTableTestHelper.addThread({ id: threadId, owner });
			await ThreadsTableTestHelper.addComment({ id: commentId, threadId, owner });
			await ThreadsTableTestHelper.addLike({ commentId, userId: owner });
			const fakeIdGenerator = () => '123';
			const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

			// Action
			const isLiked = await threadRepositoryPostgres.isLiked(commentId, owner);

			// Assert
			expect(isLiked).toEqual(true);
		});

		it('should return false when not liked', async () => {
			// Arrange
			const owner = 'user-123';
			const threadId = 'thread-123';
			const commentId = 'comment-123';
			await UsersTableTestHelper.addUser({ id: owner });
			await ThreadsTableTestHelper.addThread({ id: threadId, owner });
			await ThreadsTableTestHelper.addComment({ id: commentId, threadId, owner });
			const fakeIdGenerator = () => '123';
			const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

			// Action
			const isLiked = await threadRepositoryPostgres.isLiked(commentId, owner);

			// Assert
			expect(isLiked).toEqual(false);
		});
	});

	describe('addCommentLike function', () => {
		it('should successfully add like to a comment', async () => {
			// Arrange
			const owner = 'user-123';
			const threadId = 'thread-123';
			const commentId = 'comment-123';
			await UsersTableTestHelper.addUser({ id: owner });
			await ThreadsTableTestHelper.addThread({ id: threadId, owner });
			await ThreadsTableTestHelper.addComment({ id: commentId, threadId, owner });
			const fakeIdGenerator = () => '123';
			const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

			// Action
			await threadRepositoryPostgres.addCommentLike(commentId, owner);

			// Assert
			const like1 = await ThreadsTableTestHelper.findLike(commentId, owner);
			expect(like1).toHaveLength(1);
		});
	});

	describe('deleteCommentLike function', () => {
		it('should successfully delete like from a comment', async () => {
			// Arrange
			const owner = 'user-123';
			const threadId = 'thread-123';
			const commentId = 'comment-123';
			await UsersTableTestHelper.addUser({ id: owner });
			await ThreadsTableTestHelper.addThread({ id: threadId, owner });
			await ThreadsTableTestHelper.addComment({ id: commentId, threadId, owner });
			await ThreadsTableTestHelper.addLike({ commentId, userId: owner });
			const fakeIdGenerator = () => '123';
			const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

			// Action
			await threadRepositoryPostgres.deleteCommentLike(commentId, owner);

			// Assert
			const like1 = await ThreadsTableTestHelper.findLike(commentId, owner);
			expect(like1).toHaveLength(0);
		});
	});
});

