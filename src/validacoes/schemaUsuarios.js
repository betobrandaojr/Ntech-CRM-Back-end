const joi = require('joi');

const schemaUsuarios = joi.object({
    nome: joi.string().min(3).required().messages({
      "any.required": "O campo nome é obrigatório",
      "string.min": "Campo nome deve ter no mínimo 3 letras",
    }),
    email: joi.string().email().trim().required().messages({
      "any.required": "O campo e-mail é obrigatório",
      "string.email": "Verifique se o e-mail digitado está correto.",
    }),
    senha: joi.string().min(5).trim().required().messages({
      "string.min": "A senha deve ter no mínimo 5 caracteres.",
      "any.required": "O campo senha é obrigatório",
    }),
  });

module.exports = schemaUsuarios