const joi = require('joi');

const schemaEditarUsuarios = joi.object({
    nome: joi.string().min(3).required().messages({
      "any.required": "O campo nome é obrigatório",
      "string.min": "Campo nome deve ter no mínimo 3 letras",
    }),

    email: joi.string().email().trim().required().messages({
      "any.required": "O campo e-mail é obrigatório",
      "string.email": "Verifique se o e-mail digitado está correto.",
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

    status: joi.number().min(1).max(1).valid(0, 1).required().messages({
      "any.required": "O campo de status é obrigatório",
      "number.base": "Esse campo deve ser preenchido com números",
      "number.min": "A quantidade deve ser entre 0 e 1",
      "number.max": "A quantidade deve ser entre 0 e 1",
    }),

  });

module.exports = schemaEditarUsuarios