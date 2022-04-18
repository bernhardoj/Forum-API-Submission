class ThreadUseCase {
	constructor(threadRepository) {
		this.threadRepository = threadRepository;
	}

	async addThread(payload, owner) {
		return this.threadRepository.addThread(payload, owner);
	}

	async getThreadDetail(threadId) {
		await this.threadRepository.verifyThreadExists(threadId);
		let [thread, comments] = await Promise.all([
			this.threadRepository.getThread(threadId), 
			this.threadRepository.getThreadComments(threadId)
		]);
		comments = comments.map(comment => ({
			id: comment.id,
			date: comment.date,
			username: comment.username,
			content: comment.isDelete ? '**komentar telah dihapus**' : comment.content,
			replies: comment.replies?.map(reply => ({
				id: reply.id,
				username: reply.username,
				date: reply.date, 
				content: reply.isDelete ? '**balasan telah dihapus**' : reply.content
			})) ?? []
		}));
		return { ...thread, comments };
	}
}

module.exports = ThreadUseCase;
