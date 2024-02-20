const joi = require('joi')

const produtoSchema = joi.object({
    produto_id:joi.number().required().min(1).messages({
        "any.required": "O campo produto_id é obrigatório",
        "number.min": "O numero do produto_id deve ser maior que zero",
    }),
    quantidade_produto: joi.number().integer().min(1).required().messages({
        "any.required": "O campo quantidade_produto é obrigatório",
        "number.min": "A quantidade deve ser maior que zero",
  })
});

const schemaPedidos = joi.object({
    cliente_id: joi.number().required().min(1).messages({
        "any.required": "O campo client_id é obrigatório",
        "number.min": "O numero deve ser maior que zero",
    }),
    
    observacao: joi.string().messages({
        "string.base": "O campo Observacao deve ser um texto",
    }),

    pedido_produtos: joi.array().items(produtoSchema).min(1).required()

})



  



module.exports=schemaPedidos
