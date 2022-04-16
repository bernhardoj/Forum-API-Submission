const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentUseCase = require('../CommentUseCase');

describe('CommentUseCase', () => {
	describe('addComment function', () => {
		it('should orchestrating the add comment action correctly', async () => {
			// Arrange
			const threadId = 'thread-123';
			const content = 'Thread Comment';
			const owner = 'user-123';
			const expectedComment = {
				id: 'comment-123',
				content,
				owner,
			};
        
			/** creating dependency of use case */
			const mockThreadRepository = new ThreadRepository();
        
			/** mocking needed function */
			mockThreadRepository.verifyThreadExists = jest.fn()
				.mockImplementation(() => Promise.resolve());
			mockThreadRepository.addComment = jest.fn()
				.mockImplementation(() => Promise.resolve(expectedComment));
        
			/** creating use case instance */
			const commentUseCase = new CommentUseCase(mockThreadRepository);
        
			// Action
			const comment = await commentUseCase.addComment({ content }, owner, threadId);
        
			// Assert
			expect(comment).toStrictEqual(expectedComment);
			expect(mockThreadRepository.addComment).toBeCalledWith({ content }, owner, threadId);
			expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
		});
	});

	describe('deleteComment function', () => {
		it('should orchestrating the delete comment action correctly', async () => {
			// Arrange
			const commentId = 'comment-123';
			const userId = 'user-123';
			/** creating dependency of use case */
			const mockThreadRepository = new ThreadRepository();
        
			/** mocking needed function */
			mockThreadRepository.verifyCommentExists = jest.fn()
				.mockImplementation(() => Promise.resolve());
			mockThreadRepository.verifyCommentOwner = jest.fn()
				.mockImplementation(() => Promise.resolve());
			mockThreadRepository.deleteComment = jest.fn()
				.mockImplementation(() => Promise.resolve());
        
			/** creating use case instance */
			const commentUseCase = new CommentUseCase(mockThreadRepository);
        
			// Action and Assert
			await expect(commentUseCase.deleteComment(commentId, userId)).resolves.not.toThrowError();
			expect(mockThreadRepository.verifyCommentExists).toBeCalledWith(commentId);
			expect(mockThreadRepository.verifyCommentOwner).toBeCalledWith(commentId, userId);
			expect(mockThreadRepository.deleteComment).toBeCalledWith(commentId);
		});
	});
});
