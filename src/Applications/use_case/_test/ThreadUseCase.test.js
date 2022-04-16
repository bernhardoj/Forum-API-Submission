const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ThreadUseCase = require('../ThreadUseCase');

describe('ThreadUseCase', () => {
	describe('addThread function', () => {
		it('should orchestrating the add user action correctly', async () => {
			// Arrange
			const title = 'New Thread';
			const body = 'Thread Body';
			const owner = 'user-123';
			const expectedThread = {
				id: 'thread-123',
				title: title,
				owner: owner,
			};
        
			/** creating dependency of use case */
			const mockThreadRepository = new ThreadRepository();
        
			/** mocking needed function */
			mockThreadRepository.addThread = jest.fn()
				.mockImplementation(() => Promise.resolve(expectedThread));
        
			/** creating use case instance */
			const threadUseCase = new ThreadUseCase(mockThreadRepository);
        
			// Action
			const thread = await threadUseCase.addThread({ title, body }, owner);
        
			// Assert
			expect(thread).toStrictEqual(expectedThread);
			expect(mockThreadRepository.addThread).toBeCalledWith({ title, body }, owner);
		});
	});
	
	describe('getThreadDetaill function', () => {
		it('should orchestrating the get thread detail action correctly', async () => {
			// Arrange
			const threadId = 'thread-123';
			const commentId = 'comment-123';
			/** creating dependency of use case */
			const mockThreadRepository = new ThreadRepository();
        
			const expectedThread = {
				id: threadId,
				title: 'Thread Title',
				body: 'Thread Body',
				date: '2022-08-05T19:20:33.555Z',
				username: 'dicoding'
			};

			const expectedComments = [
				{
					id: commentId,
					content: 'Thread comment',
					date: '2022-08-05T19:20:33.555Z',
					username: 'dicoding'
				},
			];

			const expectedThreadDetail = {
				...expectedThread,
				comments: expectedComments
			};

			/** mocking needed function */
			mockThreadRepository.verifyThreadExists = jest.fn()
				.mockImplementation(() => Promise.resolve());
			mockThreadRepository.getThread = jest.fn()
				.mockImplementation(() => Promise.resolve(expectedThread));
			mockThreadRepository.getThreadComments = jest.fn()
				.mockImplementation(() => Promise.resolve(expectedComments));
        
			/** creating use case instance */
			const threadUseCase = new ThreadUseCase(mockThreadRepository);
        
			// Action
			const threadDetail = await threadUseCase.getThreadDetail(threadId);

			// Assert
			expect(threadDetail).toStrictEqual(expectedThreadDetail);
			expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
			expect(mockThreadRepository.getThread).toBeCalledWith(threadId);
			expect(mockThreadRepository.getThreadComments).toBeCalledWith(threadId);
		});
	});
});
