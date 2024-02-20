const joi = require('joi');

const schemaClientes = joi.object({
    nome: joi.string().min(3).required().messages({
      "any.required": "O campo nome é obrigatório",
      "string.min": "Campo nome deve ter no mínimo 3 letras",
    }),

    sobrenome: joi.string().min(1).required().messages({
      "any.required": "O campo Sobrenome é obrigatório",
      "string.min": "Campo nome deve ter no mínimo 1 letra!",
    }),

    email: joi.string().email().trim().required().messages({
      "any.required": "O campo e-mail é obrigatório",
      "string.email": "Verifique se o e-mail digitado está correto.",
    }),
    telefone: joi.string().min(11).max(11).trim().regex(/^[0-9]{11}$/).required().messages({
      "string.min": "Número de telefone inválido",
      "string.max": "Número de telefone inválido",
      "any.required": "O campo telefone é obrigatório",
      "string.pattern.base":"O telefone deve conter apenas numeros",
      }),
    cpf: joi.string().min(11).max(11).trim().regex(/^[0-9]{11}$/).required().messages({
    "string.min": "Cpf inválido",
    "string.max": "Cpf inválido",
    "any.required": "O campo cpf é obrigatório",
    "string.pattern.base":"O CPF deve conter apenas numeros",
    }),
    cep: joi.string().min(8).max(8).regex(/^[0-9]{8}$/).trim().messages({
        "string.min": "Cep inválido",
        "string.max": "Cep inválido",
        "string.pattern.base":"O CEP deve conter apenas numeros",
    }),
    rua: joi.string(),
    numero:joi.string().max(10).trim(),
    bairro: joi.string(),
    cidade: joi.string().min(3),
    estado: joi.string().min(2).max(2).trim()
    })

    module.exports = schemaClientes