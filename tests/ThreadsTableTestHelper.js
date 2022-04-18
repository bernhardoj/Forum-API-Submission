/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadsTableTestHelper = {
	async addThread({
		id = 'thread-123', title = 'Thread Title', body = 'Thread Body', owner = 'user-123', date = '2022-08-04T19:20:33.555Z'
	}) {
		const query = {
			text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5)',
			values: [id, title, body, owner, date],
		};

		await pool.query(query);
	},

	async addComment({
		id = 'comment-123', content = 'Thread Comment', owner = 'user-123', threadId = 'thread-123', isDelete = false, date = '2022-08-04T19:20:33.555Z'
	}) {
		const query = {
			text: 'INSERT INTO thread_comments VALUES($1, $2, $3, $4, $5, $6)',
			values: [id, content, owner, threadId, isDelete, date],
		};

		await pool.query(query);
	},

	async addReply({
		id = 'reply-123', commentId = 'comment-123', newCommentId = 'comment-234', content = 'Thread Reply', 
		owner = 'user-123', threadId = 'thread-123', isDelete = false, date = '2022-08-04T19:20:33.555Z'
	}) {
		const client = await pool.connect();
		const commentQuery = {
			text: 'INSERT INTO thread_comments VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING content, owner',
			values: [newCommentId, content, owner, threadId, isDelete, date, true]
		};
		const replyQuery = {
			text: 'INSERT INTO thread_comment_replies VALUES($1, $2, $3) RETURNING id',
			values: [id, commentId, newCommentId]
		};
		try {
			await client.query('BEGIN');
			await client.query(commentQuery);
			await client.query(replyQuery);
			await client.query('COMMIT');
		} catch (e) {
			await client.query('ROLLBACK');
			throw e;
		} finally {
			client.release();
		}
	},

	async findThreadById(id) {
		const query = {
			text: 'SELECT * FROM threads WHERE id = $1',
			values: [id],
		};

		const result = await pool.query(query);
		return result.rows;
	},

	async findCommentById(id) {
		const query = {
			text: 'SELECT * FROM thread_comments WHERE id = $1',
			values: [id],
		};

		const result = await pool.query(query);
		return result.rows;
	},

	async findReplyById(id) {
		const query = {
			text: 'SELECT * FROM thread_comment_replies WHERE id = $1',
			values: [id],
		};

		const result = await pool.query(query);
		return result.rows;
	},

	async addLike({commentId = 'comment-123', userId = 'user-123'}) {
		const query = {
			text: 'INSERT INTO thread_comment_likes VALUES($1, $2)',
			values: [commentId, userId],
		};

		await pool.query(query);
	},

	async findLike(commentId, userId) {
		const query = {
			text: 'SELECT * FROM thread_comment_likes WHERE "commentId" = $1 AND "userId" = $2',
			values: [commentId, userId],
		};

		const result = await pool.query(query);
		return result.rows;
	},

	async cleanTable() {
		await pool.query('DELETE FROM threads WHERE 1=1');
	},
};

module.exports = ThreadsTableTestHelper;
