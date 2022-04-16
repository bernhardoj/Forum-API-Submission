/* eslint-disable camelcase */

exports.up = (pgm) => {
	pgm.createTable('thread_comment_replies', {
		id: {
			type: 'VARCHAR(22)',
			primaryKey: true,
		},
		replyTo: {
			type: 'VARCHAR(24)',
			notNull: true,
			references: '"thread_comments"',
			onDelete: 'cascade',
		},
		commentId: {
			type: 'VARCHAR(24)',
			notNull: true,
			references: '"thread_comments"',
			onDelete: 'cascade',
		}
	});
};

exports.down = (pgm) => {
	pgm.dropTable('thread_comment_replies');
};
