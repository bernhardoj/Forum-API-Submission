/* istanbul ignore file */

const Joi = require('joi');

const PostThreadPayloadSchema = Joi.object({
	title: Joi.string().required(),
	body: Joi.string().required(),
});

const PostCommentThreadPayloadSchema = Joi.object({
	content: Joi.string().required()
});

const PostReplyCommentPayloadSchema = Joi.object({
	content: Joi.string().required()
});

module.exports = {
	PostThreadPayloadSchema,
	PostCommentThreadPayloadSchema,
	PostReplyCommentPayloadSchema
};
