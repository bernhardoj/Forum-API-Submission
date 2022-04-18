const CommentUseCase = require('../../../../Applications/use_case/CommentUseCase');
const ReplyUseCase = require('../../../../Applications/use_case/ReplyUseCase');
const ThreadUseCase = require('../../../../Applications/use_case/ThreadUseCase');
const ThreadsValidator = require('../../validator/threads');
class ThreadsHandler {
	constructor(container) {
		this.container = container;

		this.postThreadHandler = this.postThreadHandler.bind(this);
		this.postCommentThreadHandler = this.postCommentThreadHandler.bind(this);
		this.postReplyCommentHandler = this.postReplyCommentHandler.bind(this);
		this.getThreadHandler = this.getThreadHandler.bind(this);
		this.deleteCommentThreadHandler = this.deleteCommentThreadHandler.bind(this);
		this.deleteReplyCommentHandler = this.deleteReplyCommentHandler.bind(this);
		this.likeCommentHandler = this.likeCommentHandler.bind(this);
	}

	async postThreadHandler(request, h) {
		ThreadsValidator.validatePostThreadPayloadSchema(request.payload);
		const threadUseCase = this.container.getInstance(ThreadUseCase.name);
		const addedThread = await threadUseCase.addThread(request.payload, request.auth.credentials.id);

		const response = h.response({
			status: 'success',
			data: {
				addedThread,
			},
		});
		response.code(201);
		return response;
	}

	async getThreadHandler(request) {
		const threadUseCase = this.container.getInstance(ThreadUseCase.name);
		const thread = await threadUseCase.getThreadDetail(request.params.threadId);

		return {
			status: 'success',
			data: {
				thread,
			},
		};
	}
	
	async postCommentThreadHandler(request, h) {
		ThreadsValidator.validatePostCommentThreadPayloadSchema(request.payload);
		const commentUseCase = this.container.getInstance(CommentUseCase.name);
		const addedComment = await commentUseCase.addComment(
			request.payload,
			request.auth.credentials.id, 
			request.params.threadId 
		);

		const response = h.response({
			status: 'success',
			data: {
				addedComment,
			},
		});
		response.code(201);
		return response;
	}

	async postReplyCommentHandler(request, h) {
		ThreadsValidator.validatePostReplyCommentPayloadSchema(request.payload);
		const replyUseCase = this.container.getInstance(ReplyUseCase.name);
		const addedReply = await replyUseCase.addReply(
			request.payload,
			request.auth.credentials.id, 
			request.params.threadId,
			request.params.commentId,
		);

		const response = h.response({
			status: 'success',
			data: {
				addedReply,
			},
		});
		response.code(201);
		return response;
	}
	
	async deleteCommentThreadHandler(request) {
		const commentUseCase = this.container.getInstance(CommentUseCase.name);
		const { commentId } = request.params;
		const userId = request.auth.credentials.id;
		await commentUseCase.deleteComment(commentId, userId);

		return {
			status: 'success'
		};
	}

	async deleteReplyCommentHandler(request) {
		const replyUseCase = this.container.getInstance(ReplyUseCase.name);
		const { replyId } = request.params;
		const userId = request.auth.credentials.id;
		await replyUseCase.deleteReply(replyId, userId);

		return {
			status: 'success'
		};
	}

	async likeCommentHandler(request) {
		const commentUseCase = this.container.getInstance(CommentUseCase.name);
		const { threadId, commentId } = request.params;
		const userId = request.auth.credentials.id;
		await commentUseCase.likeComment(threadId, commentId, userId);

		return {
			status: 'success'
		};
	}
}

module.exports = ThreadsHandler;
