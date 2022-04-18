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

	async likeComment(threadId, commentId, userId) {
		await this.threadRepository.verifyThreadExists(threadId);
		await this.threadRepository.verifyCommentExists(commentId);
		const isLiked = await this.threadRepository.isLiked(commentId, userId);
		if (isLiked) await this.threadRepository.deleteCommentLike(commentId, userId);
		else await this.threadRepository.addCommentLike(commentId, userId);
	}
}

module.exports = CommentUseCase;
