const bcrypt = require("bcrypt");
const pool = require("../conexao");
const jwt = require("jsonwebtoken");
const senhaJWT = require("../senhaJWT");

const cadastrarUsuario = async (req, res) => {
  const { nome, email, senha, empresa_id, cargo_id } = req.body;

const status = 1;

  try {
    const emailExiste = await pool.query(
      "select * from usuarios where email = $1",
      [email]
    );
    if (emailExiste.rowCount > 0) {
      return res.status(400).json({ erro: "Email informado já existe" });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const query = `
    insert into usuarios(nome, email, senha, empresa_id, cargo_id, status)
    values($1,$2,$3,$4,$5,$6) returning *
`;

    const { rows } = await pool.query(query, [nome, email.toLowerCase(), senhaCriptografada, empresa_id, cargo_id, status]);

    const { senha: _, ...usuario } = rows[0];
    return res.status(201).json(usuario);
  } catch (error) {
  
    return res.status(500).json({ erro: error.message });
  }
};

const login = async (req, res) => {
  const { email, senha } = req.body;
  
  try {
    const usuario = await pool.query(
      "select * from usuarios where email = $1",
      [email]
    );

    if (usuario.rowCount < 1) {
      return res.status(400).json({ erro: "E-mail ou senha inválidos" });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.rows[0].senha);

    if (!senhaValida) {
      return res.status(400).json({ erro: "E-mail ou senha inválidos" });
    }

    delete usuario.rows[0].senha;
    const userSemSenha = usuario.rows[0];
    const token = jwt.sign(userSemSenha, senhaJWT);
    const resposta = { usuario: userSemSenha, token: token };

    return res.json(resposta);
  } catch (error) {
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }
};




const editarPerfilUsuario = async (req, res) => {
  const { nome, email, empresa_id, cargo_id, status } = req.body;
  const usuario = req.params;

  try {
    const userId = usuario.id;
    const usuarioExistente = await pool.query(
      "SELECT * FROM usuarios WHERE usuario_id = $1",
      [userId]
    );

    if (usuarioExistente.rowCount < 1) {
      return res.status(400).json({ erro: "Usuario não encontrado!" });
    }

    const emailExistente = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email.toLowerCase()]
    );

    if (emailExistente.rowCount < 1) {
      return res.status(400).json({ erro: "Email não encontrado!" });
    }

    const usuarioAtualizado = await pool.query(
      "UPDATE usuarios SET nome = $1, email = $2, empresa_id = $3, cargo_id = $4, status = $5 WHERE usuario_id = $6 RETURNING usuario_id, nome, email, empresa_id, cargo_id, status",
      [nome, email.toLowerCase(),empresa_id,cargo_id, status ,userId]
    );

    if (usuarioAtualizado.rowCount > 0) {
      const usuarioEditado = usuarioAtualizado.rows[0];
      return res.json(usuarioEditado);
    } else {
      return res.status(500).json({ erro: "Erro interno do servidor" });
    }

  } catch (error) {
    return res.status(400).json({ erro: error.message });
  }
};



const detalharPerfilUsuario = async (req, res) => {
  const user = req.usuario.rows[0];
  delete user.senha;
  return res.status(200).json(user);
};




const listarUsuarios = async (req, res) => {
  const users = 'usuarios';
  try {
    const usuarios = await pool.query(`SELECT * FROM ${users} WHERE status = 1`);
    const usuariosSemSenha = usuarios.rows.map(({ senha, ...usuario }) => usuario);
    return res.status(200).json(usuariosSemSenha);
  } catch(error) {
    return res.status(400).json({ erro: error.message });
  }
};



const excluirUsuario = async (req, res) => {
  //const { email } = req.body;
  const {id} = req.params;

  try {
    const usuarioExistente = await pool.query(
      "SELECT * FROM usuarios WHERE usuario_id = $1",
      [id]
    );


    if (usuarioExistente.rowCount < 1) {
      return res.status(400).json({ erro: "Usuario não encontrado!" });
    }

// if(!email){
//   return res.status(400).json({ erro: "O email não encontrado!" });
// }

//     const emailExistente = await pool.query(
//       "SELECT * FROM usuarios WHERE email = $1",
//       [email.toLowerCase()]
//     );


//     if (emailExistente.rowCount < 1) {
//       return res.status(400).json({ erro: "Email não encontrado!" });
//     }


    let { nome, email, empresa_id, cargo_id, status } = usuarioExistente.rows[0];
    
    if(status == 0){
     return res.status(200).json({ erro: "Usuario já consta como inativo!" });
    }else{
      status = 0;
    }

    const usuarioAtualizado = await pool.query(
      "UPDATE usuarios SET nome = $1, email = $2, empresa_id = $3, cargo_id = $4, status = $5 WHERE usuario_id = $6 RETURNING usuario_id, nome, email, empresa_id, cargo_id, status",
      [nome, email.toLowerCase(),empresa_id,cargo_id, status ,id]
    );

    if (usuarioAtualizado.rowCount > 0) {
      const usuarioEditado = usuarioAtualizado.rows[0];
      return res.json(usuarioEditado);
    } else {
      return res.status(500).json({ erro: "Erro interno do servidor" });
    }

  } catch (error) {
    return res.status(400).json({ erro: error.message });
  }
};





module.exports = {
  cadastrarUsuario,
  login,
  detalharPerfilUsuario,
  editarPerfilUsuario,
  listarUsuarios,
  excluirUsuario
};