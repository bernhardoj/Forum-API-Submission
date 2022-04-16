/* eslint-disable camelcase */

exports.up = (pgm) => {
	pgm.createTable('threads', {
		id: {
			type: 'VARCHAR(23)',
			primaryKey: true,
		},
		title: {
			type: 'TEXT',
			notNull: true,
		},
		body: {
			type: 'TEXT',
			notNull: true,
		},
		owner: {
			type: 'VARCHAR(50)',
			notNull: true,
			references: '"users"',
			onDelete: 'cascade',
		},
		date: {
			type: 'TEXT',
			notNull: true,
			default: pgm.func('current_timestamp')
		}
	});
};

exports.down = (pgm) => {
	pgm.dropTable('threads');
};
