/* eslint-disable camelcase */

exports.up = (pgm) => {
	pgm.createTable('thread_comment_likes', {
		commentId: {
			type: 'VARCHAR(24)',
			notNull: true,
			references: '"thread_comments"',
			onDelete: 'cascade',
		},
		userId: {
			type: 'VARCHAR(50)',
			notNull: true,
			references: '"users"',
			onDelete: 'cascade',
		}
	});
};

exports.down = (pgm) => {
	pgm.dropTable('thread_comment_likes');
};
