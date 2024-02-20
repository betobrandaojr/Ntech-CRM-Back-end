create database pdv;

create table usuarios
(id serial primary key,
 nome text not null,
 email text not null unique,
 senha text not null
);

create table categorias
(id serial primary key,
 descricao text not null
);

insert into categorias (descricao)
values 
('Manipulados'),
('Perfumaria'),
('Recreativos'),
('Nutraceuticos'),
('Especiais');


create table produtos(
  id serial primary key,
  descricao text not null,
  quantidade_estoque integer not null,
  valor integer not null,
  categoria_id integer references categorias(id),
  sku text,
  codBarras text,
  produto_imagem text
);


create table clientes(
  id serial primary key,
  nome text not null,
  sobrenome text not null,
  cpf text not null unique,
  email text not null unique,
  telefone text not null,
  cep text,
  rua text,
  numero integer,
  bairro text,
  cidade text,
  estado text
);

create table pedidos
(id serial primary key,
 cliente_id integer not null,
 observacao text,
 valor_total integer
);

create table pedido_produtos
(id serial primary key,
 pedido_id integer not null,
 produto_id integer not null,
 quantidade_produto integer not null,
 valor_produto integer
);
