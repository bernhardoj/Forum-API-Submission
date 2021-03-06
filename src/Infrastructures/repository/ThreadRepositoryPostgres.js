const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
	constructor(pool, idGenerator) {
		super();
		this.pool = pool;
		this.idGenerator = idGenerator;
	}
    
	async addThread({ title, body }, owner) {
		const id = `thread-${this.idGenerator()}`;
		const query = {
			text: 'INSERT INTO threads VALUES($1, $2, $3, $4) RETURNING id, title, owner',
			values: [id, title, body, owner]
		};

		const result = await this.pool.query(query);

		return result.rows[0];
	}

	async addComment({ content }, owner, threadId) {
		const id = `comment-${this.idGenerator()}`;
		const query = {
			text: 'INSERT INTO thread_comments VALUES($1, $2, $3, $4) RETURNING id, content, owner',
			values: [id, content, owner, threadId]
		};

		const result = await this.pool.query(query);

		return result.rows[0];
	}

	async deleteComment(commentId) {
		const query = {
			text: 'UPDATE thread_comments SET "isDelete" = true WHERE id = $1',
			values: [commentId]
		};

		await this.pool.query(query);
	}

	async verifyThreadExists(threadId) {
		const query = {
			text: 'SELECT id FROM threads WHERE id = $1',
			values: [threadId]
		};
		const result = await this.pool.query(query);

		if (!result.rowCount) throw new NotFoundError('thread tidak dapat ditemukan');
	}

	async verifyCommentExists(commentId) {
		const query = {
			text: 'SELECT owner FROM thread_comments WHERE id = $1',
			values: [commentId]
		};
		const result = await this.pool.query(query);

		if (!result.rowCount) throw new NotFoundError('komentar tidak dapat ditemukan');
	}

	async verifyReplyExists(replyId) {
		const query = {
			text: 'SELECT "commentId" FROM thread_comment_replies WHERE id = $1',
			values: [replyId]
		};
		const result = await this.pool.query(query);

		if (!result.rowCount) throw new NotFoundError('balasan tidak dapat ditemukan');
		return result.rows[0].commentId;
	}

	async verifyCommentOwner(commentId, userId) {
		const query = {
			text: 'SELECT owner FROM thread_comments WHERE id = $1 AND owner = $2',
			values: [commentId, userId]
		};
		const result = await this.pool.query(query);

		if (!result.rowCount) throw new AuthorizationError('kamu tidak memiliki akses');
	}

	async getThread(threadId) {
		const query = {
			text: `SELECT t.id, title, body, date, u.username
			FROM threads t
			JOIN users u ON t.owner = u.id
			WHERE t.id = $1`,
			values: [threadId]
		};

		const result = await this.pool.query(query);

		return result.rows[0];
	}

	async getThreadComments(threadId) {
		const query = {
			text: `
			SELECT 
				tc.id, 
				tc.date, 
				u.username, 
				tc.content,
				tc."isDelete",
				ARRAY(
					SELECT json_build_object(
						'id', tcr.id, 
						'username', u.username, 
						'content', tcc.content,
						'isDelete', tcc."isDelete", 
						'date', tcc.date)
					FROM thread_comment_replies tcr
					JOIN thread_comments tcc ON tcc.id = "commentId"
					JOIN users u ON u.id = tcc.owner	
					WHERE tcr."replyTo" = tc.id
					ORDER BY tcc.date ASC
				) as replies,
				COUNT(tcl."commentId")::int as "likeCount"
			FROM thread_comments tc
			JOIN users u ON tc.owner = u.id
			LEFT JOIN thread_comment_likes tcl ON tcl."commentId" = tc.id
			WHERE tc."threadId" = $1 AND "isReply" = false
			GROUP BY tc.id, u.username
			ORDER BY date ASC`,
			values: [threadId]
		};
		const result = await this.pool.query(query);

		return result.rows;
	}

	async addReply({ content }, owner, threadId, commentId) {
		const replyId = `reply-${this.idGenerator()}`;
		const newCommentId = `comment-${this.idGenerator()}`;
		const client = await this.pool.connect();
		const commentQuery = {
			text: 'INSERT INTO thread_comments (id, content, owner, "threadId", "isReply") VALUES($1, $2, $3, $4, $5) RETURNING content, owner',
			values: [newCommentId, content, owner, threadId, true]
		};
		const replyQuery = {
			text: 'INSERT INTO thread_comment_replies VALUES($1, $2, $3) RETURNING id',
			values: [replyId, commentId, newCommentId]
		};
		let commentResult, replyResult;
		try {
			await client.query('BEGIN');
			commentResult = await client.query(commentQuery);
			replyResult = await client.query(replyQuery);
			await client.query('COMMIT');
		} catch (e) {
			/* istanbul ignore next */
			await client.query('ROLLBACK');
			/* istanbul ignore next */
			throw e;
		} finally {
			client.release();
		}
		return { ...commentResult.rows[0], ...replyResult.rows[0] };
	}

	async isLiked(commentId, userId) {
		const query = {
			text: 'SELECT * FROM thread_comment_likes WHERE "commentId" = $1 AND "userId" = $2',
			values: [commentId, userId]
		};
		const result = await this.pool.query(query);

		return result.rowCount !== 0;
	}

	async addCommentLike(commentId, userId) {
		const query = {
			text: 'INSERT INTO thread_comment_likes VALUES($1, $2)',
			values: [commentId, userId]
		};

		await this.pool.query(query);
	}

	async deleteCommentLike(commentId, userId) {
		const query = {
			text: 'DELETE FROM thread_comment_likes WHERE "commentId" = $1 AND "userId" = $2',
			values: [commentId, userId]
		};

		await this.pool.query(query);
	}
}

module.exports = ThreadRepositoryPostgres;