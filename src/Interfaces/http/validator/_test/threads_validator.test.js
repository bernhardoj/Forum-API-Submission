const InvariantError = require('../../../../Commons/exceptions/InvariantError');
const ThreadsValidator = require('../threads');

describe('threads payload validator', () => {
	describe('new thread payload', () => {
		it('should not throw error when given correct payload', async () => {
			expect(() => ThreadsValidator.validatePostThreadPayloadSchema({
				title: 'Thread Title',
				body: 'Thread Body'
			})).not.toThrowError();
		});

		it('should throw error when given incorrect payload', async () => {
			expect(() => ThreadsValidator.validatePostThreadPayloadSchema({
				title: '',
				body: false
			})).toThrow(new InvariantError('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada/tidak sesuai'));
		});
	});

	describe('new comment payload', () => {
		it('should not throw error when given correct payload', async () => {
			expect(() => ThreadsValidator.validatePostCommentThreadPayloadSchema({
				content: 'Thread Comment',
			})).not.toThrowError();
		});

		it('should throw error when given incorrect payload', async () => {
			expect(() => ThreadsValidator.validatePostCommentThreadPayloadSchema({})).toThrow(new InvariantError('tidak dapat menambahkan komentar karena properti yang dibutuhkan tidak ada/tidak sesuai'));
		});
	});

	describe('new reply payload', () => {
		it('should not throw error when given correct payload', async () => {
			expect(() => ThreadsValidator.validatePostReplyCommentPayloadSchema({
				content: 'Thread Reply',
			})).not.toThrowError();
		});

		it('should throw error when given incorrect payload', async () => {
			expect(() => ThreadsValidator.validatePostReplyCommentPayloadSchema({})).toThrow(new InvariantError('tidak dapat memberikan balasan karena properti yang dibutuhkan tidak ada/tidak sesuai'));
		});
	});
});
