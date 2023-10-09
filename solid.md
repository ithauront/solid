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
 (v) deve ser possivel se cadastrar
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
(v) o usuario não pode se cadastrar com email duplicado
() o usuario não pode fazer dois checkin no mesmo dia
() o usuario não pode fazer checkin se não estiver a 100m da academia
() o checkin so pode ser validado até 20 min apos criado
() o checkin so pode ser validado por administradores
() a academia so pode ser cadastrada por administradores


# rnf (reauisitos não funcionais)
    * qual estrategia de paginação, qual banco de dados vamos usar coisas que so a gente vai entender, o usuario não precisa ter interação com essas coisas.
(v) a senha do usuario deve estar criptografada
(v) os dados da aplicação precisam estar persistidos em um banco postgrees sql
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

## docker
o docker facilita muito o deploy mas nos vamos usar ele tambem em desenvolvimento
o docker tem uma ideia de container para armazenar as coisas que a gente instala para fazer a aplicação de uma forma que  caso a gente queira apagar ele vai retirar sem deixar nenhum resquicio no nosso sistema operacional, funciona meio que como uma virtualização ou um hd a parte.
porem diferente da virtualização ele não tem o sistema operacional. no desenvolvimento a gente vai usar o docker para subir os serviços como postgress de banco de dados de forma mais facil e de forma que fique igual para todos os usuario/dev.
como a gente pode ter varias aplicações que podem usar o mesmo banco de dados como o postgress ele pode acabar ficando com configurações estranhas que vao interferir entre os diferentes app. com o docker a gente meio que tem um postgress para cada aplicaçã assim não da conflito.
vamos instalar o docker seguindo o guia nesse site:
https://docs.docker.com/desktop/install/windows-install/
se for outro sistema operacional a gente usa outro install e não o windows install
agora com o docker iocker do a gente pode no terminal dar o commando docker -v para ver a versão dele e se certificar que ele esta instalado.
a gente pode ir no site docker hub que é um repositorio de imagens do docker ou seja scripts preconfigurados para executar algumas coisas comuns como banco postgress node, e outros.
nos podemos ter acesso a isso tambem no docker desktot na aba de images
a gente poderia pegar a image oficial do postgrees mas como a rocketseat prefere usar a da bitnamio vamos usar a mesma que eles.
a gente pode achar ela aqui;

https://hub.docker.com/r/bitnami/postgresql

a gente usa a bitnaç porque eles ja se preocupam muito com a segurança

agora como nos vamos rodar ela npasossa  projeto vamos rodar
docker run --name api-solid-pg bitnami/postgresql  (não passar ainda esse comando)

apos o nome a gente coloca o nome do banco de dados que queremos criar
apos esse nome o que tem é o nome da imagem que queremos utilizar e podemos ou não colocar :latest no fim
porem ainda não vamos executar o comando porque queremos fazer umas configurações oara passar umas variaveis ambientes
a gente pode depois do nome do banco de dados passar um -e POSTGRESQL_USERNAME=docker e ppassar um outro -e POSTGRESQL_PASSWORD=docker  e mais um -e para o database POSTGRESQL_DATABASE=apisolid
vamos tambem passar um outro parametro -p 5432:5432 que o -p vem de port dessa forma a gente publica uma porta que o postgre roda por padr éao na porta 5432 quando a gente cria ele no docker ele roda em um ambiente isolado de nossa maquina ou seja ao rodar isso sem passar a porta a gente não consegue localizar ele no nosso localhost
ou sejaesse comando direciona a porta 5432 de nossa maquina para a porta 5432 de dentro do container.
o coando fica assim:
docker run --name api-solid-pg -e POSTGRESQL_USERNAME=docker -e POSTGRESQL_PASSWORD=docker -e POSTGRESQL_DATABASE=apisolid -p 5432:5432 bitnami/postgresql
ao rodar isso ele vai commeçar a criar o banco de dados.
e  o fim ele vai nos dar essa mensagem
2023-09-26 11:56:37.027 GMT [1] LOG:  database system is ready to accept connections

porem é ruim que sempre que a gente queira iniciar nossa aplicação a gente precise dar esse comando todo. e para isso o docker nos da essa solução:
então se a gente parar o container com cnrtl c e a gente der um  docker ps -a ele mostra todos os container que a gente ja rodou ou seja ele guarda isso em cash.
então para coltar ele a gente não pode mais rodar todo aquele comando porque ele tentaria criar um novo. a gente vai dar um docker start e passar o id ou o nome do container.
docker start api-solid-pg
e para parar a gente pode usar um docker stop e passar o id ou nome
e para deletar o container a gente da o docker rm e passar o nome
para ver os log a gente pode dar um docker logs e o nome do container
se a genge for agora no nosso .env a gente vai ver alguns comentarios e o database que o prisma criou automaticamente podemos apagar os comentarios e mudamos o database que ele criou de johndoe para docker e o nome do banco para apisolid
fica assim:
DATABASE_URL="postgresql://docker:docker@localhost:5432/apisolid?schema=public"
agora com isso salvo para testar que a conexão esta funcionando vamos rodar um
 npx prisma migrate dev
esse comando faz com que o prisma vai no nosso schema.prisma e vai ver as tabelas que temos e vai ver o que ainda não foi refletido no banco de dados ao ver isso ele vai detectar isso e vai dizer que tem alterações para fazere pedir um nome para a migration
o nome deve ser o que fizemos desde a ultima vez que executamos esse comando e como é a primeira vezvamos dizerq eu criamos a tabela users que foi o que a gente fez
com isso el vai criar uma pasta prisma e dentro dela uma pasta migration com a migrationque a gente acaboude fazer com timestamp e tudo 
agora para navegar pelas tableas o prisma traz o prisma studio então se a gente rodar 
npx prisma studio ele vai abri o navegador em uma interface que nos perite navegar nas tabelas.
e la nos podemos inclusive fazer entradas na nossa tabela e salvar.

porem o docker esta rodando na nossa maqiina para uma outra pessoa acessar ela teria que fazer aqueel comando tambem. para evitar isso a gente vai fazer assim:
vamos usar a feramenta do docker chamada docker compose que é um arquivo criado na raiz do projeto com o nome de docker-compose.yml
nesse arquivo vamos colocar o comando de criação que executamos no docker
e traduzi-lo para a sintaxe do docker compose.
vamos colocar ele la como comentario e depois vamos começar a trabalhar ele
passando o version
vamos passar a 3
e depois passar os services
o primeiro serviço é o nome que a gente usou. depois a imagem que é o bitnmai/postgre
depois a porta e depois a enviromnment
e a gente passa todos os nossos environments  o arquivo fica assim:

version: '3'

services:
  api-solid-pg:
    image: bitnami/postgresql
    ports:
      - 5432:5432
    environment:
      - POSTGRESQL_USERNAME=docker
      - POSTGRESQL_PASSWORD=docker
      - POSTGRESQL_DATABASE=apisolid

  agora para testar isso a gente vai parar o nosso banco com docker stop api-solid-pg
  e vamos até deletar ele usando o docker rm api-solid-pg
  agora para subir a aplicação a gente vai dar um 
  docker compose up -d
   -d é para rodar os containers em modo detach para não ficar mostrando no terminal o log dos containers 
   agora se a gente rodar docker ps ele ja mostre
   agora se a gente quiser parar os conteiners a gente da docker compose stop. o docker compose down é para deletar as o container com todas suas tabelas então evitamos usat ele
   agora oustras pessoas que queiram usar so vao colocar o docker compose up e vai pegar nossa aplicação vai rodar com o container.
   como nos apagamos o banco para criar de novo nos precisamos criar de novo a tabela no banco de dados então vamos rodar de novo o npx prisma migrate dev

   # criando o schema do prism
   vamos na nossa pasta prisma e no arquivo shema.prisma e abaixo de tudo que ja tem vamos abrir dois novos models o checkin e o Gym
   todos vao ter o id igual o do users então podemos copiar colar na academia vamos colocar title vamos colocar description como opicional usando o ?  o phone tambem como opcional e o mais importante a latitude e longitude como decimal para a gente poder achar ela na geolocalização fica assim o gym o qiue impede de os usuarios fazerem loging a distancia por outroa pessoa e etc. tambem vamos remapear ou renomear a tabela para gyms usando o @@map
   model Gym {
  id          String  @id @default(uuid())
  title       String
  description String?
  phone       String?
  latitude    Decimal
  longitude   Decimal

  @@map("gyms")
}
no checkin vamos renoemar para check_ins no checkin vamos tambem ter o campo created_at com um datetime e o default vai ser now.
o checkin vai ser possivel de ser validado por um adm da academia. ou seja o checkin pode ser validado.
a gente poderia usar um boolean para se esta ou não validado. mas se a gente trocar por uma data e colocar ela como opcional a gente tem duas informações em uma, se ela estiver preenchida quer dizer que foi validado mesmo e alem disso a gente ja engloba o quando foi validado.
na tabela users vamos tambem colocar um password como string e como precisa ser encriptada vamos salvar como password_hash pq ele vai ser um hash da senha
a diferença entre hash e criptografia é que a criptografia pode ser descriptografada o hash não a partir do momento que ele foi criado a genter não pode mais voltar ele para o original
vamos colocar tambem um created_At da mesma forma que o outro que ja fizemos. não precisamos ficar colocando dados desnecessarios em todas as tabelas.

agora vamos rodar novamente o npx prisma migrate dev para atualizar as tabelas.
o docker tem qiue esta rodando para isso.
quando a gente for dar deploy a gente néao vai colocar mais o dev porque ele não vai mais comparar com o que tem para ver se precisa criar uma nova migratiot
ele vai criar a nova migração e o arquivo sql vai ter um warning porque nos criamos uma nova coluna em uma tabela existente que não tem default e é obrigatoria isso quer dizer que caso ja tenha algo nessa tabela ele vai quebrar porque qs coisas vao ter nulo em um valor obrigatorio.então caso a gente ja tivesse algo na database a gente teria que colocar ela como opcional ou dar um valor default mesmo que esse valor fosse em branco ou nulo.

# relacionamentos entre tabela
nos podemos ter relacionamentos de 1-1, 1-n ou n-n
um dados de uma tabela vai se relacionat somente com um dado de outra tarbela
o relacionamento de 1 para n significa que uma informação de uma tabela pode se relacionar com varios registros de outra tabela. por exemplo 1 unico usuario pode fazer varios check ins 
o relacionamento de n para n é quando um registro em uma tabela pode estar relacionado com varios registros de outra e um registro de outra pode estar relacionado com varios dessa tabela inicial. é como se tivesse um grupo da academia o checkin tambem poderia se relacionar a diversos fucnionarios. qo mesmo tempo que podemos ter varios checkin para varios usuarios.
para os relacionamentos vamos criar nossas chaves strangeiras.
ou seja podemos no checkin ter um campo de user id para armazenar o id do usuario que fez o checkin e tambem um gym id para dizer em qua academia foi feito o checkin
porem para criar isso no prisma nos temos que dizer que são foreing keys a gente precisa chamar a realete a gente vai escrever dentro da tabela checkin user User para dizer que o relacionamento user esta relacionado a tabela User? so de salvar isso ele ja autocompleta para a gente um monte de coisa
user   User   @relation(fields: [userId], references: [id])
  userId String
   e ele tambem cria a referenia inversa na tabela de users dando um aray para a gente poder passar varios checkin para o usuario.. a gente vai mudar o userId para user_id para seguir o padrão.

vamos mudar la no user de check in para check ins para manter o plural. e onde tem o relacionamento a gente vai usar o camel case poque não vai ser coluna no banco de dados e a gente vai usar isso no javascript com o primsa. o resto a gente coloca em snakecase.
fazemos o mesmo para gym Gym e as alteraço~es e pronto.
o arquivo fica assim:
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
  id            String   @id @default(uuid())
  name          String
  email         String   @unique
  password_hash String
  created_at    DateTime @default(now())

  CheckIns CheckIn[]

  @@map("users")
}

model CheckIn {
  id           String    @id @default(uuid())
  created_at   DateTime  @default(now())
  validated_at DateTime?

  user    User   @relation(fields: [user_id], references: [id])
  user_id String

  gim    Gym    @relation(fields: [gym_id], references: [id])
  gym_id String

  @@map("check_ins")
}

model Gym {
  id          String  @id @default(uuid())
  title       String
  description String?
  phone       String?
  latitude    Decimal
  longitude   Decimal

  CheckIns CheckIn[]

  @@map("gyms")
}


agora rodamos o npx prisma migrate dev de novo

# rota usuario
vamos criar a rota mais simples de criação de usuario.
dentro do nosso app.ts
vamos retirar isso:
const prisma = new PrismaClient()

prisma.user.create({
  data: {
    name: 'Iuri Reis',
    email: 'iuri@reis.com',
  },
})
 e no lugar
vamos criar uma rota 
app.post('/users', (request, reply) => {
  
})

vamos importar o zod para poder fazer a validação dessa rota.
assim
  const registerBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(7),
  })
  vamos agora dar um parse no request body
  const { name, email, password } = registerBodySchema.parse(request.body)

  agora para adicionar o usuario a gente vai ter que fazer a conexãoéaom o brnco. vamos rtirar ela desse arquivo então em src a gente vai fazer uma pasta chamada lib
  dentro dela a gente faz um arquivo chamado prisma.ts
  e nesse arquivo a gente exporta a conts prisma sendo igual a new Prismaclient o qrauivo fica assim:
  import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient()

agorade volta ao app a gente da um await prisma ( e tem cuidado de pegar o prisma de dentro do arquivo prisma que esta na lib que criamos) damos um ponto e conrl espaço e ele ja encontra as nossas tabelas ai a gente da um create abre um objeto e passa data, e vai colocando as nossas informações que a gente pegou do body. fica assim:
await prisma.user.create({
    data: {
      name,
      email,
      password_hash: password,
    },
  })

  agora damos um return reply.status(201).send()
  o app.ts ficou assim:
  import fastify from 'fastify'
import { z } from 'zod'
import { prisma } from './lib/prisma'

export const app = fastify()

app.post('/users', async (request, reply) => {
  const registerBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(7),
  })

  const { name, email, password } = registerBodySchema.parse(request.body)

  await prisma.user.create({
    data: {
      name,
      email,
      password_hash: password,
    },
  })
  return reply.status(201).send()
})

agora vamos testar.
vamos rodar o docker e o servidor e vamos no insomnia
a gente cria uma nova colection e nela a gente cria uma nova requisição para o localhost 3333/users
e mandamos isso no body:
{
	"name": "iuri",
	"email": "iuri@hotmail.com",
	"password": "minimo7letras"
}

fucnionou.
voltamos para o lib/prisma.ts
e dentro do nosso prisma a gente pode passar um objeto com varias coisas a gente vai passar o log e nele o query 
export const prisma = new PrismaClient({
    log: ['query']
})
porem a gente vai abilidat ele apenas para o ambiente de dev então vamos pegar o env e a gente vai colocar que se o node_env for dev o log vai ser query se não vai ser vazio assim:
  log: env.NODE_ENV === 'dev' ? ['query'] : [],
com isso quando a gente fizer algo no banco de dados o prisma mostra o que ele fez ao adicionar um usuario ele mostra isso:
2023-09-27 14:13:40 proj3-api-solid-pg-1  | 2023-09-27 12:13:39.851 GMT [110] STATEMENT:  INSERT INTO "public"."users" ("id","name","email","password_hash","created_at") VALUES ($1,$2,$3,$4,$5) RETURNING "public"."users"."id", "public"."users"."name", "public"."users"."email", "public"."users"."password_hash", "public"."users"."created_at"

o log para mim apareceu no docker desktop e não no terminal.

# controller
o controller é o nome dado a função que lida co a entrada de dados por uma requisição http e devolve uma resposta. ou seja por exemplo a nossa função de adicionar usuaio.
o controller geralmente esta associado a uso de um framework como fastify, knex e outros.
vamos criar uma pasta chamada http e tudo que tiver a ver com o http de nossa aplicação vamos mover para la. no caso a função que posta no users a partir do async vai para la.dentro de http vamos criar uma outra pagina chamada de controler e dentro dessa pasta vamos criar um arquivo chamado register.ts
nesse arquivo nos vamos colar a função mas dando o export antes e escrevendo function e tambem o nome dela, ou seja tirando de arrow function. importamos o z e o  
porem como vem de outro arquivo ele não sabe o que é o reply e o request.
entéao temos que importar o fastifyrequest e reply de dentro deo fastyvfi e a gente coloca esses tipos no request e reply. fica assim:
import { prisma } from '@/lib/prisma'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(7),
  })

  const { name, email, password } = registerBodySchema.parse(request.body)

  await prisma.user.create({
    data: {
      name,
      email,
      password_hash: password,
    },
  })
  return reply.status(201).send()
}

agora la no app a gente coloca o register no lugar da funçã que tiramos.
import fastify from 'fastify'

import { register } from './http/controller/register'

export const app = fastify()

app.post('/users', register)

com cuidado para ter importado ele do lugar certo.

vamos então tirar as rotas do arquivo app. la no http vamos criar um arquivo routes.ts e mover a nossa rota post paa la. como esse arquivo precisa ser uma função tambem nos vamos escrever como export function appRoutes fica assim:

import { FastifyInstance } from 'fastify'
import { register } from './controller/register'

export async function appRoutes(app: FastifyInstance) {
  app.post('/users', register)
}


e no app eu adiciono essa linha com a importação dela:
app.register(appRoutes)

com isso funcionando a gente vai ovoltar para o nosso arquivo controller e vamos começar a separar o codigo dele. porque vamos começar a enxergar essa aplicação em camadas.  ou seja independente de qual porta de entrada seja feita um cadastro por exemplo, a logica para o cadastro deve ser sempre a mesma, ele vempre vai precisar passar o nome email e senha, a senha sempre vai ser hashiada com a mesma força e etc.
ou seja : a parte de validação do schema é uma camada, a inserção do que foi validado no bancode dados é outra camada.

# hash da senha
antes de separa o codigo vamos logo fazer essa funcionalidade de criação de usuario com mais coisas.
vamos instalar o bcrypt js
npm i bcryptjs
precisamos tambem instalar separadamente o types
npm i -D @types/bcryptjs
então la no nosso arquivo register a gente vai importar do bcrypt o modo hash

agora ao inves de salvar a senha do usuario dentro de password hash a gente vai criar um hash usando o metodo has que importamos/.
o hash retorna uma promisse enãot temos que usar o await. passamos o password para dentro do ahash e o segundo parametro vai ser a quantidade de rounds
nos vamos fazer uma const password_hash = await hash(password,)
o hash gera um dado impossivel de reverter mas ele usa esse dado com base em algo pode ser o salrt ou os rounds qjuanto mais round a gente fizer mais dificil é de quebrar ele porem é mais pesado para a aplicação fazer.
se a gente usa ele para algo que a aplicação faz sempre pode pesar. para a maioria usamos 6 rounds e ja ta otimo.

vamos so um parenteses entrar no eslint.json e colocar uma regra de camelcase off fica assim:
{
    "extends": [
        "@rocketseat/eslint-config/node"
    ],
    "rules": {
        "camelcase": "off"
}
}

agora voltamos.
trocamos da criação de usuario oa designação de password e passamos so o password hash pq ele ja vai estar pegando corretamente e passando pelo hash. a pagina fica assim:
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(7),
  })

  const { name, email, password } = registerBodySchema.parse(request.body)

  const password_hash = await hash(password, 6)

  await prisma.user.create({
    data: {
      name,
      email,
      password_hash,
    },
  })
  return reply.status(201).send()
}

agora abaixo do constque faz o hash nos vamos validar se tem algum usuario com o mesmo email. a gente vai fazer uma const e vamos igualar ela a await prisma.user.findUnique que vai procurar um registro unico na tabela agora podemos passar um where para dizer onde ele deve procudar. mas sabendo que o find unique so procura em registros da tabela que nos colocamos a flag unique ou então que são cave primaria.
vamos procurar pelo email e caso a conste exista ou seja caso ela achealgum email ja existente a gente vai retornar o status 409 que é usado como algo que o registroesta duplicado. essa parte fica assim:
  const userWithSameEmail = await prisma.user.findUnique({
    where: { email },
  })
  if (userWithSameEmail) {
    return reply.status(409).send()
  }
  agora a gente ta vendo que essa camada do core do controller esta ficando ada vez maior. então a parte que não muda sempre que a gente for fazer um usuario, que a gente vai ter que copiar e colar e sta cada vez maior. vamos começar em breve a pensar em coisas para sair desse local de core para que não precisemos repetir ela.
  nos vamos separar essa parte que vai ser indispensavel em toda criação de usuario em uma nova pasta que vamos criar. podemos chalar ela de services ou use-cases
  e vamos fazer ela no src
  vamos pegar essa parte do register:
   const password_hash = await hash(password, 6)

  const userWithSameEmail = await prisma.user.findUnique({
    where: { email },
  })
  if (userWithSameEmail) {
    return reply.status(409).send()
  }

  await prisma.user.create({
    data: {
      name,
      email,
      password_hash,
    },
  })
 

  dentgro da pasta use-case vamos tambem abrir um arquivo chamado de register.ts vamos exportar uma função assincrona chamada registerUseCAses e colar o nosso codigo dentro dela. e fazer as importações necessarias.
  agora precisamos receber as coisas como o password o email etc entéao vamos criar uma interface RegisterUseCaseParams {}
  e passamos name email e password como strings. agora na função vamos receber um objeto como name email e password e ele vai ser tipado pela interface que criamos.
  isso ja para a maioria dos erros, maisainda temos o erro do reply.
  o reply é algo expecifico do fastify e de uma requisição http mas a gente ta tentando criar algo desacoplado das requisições http ,  gente quer que ele posssa surgir de outra forma que não seja a requisição então não faz sentido a gente usar o reply ali porque talvez ele saia para algo que não aceite o reply, se não for algo http.
  então nos vamos substituir isso por uma oitra forma de disparar o erro. podemos usar um throw new error email already exist e depois quando a gente for chamar ele no nosso register a gente chaam por um try catch e dessa forma ele pegaria o erro e daria um reply http quando fosse chamado de forma http, de outras formas ele pegaria esse erro de forma diferente. que não vamos fazer aqui.
  o codigo do useCases fica assim:
  import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

interface RegisterUseCaseParams {
  name: string
  email: string
  password: string
}

export async function registerUseCase({
  name,
  email,
  password,
}: RegisterUseCaseParams) {
  const password_hash = await hash(password, 6)

  const userWithSameEmail = await prisma.user.findUnique({
    where: { email },
  })
  if (userWithSameEmail) {
    throw new Error('Email already exists.')
  }

  await prisma.user.create({
    data: {
      name,
      email,
      password_hash,
    },
  })
}

e agora no controller vamos chamar ele assim em um try passando o nome email e senha e no caso de pegar um erro a gente passa o return reply com o status 409 e se a gente quiser a gente pode mandar dentro do send uma message: err.message para pegar a mensagem que escrevemos la no erro. mas não vamos fazer isso porqe depois vamos mudar.fica assim a pagina:
import { registerUseCase } from '@/use-cases/register'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(7),
  })

  const { name, email, password } = registerBodySchema.parse(request.body)

  try {
    await registerUseCase({
      name,
      email,
      password,
    })
  } catch (err) {
    return reply.status(409).send()
  }

  return reply.status(201).send()
}

agora em qualquer lugar de nossa aplicação que a gente queira registrar um usuario de qualquer forma que a gente quiser a gente so presia chamar o nosso registerUseCase e passar para ele nome email e password que ele vai criar.
sempre ue a gente separa algo no nosso codigo é interessante ter um bom motivo para essa separaão porque se não a gente pode acabar complicando o codigo. o caso acima tinha um bom motivo. e agora do ueCases nos vamos separar a conexão com o banco de dados. isso tambem vai em breve ter bos motivos para isso. para fazer isso nos vamos criar uma pasta chamada repositories e dentro del vamos criar um arquivo chamado prisma-users(o nome da tabel que estamos usando)-repository.ts
dentro dele nos vamos exportar uma classe chamada prismaUserRepositories e dentro dele vamos ter varios metodos que vão interceptar ou ser as portas de entrada para qualquer importação que a gente for fazer no banco de dados então todas as alterações no banco de dados vao passar pelo repositories.
a primeira que a gente vaicolocar vai ser a que a gente vai tirar do useCases para criar o usuario
a gente da um async create(data) { e qui dentro a gente passa o que a gente pegou do useCase que é isso:await prisma.user.create({
    data: {
      name,
      email,
      password_hash,
    },
  })}
  importamos o prisma 
  para não ter que repetir tudo que tem la passando os email nome e tudo mais, o prisma ja tipificou para a gente o que podemos usar no create metod no users ou seja ele sabe que tem que passar name email e password-hash
  então no data que a gente esta passando par a a função a gente pode tipar ele com : userCreateInput e ele vai ter a tipagem necessaria. a gente vai impoortar o Prisma com P maiusculo para isso tambem e agora a gente pode passar o data inteiro para a criação sem precisar desetrutirar. vamos tamber transformar essa criação em uma cont para poder devolver ela. fica assim:
  import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export class prismaUsersRepositories {
  async create(data: Prisma.UserCreateInput) {
    const user = await prisma.user.create({
      data,
    })
    return user
  }
}

agora no register a gente precisa instanciar essa classe para poder trabalhar com o user então vamos fazer uma const PrismaUserRepositorie = new PrismauserRepositorie
 const prismaUsersRepositories = new PrismaUsersRepositories()
 e agora a gente pode chamar o prismaUsersRepoistoris.create e passar para ele os valores de name email e password por ser umùa promisse temos que dar await antes
 fica assim:
 import { prisma } from '@/lib/prisma'
import { PrismaUsersRepositories } from '@/repositories/prisma-user-repositories'
import { hash } from 'bcryptjs'

interface RegisterUseCaseParams {
  name: string
  email: string
  password: string
}

export async function registerUseCase({
  name,
  email,
  password,
}: RegisterUseCaseParams) {
  const password_hash = await hash(password, 6)

  const userWithSameEmail = await prisma.user.findUnique({
    where: { email },
  })
  if (userWithSameEmail) {
    throw new Error('Email already exists.')
  }

  const prismaUsersRepositories = new PrismaUsersRepositories()

  await prismaUsersRepositories.create({
    name,
    email,
    password_hash,
  })
}

uma das vantagens de usar o repositorie pattern é que no futuro se a gente não trabalhar mais com o prims por exemplo vai ficar mais facil para mudar porque so o repositorio vai ter codigo relacionado com o prisma, fica menos arquivos para mexer porque eles são os unicos arquivos que vao ter contato com o banco de dados.
mas ainda tem outras vantagens que vamos ver em brreve.
da foprma que estamos a gente não onseguiria migrar para outro serviço a parte do prisma ou outro banco de pque a gente teria que ir para todos os nossos casos de uso e mudar  chamada dos repositorios em todos os casos de uso (que no futuro podem ser muitos.)
mas agora a gente vai ver os principios solid que podem mudar um pouco isso.
solid é dividido em 5 principios vamos falar deles mas o ultimo é o d
dependenci inversion principle
o nosso caso de uso tem uma dependencia no repoositorio do prisma
se o nosso repositorio do prisma não existe o nosso caso de uso para de fucnionar.
# inversão de dependencia
nos vmos mudar como o nosso caso de uso tem acesso a dependencia
hj ele esta instanciando o repositorio que ele precisa mas isso traz essa dependencia
com esse principio a gente vi inverter a ordem de como a dependencia chega, ao invez de instanciar a gente vai receber ela como paramentro. porem se a gente receber ela la na função com os outros parametros pode ficar bagunçado então geralmente a gente vai
nos vamos fazer uma class chamada registerUseCase {} e a gente pega toda nossa função registerUseCase e joga la dentro so que tira o export function, deixa so o assync, e troca o nome da função para algo como execute ou handle ou algo assim 
e cada classe de caso de uso vai ter apenas um unico metodo.
mas o que mudou?
com essa classe a gente pode, fazer um construtor
constructor () {}
e dentro desse construtor a gente pode colocar nossas dependencias, assim ao ivez de nossa função instanciar as dependencias que ela precisa, ela vai receber as dependencias como parametro, por isso é inversão de dependencia.
dentro do construtor nos vamos receber o userRepositorie e o tipo dele por euqnaitp vai ser any. para que um parametro vire automaticamete uma propriedade daz classe a gente coloca uma palavra de visibilidade na frente dele, como por exemplo private ou public
então vamos colocar private usersRepository
ele vai dizer que o construtor é inutil porque não tem nada dentro das chaves, mas isso é um falso negativo a gente pode ir la no eslint e desabilitar isso no rules
{
    "extends": [
        "@rocketseat/eslint-config/node"
    ],
    "rules": {
        "camelcase": "off",
        "no-useless-constructor": "off"
}
}

agora a gente tira a instanciação do userrepository e no await a gente tira o prismaserrepositorie e coloca this.userRepository pegando o que a gente construiu na classe.
fica assim, com a retirada da instanciação em comentario para ficar facil de identificar:
import { prisma } from '@/lib/prisma'
import { PrismaUsersRepository } from '@/repositories/prisma-user-repositories'
import { hash } from 'bcryptjs'

interface RegisterUseCaseParams {
  name: string
  email: string
  password: string
}
class RegisterUseCase {
  constructor(private usersRepository: any) {}

  async execute({ name, email, password }: RegisterUseCaseParams) {
    const password_hash = await hash(password, 6)

    const userWithSameEmail = await prisma.user.findUnique({
      where: { email },
    })
    if (userWithSameEmail) {
      throw new Error('Email already exists.')
    }

   // const prismaUsersRepositories = new PrismaUsersRepository()

    await this.usersRepository.create({
      name,
      email,
      password_hash,
    })
  }
}

vamos agora exportar a classe e a gente ja pode apagar a importação do prisma
em breve vamos modificar a parte do email para que não tenha nenhuma mais referencia ao prisma. porem a parte de insersão no banco de dados ja esta independente do prisma.
agora o arquivo que precisar do n osso caso de uso como o controllet vamos comocar o R maiusculo porque é uma classe
e no momento que a gente for usar ela, no caso no try a gente vai instanciar e vamos passar as dependencias ou seja instanciamos tambem o prisma userRepositories e passamos ele para dentro da nossa instanciação do registerUseCase e damos um await registerUseCase.execute 
recaptulado as duas paginas fica assim, a useCases:
import { prisma } from '@/lib/prisma'

import { hash } from 'bcryptjs'

interface RegisterUseCaseParams {
  name: string
  email: string
  password: string
}
export class RegisterUseCase {
  constructor(private usersRepository: any) {}

  async execute({ name, email, password }: RegisterUseCaseParams) {
    const password_hash = await hash(password, 6)

    const userWithSameEmail = await prisma.user.findUnique({
      where: { email },
    })
    if (userWithSameEmail) {
      throw new Error('Email already exists.')
    }

    await this.usersRepository.create({
      name,
      email,
      password_hash,
    })
  }
}


e a controller
import { PrismaUsersRepository } from '@/repositories/prisma-user-repositories'
import { RegisterUseCase } from '@/use-cases/register'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(7),
  })

  const { name, email, password } = registerBodySchema.parse(request.body)

  try {
    const prismaUsersRepositories = new PrismaUsersRepository()
    const registerUseCase = new RegisterUseCase(prismaUsersRepositories)
    await registerUseCase.execute({
      name,
      email,
      password,
    })
  } catch (err) {
    return reply.status(409).send()
  }

  return reply.status(201).send()
}

ou seja o arquivo que vai fazer uso do useCase é ele que vai enviar a conexão com o prsma ou qualquer plataforma que a gente esteja usando para os use cases, assim caso a gente precise mudar, mudamos apenas nesses arquivos. e os nossso useCases continuam inalterados.
então caso um dia a gente altere do prisma para outro repositorio, apos criar o novo repositorio so precisaremos trocar essas duas linhas
 const prismaUsersRepositories = new PrismaUsersRepository()
    const registerUseCase = new RegisterUseCase(prismaUsersRepositories) // the file that need a useCase is the file that will send the dependencies as params to the useCase
   
e o nosso app funcionara.

nosso use case esta independente do userrepository porem seria interessante que ele soubesse pelo menos quais metodos existem e quais conteudos esses metodos vao receber. isso não atrapalha sua independencia.
então vamos criar uma interface na pasta repositories chamada users-repository.ts
isso porque nessa linha aqui do useCase
export class RegisterUseCase {
  constructor(private usersRepository: any) {}
  a gente podia colocar no lugar de any um PrismaUsersRepoitory que ja existe, porem ai o usecase ia conhecer a implementação do prisma e ia voltar a ficar dependente.
  então o nosso users-repository vai ser apenas uma interface (pode ser encontrado tambem como uma classe abstrata mas aqui é melhor usar uma interface)
  essa interface vai dizer quais metodos vão ser utilizados; quais parametros ele vai receber e ela vai devolver uma promisse com um User fica assim:
  import { Prisma, User } from '@prisma/client'

export interface UsersRepository {
  create(data: Prisma.UserCreateInput): Promise<User>
}

agora no use case nos vamos trocar o any que a gente citou logo acima por usersRepository

agora o create esta tipado então la no fim ele ja sugere.

so que la no nosso register controle quando nos instanciamos o nosso prisma

quando a gente usa ele da certo. porem dentro do prisma repository se a gente entra no prismaUserRepository não colocar o metodo create ele não aponta erro, porem esse erro aconteceria ele precisa do metodo create.
então nos repositoriso que a gente quer que siga isso a gente precisa implementear o usersRepository. fica assim:

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { UsersRepository } from './users_repository'

export class PrismaUsersRepository implements UsersRepository {
  async create(data: Prisma.UserCreateInput) {
    const user = await prisma.user.create({
      data,
    })
    return user
  }
}


assim se a gente tirar o asyc create ele aponta o erro e ele pode ate sugerri o metodo para resolver.
para organizar dentro da pasta repositories nos vamos criar uma pasta prisma e jogar as coisas relacionadas ao prisma nela. as importaç éoes devem ser atualizadas automaticamente mas se não so tem no proprio prisma repositorie e no register.

vamos agora mover o metodo de bustcar um usuario pelo email para dentro do repositorio porque a gente ão quer nenhuma menção ao prisma no useCases.
esse é o metodo em questão que esta no useCase
 const userWithSameEmail = await prisma.user.findUnique({
      where: { email },
    })
    if (userWithSameEmail) {
      throw new Error('Email already exists.')
    }


então vamos la no usersRepository e sempre começamos pela interface porque ela que diz quais metodos vão xistir. ela é o contrato.
no repositorio a gente cria metodos mais expecificos enão o nome vai ser findByEmail
a gente procura por email, recebe ul email que é uma string e devolve uma promisse user ou se não encontrar volta nulo fica assim:
import { Prisma, User } from '@prisma/client'

export interface UsersRepository {
  findByEmail(email: string): Promise<User | null>
  create(data: Prisma.UserCreateInput): Promise<User>
}


agora vamos la no repositorioPrisma
como ele ta implementando o contrato da interface ele ja esta apontando um erro. se a gente der um cntrl +  ele ja cria uma versão do que devemos colocar/
ele nos da isso
  findByEmail(email: string): Promise<{ id: string; name: string; email: string; password_hash: string; created_at: Date } | null> {
    throw new Error('Method not implemented.')
  }
  a gente coloca um async na frente
  retira o retorno e tambem o erro e vamos dentro dele passar o codigo que temos no caso de uso. acaba que a pagina fica assim:
  import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { UsersRepository } from '../users_repository'

export class PrismaUsersRepository implements UsersRepository {
  async findByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    return user
  }

  async create(data: Prisma.UserCreateInput) {
    const user = await prisma.user.create({
      data,
    })
    return user
  }
}
e na pagina do useCase a gente vai tirar a parte  que a gente copiou para usar o metodo do repositorio: fica assim:
 const userWithSameEmail = await this.usersRepository.findByEmail(email)

    if (userWithSameEmail) {
      throw new Error('Email already exists.')
    }

    a pagina completa:

    import { prisma } from '@/lib/prisma'
import { UsersRepository } from '@/repositories/users_repository'

import { hash } from 'bcryptjs'

interface RegisterUseCaseParams {
  name: string
  email: string
  password: string
}
export class RegisterUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ name, email, password }: RegisterUseCaseParams) {
    const password_hash = await hash(password, 6)

    const userWithSameEmail = await this.usersRepository.findByEmail(email)

    if (userWithSameEmail) {
      throw new Error('Email already exists.')
    }

    await this.usersRepository.create({
      name,
      email,
      password_hash,
    })
  }
}

agora nosso useCase esta livre do prisma.


# erros no use case
vqamos melhorar a tratativa de erros no ue case no momento so ta dandi o trhow no caso do email.
para qualque erro a gente retorna o mesmo status^pode ser ruim  poem acontecer varios tipos de erro diferentes.
existem varias possibilidades para resolver isso; a que a gente vai usar vai ser criar uma pasta chamada erros e ter arquivos para cada tipo de erro na aplicação. a pasta erros ficar dentro do useCase
nela vamos criar um arquivo chamado userAlreadyExists.ts
dentro dele a gente exporta uma classe com o nome do erro e com erro no fim para onde a gente ver ela sendo usada saber que é um erro. ela vai extender a classe error que é uma classe preexistente do java script.
dentro dessa classe a gente so vai chamar o constructor e esse constructor vai ser o super que é algo que ja existe na classe error e dentro dele a gente so vai passar a msg user already exists.
    export class UserAlreadyExistsError extends Error {
  constructor() {
    super('E-mail already exists')
  }
}

ai agora la no uso de caso ao inves de dar um thrown new error a gente da um trhow nez UserAlreadyExistError.
 if (userWithSameEmail) {
      throw new UserAlreadyExistsError()
    }

    agora no nosso controler a gente poder fazer um 
    if o erro for uma instancia de userAlreadyExistsError a gente retorna o status 409 e na mssage do send a gente colocar oa messagem que tinha no error. e se não for a gente dar um return status 500 por enquanto depois a gente ajeita isso. fica assim:
    import { PrismaUsersRepository } from '@/repositories/prisma/PrismaUsersRepository'
import { UserAlreadyExistsError } from '@/use-cases/errors/user-already-exists'
import { RegisterUseCase } from '@/use-cases/register'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(7),
  })

  const { name, email, password } = registerBodySchema.parse(request.body)

  try {
    const prismaUsersRepositories = new PrismaUsersRepository()
    const registerUseCase = new RegisterUseCase(prismaUsersRepositories) // the file that need a useCase is the file that will send the dependencies as params to the useCase
    await registerUseCase.execute({
      name,
      email,
      password,
    })
  } catch (err) {
    if (err instanceof UserAlreadyExistsError) {
      return reply.status(409).send({message : err.message})
    }
    return reply.status(500).send() //TODO fixthis
  }

  return reply.status(201).send()
}

perceba a mudança perto do todo fixthis.

agoracom isso a gente vai fazer ao longo da aplicação sempre uma esturtura parecida com isso.
agora que ja sabemos um pouco de inversão de dependencia cvamos começar a colocar testes. e é com testes que vamos vizuqalisar melhot o porque a inversão de dependencia é tão necessaria.

antes de ir para os testes  vamos resolver o como lidar com outros tipos de erro na aplicaà
o nosso register esta com sse TODO fix this
ou seja se acontecer qualqquer erro que não seja conhecido e ele não vai ter sido tratado.
então se não for um erro conhecido nos vamos dar um trhow no erro. ou seja
se o erro não for conhecido apesar de a gente estar em uma tratativa de erro a gente vai estar dizendo que néqo wueremos tratar esse erro, vamos deixar para uma outra camada tratar esse erro. e se a gente fizer isso no lugar dessa linha
 return reply.status(500).send() //TODO fixthis
  }

  ele vai retornar um erro e dizer o que esse erro é isso porque nesse caso o fastify vai estar tratando esse erro automaticamente na trata^ão de erro interna dela.
  porem as vezes essa tratativa não é tão boa então nos vamos criar ulm error handler para tratar globalmente os erros na aplicação.
  então vamos no app, depois das rotas e vamos colocar um 
  app.setErrorHandler dentro dele vamos passar o error o request e o  reply
  fica assim:
  import fastify from 'fastify'
import { appRoutes } from './http/routes'

export const app = fastify()

app.register(appRoutes)

app.setErrorHandler((err, request, reply) => {
    
})

agora dentro dele vamos começar a passar algumas coisas
se for um erro originario de uma validação if(error instanceOf ZodError) e gente retorna um status 400 ou seja um bad request e vamos enviar no copo uma message de validation error e dentro de issues o format (ou seja o formato do errO) 
    if(error instanceof ZodError) {
        return reply.status(400)
        .send({message: "Validation error", issues:error.format()})
    }
  de fazer isso eles ja aparecem de uma forma um pouco melhor. fica mais facil de entender o porque do erro
  porem se não for um erro de validação ainda não esta tratando e ai vai ficar um loop infinito porque ele não tem onde cair.

  por isso se o erro caiu até aqui é porque realmente é um erro desconhecido então nos vamos colocar apenas um return reply.status(500).SEND(message:"internal server error")
  podem cair erros nesses mas vao ser mais rarros e a gente não tem como prever todos os erros possiveis.
  então a gente quer manter a habilidade de tratar esses erros.
  para tratar isso nos vamos puxar um if o Node_env (com cuidado pra chamar do lugar certro que é o que a gente criou) for diferente de production a gente vai dar um console.error. fica assim:
  app.setErrorHandler((error, request, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation error', issues: error.format() })
  }
  return reply.status(500).send({ message: 'Internal server error' })
  if (env.NODE_ENV !== 'production') {
    console.error(error)
  }
})
agora no terminal caso néao esteja em produção nos vamos ver o erro no terminal vendo onde aconteceu e tudo mais. porem em produção não faz sentido deixar o console.error porque a gente não vai ficar omhando o terminal.
por isso em else mas não vamos fazer agora então vamos deixar como comentario para o futuro fazer um log em alguma outra ferramenta que usaria isso como datadog ou newrelic. que s ão gferramentes de observabilidade que nos enviaraim quais erros eséoa acontecendo
no lugar do request um underline qao esta usando a gente pode colocar um underline que ele entendeo como um parametro não usado.
no caso vamos substituir o request por um underline.
o codigo do app fica assim e agora a gente trabalha com os erros de forma global.

# testes
vamos começar a escrever testes. é importante ir fazendo eles ao mesmo tempo que vamos fazndo a aplicaçéao. não da pra finalizar a aplicaçéao e depois fazer os testes.
para isso vamos istanar o vitest com um plugin para ele entender os paths que a gente fez com o @ no inisial
npm i vitest vite-tsconfig-paths -D

agora na raiz vamos criar um arquivo chamado vite.config.ts
e la vamos exportar uma finção chamada defineConfig como default nos vamos importar ela do vite/config
e dentro dela vamos passar um objeto e la vamos passar plugins como tsconifgpaths que é o pluging que vamos importar de dentro do vite-tsconfig-paths e vamos passar um parenteses nele pra dizer que é função
fica assim:
import { defineConfig } from 'vitest/config'
import tsconfigpaths from 'vite-tsconfig-paths'
export default defineConfig({
  plugins: [tsconfigpaths()],
})


agora o vitest ja vai entender os endereços que passamos.

vamis agora no package.json e vamos criar um script test um chamado test para ele testar todos os testes sem ficar dando watch e outro test:watch que vai roadr so vitest assim cada mudança que a gente fizer ele vai observar.
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsup src --out-dir build",
    "start": "node build/server.js",
    "test": "vitest run",
    "test:watch": "vitest"
  },

  agora para testar nos camos nos casos de uso pasta e vamos criar um arquivo chamado register.spec.ts
  e não vamos fazer um teste real agora, é so para testar.
  vamos importar o { test } de vitest
  e vamos fazer um test assim:
  import { expect, test } from 'vitest'

test('check if it works', () => {
  expect(2 + 2).toBe(4)
})

agora se a gente der um npm run test ele deve testar isso e dizer s falha ou não e se a gente der um npm run test:watch ele deve ficar observando e se a gente mudar algo ele deve acusar.
a função com watch não funciona comigo e fica dando falsos positivos. eu não sei porque mas meu node parece ter um roblema para rodar com watch então vamos se consocentrar em sempre dar kill no test e rodar ele novamente.

## testes
olhando nossas regras de negocios. cada uma delas exige teste.
vamos fazer um teste para ver se esta gerando a senha hasheada
vamos no nosso arquivo de teste e apagamos aquele teste que fizemos. na importação fazemos tambem a importação do describe.
e vamos usar o describe para categorizar os testes dentro dele como o register use case fica assim
import { expect, test, describe } from 'vitest'

describe('register use case', () => {
  aqui vai o teste
})

vamos criar o teste e começar instanciado ele
puxando o repositorio e tambem o registeUseCase
describe('register use case', () => {
  test('if hash user password upon registration', async () => {
    const prismaRepository = new PrismaUsersRepository()
    const registerUseCase = new RegisterUseCase(prismaRepository)
  })
})

agora a gente pode dar um await registerUseCase/execute e passar os dados de um usario para ver se funciona.
import { PrismaUsersRepository } from '@/repositories/prisma/PrismaUsersRepository'
import { expect, test, describe } from 'vitest'
import { RegisterUseCase } from './register'

describe('register use case', () => {
  test('if hash user password upon registration', async () => {
    const prismaRepository = new PrismaUsersRepository()
    const registerUseCase = new RegisterUseCase(prismaRepository)

    await registerUseCase.execute({
      name: 'Jhon Doe',
      email: 'jhondoe@hotmail.com',
      password: 'testpassword',
    })
  })
})


vamos fazer uma coisa que não devemos sempre fazer porque o codigo não deve se adaptar ao teste e sim o contrario. porem como nosso codigo ainda não esta copleto vamos fazer essa alteração
vamos la no nosso use case e na criaçéao do usuario nos vamos transformar em uma const chamada user para a gente poder retornar ela depois. fica assim:
  const user = await this.usersRepository.create({
      name,
      email,
      password_hash,
    })

    return { user}
    a gente tenta sempre retornar logo um objeto porque no futuro se ela retornar mais coisas é so adcionar ao objeto.
    agora ainda n useCase nos vamos la em cima fazer uma interface falando o que vai ter nessa resposta. vamos dizer que ele retorna um usuario que é o nosso User que vem la do prisma.
    RegisterUseCaseResponse {
      user: User

    }
agora a gente vai na nossa função execute e tipa ela retornando uma promisse com a interface que a gente acabou de criar . a pagina fica assim:
import { UsersRepository } from '@/repositories/users_repository'

import { hash } from 'bcryptjs'
import { UserAlreadyExistsError } from './errors/user-already-exists'
import { User } from '@prisma/client'
import { promise } from 'zod'

interface RegisterUseCaseParams {
  name: string
  email: string
  password: string
}
interface RegisterUseCaseResponse {
  user: User
}
export class RegisterUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    name,
    email,
    password,
  }: RegisterUseCaseParams): Promise<RegisterUseCaseResponse> {
    const password_hash = await hash(password, 6)

    const userWithSameEmail = await this.usersRepository.findByEmail(email)

    if (userWithSameEmail) {
      throw new UserAlreadyExistsError()
    }

    const user = await this.usersRepository.create({
      name,
      email,
      password_hash,
    })

    return { user }
  }
}

agora voltamos para o nosso test e no nosso envio de informações a gente pode colocar antes dele uma const {user} = await registerCaseExecute ou seja a gente ta buscando o user que vai gerar la.
e depois de gerar a gente pode pegar o user.password_hash que é o que queremos ver se a senha gerada realmente é uma hash.
o que a gente pode fazer simplismente com um console.log(user.password_hash)
se a gente testar isso dando o run test ele ja mostra que é um hash. porem esse teste ainda precisaria de um humano para olhar se funciona.
a gente não pode descriptografar a senha mas podemos gerar um novo hash para ver se eles batem. então vamos fazer uma const isPasswordCorectlyHashed e vamos mandar para ele o metodo compare que vem la do bcrypt qque é um metodo que vai comparar uma senha que a gente vai dar com uma senhahasheada e ele vai dizer se caso a gente hasheie a nova senha que vamos dar vai ser igual a aquilo. e ele vai retornar true ou false. e ai a gente vai dar um expect isso toBe true. fica assim:
import { PrismaUsersRepository } from '@/repositories/prisma/PrismaUsersRepository'
import { expect, test, describe } from 'vitest'
import { RegisterUseCase } from './register'
import { compare } from 'bcryptjs'

describe('register use case', () => {
  test('if hash user password upon registration', async () => {
    const prismaRepository = new PrismaUsersRepository()
    const registerUseCase = new RegisterUseCase(prismaRepository)

    const { user } = await registerUseCase.execute({
      name: 'Jhon Doe',
      email: 'jhondoe@hotmail.com',
      password: 'testpassword',
    })

    const isPasswordCorectlyHashed = await compare(
      'testpassword',
      user.password_hash,
    )
    expect(isPasswordCorectlyHashed).toBe(true)
  })
})


se a gente rodar esse teste multiplas vezes vai dar erro porque apos ele criar o usuario uma vez o email nõa pode mais ser usado então a gente não deve tambvem ficar mudando o email a cada vez que for fazer um teste.
### testes unitarios
o que a gente esta criando acima são testes unitarios qu são a base da piramide de testes. eles devem ser totalmente desconectado de suas dependencias
ao escrever um teste unitario a gente quer testar ele so, sem as dependencias de outras camadas da aplicação
ou seja apartir do momento que nos estamos usando o useCase  pegado o prisma repository e estanciando ele no nosso teste ele não é mais um teste unitario. ele pode ser considerad um teste de integração porque ele testa as integrações entre o repositorio e o useCase mas não um teste unitario.
teste unitario nunca vai tocar em banco de dado ou camadas externas de nossa aplicação.
agora nos vamos ver a principal vantagem de inversão de dependencias.
então a inves de chamar o prisma repositry nos vamos imitar ele dentro do nosso teste.
vamos apagar a instancia do primsa e dentro do register vamos passar um objeto com um async create(data) {
  return { awqui vamos retornar um objeto como se fosse o usuario.}
}
ou seja fizemos um metodo create.
nos colocamos tambem o metodo findByEmail e retornamos null.
a pagina fica assim:
import { expect, test, describe } from 'vitest'
import { RegisterUseCase } from './register'
import { compare } from 'bcryptjs'

describe('register use case', () => {
  test('if hash user password upon registration', async () => {
    const registerUseCase = new RegisterUseCase({
      async findByEmail(email) {
        return null
      },
      async create(data) {
        return {
          id: '145781475',
          name: data.name,
          email: data.email,
          password_hash: data.password_hash,
          created_at: new Date(),
        }
      },
    })

    const { user } = await registerUseCase.execute({
      name: 'Jhon Doe',
      email: 'jhondoe@hotmail.com',
      password: 'testpassword',
    })

    const isPasswordCorectlyHashed = await compare(
      'testpassword',
      user.password_hash,
    )
    expect(isPasswordCorectlyHashed).toBe(true)
  })
})

e agora o teste não precisa mais do prisma nem do banco de dados nem de nada. ele esta sowinho se comparadno com o usuario ficticio que a gente criou.
e o teste fica superrapido e pode rodar varias vezes que não vai dar o erro de não encontrar o banco de dados ou do email duplicado, porque ele não depende do banco de dados.
claro que esse tipo de teste não vai ver possiveis erros no banco de dados. mas esse não é o papel desses testes, então vamos ter muitos testes unitarios que não vao ver o banco de dados e alguns outros menos para ver o banco de dados.

## in memory pattern 
isso que a gente criou de fazer um repositorio ficticio é o que chamamos de in memory pattern tem textos sobre issono blog de martinfowler
porem como nos vamos fazerdiversos testes que vao usar isso. nos podemos para não ficar refazendo essa criação fazer um outro arquivo dentro de uma pasta chamada in-memory
esse arquivo vai se chamar in-memory-users-reporitory
e ele vai se parecer muuito com o prisma repository colocando la o metodo find by email e create;
dentro do vreate vamos colocar o nosso usuario.
  return {
          id: '145781475',
          name: data.name,
          email: data.email,
          password_hash: data.password_hash,
          created_at: new Date(),
        }

        e vamos salvar em uma const user ser isso.
        agora na classe fazemos um public Itens: users[] = [  ] e depois de criar o user a gente da um push no array itens com esse user. fica assim:
        import { UsersRepository } from '@/repositories/users_repository'
import { Prisma, User } from '@prisma/client'

class InMemoryUserRepository implements UsersRepository {
  public Itens: User[] = []
  async findByEmail(email: string): Promise<User | null> {
    throw new Error('Method not implemented.')
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const user = {
      id: '145781475',
      name: data.name,
      email: data.email,
      password_hash: data.password_hash,
      created_at: new Date(),
    }
    this.Itens.push(user)
    return user
  }
}

agora para o email fazemos, um const user = this.user e vamos usar o find um item onde o email do item é igual ao imail que eu estou querendo buscar e se a gente não achar retornamos nulo/
fica assim:
import { UsersRepository } from '@/repositories/users_repository'
import { Prisma, User } from '@prisma/client'

export class InMemoryUserRepository implements UsersRepository {
  public Itens: User[] = []
  async findByEmail(email: string): Promise<User | null> {
    const user = this.Itens.find((item) => item.email === email)
    if (!user) {
      return null
    }
    return user
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const user = {
      id: '145781475',
      name: data.name,
      email: data.email,
      password_hash: data.password_hash,
      created_at: new Date(),
    }
    this.Itens.push(user)
    return user
  }
}

o que a gente fez foi criar um banco de dados so no javascript usando a memoria do array/

agora no test a gente pode instaniar isso e passar ela para o teste:
import { expect, test, describe } from 'vitest'
import { RegisterUseCase } from './register'
import { compare } from 'bcryptjs'
import { InMemoryUserRepository } from './in-memory/in-memory-user-repository'

describe('register use case', () => {
  test('if hash user password upon registration', async () => {
    const userRepository = new InMemoryUserRepository()
    const registerUseCase = new RegisterUseCase(userRepository)

    const { user } = await registerUseCase.execute({
      name: 'Jhon Doe',
      email: 'jhondoe@hotmail.com',
      password: 'testpassword',
    })

    const isPasswordCorectlyHashed = await compare(
      'testpassword',
      user.password_hash,
    )
    expect(isPasswordCorectlyHashed).toBe(true)
  })
})

agora com isso se a gente for criar outro teste como não pode cadastrar o mesmo email duas vezes a gente pode copiar esse teste anterior e modificar umas coisas.
a gente cria uma variavel eail com o email do usuario que vamos usar
a gente chama o metodo de cadastro passando esse email uma vez. e na segunda vez que vamos usar ele deve dar erro. porque ja cadastrou com esse email uma vez e ele foi cadastrado no nosso array do in memory user repository.
 para testar isso a gente da na segunda chamada um expect uma funç:éao e passamos os dados da criação
 esse register é uma promisse e uùa promisse retorna duas coisas ou resolve se deu cert ou reject se deu errado.
 enãot nesse caso nos esperamos um reject poruq tem que dar errado e esperamos que esse reject seja uma instancia da classe userAlreadyExists
 fica assim:
 test('if user cannot use the same email', async () => {
    const userRepository = new InMemoryUserRepository()
    const registerUseCase = new RegisterUseCase(userRepository)
    const email = 'jhondoe@hotmail.com'

    await registerUseCase.execute({
      name: 'Jhon Doe',
      email,
      password: 'testpassword',
    })
    expect(() => {
      registerUseCase.execute({
        name: 'Jhon Doe',
        email,
        password: 'testpassword',
      })
    }).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })

  agora nos vamos criar um ultimo teste para ver se o registro acontece ocorretamente.
  vamos apenas registrar um usuario e vamos ver se esse usuario tem um id, ou seja como o id é automatico, caso ele tenha um id quer dizer que ele foi criado. então temos que ver se o user.id toEqual uma string.

# coverage de testes
para saber se estamocaçãoente testando todas as partes de nossa aplicação os frameworks de testes tem uma funcionalidade chamada de coverage. para usar ela vamos no package json e escrevemos um novo script
 "test:coverage": "vitest --coverage"
 agoravse a gente rodar esse script ele vai dizer que tem uma dependencia que n<éao foi instalada a gente da um y para ele instalar.
 percebemos um erro nos testes que é a parte que o expect tem uma promisse o vitest não vai esperar essa promisse se realizar. então sempre que tiver o expect e dentro dele uma promisse a gente tem que colocar oawait dentro do expect.então esse texte abaixo fica adicionado do await xpect:
  test('if user cannot use the same email', async () => {
    const userRepository = new InMemoryUserRepository()
    const registerUseCase = new RegisterUseCase(userRepository)
    const email = 'jhondoe@hotmail.com'

    await registerUseCase.execute({
      name: 'Jhon Doe',
      email,
      password: 'testpassword',
    })
    await expect(() =>
      registerUseCase.execute({
        name: 'Jhon Doe',
        email,
        password: 'testpassword',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })

  agora nos podemos rodar o test:coverage novamnete
  ele retorna isso:
   ✓ src/use-cases/register.spec.ts (3)
   ✓ register use case (3)
     ✓ if registration happens
     ✓ if hash user password upon registration
     ✓ if user cannot use the same email

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  11:22:37
   Duration  12.23s (transform 1.21s, setup 0ms, collect 1.94s, tests 187ms, environment 1ms, prepare 5.95s)

 % Coverage report from v8
-------------------------------|---------|----------|---------|---------|-------------------
File                           | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------------------|---------|----------|---------|---------|-------------------
All files                      |     100 |      100 |     100 |     100 |
 use-cases                     |     100 |      100 |     100 |     100 |
  register.ts                  |     100 |      100 |     100 |     100 |
 use-cases/errors              |     100 |      100 |     100 |     100 |
  user-already-exists.ts       |     100 |      100 |     100 |     100 |
 use-cases/in-memory           |     100 |      100 |     100 |     100 |
  in-memory-user-repository.ts |     100 |      100 |     100 |     100 |
-------------------------------|---------|----------|---------|---------|-------------------

 PASS  Waiting for file changes...
       press h to show help, press q to quit


veja que todos os testes passaram
e ele gera um relatorio para a gente o que testou
vamos so mudar o script para run coverage para ele não ficar sempre observando, apenas rodar uma vez e pronto. o relatorio continua o mesmo
ele gera uma pasta para nos chamada coverage. nos colocamos essa pasta dentro do gitignore. essa pasta tem um arquivo chamado index.html e esse arquivo tras uma listagem de todos os arquivos que de alguma forma nossos testes passaram e traz o quanto por centro dos nossos arquivos foram cobertos por testes. a gente pode clicar em um desses arquivos como os casos de uso e ele vai mostrar o codigo do nosso arquivo e do mado do numero da linha tem o quantas vezes um teste passa por essa linha.
dito isso é bom saber que nossa aplicação não precisa ter 100% de coverage, não precisamos testar tudo, porem o cover é bom para que a gente saiba e identifiqwue caso a gente tenha esquecido de testar algo.
## vistest ui
para ficar mais visual e não esses relatorios de terminal a gente pode instalar o pacote vitest ui e fazer
npm i -D @vitest/ui
e no nosso package json vamos fazer um script 
 "test:ui": "vitest --ui"

 ai quando a gente roda isso ele abre uma aba no navegador com todos os testes organizados como uma interface de navegador, a gente pode clicar nos testes e ter mais informação etc.
 ele mostra o module graph que mostra como nosso teste esta conectado com outras partes da aplicação.

# autentificação
vamos começar pelo caso de uso porque ela é o nivel mais baixo possivel, se a gente começar pelo controler a gente não tem como verificar porque o controler serve para a gente usar o caso de uso fornecer um meio de acesso externo ao nosso caso de uso. então vamos sempre começar de baixo para cima/.

na pasta de useCase vamos criar o autenticate.ts que vai ser o nosso caso de uso de autenticação.
vamos criar ele tambem como classe por conta da inverão de dependencia. essa classe vai ter um construtor com as dependencias que esse caso de uso vai ter.
export class AutenticateUseCase {
  constructor() {}
}
vamos precisar acessar o repositorio de usuarios então vamos criar a nossa dependencia do userRepository
import { UsersRepository } from '@/repositories/users_repository'

export class AutenticateUseCase {
  constructor(private usersRepository: UsersRepository) {}
}

e nos vamos ter um metodo chamado asyn execute que vai faz"er a autenticação.
agora temos tambem que fazer as tipagens do que entra e o que sai desse usecase
entéao vamos fazer uma interface
para se autenticar precisamos do email e senha
interface AutenticateUseCaseRequest {
  email: string
  password: string
}
e vamos passar para o execute esse email e password de forma desestruurada ou seja dentro de {} e ele vai vir do autenticateUseCaseRequest e vai devolver uma promisse dando um objeto como resposta que é o mesmo do interface de resposta que por enquanto esta vazio fica assim:
async execute({
    email,
    password,
  }: AutenticateUseCaseRequest): Promise<AutenticateUseCaseResponse> {
    // autentification
  }

vai ficar dando erro para parar de dar erro podemos transformar por enquanto o response em um type AutenticateUseCaseResponse = void.

para fazer uma autentificação o processo que vamos fazer é
buscar o usuario no banco pelo email e comparar se a senha salva no banco bate com a senha enviada
ent~~ao vamos conseguir reaproveitar o metodo findByEmail que a gente criou no repositorio
vamos fazer então dentro do execute
 const user = await this.usersRepository.findByEmail(email) ou seja vamos pegar la do userRepository o metodo findbyemail e vamos passar o nosso email.
 caso a gente não encontre o email vamos passar o nosso primeiro erro 
 if (!user)
 vamos criar um arquivo de erro invalid-credentials-error
 a gente não faz um erro de senha incorreta e um de usuario para caso qlguem tente burlar o sistema ele não ter dicas de onde ele esta errando.
 copiamos o erro de userAlredy exist para a gente poder rearoveitar.
 e vamos mudar o nome para invalid credentials error e no super
 export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid credentials error')
  }
}

e agora no nosso use case no caso desse erro a gente da um trhwo nele.

agora caso o usuario exista a gente vai começar comparando as senhas
vamos criar uma variavel de se a senha bate
const doesPasswordMatches =
### dica de cleancode
nos usamos para booleans esse tipo de const ocm um nome como se fosse uma pergunta para a leitura dele ficar semantica, ele vai retornar um true ou falso e ai vai ficar mais compreensivel.

nessa const nos vamos usar o metodo compare do bcrypt 
esse metodo vai pegar uma senha sem ter feito o hash e uma senha com o hash e compara se a senha sem o hash poderia ser usada para gerar o hash.
assim:
  const doesPasswordMatches = await compare(password, user.password_hash)
  sabendo que o compare foi importado do bcrypt
  ai se as senhas não baterem vamos jogar de novo o nosso erro de invalid credential
  e caso a senha bata;, ou seja caso ele passe por tudo isso a gente pode retornar de dentro do caso de uso o nosso usuario. em outras palavras, vamos dar acesso a esse usuario. e na nossa interface de retnro nos vamos colocar que o nosso usuario com a tipagem User de prisma/client 
  a pagina fica assim:
  import { UsersRepository } from '@/repositories/users_repository'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'
import { compare } from 'bcryptjs'
import { User } from '@prisma/client'

interface AutenticateUseCaseRequest {
  email: string
  password: string
}
interface AutenticateUseCaseResponse {
  user: User
}
export class AutenticateUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    email,
    password,
  }: AutenticateUseCaseRequest): Promise<AutenticateUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email)
    if (!user) {
      throw new InvalidCredentialsError()
    }
    const doesPasswordMatches = await compare(password, user.password_hash)
    if (!doesPasswordMatches) {
      throw new InvalidCredentialsError()
    }
    return { user }
  }
}

# teste para a autentificação
vamos criar o autenticate.spec.ts e podemos nele copiar o register porque vai ser parecido.
mudamos o describe para autenticate useCase
apagamos os umtimos testes. ficamos apenas com um teste que é o mais simples.
mudamos o nome do teste  para autenticate
mudamos o caso de uso para autenticate useCase e o nome dessa conts tambem. porem como nos ao criar testes damos muito cntrl c cntrl v podemos acabar com o tempo esquecendo de trocar o nome da const. então existe um padrão na comunidade que é chamar a const que vai ser testada, ou seja o use case (dentro do teste) de sut ou seja sistemundertest
assim quando a gente der cntrl v essa parte não vai mais precisar ser trocada. podemos tirar  name do que nos vamos passar para o execute pq para autentificar ele vai usar so email e senha.
fica assim por enquanto:
import { expect, test, describe } from 'vitest'
import { RegisterUseCase } from './register'
import { InMemoryUserRepository } from './in-memory/in-memory-user-repository'
import { AutenticateUseCase } from './autenticate'

describe('autenticate use case', () => {
  test('if autentication happens', async () => {
    const userRepository = new InMemoryUserRepository()
    const sut = new AutenticateUseCase(userRepository)

    const { user } = await sut.execute({
      email: 'jhondoe@hotmail.com',
      password: 'testpassword',
    })

    expect(user.id).toEqual(expect.any(String))
  })
})


porem para testar isso o usuario precisa estar previamente criado. nos não vamos chamar o register useCase para criar esse usuario porque ai nos estariamos testando dois casos de uso. se tiver erro em um esse erro vai infiltrar.
então como nos temos acesso ao inMemoryRpository nos vamos criar um usuario la dentro antes de chamar o nosso execute
vamos da  r um await userRepository e pegar de la o metodo create. e vamos passar os dados do usuario. sabendo que o email e senha tem que ser os mesmos que nos vamos passar no execute. so que no password nos temos que enviar o passwordHash então temos que fazer o hash dessa senha. vamos pegar o hash do bcrypt passar para ele a senha e o numero de round que nos usamos no register que é 6 e ele precisa de um await porque isso é uma promisse.
fica assim  await userRepository.create({
      name: 'jhon doe',
      email: 'jhondoe@hotmail.com',
      password_hash: await hash('testpassword', 6),
    })

  a pagina total fica assim e a gente ja pode testar
  import { expect, test, describe } from 'vitest'
import { InMemoryUserRepository } from './in-memory/in-memory-user-repository'
import { AutenticateUseCase } from './autenticate'
import { hash } from 'bcryptjs'

describe('autenticate use case', () => {
  test('if autentication happens', async () => {
    const userRepository = new InMemoryUserRepository()
    const sut = new AutenticateUseCase(userRepository)

    await userRepository.create({
      name: 'jhon doe',
      email: 'jhondoe@hotmail.com',
      password_hash: await hash('testpassword', 6),
    })

    const { user } = await sut.execute({
      email: 'jhondoe@hotmail.com',
      password: 'testpassword',
    })

    expect(user.id).toEqual(expect.any(String))
  })
})

e ja funciona.

agora a gente precisa criar alguns outros testes para cair nos if de erro la.
vamos copiar o teste e fazer ul test try to autenticate with wrong email e ai a gente pode tirar o cadastro do usuario, porque ai o email que a gente vai tentar não vai estar la dentro do banco. vamos tirar o const user e colocar so que a gente expect que o await sut.execute de um erro de wrong credentials como lembrado a gente tem que colocar o await antes do expfica assim esse teste/ IMPORTANTE QUE NESSE CASO NÃO COLOCAMOS O { } DEPOIS DA ARROW DO EXPECT:
test('if try to autenticate with wrong email', async () => {
    const userRepository = new InMemoryUserRepository()
    const sut = new AutenticateUseCase(userRepository)

    await expect(() => 
      sut.execute({
        email: 'jhondoe@hotmail.com',
        password: 'testpassword',
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

esse teste tambem passou.
vamos agora fazer o de wrong password. a gente copia esse ultimo teste mas tambem adicionamos a criação de usuario. porque queremos achar o usuario mas a senha dele não bater.
podemos mudar o pasword que passamos para o sut como algo wrongPassoword so para ficar explicito onde esta a diferença.
o este fica assime ele tambem esta fucnionando.
 test('if try to autenticate with wrong password', async () => {
    const userRepository = new InMemoryUserRepository()
    const sut = new AutenticateUseCase(userRepository)

    await userRepository.create({
      name: 'jhon doe',
      email: 'jhondoe@hotmail.com',
      password_hash: await hash('testpassword', 6),
    })

    await expect(() =>
      sut.execute({
        email: 'jhondoe@hotmail.com',
        password: 'wrongPassword',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  agora com nossa parte de testes feita a gente pode ir para o controler da nossa autenticação.

  # controler autentication
  na pasta http controler nos vamos criar um arquivo autentificate.ts
  nos vamos copiar o register nele porque é muito semelhante.
  mudamos o nome da função para autenticate
  vamos tirar o name das coisas que ele recebe
  vamos trocando os register por autenticate. a importaçéao do registerUseCase a gente muda para autenticateUseCase.
  e mudamos o erro para o invalidCREDENTIALError e mudamos o reply status para 400QUE 2 BAD REQUEST e no status de se tudo der certo vamos mandar um 200 e não um 201 porque nos não estamos criando nada. e sim dando um ok.
  o controler fica assim:
  import { PrismaUsersRepository } from '@/repositories/prisma/PrismaUsersRepository'
import { AutenticateUseCase } from '@/use-cases/autenticate'
import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function autenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const autenticateBodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(7),
  })

  const { email, password } = autenticateBodySchema.parse(request.body)

  try {
    const prismaUsersRepositories = new PrismaUsersRepository()
    const autenticateUseCase = new AutenticateUseCase(prismaUsersRepositories) // the file that need a useCase is the file that will send the dependencies as params to the useCase
    await autenticateUseCase.execute({
      email,
      password,
    })
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return reply.status(400).send({ message: err.message })
    }
    return reply.status(500).send() // TODO fixthis
  }

  return reply.status(200).send()
}

claro que aqui a gente por enquanto so esta verificando se o email e a senha batem e não estamos fazendo nada com isso para o usuario ficar e permanecer autentificado em nossa aplicação (talvez a gente faria isso usando um cookie??) vamos ver esses processos de manter o usuario autentificado depois
vamos criar uma rota na aplicação no arquivo routes.ts
vamos criar uma rota post porque nos vamos enviar parametros atravez do body da requisição.
para o nome da rota nos podemos pensar em tudo na aplicação como identidades, então para manter a semantica a gente pode usar sessions como o nome da rota, ou seja a gente vai criar com o post uma session. assim esse usuario vai entrar na sessão dele, ou seja vai estar autenticado. e no lugar passamos como segundo parametro o autenticate. o arquivo de rotas fica assim:
import { FastifyInstance } from 'fastify'
import { register } from './controller/register'
import { autenticate } from './controller/autentificate'

export async function appRoutes(app: FastifyInstance) {
  app.post('/users', register)
  app.post('/sessions', autenticate)
}

se a gente quiser testar isso agora a gente pode abrir o insomnia, dar um run dev na aplicaçao. ducplicar nossa rota de users e passar sessions para ela. no body passar email e senha e enviar. ele deve retornar ok.
funciona.

uma das coisas que esta ficando repetitiva em todos os testes é a instanciação. essas linhas:
 const userRepository = new InMemoryUserRepository()
    const registerUseCase = new RegisterUseCase(userRepository)
    no register e essas no autenticate
     const userRepository = new InMemoryUserRepository()
    const sut = new AutenticateUseCase(userRepository)

    aparece em todos os testes. a gente pode recortar elas e colocar para elas rodarem em todos os testes.
    a gente poderia colocar elas antes de iniciar os testes, porem seria a mesma instanciação usada em todos os testes, se acumulando;, e nos precisamos dos testes de forma indepentende, então talvez seja melhor usar um before each.
    é isso mesmo vamos apos o decribe usar a beforeEach com cuidado para importar ela de dentro do vitest.
    vamos retirar  instanciação de cada um dos testes e colocar dentro do beforeEach. porem ainda não funciona porque os testes não enxergam ela dessa forma então vamos de forma global criar a userRepository usando o let para poder mudar e apenas tipar ela como inMemoryUser Repository e a mesma coisa para o sut (no register vamos tambem mudar o nome do register use case para sut)
    fica assim; reparando que nos estamos tipando sem iniciar essas variaveis ou seja sem colocar o () no fim delas
    let userRepository: InMemoryUserRepository
let sut: AutenticateUseCase

agora no beforeEach a gente inicia as variaveis fica assim:
 beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    sut = new AutenticateUseCase(userRepository)
  })

  agora nos fazemos a mesma coisa no register mudando o nome para sut
  o exemplo de uma pagina interia fica assim:
  import { expect, test, describe, beforeEach } from 'vitest'
import { RegisterUseCase } from './register'
import { compare } from 'bcryptjs'
import { InMemoryUserRepository } from './in-memory/in-memory-user-repository'
import { UserAlreadyExistsError } from './errors/user-already-exists'

let userRepository: InMemoryUserRepository
let sut: RegisterUseCase
describe('register use case', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    sut = new RegisterUseCase(userRepository)
  })
  test('if registration happens', async () => {
    const { user } = await sut.execute({
      name: 'Jhon Doe',
      email: 'jhondoe@hotmail.com',
      password: 'testpassword',
    })

    expect(user.id).toEqual(expect.any(String))
  })

  test('if hash user password upon registration', async () => {
    const { user } = await sut.execute({
      name: 'Jhon Doe',
      email: 'jhondoe@hotmail.com',
      password: 'testpassword',
    })

    const isPasswordCorectlyHashed = await compare(
      'testpassword',
      user.password_hash,
    )
    expect(isPasswordCorectlyHashed).toBe(true)
  })
  test('if user cannot use the same email', async () => {
    const email = 'jhondoe@hotmail.com'

    await sut.execute({
      name: 'Jhon Doe',
      email,
      password: 'testpassword',
    })
    await expect(() =>
      sut.execute({
        name: 'Jhon Doe',
        email,
        password: 'testpassword',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })
})

ou seja a gente recria essas variaveis em memoria antes de cada teste tendo assim um con,texto limpo para cada teste.

# factory pattern
esse pattern no momento não traz muitos beneficios mas é melhor ver ele logo para não voltar depois refazendo tudo.
é comum que em uma aplicação a gente acabe tendo varias rotas ou porta de entradas para coisas normais da aplicação como autentificaçéao cadastro e outros. por isso que fazemos dessas coisas como casos de uso e sempore que a gente precisar desse caso de uso vamos precisar tambem das dependencias desse caso de uso. e aualmente nosso caso de uso ta recebendo um repositorio que é o users repository, mas no futuro isso poderiam ser varios.
então cada vez que a gente fosse usar um caso de uso a gente eria que instanciar as diversas dependencias dele.
e para isso temos o factory pattern, ou seja uma fabrica de criação de coisas comuns como dependencias. então sempre que a gente tiver um codigo que vai ser usado em varios lugares da aplicação e que ele vai usar varias dependencias a gente pode utilizar o factory pattern.
então vamos começar
na pasta de se cases (porque vamos criar patterns expecificamente para os usecases ) nos vamos criar uma pasta chamada factory e dentro dela vamos fazer arquivos chamados make-(nome da fabrica) ou seja make-register meake-autenticate etc. ele pode ter varios padroes de nomenclatura, mas aqui vamos usar o make.
e cada arquivo vai ser bem simples. uma função que vai devolver o nosso caso de uso ja com suas dependencias. ou seja vamos la no http controller e pegamos cada um dos arquivos e pegamos as instanciações para fazer o factory deles.
fica assim:
import { PrismaUsersRepository } from '@/repositories/prisma/PrismaUsersRepository'
import { RegisterUseCase } from '../register'

export function makeRegisterUseCase() {
  const prismaUsersRepositories = new PrismaUsersRepository()
  const registerUseCase = new RegisterUseCase(prismaUsersRepositories) // the file that need a useCase is the file that will send the dependencies as params to the useCase

  return registerUseCase
}

agora a gente pode importar essa função la no nosso controler. porque ela ja volta instanciada.
agora no nosso controler fica assim:
try {
    const registerUseCase = makeRegisterUseCase()
    quando a gente precisa do register usecase é so a gente chamar essa função.

agora quando a gente precisar adicionar dependencias a gente pode fazer elas direto no factory que vai centralizar tudo e essa alteração vai se refletir em todos os lugares, sem precisar ser instanciado em cada um dos lugares e diversas vezes.
vamos fazer igual para o autenticate.

# user Progile
vamos fazer agora um caso de uso para pegar o perfil de um usuario logado.
vamos criar um caso de uso para isso que vamos chamar de get-uer-profile.ts dentro da pasta useCase
a gente pode pegar o caso de uso do autenticate e colar la e começar a alterar algumas cisas.
as interfaces vamos alterar os nomes
e dentro delas nos vamos receber apenas o id do usuario como parametro. na de request
interface GetUserProfileUseCaseRequest {
  userId: string
}
vai ser o id porque o id vai ser a unica informação do usuario que nos vamos ter acesso apos o usuario se autenticar.
assim ja mudamos tambem em todos os lugares que falava autenticate a gente muda para getUserProfile. tambem colocamos wue a execute recebe como parametro apenas o userId.
vamos agora no prisma usersRepository.ts e vamos fazer o metodo para o findByUserId
fica assim:
import { Prisma, User } from '@prisma/client'

export interface UsersRepository {
  findById(userId: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(data: Prisma.UserCreateInput): Promise<User>
}

agora vamos no inMemory e vamos colocar tambem o metodo do findBy Id podemos colocar ele abaixo do public Itens a gente pode fazer ele ja aproveitando o find by email que copimos e colamos. e mudamos o nome e tambem colocamos para ele receber o userId e não o email. e a gente compara o id e não o email como era no find by email. fica assim:
import { UsersRepository } from '@/repositories/users_repository'
import { Prisma, User } from '@prisma/client'

export class InMemoryUserRepository implements UsersRepository {
  public Itens: User[] = []

  async findById(id: string): Promise<User | null> {
    const user = this.Itens.find((item) => item.id === id)
    if (!user) {
      return null
    }
    return user
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.Itens.find((item) => item.email === email)
    if (!user) {
      return null
    }
    return user
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const user = {
      id: '145781475',
      name: data.name,
      email: data.email,
      password_hash: data.password_hash,
      created_at: new Date(),
    }
    this.Itens.push(user)
    return user
  }
}

com isso salvo voltamos para o get-user-profile.ts
na execute nossa cont user vai usar o findById e vai passar o userId.
nos vamos ter a condicional do usuario não existir que é muito comum termos essa condicional para o que estamos procurando não existir por isso podemos fazer um novo erro generico chamado reseurce-not-found-error.ts para tratarmos de todos os erros em que algo que a gente chama não existe.
vamos fazer umaexport class ResourceNotFoundError extends Error {
  constructor() {
    super('Resource not found')
  }
}

e agora la no nosso if(!user) a gente da nosso throw chamando esse erro.
apagamos a const de doesPasswrd match e retornamos o usuario a pagina fica assim:
import { UsersRepository } from '@/repositories/users_repository'
import { compare } from 'bcryptjs'
import { User } from '@prisma/client'
import { ResourceNotFoundError } from './errors/resource-not-found-erros'

interface GetUserProfileUseCaseRequest {
  userId: string
}
interface GetUserProfileUseCaseResponse {
  user: User
}
export class GetUserProfileUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userId,
  }: GetUserProfileUseCaseRequest): Promise<GetUserProfileUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    return { user }
  }
}

agora nos vamos fazer os testes para ele.
podemos aproveitar o autenticate éque é bem parecido.




