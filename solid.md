nesse projeto vamos abordar o solid vamos trabalhar muito com testes tambem.

conceito desse app
app de checkin m academias
a ideia é a pessoa paga um pass e esse pass permite ela o acesso as academias parceiras por X vezes ao mes.

vamo trabalhar com geolocalização -calculo de distancia etc
verificação com data - a pessoa pode entrar apos 20 de fazer o checkin etc

regras de negocio sempre esta associada a um requisito funcional. a regra de negocio pode ser como um if na aplicação
requisito não funcional não parte do cliente eles são mais tecnicos do que a nivel de funcionalidade. 
esse processo é um design de software.
gympass 

# rf (requisitos funcionais)
    * funcionalidades da aplicação 
ex 1 o usuario deve fazer checkin
 () deve ser possivel se cadastrar
 () deve ser possivel se autenticar
 () deve ser possivel obeter o perfil de um usuario logado
 () deve ser possivel obter o numero de checkin realizados pelo usuario logado
 () deve ser possivel o usuario obter seu historico de chekins
 () deve ser possivel o usuario buscar academias proximas
 () deve ser possivel o usario buscar academias pelo nome
 () deve ser possivel o usuario realizar checkin em uma academia
 ()  deve ser possivel validar o checkin de um usuario
 () deve ser possivel cadastrar uma academia
 

# rn (regras de negocio)
    * caminhos que cada requisito pode tomar
ex 1 o usuario so pode fazer checkin a 10km da academia
() o usuario não pode se cadastrar com email duplicado
() o usuario não pode fazer dois checkin no mesmo dia
() o usuario não pode fazer checkin se não estiver a 100m da academia
() o checkin so pode ser validado até 20 min apos criado
() o checkin so pode ser validado por administradores
() a academia so pode ser cadastrada por administradores


# rnf (reauisitos não funcionais)
    * qual estrategia de paginação, qual banco de dados vamos usar coisas que so a gente vai entender, o usuario não precisa ter interação com essas coisas.
() a senha do usuario deve estar criptografada
() os dados da aplicação precisam estar persistidos em um banco postgrees sql
() todas as listas de dados precisam estar paginadas com 20 items por pagina
() o usuario deve ser identificado por um jwt (json web token)


vamos inicia o projeto.
npm init -y

fazemos uma pasta src dentro dela um server.ts

vamos instalar logo algumas coisas que vamos usar o typescript o @types/node o tsx e o tsup que é o que funciona para o deploy
npm i typescript @types/node tsx tsup -D

com isso instalado nos vamos rodar o
 npx tsc --init 
 para ele criar o arquivo de config d typescript e nos vamos nesse arquivo e mudamos o target para es2020
vamos instalar tambem o fastify 
npm i fastify
vamos separar o server do app logo vamos criar o arquivo app.ts e nele vamos importar o fastify from fastify e exportamos a const app para ser iguam a fastify() o arquivo fica assim:
import fastify  from "fastify"

export const app = fastify()

agora vamos no server e importamos o app aplicamos o listne no app e passamos host e a port fica assim:
import { app } from "./app";

app.listen({
    host: '0.0.0.0',
    port: 3333,
}).then(()=>{
    console.log('HTTP server running')
})

vamos criar um .gitignore e colocar la node_modules e tambem build para ele ignorar a pasta build que vamos usar para fazer a build da aplicação
vamos agora no package.json para configurar alguns scripts ficaram assim os novos scripts
 "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsup src --out-dir build",
    "start": "node build/server.js",

    o dev para rodar a aplicação o build para criar a pasta build para produção e o start para rodar ele em produção ou seja rodar o server da pasta build.


 # configurar npm
 vamos configurar o npm criando um arquivo na raiz chamado .npmrc dentro dele a gente vai escrever unicamente 
 save-exact=true
 isso faz com que quando a gente execute um npm aguma coisa, a versão do npm vai ficar fixa. ou seja se a gente configurar no package.json uma versão ele vai sempre usar essa.
 depois disso a gente pode instalar todas as dependencias de novo que ele vai fixar as versoes
 a gente faz isso porque quando colocamos o projeto no ar é importante de sempre atuaizarmos as dependencias dos nossos projetos.
 e néao da para tirar um dia com o projeto bem defasado e atualizar tudo de vez, porque isso pode quebrar o codigo por compatibilidade e outros motivos.
 então podemos usar um bot do github como o renovate que caso as nossas dependencias estejam fixas ele pode ficar olhando e e atualizando e apos atualizar ele roda os testes de nossa aplicação para ver se não quebrou nada
 caso os testes passem ele pede cria uma pull request para a gente atualizar . caso um teste não passe ele diz o que não passou para a gente tentar reolver.

 # configurar variaveis ambiente
 vamos criar um arquivo na raiz .env cfriamos tambem o .env.example

 por enquanto colocamos neles apenas a node_env fica assim:
 NODE_ENV=dev

jogamos o .env tambem no gitignore
agora vamos carregar essas variaveis em nosso projeto.
vamos instalar a dotenv
npm i dotenv

vamos criar uma pasta na src chamada env
nela vamos criar um arquivo chamado index.ts
nesse arquivo apenas de a gente importar o dotenv config ele ja carrega as variaveis ambientes
import 'dotenv/config'

porem vamos tambem validar essas com um esquema então vamos instalar o zod para isso.
npm i zod

de volta ao arquivo env/index.ts vamos tambem importar o z de dentro do od
import { z } from 'zod'

e ai criamos a const envSchema = z.object({})
é um z.object porque quando o dot.env carregar as nosas variaveis ambiente cada um das propriedades que vier como o NODE_ENV evai vir como um objeto.

então vamos fazer nosso esquema de validação dentro desse objeto fica assim:
import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
    NODE_ENV : z.enum(['dev', 'production', 'test']).default('dev'),
    PORT : z.coerce.number().default(3333)
})

agora vamos criar a validação em si.
vamos criar uma variavel chamada _env = envSchema e vamos passar um safeParse(process.env) 
o safe parse vai tentar validar e ver se deu certo. a gente vai fazer um if o _env.sucesse === false ou seja se deu errado a gente vai dar um console.error('invalid env variables') e tambem passar os erros que aconteceram usando o _env.error.format.
e vamos dar um trhow new error para impedir que continue rodando codigo
so ele passe por isso sem dar erro a gente vai exportar a variavel env sendo igual ao _env.data que é os dados que forma parseados. a pagina fica assim:
import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
    NODE_ENV : z.enum(['dev', 'production', 'test']).default('dev'),
    PORT : z.coerce.number().default(3333)
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
    console.error('invalid env vabriables', _env.error.format())
    throw new Error('invalid env vabriables')
} 

export const env = _env.data

para testar isso a gente vai no server e muda a port para env.port com cuidado para importar do nosso ./env fica assim:
import { app } from "./app";
import { env } from "./env";

app.listen({
    host: '0.0.0.0',
    port: env.PORT,

# configurar o eslint
vamos instalar o eslint ja com a config da rocketseat
 npm i eslint @rocketseat/eslint-config -D
 na raiz vamos criar um arquivo chamado .eslintrc.json
 {
    "extends": [
        "@rocketseat/eslint-config/node"
    ]
}

apos salvar isso ele começa a corrijir os erros. a gente pode fazer o script se quiser com o fix, mas não vamos fazer agora.
vamos criar um arquivo .eslintignore
para ignorar algumas pastas e vamos colocar a build e o node_modules la

# analises de importação
criar atalhos de caminhos alias na hora de fazer importações entre arquivos
quando a gente tem muitas pastas uma dentro da outra e a gente importa um arquivo fica la assim ../../../../ etc
pode ficar dificil de entender onde esta o negocio.
para mudar isso a gente vai la no nosso tsconfig.json e procurar a opção chamada base_url
ela ta em modules
ele diz qual é o diretorio raiz da aplicação 
a gente é obrigado a descomnetar ele para poder informar o que a gente quer que é o paths que esta logo abaixo
vamos abrir dentro do objeto do paths e vamos dar a logica do quando a gente fizer uma importação que comece com @/ tudo que vier depois do barra eu quero que o vscode pegue como vindo do ./src/ qualquer coisa que vem apos o src
o seja ao invez de fazer o camoinho de ir saindo das pastas a gente vai fazer o caminho entrando a partir da src
para passar essa logica a gente usa * para identificar o tudo que vier depois. fica assim:
 /* Modules */
    "module": "commonjs",                                /* Specify what module code is generated. */
    // "rootDir": "./",                                  /* Specify the root folder within your source files. */
    // "moduleResolution": "node10",                     /* Specify how TypeScript looks up a file from a given module specifier. */
    "baseUrl": "./",                                  /* Specify the base directory to resolve non-relative module names. */
    "paths": {
      "@/*" : ["./src/*"] 
    },            

    mais pra frente a gente tem que configurar um pouco mais isso por conta dos testes mas o proprio tsx deve entender isso então o programa continua funciona.
    a gente não vai usar isso pra tudo. a gente usa geralmente para quando estamos em uma pasta muito profunda e queremos pegar algo de la da src .
    

# prisma
nos podemos usar querybuilder como o knex porem ele não tem um controle tão grande porque ele não sabe se as tabelas realmente existem no banco de dados a gente tem que fazer a tipagem na mão, iinformar quais são as tabelas, os campos os tipos do campos se são obrigatorios e etc.
porem existe um terceiro nivel de abstração apos os querybuilders
esse nivel de abstração é o 
orm
por exemplo o prisma o typorm sequeize e etc
elas trazem um alto nivel de abstração para trabalharmos com o banco de dados.
a grande ideia por tras de um orm object reletion mapper o conceito é anget mapear as relações das tabelas e transformar elas em objetos os campos de uma tabela vao ser mapeadas para estruturas de codigo como objetos que assim a gente consegue pegar eles e trabalhar ele em algo direcionado a objeto como são as linguagens que a gente esta usando.
a vantagem do prisma é que ele diminui muito o nosso trabalho e prinicipalmente a duplicidade que a gente pode ter em nossos codigos. e ele é muito integrado com o typescript
o prisma entende a existencia da tabela e ele consegueinferir para a gente e qual a tabela, quais os campos e ele ja fala pra gente se a gente esta preenchendo automaticamente.
ele tambem faz migration de forma automatizada ou seja não precisamos escrever a migration quando a gente altera algo ele faz a migration atumaticamente.
a orm suporta varios bancos de dados e ambientes diferentes.
Vamos instalar o prisma

npm i prisma -D

porem esse é apenas uma interfacede comando não é ele que vai ter acesso ao banco de dados. para isso a gente pode dar um 
npx prisma init 
e agora ele inicializa a parte de banco de dados de nossa aplicação
ele vai criar uma pasta prisma e uma arquivo prisma schema
e a gene instala a extenção do prisma no vscode
a gente tambem vai abirr o nosso usersettings e colocar essas linhas
    "[prisma]": {
        "editor.formatOnSave": true
    },
   com isso ele vai formatar o nosso escquima do prsma pra ele ficar organizado a cada save.
    
alem disso dentro do arquivo schema.prisma que esta na pasta prisma. esse qrauivo é uma representação de nossas tabelas. e cada tipo de banco de dados tem um nome diferente para tabela e por isso o prisma chama ela de model 
o arquivo original esta assim:
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
e nos vamos colocar um model User sempre em letra maicusla e nunca no plural
o nome da tabela por padrão vai ser User mas a gente pode trocar o nome passando dentro do ojeto um @@map("users") assim a tabela vai se chamar users no plural e minusculo tem esses dois arrobas porqueé a configuração do model os campos da tabela a gente pode ir jogando dentro do objeto não precisamos nos procupar em escreer na sintax errada pq o prisma não vai deixar a gente errar.
nosso usuario vai ter uma id que vai ser uma string e se depois de passar id String a gente colocar @ ele vai trazer umas configurações para a gente quando a gente coloca @@ a gente configura a tabela inteeira se a gente coloca um so @ a gente esta configurando apenas esse campo. a gente coloca @id pra identificar que esse é o id da tabela e a chave primaria. e vamos passar tambem o default que tem tres possibilidaes o uuid cuid que é a mesma ideia do uuid. ou autoincrement que não é muito aconselhavel. no caso vamos passar o uuid.
vamos passar tambem um name e um email e o email a gente vai colocar como unico.
o arquivo ficou assim:
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    String @id @default(uuid())
  name  String
  email String @unique

  @@map("users")
}

agora com isso salvo vamos dar o comando
npx prisma generate
isso vai criar a tipagem automatica para nosso banco de dados.
para checar se isso funcionou a gente vai em node_modules/.prisma ele vai ter criado uma nova pasta chamada client r vai ter um arquivo chamado index.d.ts
a gente abre esse arquivo.
la vai ter a nossa tabela ja tipada

/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
se a gente passar o mouse em cima do payload a gente ve nossa tabela.
 e nesse arquivo tambem tem todas as oprações que a gente pode fazer nela.
 tem varios metodos como o por exemplo findUnique para a gente achar a primarykey ou o unique tem os metodos create, update, etc tudo pronto.
 para começar a trabalhar com isso agora a gente precisa instalar o @prisma/client e esse sim é uma dependencia de produção
 npm i @prisma/client
 e essa a gente vai usar para acessar o nosso banco de dados.
 para testar vamos la em app.ts e vamos importar o 
 import { PrismaClient } from '@prisma/client'

 e para criar uma conexão com o banco de dados basta a gente instanciar esse prima client a gete da uma const prisma  = new prismaClient()
 e agora ao a gente dar um prisma. ele ja traz la em baixo o nosso users e se a gente der outro ponto ele nos da todos os modos que a gente pode usar.
 e ai a gente da um create e ele ja mostra que a gente tem que informar o data
  e dentro do data ele ja traz nossos campos mostrando que o id não é obrigatorios.
  fica assim:
  import fastify from 'fastify'
import { PrismaClient } from '@prisma/client'

export const app = fastify()

const prisma = new PrismaClient()

prisma.user.create({
  data: {
    name: 'Iuri Reis',
    email: 'iuri@reis.com',
  },
})
porque o id é criado automatico la pelo uuid mas se a gente quiser informar podemos tambem. porem se a gente tentar informar um camoi diferente de como ele deve er tipo âssar um number para um string ele diz que não pode.
a nossa conexção ainda não esta feita. mas por enquanto vamos deixar assim enquanto configuramos outras coisas.



