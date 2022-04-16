/* eslint-disable camelcase */

exports.up = (pgm) => {
	pgm.createTable('thread_comments', {
		id: {
			type: 'VARCHAR(24)',
			primaryKey: true,
		},
		content: {
			type: 'TEXT',
			notNull: true,
		},
		owner: {
			type: 'VARCHAR(50)',
			notNull: true,
			references: '"users"',
			onDelete: 'cascade',
		},
		threadId: {
			type: 'VARCHAR(23)',
			notNull: true,
			references: '"threads"',
			onDelete: 'cascade',
		},
		isDelete: {
			type: 'BOOLEAN',
			notNull: true,
			default: false
		},
		date: {
			type: 'TEXT',
			notNull: true,
			default: pgm.func('current_timestamp')
		},
		isReply: {
			type: 'BOOLEAN',
			notNull: true,
			default: false
		}
	});
};

exports.down = (pgm) => {
	pgm.dropTable('thread_comments');
};
