const {
	PostThreadPayloadSchema,
	PostCommentThreadPayloadSchema,
	PostReplyCommentPayloadSchema
} = require('./schema');
const InvariantError = require('../../../../Commons/exceptions/InvariantError');
  
const ThreadsValidator = {
	validatePostThreadPayloadSchema: (payload) => {
		const validationResult = PostThreadPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada/tidak sesuai');
		}
	},
	validatePostCommentThreadPayloadSchema: (payload) => {
		const validationResult = PostCommentThreadPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError('tidak dapat menambahkan komentar karena properti yang dibutuhkan tidak ada/tidak sesuai');
		}
	},
	validatePostReplyCommentPayloadSchema: (payload) => {
		const validationResult = PostReplyCommentPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError('tidak dapat memberikan balasan karena properti yang dibutuhkan tidak ada/tidak sesuai');
		}
	},
};
  
module.exports = ThreadsValidator;
  