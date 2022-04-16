class ThreadRepository {
	async addThread({ title, body }, owner) {
		throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
	}

	async addComment({ content }, owner, threadId) {
		throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
	}

	async addReply({ content }, owner, threadId, commentId) {
		throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
	}

	async verifyThreadExists(threadId) {
		throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
	}

	async verifyCommentExists(commentId) {
		throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');	
	}

	async verifyReplyExists(commentId) {
		throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');	
	}

	async verifyCommentOwner(commentId, userId) {
		throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
	}

	async getThread(threadId) {
		throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
	}

	async getThreadComments(threadId) {
		throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
	}

	async deleteComment(threadId, commentId) {
		throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
	}
}

module.exports = ThreadRepository;