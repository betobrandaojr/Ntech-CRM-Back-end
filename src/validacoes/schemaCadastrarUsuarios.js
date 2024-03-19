const joi = require('joi');

const schemaCadastrarUsuarios = joi.object({
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

    empresa_id: joi.number().min(1).required().messages({
      "any.required": "O campo de empresa_id é obrigatório",
      "number.base": "Esse campo deve ser preenchido com números",
      "number.min": "A quantidade deve ser maior que Zero",
    }),

    cargo_id: joi.number().min(1).required().messages({
      "any.required": "O campo cargo_id é obrigatório",
      "number.base": "Esse campo deve ser preenchido com números",
      "number.min": "A quantidade deve ser maior que Zero",
    }),

    // status: joi.number().min(1).max(1).valid(0, 1).required().messages({
    //   "any.required": "O campo de status é obrigatório",
    //   "number.base": "Esse campo deve ser preenchido com números",
    //   "number.min": "A quantidade deve ser entre 0 e 1",
    //   "number.max": "A quantidade deve ser entre 0 e 1",
    // }),

  });

module.exports = schemaCadastrarUsuarios;