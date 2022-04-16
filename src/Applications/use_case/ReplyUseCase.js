class ReplyUseCase {
	constructor(threadRepository) {
		this.threadRepository = threadRepository;
	}

	async addReply(payload, owner, threadId, commentId) {
		await this.threadRepository.verifyThreadExists(threadId);
		await this.threadRepository.verifyCommentExists(commentId);
		return this.threadRepository.addReply(payload, owner, threadId, commentId);
	}

	async deleteReply(replyId, userId) {
		const commentId = await this.threadRepository.verifyReplyExists(replyId);
		await this.threadRepository.verifyCommentOwner(commentId, userId);
		await this.threadRepository.deleteComment(commentId);
	}
}

module.exports = ReplyUseCase;