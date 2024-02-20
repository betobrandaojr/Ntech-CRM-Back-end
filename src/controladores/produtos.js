const pool = require("../conexao");
const aws = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;

const endpoint = new aws.Endpoint(process.env.ENDPOINT_S3);
const s3 = new aws.S3({
endpoint,
credentials:{
    accessKeyId:process.env.KEY_ID,
    secretAccessKey:process.env.APP_KEY
}
});

const cadastrarProduto = async (req, res) => {
  let { descricao, quantidade_estoque, valor, categoria_id, produto_imagem } = req.body;
  const quantidade = parseInt(quantidade_estoque);
  const {file} = req;


  try {
    const categoriaExiste = await pool.query(
      "select * from categorias where id = $1",
      [categoria_id]
    );
    if (categoriaExiste.rowCount < 1) {
      return res.status(400).json({ erro: "Esta categoria não existe" });
    }

    const produtoExiste = await pool.query("select * from produtos where descricao = $1",[descricao]);

    if (produtoExiste.rowCount > 0) {
      const updateQuery = `
        UPDATE produtos 
        SET quantidade_estoque = quantidade_estoque + $1
        WHERE descricao = $2
        RETURNING *;
      `;
      const { rows: [produtoAtualizado] } = await pool.query(updateQuery, [quantidade, descricao]);
      return res.status(201).json(produtoAtualizado);
    }
   
    if(file){
    try {
     const arquivo = await s3.upload({
       Bucket:process.env.BACKBLAZE_BUCKET,
       Key:file.originalname,
       Body:file.buffer,
       ContentType:file.mimetype
      }).promise();
   
produto_imagem = await arquivo.Location;
   

    } catch (error) {
     return res.status(500).json({mensagem:"Erro inter do servidor"})
    } }


    const query = `
    insert into produtos(descricao,quantidade_estoque,valor,categoria_id,produto_imagem)
    values($1,$2,$3,$4,$5) returning *
    `;
    const { rows } = await pool.query(query, [
      descricao,
      quantidade_estoque,
      valor,
      categoria_id,
      produto_imagem,
    ]);

    if (rows.length > 0) {
      const produto = rows[0];
      return res.status(201).json(produto);
    }
  } catch (error) {
   
    return res.status(400).json({ erro: error.message });
  }
};


const editarDadosProduto = async (req, res) => {
  const { id } = req.params;
  const { descricao, quantidade_estoque, valor, categoria_id, produto_imagem} = req.body;

  try {
    const produtoExiste = await pool.query(
      "select * from produtos where id = $1",
      [id]
    );
    if (produtoExiste.rowCount < 1) {
      return res.status(400).json({ erro: "Produto não encontrado!" });
    }

    const categoriaExiste = await pool.query(
      "select * from categorias where id = $1",
      [categoria_id]
    );
    if (categoriaExiste.rowCount < 1) {
      return res.status(400).json({ erro: "Esta categoria não existe" });
    }

    const query = `
UPDATE produtos
SET descricao = $1, quantidade_estoque = $2, valor = $3, categoria_id = $4, produto_imagem = $5
WHERE id = $6; 
`;
    const { rows, rowCount } = await pool.query(query, [
      descricao,
      quantidade_estoque,
      valor,
      categoria_id,
      produto_imagem,
      id
    ]);

    if (rowCount > 0) {
      return res.status(201).json("Produto Atualizado");
    }
  } catch (error) {
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
};



const listarProdutos = async (req, res) => {
  const { categoria_id } = req.query;

  try {
    if (categoria_id) {

      const categoriaExistente = await pool.query(
        "SELECT * FROM categorias WHERE id = $1",
        [categoria_id]
    );

    if (categoriaExistente.rows.length === 0) {
        return res.status(400).json({ erro: "A categoria não existe" });
    }

      const produtoExiste = await pool.query(
        "select * from produtos where categoria_id = $1",
        [categoria_id]
      );
     
      const produtoEncontrado = produtoExiste.rows;
      return res.status(201).json(produtoEncontrado);
    }

    const listaProdutos = await pool.query("select * from produtos");
    const lista = listaProdutos.rows;
    return res.status(201).json(lista);
  } catch (error) {
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
};

const detalharProduto = async (req, res) => {
  const { id } = req.params;

  try {
    if (id) {
      const produtoExiste = await pool.query("select * from produtos where id = $1",[id]);
      if (produtoExiste.rowCount < 1) {
        return res.status(400).json({ erro: "Produto não encontrado!" });
      }
      const produtoEncontrado = produtoExiste.rows[0];
      return res.status(201).json(produtoEncontrado);
    }
  } catch (error) {
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
};

const excluirProduto = async (req, res) => {
  const { id } = req.params;

  try {

    const verificaPedidos = await pool.query("select * from pedido_produtos where produto_id = $1",[id]);

    if (verificaPedidos.rowCount > 0) {
      return res.status(400).json({ erro: "Produto vinculado a pedido, nao pode ser excluido!"});
    } 

    const query = `DELETE FROM produtos WHERE id = $1 RETURNING produto_imagem;`;
    const { rowCount,rows } = await pool.query(query, [id]);
    let recebeKey = "";

    if (rowCount > 0){
      const URLdaImagem = rows[0]?.produto_imagem || ''; 
      
if(rows[0].produto_imagem){
       const parteDaUrl = URLdaImagem.split('/');
       recebeKey = parteDaUrl[parteDaUrl.length - 1];

await s3.deleteObject({
  Bucket:process.env.BACKBLAZE_BUCKET,
  Key:recebeKey
}).promise()
}
      return res.status(200).json({ erro: "Produto excluído com sucesso!" });
    } else {
      return res.status(404).json({ erro: "Produto não encontrado para exclusão" });
    }

  } catch (error) {
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
};



const imagem = async(req,res)=>{
 const {id} = req.params
 const {file} = req;

 try {
  const arquivo = await s3.upload({
    Bucket:process.env.BACKBLAZE_BUCKET,
    Key:file.originalname,
    Body:file.buffer,
    ContentType:file.mimetype
   }).promise();

   return res.json({
    url:arquivo.Location,
    path:arquivo.Key
  });

 } catch (error) {
  return res.status(500).json({mensagem:"Erro inter do servidor"})
 }


}

module.exports = {
  cadastrarProduto,
  editarDadosProduto,
  listarProdutos,
  detalharProduto,
  excluirProduto,
  imagem
};
