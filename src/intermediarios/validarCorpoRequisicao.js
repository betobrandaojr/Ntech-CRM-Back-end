const validarCorpoRequisicao = (joiSchema) => async (req, res, next) => {
    try {
      
      await joiSchema.validateAsync(req.body);
      next();
    } catch (error) {
      let mensagensErro = '';
      if (error.details && error.details.length > 0) {
        mensagensErro = error.details.map((detalhe) => detalhe.message).join('. ');
      } else {
        mensagensErro = 'Erro interno do servidor';
      }
  
      return res.status(400).json({ erro: mensagensErro });
    }
  };
  
  module.exports = validarCorpoRequisicao;
  
  