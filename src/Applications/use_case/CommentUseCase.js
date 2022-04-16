class CommentUseCase {
	constructor(threadRepository) {
		this.threadRepository = threadRepository;
	}

	async addComment(payload, owner, threadId) {
		await this.threadRepository.verifyThreadExists(threadId);
		return this.threadRepository.addComment(payload, owner, threadId);
	}

	async deleteComment(commentId, userId) {
		await this.threadRepository.verifyCommentExists(commentId);
		await this.threadRepository.verifyCommentOwner(commentId, userId);
		await this.threadRepository.deleteComment(commentId);
	}
}

module.exports = CommentUseCase;