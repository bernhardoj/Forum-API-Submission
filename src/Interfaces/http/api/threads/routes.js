const routes = (handler) => ([
	{
		method: 'POST',
		path: '/threads',
		handler: handler.postThreadHandler,
		options: {
			auth: 'forumapi_jwt',
		},
	},
	{
		method: 'POST',
		path: '/threads/{threadId}/comments',
		handler: handler.postCommentThreadHandler,
		options: {
			auth: 'forumapi_jwt',
		},
	},
	{
		method: 'POST',
		path: '/threads/{threadId}/comments/{commentId}/replies',
		handler: handler.postReplyCommentHandler,
		options: {
			auth: 'forumapi_jwt',
		},
	},
	{
		method: 'GET',
		path: '/threads/{threadId}',
		handler: handler.getThreadHandler,
	},
	{
		method: 'DELETE',
		path: '/threads/{threadId}/comments/{commentId}',
		handler: handler.deleteCommentThreadHandler,
		options: {
			auth: 'forumapi_jwt',
		},
	},
	{
		method: 'DELETE',
		path: '/threads/{threadId}/comments/{commentId}/replies/{replyId}',
		handler: handler.deleteReplyCommentHandler,
		options: {
			auth: 'forumapi_jwt',
		},
	},
	{
		method: 'PUT',
		path: '/threads/{threadId}/comments/{commentId}/likes',
		handler: handler.likeCommentHandler,
		options: {
			auth: 'forumapi_jwt',
		},
	},
]);

module.exports = routes;
