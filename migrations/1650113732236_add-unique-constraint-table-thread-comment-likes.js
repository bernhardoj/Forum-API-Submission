/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
	pgm.addConstraint(
		'thread_comment_likes',
		'unique.thread_comment_likes.commentId_userId',
		{
			unique: ['commentId', 'userId'],
		},
	);
};

exports.down = (pgm) => {
	pgm.dropConstraint(
		'thread_comment_likes',
		'unique.thread_comment_likes.commentId_userId',
	);
};
