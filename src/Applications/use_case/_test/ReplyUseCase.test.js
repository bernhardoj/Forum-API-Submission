const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ReplyUseCase = require('../ReplyUseCase');

describe('ReplyUseCase', () => {
	describe('addReply function', () => {
		it('should orchestrating the add reply action correctly', async () => {
			// Arrange
			const threadId = 'thread-123';
			const content = 'Thread Comment';
			const owner = 'user-123';
			const commentId = 'comment-123';
			const expectedReply = {
				id: 'reply-123',
				content,
				owner,
			};
        
			/** creating dependency of use case */
			const mockThreadRepository = new ThreadRepository();
        
			/** mocking needed function */
			mockThreadRepository.verifyThreadExists = jest.fn()
				.mockImplementation(() => Promise.resolve());
			mockThreadRepository.verifyCommentExists = jest.fn()
				.mockImplementation(() => Promise.resolve());
			mockThreadRepository.addReply = jest.fn()
				.mockImplementation(() => Promise.resolve(expectedReply));
        
			/** creating use case instance */
			const replyUseCase = new ReplyUseCase(mockThreadRepository);
        
			// Action
			const reply = await replyUseCase.addReply({ content }, owner, threadId, commentId);
        
			// Assert
			expect(reply).toStrictEqual(expectedReply);
			expect(mockThreadRepository.addReply).toBeCalledWith({ content }, owner, threadId, commentId);
			expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
			expect(mockThreadRepository.verifyCommentExists).toBeCalledWith(commentId);
		});
	});

	describe('deleteReply function', () => {
		it('should orchestrating the delete reply action correctly', async () => {
			// Arrange
			const replyId = 'reply-123';
			const commentId = 'comment-123';
			const userId = 'user-123';
			/** creating dependency of use case */
			const mockThreadRepository = new ThreadRepository();
        
			/** mocking needed function */
			mockThreadRepository.verifyReplyExists = jest.fn()
				.mockImplementation(() => Promise.resolve(commentId));
			mockThreadRepository.verifyCommentOwner = jest.fn()
				.mockImplementation(() => Promise.resolve());
			mockThreadRepository.deleteComment = jest.fn()
				.mockImplementation(() => Promise.resolve());
        
			/** creating use case instance */
			const replyUseCase = new ReplyUseCase(mockThreadRepository);
        
			// Action and Assert
			await expect(replyUseCase.deleteReply(replyId, userId)).resolves.not.toThrowError();
			expect(mockThreadRepository.verifyReplyExists).toBeCalledWith(replyId);
			expect(mockThreadRepository.verifyCommentOwner).toBeCalledWith(commentId, userId);
			expect(mockThreadRepository.deleteComment).toBeCalledWith(commentId);
		});
	});
});
