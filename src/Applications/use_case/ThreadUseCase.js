class ThreadUseCase {
	constructor(threadRepository) {
		this.threadRepository = threadRepository;
	}

	async addThread(payload, owner) {
		return this.threadRepository.addThread(payload, owner);
	}

	async getThreadDetail(threadId) {
		await this.threadRepository.verifyThreadExists(threadId);
		const [thread, comments] = await Promise.all([
			this.threadRepository.getThread(threadId), 
			this.threadRepository.getThreadComments(threadId)
		]);
		return { ...thread, comments };
	}
}

module.exports = ThreadUseCase;