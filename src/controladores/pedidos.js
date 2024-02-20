const pool = require('../conexao');
const geraPaginaHTML = require('../servicos/HTML')
const enviarEmail = require('../servicos/nodemailer');

const cadastrarPedidos = async (req, res) => {
    const { cliente_id, pedido_produtos, observacao } = req.body;

       let email = "";
    try {
        const clienteExiste = await pool.query('SELECT id,email FROM clientes WHERE id = $1', [cliente_id]);
        if (clienteExiste.rowCount === 0) {
            return res.status(400).json({ erro: 'Cliente não encontrado' });
        }
       email = clienteExiste.rows[0].email;

        let valor_total = 0;

        for (const pedido of pedido_produtos) {
            const { produto_id, quantidade_produto } = pedido;

            const produtoExiste = await pool.query('SELECT * FROM produtos WHERE id = $1', [produto_id]);
            if (produtoExiste.rowCount === 0) {
                return res.status(400).json({ erro: `Produto com ID ${produto_id} não encontrado` });
            }
            const estoqueDisponivel = produtoExiste.rows[0].quantidade_estoque;
            if (quantidade_produto > estoqueDisponivel) {
                return res.status(400).json({ erro: `Produto com ID ${produto_id} tem quantidade insuficiente em estoque` });
            }

            valor_total += produtoExiste.rows[0].valor * quantidade_produto;
        }

        const insertPedidoQuery = 'INSERT INTO pedidos (cliente_id, observacao, valor_total) VALUES ($1, $2, $3) RETURNING id';
        const valoresPedido = [cliente_id, observacao, valor_total];
        const resultadoInsercaoPedido = await pool.query(insertPedidoQuery, valoresPedido);
        const pedidoId = resultadoInsercaoPedido.rows[0].id;

        // Inserir os produtos associados ao pedido na tabela 'produtos_pedidos'
        for (const pedido of pedido_produtos) {
            const { produto_id, quantidade_produto } = pedido;
            const produtoValorQuery = 'SELECT valor FROM produtos WHERE id = $1';
            const produtoValorResult = await pool.query(produtoValorQuery, [produto_id]);
            const valorDoProduto = produtoValorResult.rows[0].valor;
            const insertProdutosPedidoQuery = 'INSERT INTO pedido_produtos (pedido_id, produto_id, quantidade_produto,valor_produto) VALUES ($1, $2, $3, $4)';
            const valoresProdutosPedido = [pedidoId, produto_id, quantidade_produto, valorDoProduto];
            await pool.query(insertProdutosPedidoQuery, valoresProdutosPedido);
        }

        const pedidoEmail = req.body
        const paginaHTML = await geraPaginaHTML(pedidoEmail);
        enviarEmail(email, 'Pedido realizado', paginaHTML);
        return res.status(201).json({ mensagem: 'Pedido cadastrado com sucesso' });

    } catch (error) {
        return res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};


const listarPedidos = async (req, res) => {
    const { cliente_id } = req.query;

    try {
        if (cliente_id && cliente_id > 0) {
            const clienteExiste = await pool.query('SELECT id FROM clientes WHERE id = $1', [cliente_id]);
            if (clienteExiste.rowCount === 0) {
                return res.status(400).json({ erro: 'Cliente não encontrado' });
            }

            const pedidosExistem = await pool.query('SELECT * FROM pedidos WHERE cliente_id = $1', [cliente_id]);
            if (pedidosExistem.rowCount === 0) {
                return res.status(400).json({ erro: 'Não existem pedidos para este cliente' });
            }

            const pedidosFormatados = pedidosExistem.rows.map(async (pedido) => {
                const pedidoProdutos = await pool.query('SELECT * FROM pedido_produtos WHERE pedido_id = $1', [pedido.id]);
                return {
                    pedido: {
                        id: pedido.id,
                        valor_total: pedido.valor_total,
                        observacao: pedido.observacao,
                        cliente_id: pedido.cliente_id
                    },
                    pedido_produtos: pedidoProdutos.rows.map((produto) => ({
                        id: produto.id,
                        quantidade_produto: produto.quantidade_produto,
                        valor_produto: produto.valor_produto,
                        pedido_id: produto.pedido_id,
                        produto_id: produto.produto_id
                    }))
                };
            });

            Promise.all(pedidosFormatados).then((resultados) => {
                return res.status(200).json(resultados);
            }).catch((err) => {
                console.error(err);
                return res.status(500).json({ erro: 'Erro ao formatar dados' });
            });
        } else {
            const pedidosCadastrados = await pool.query('SELECT * FROM pedidos');
            if (pedidosCadastrados.rowCount === 0) {
                return res.status(400).json({ erro: 'Não existem pedidos cadastrados' });
            }

            const pedidosFormatados = pedidosCadastrados.rows.map(async (pedido) => {
                const pedidoProdutos = await pool.query('SELECT * FROM pedido_produtos WHERE pedido_id = $1', [pedido.id]);
                return {
                    pedido: {
                        id: pedido.id,
                        valor_total: pedido.valor_total,
                        observacao: pedido.observacao,
                        cliente_id: pedido.cliente_id
                    },
                    pedido_produtos: pedidoProdutos.rows.map((produto) => ({
                        id: produto.id,
                        quantidade_produto: produto.quantidade_produto,
                        valor_produto: produto.valor_produto,
                        pedido_id: produto.pedido_id,
                        produto_id: produto.produto_id
                    }))
                };
            });

            Promise.all(pedidosFormatados).then((resultados) => {
                return res.status(200).json(resultados);
            }).catch((err) => {
                console.error(err);
                return res.status(500).json({ erro: 'Erro ao formatar dados' });
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

module.exports = {
    cadastrarPedidos,
    listarPedidos
}