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

agora nos vamos fazer os testes para ele get-user-profile.spec.ts.
podemos aproveitar o autenticate éque é bem parecido.
vamos mudar o nome do describe para get user profile use case
e tambem a instanciação do before each usando o GetUserProfileUseCase
no let tambem vamos mudar para getuserProfileUseCase vamos ter so dois testes um para pegar o profile e um que de erro ao tentar pegar o profile
mudamos o nome dos testes.
nos nomeamos a criação do usuario como createdUser e assim podemos pegar o user id dele logo abaixo.
e vamos dar um expect que retorneo nome do usuario e a gente pode passar exatamento o nome dele pra ver se funciona
esse primeiro teste fica assim:
 test('if gets user profile', async () => {
    const createdUser = await userRepository.create({
      name: 'jhon doe',
      email: 'jhondoe@hotmail.com',
      password_hash: await hash('testpassword', 6),
    })

    const { user } = await sut.execute({
      userId: createdUser.id,
    })

    expect(user.name).toEqual('jhon doe')
    
  })

  o segundo teste vai ser se a gente passar um id errao entao nos mudamos o nome dele e passamos apenas um userId errado e mudamos o tipo de erro para o que o de resourse fica assim:
  test('if cannot get user with wrong id', async () => {
    await expect(() =>
      sut.execute({
        userId: 'wrong id',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  apagamos os outros testes e roamos o npm run test para ver a pagina fica assim:
  import { expect, test, describe, beforeEach } from 'vitest'
import { InMemoryUserRepository } from './in-memory/in-memory-user-repository'
import { hash } from 'bcryptjs'
import { GetUserProfileUseCase } from './get-user-profile'
import { ResourceNotFoundError } from './errors/resource-not-found-erros'

let userRepository: InMemoryUserRepository
let sut: GetUserProfileUseCase

describe('get user profile use case', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    sut = new GetUserProfileUseCase(userRepository)
  })

  test('if gets user profile', async () => {
    const createdUser = await userRepository.create({
      name: 'jhon doe',
      email: 'jhondoe@hotmail.com',
      password_hash: await hash('testpassword', 6),
    })

    const { user } = await sut.execute({
      userId: createdUser.id,
    })

    expect(user.name).toEqual('jhon doe')
  })
  test('if cannot get user with wrong id', async () => {
    await expect(() =>
      sut.execute({
        userId: 'wrong id',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})

nos vamos agora ficar um tempo mais focado nos usos de caso sem fazer os http de cada uso de aso por enquanto.
alem disso nas nossas factories tambem estao dando erro porque a gente não implementou o medoto que fizems no prismaUsersRepositories 
vamos implementar aqui, mas nas proximas vezes nos vamos deixar a parte do factories mais pra frente. então vamos na pasta repositories/primsa/prismaUsersRepostiries.ts
e la amos ver o erro e dar o implement fica assim:
import { prisma } from '@/lib/prisma'
import { Prisma, User } from '@prisma/client'
import { UsersRepository } from '../users_repository'

export class PrismaUsersRepository implements UsersRepository {
  findById(id: string): Promise<User | null> {
    throw new Error('Method not implemented.')
  }

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

agora os nossos factories não dão mais erro.
nos vamos deixar os register para mais tarde porque é outra camada, a camada de infra então vamos fazer os nossos usos de caso com seus testes por agora e depois passar para essa outra camada.

# caso de uso de checkin
vamos criar o arquivo checkin-Use-Case
vamos copar outro use case qualquer e colar nesse arquivo e mudar o nome do useCase
agora na interface do request vamos passar o que vamos precisar.
o id do usuario, o id da academia e por enquanto vai ser so isso. depois vamos adicionar mais coisas (provavelmente localidade e hora)
interface CheckinUseCaseRequest {
  userId: string
  gymId: string
}
e no response vamos retornar um checkIn: CheckIn sendo o segundo checkin importado do prisma
.
na construção de classe nos não vamos precisar do userRepository. nos vamos precisar de um novo repository que vamos fazer então vamos na pasta de repostitorye  criamos um novo arquivo.check-ins-repository.ts
vamos dar um export interface e colocar nela o mesmo metodo crete do users mas mudando algumas coisas trocando tudo q é user por checkin. fica assim:
import { CheckIn, Prisma } from '@prisma/client'

export interface CheckInRepository {
  create(data: Prisma.CheckInCreateInput): Promise<CheckIn>
}


agora podemos passar ele para o nosso constructor assim:
export class CheckInUseCase {
  constructor(private checkInRepository: CheckInRepository) {}

  no execute a gente desestrutura os dados user e gym Id no lugar do que tinha. fica assim:
   async execute({
    userId,
    gymId,
  }:

  e aora valos criar o check in dando uma const check in sendo igual ao await this.checkinRepository;create e apara o create a gente teria que passar o gim e o user id porem se a gente for olhar os parametros a gente não vai ter eles porque o prisma cria o checkincreateInput sem eles e o checkinUncheckedCreateInput que tem os parametros de relacionamento a ei eles aparecem. ou seja quando a gente estiver criando o checkin a gente vai estar tambem criando em uma outra tabela um registro desse relacionamento entre essas tabelas e o checkin.
  ou seja tem um que é feito para se quando a gente quiser fazer o checkin em um momento que o usuario e o gim ainda não existisse e a gente criaria eles tambem. mas não vai ser o caso para nos. então nos vamos usar o unchecked que é quando esses valores ja existem em nosso banco de dados.
  então vamos la no repository e mudamos para checkinUncheckedCreateInput assim:
  export interface CheckInRepository {
  create(data: Prisma.CheckInUncheckedCreateInput): Promise<CheckIn>
}
e agora o prisma ja reconhece automaticamente o nosso gymId e userId
   const checkIn = await this.checkInRepository.create({
      gym_id: gymId,
      user_id: userId,
    })
  }

temos que tipar porque esta escrito de maneira diferente acho que na taberla.

agora podemos dar um return checkin apagamos as importações que não usa e o use case fica assim:

import { CheckIn } from '@prisma/client'
import { CheckInRepository } from '@/repositories/check-ins-repository'

interface CheckInUseCaseRequest {
  userId: string
  gymId: string
}
interface CheckInUseCaseResponse {
  checkIn: CheckIn
}
export class CheckInUseCase {
  constructor(private checkInRepository: CheckInRepository) {}

  async execute({
    userId,
    gymId,
  }: CheckInUseCaseRequest): Promise<CheckInUseCaseResponse> {
    const checkIn = await this.checkInRepository.create({
      gym_id: gymId,
      user_id: userId,
    })
    return { checkIn }
  }
}


agora vamos escrever os testes para ela. 
para começar a fazer os testes vou criar um inmemory checkin repository
vamos apagar todos os metodos e so deixar o create vamos colocar para ele pegar o checkinunchecked do prisma voltamos rapidamente para o inmemody user e mudamos o id que esta como um numero la para um ramdom do cripto.
e na importação a gente coloca um node: na frente do crypto fica assim:
import { randomUUID } from 'node:crypto'
fazemos o mesmo no id do checkin e ai vamos colocar os outros campos que podem vir no checkin
  id?: string | undefined;
    created_at?: string | Date | undefined;
    validated_at?: string | Date | null | undefined;
    user_id: string;
    gym_id: string;
  
  nos vamos colocar o user e o gym peando de data.(eles) e para o validated_at a gente vai colocar que vai ser de data.validated_at caso isso exista vamos usar u new Date(validated_at) assim esse campo vai sempre ser uma data. caso não vamos colocar null. 
  nosso repository fica assim e agora podemos começar a escrever os testes.
  import { CheckInRepository } from '@/repositories/check-ins-repository'
import { CheckIn, Prisma } from '@prisma/client'
import { randomUUID } from 'node:crypto'

export class InMemoryCheckInsRepository implements CheckInRepository {
  public Itens: CheckIn[] = []

  async create(data: Prisma.CheckInUncheckedCreateInput): Promise<CheckIn> {
    const checkIn = {
      id: randomUUID(),
      user_id: data.user_id,
      gym_id: data.gym_id,
      validated_at: data.validated_at ? new Date(data.validated_at) : null,
      created_at: new Date(),
    }
    this.Itens.push(checkIn)
    return checkIn
  }
}

criamos o arquivo check-in.spec.ts
vamos copiar o register nele
deleta todos os testes menos o mais simples de registrar.
trocamos o repository que vamos usar
com a preparação do teste mudada ela fica assim:
import { expect, test, describe, beforeEach } from 'vitest'
import { InMemoryCheckInsRepository } from './in-memory/in-memory-check-in-repository'
import { CheckInUseCase } from './check-in'

let checkInsRepository: InMemoryCheckInsRepository
let sut: CheckInUseCase
describe('check-in use case', () => {
  beforeEach(() => {
    checkInsRepository = new InMemoryCheckInsRepository()
    sut = new CheckInUseCase(checkInsRepository)
  })

  agora vamos partir para o teste
  agora para o execute vamos passar o gym id e o user ID.
  porem se a gente passar um qualquer como gym01 e user01 tende a funcionar porque nos no nosso usecase a gente não faz uma verificação se esse usuario ou essa academia realmente existem entéao porenquanto vamos deixar assim:
    e no expect a gente passa o checkin id para ser igual uma string. o teste completo fica assim:import { expect, test, describe, beforeEach } from 'vitest'
import { InMemoryCheckInsRepository } from './in-memory/in-memory-check-in-repository'
import { CheckInUseCase } from './check-in'

let checkInsRepository: InMemoryCheckInsRepository
let sut: CheckInUseCase
describe('check-in use case', () => {
  beforeEach(() => {
    checkInsRepository = new InMemoryCheckInsRepository()
    sut = new CheckInUseCase(checkInsRepository)
  })
  test('if can check in', async () => {
    const { checkIn } = await sut.execute({
      gymId: 'gym01',
      userId: 'user01',
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })
})

# tdd
test driven develompemnt
ou seja devemos desenvolver o teste de uma regra de negocio antes da implementação daquilo o teste ja ajuda a validar se a implementação esta ok ou não.
então agora a gente tem feito o caso de uso e depois testamos ele. mas poderiamos fazer o caso contrario.
é uma metodologia, isso é opcional, pode funcionar para alguns e para outros não ser tão adequado.
as vezes é bom de fazer para coisas bem complicadas. ele facilita a gente entender e caminhar pelas regras de negocio enquanto fazemos.
vamos aplicara nessa funcionalidade
o usuario não pode fazer checkin no mesmo dia.
vamos nos testes de check in e copiar o test que a gente fez para adaptar ele a isso. a gente muda o nome do test para que não seja possivel fazer checkin duas vezes no mesmo dia para isso a gente vai fazer um primeiro checkin e depois vamos tentar fazer o segundo  e queremos que esse segundo seja rejeitado e que isso seja a instancia de um erro como a gente ainda não criou esse erro especifico a gente pode colocar o erro global. fica assim:
test('if cannot make check in twice in a day', async () => {
    await sut.execute({
      gymId: 'gym01',
      userId: 'user01',
    })

    await expect(() =>
      sut.execute({
        gymId: 'gym01',
        userId: 'user01',
      }),
    ).rejects.toBeInstanceOf(Error)
  })
})

salvando isso e rodando os testes ele vai dar erro no teste porque ele vai dizer que a promisse foi resolvida e não o erro como a gente esperada.
com isso estamos na pimeira etapa do tdd que é o red
ou seja a parte que o teste esta feita e como ainda não tem o que testar ele da erro. a proxima etapa que vamos buscar é o estado green
ou seja vamos codar o minimo possivel para que o teste fique verde. ou seja que ele passe. e o terceiro é o refractor.

o nosso teste unitario precisa ser o mais especifico possivel.
## moking e dates
usar datas em teste é sempre complicado principalmente quando usamos o new date porque a gente não consegue garantir que vamos estar trabalhando com a mesma data.
porque se a pesso rodar os testes no futuro a data que foi criada la no in memory vai ser diferente da data q ele vzai rodar.
entao sempre q a gente usar datas e teste vamos usar mocking que sao valores ficticios para dados.
o vitest ja tem uma estrategia interna para mokinf de datas. a gente pode passar o use fake timmer
a gente pode passar uma data especifica para cada vez que for usar o new date ele substituir por essa data especifica que criamos.
uma boa pratica e se colocarmos uma fakeTimer em um before each a gentre creiar um aftereach para voltar ao realTime, assim a gente zera o ambiente.
assim:
 beforeEach(() => {
    checkInsRepository = new InMemoryCheckInsRepository()
    sut = new CheckInUseCase(checkInsRepository)

    vi.useFakeTimers()
  })
  afterEach(()=>{
    vi.useRealTimers()
  })

  agora no teste a gente pode setar uma data. antes de criar o checkin a gente faz ul
  vi.setSystemTime( new Date(e aqui a gente passa o tempo).)
    test('if can check in', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0)) // o mes é zero porque janeiro é o index zero 
    const { checkIn } = await sut.execute({
      gymId: 'gym01',
      userId: 'user01',
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

assim ao rodar um teste a data que ele usa vai ser a que a gente setou.
agora para garantir que os dois checkins sao mesmo criados na mesma data basta a gente colocar um visetsystemtime.
esse nosso caso provavemente nao daria erro. mas é bom termos o costume de usar isso sempre que tiver data no meio.

como vamos agora garantir que nao tenhamos dois checkn in com a mesma data.
vamos no repository criar um novo metodo chamado findByUSerIdOnDate ele vai receber um userId e uma data e ele pode devolver um checkin ou nulo.
  findByUserIdOnDate(userId: string, date: Date): Promise<CheckIn | null>
esse metodo vai procurar se existe um checkin de um determinado usuario em uma determinada data.
agora la no nosso inmemory a gente tem que implementar isso.
 async findByUserIdOnDate(userId: string, date: Date): Promise<CheckIn | null> {
    throw new Error('Method not implemented.')
  }

colocamos isso acima e vamos implementar o metodo.
a gente vai fazer um find para ir la nos itens e ver se tem algum checkin userId igual ao userId que a gente esta recebendo como parametero. e caso não tenha retornamos nulo.
caso tenha a gente retorna o checkin on the same date.
fica assim:
async findByUserIdOnDate(
    userId: string,
    date: Date,
  ): Promise<CheckIn | null> {
    const checkInOnSameDate = this.Itens.find(
      (checkIn) => checkIn.user_id === userId,
    )
    if (!checkInOnSameDate) {
      return null
    }
    return checkInOnSameDate
  }

  ou seja nos acabamos nem usando a data.
  isso porque primeiro a gente faz so funcionar, depois a gente vai refatorar para funcionar como a ente quer.

  agora vamos no nosso useCase de chekin e antes de criar o checkin nos vamos verificar esse metodo.
      const checkInOnSameDay = await this.checkInRepository.findByUserIdOnDate(
      userId,
      new Date(),
    )
    colocamos isso logo antes da const checkin dentro do execute e ai vamos fazer um if(checkinonsameday) {
      throw new Error
    }
    ou seja se existir ja um checkin nesse dia ele vai disparar um erro. colocamos um erro generico porque primeiro so queremos fazer passar.
    a pagina fica assim:
    import { CheckIn } from '@prisma/client'
import { CheckInRepository } from '@/repositories/check-ins-repository'

interface CheckInUseCaseRequest {
  userId: string
  gymId: string
}
interface CheckInUseCaseResponse {
  checkIn: CheckIn
}
export class CheckInUseCase {
  constructor(private checkInRepository: CheckInRepository) {}
  async execute({
    userId,
    gymId,
  }: CheckInUseCaseRequest): Promise<CheckInUseCaseResponse> {
    const checkInOnSameDay = await this.checkInRepository.findByUserIdOnDate(
      userId,
      new Date(),
    )
    if (checkInOnSameDay) {
      throw new Error()
    }
    const checkIn = await this.checkInRepository.create({
      gym_id: gymId,
      user_id: userId,
    })
    return { checkIn }
  }
}

agora nossos testes ja devem passar. ou seja agora estamos na etapa green e agora temos que fazer o refactore.
antes do refactor podemos criar mais testes
com o tdd os testes podem ir guiando a gentepata ve o que esquecemos.
por exemplo temos que poder fazer dois checkin mas em dias diferentes.
fica parecido com o outro teste. a gente cria o primeiro check in a apos ele a gente seta de novo o tempo para o dia 21. e ai o checkin abaixo não pode mais dar erro.
então ao invez de rejects a gente coloca o segundo em uma const checkin e colocamos que a gente espera que ele devolva esse checkIn.id sendo igual a qualqiuer string.
fica assim o teste:
 test('if cannot make check in in different days', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))
    await sut.execute({
      gymId: 'gym01',
      userId: 'user01',
    })

    vi.setSystemTime(new Date(2022, 0, 21, 8, 0, 0))
    const { checkIn } = await sut.execute({
      gymId: 'gym01',
      userId: 'user01',
    })
    expect(checkIn.id).toEqual(expect.any(String))
  })
  porem se a gente rodar isso vai dar erro. porque como estamos validadno apenas por userId e não por dataele vai ignorar que as datas são diferentes e vai cair no mesmo erro que o outro cai. então agora temos que fazer esse ficar verde.
  TDD é isso, a gente vai escrevendo testes e vai fazendo esses testes ficarem vedes e ao escrever mais testes vamos percebendo coisas que temos que melhorar na nossa aplicação para que os outros testes passem a funcionar e que a gente possa cobrir furos que outros testes deixaram.
  
# validar a data
para trabalhar com essa data nos vamos instalar um pacote chamado dayjs
npm i dayjs
agora com esse pacote nos podemos fazer o inicio do dia e o fim do dia.
assim não vamos nos preocupar com com os horas minutos e segundos, vamos ter o nosso checkin so gravado no dia.
la no inmemory  a gente faz essa const dentro do metodo find by date
const startOfDay = dayjs(date).startOf('date')
ou seja estamos usando o dayjs para  date no javascript significa o dia, o day significa o dia da semana. por isso usamos o date.
isso vai fazer independente do horario do dia ele retornar sempre o dia com os horarios zerados. ai vai ficar tudo no mesmo dia
e vamos crir uma outra que vai ser o endofDay que vai usar o endOf no lugar do StartOf e a diferença vai se no endof day ele vai retornar o ultimo segundo do dia.
vamos agora nessa função e vamos mudar o checkin que temos por um return a mesma coisa
    const checkInOnSameDate = this.Itens.find(
      
      (checkIn) => checkIn.user_id === userId,
    )
     const checkInOnSameDate = this.Itens.find(
      

     return checkIn.user_id === userId,
    )

    e andet desse return vamos passar uma const chekin date para ser igual ao dayJspegando o checkin created at.
     const checkInDate = dayjs(checkIn.created_at)

     agora vamos dar uma const isSameDate e vamos pegar a nossa chackindate e buscar se ela é depois do startofDay e anterior ao endOfday 
     e no return vamos verificar o userId e o isOnsamedate fica assim:
     import { CheckInRepository } from '@/repositories/check-ins-repository'
import { CheckIn, Prisma } from '@prisma/client'
import dayjs from 'dayjs'
import { randomUUID } from 'node:crypto'

export class InMemoryCheckInsRepository implements CheckInRepository {
  public Itens: CheckIn[] = []
  async findByUserIdOnDate(
    userId: string,
    date: Date,
  ): Promise<CheckIn | null> {
    const startOfDay = dayjs(date).startOf('date')
    const endOfDay = dayjs(date).endOf('date')
    const checkInOnSameDate = this.Itens.find((checkIn) =>{
      const checkInDate = dayjs(checkIn.created_at)
      const isOnSameDate = checkInDate.isAfter(startOfDay) && checkInDate.isBefore(endOfDay)

     return checkIn.user_id === userId && isOnSameDate,
    } )
    if (!checkInOnSameDate) {
      return null
    }
    return checkInOnSameDate
  }

  async create(data: Prisma.CheckInUncheckedCreateInput): Promise<CheckIn> {
    const checkIn = {
      id: randomUUID(),
      user_id: data.user_id,
      gym_id: data.gym_id,
      validated_at: data.validated_at ? new Date(data.validated_at) : null,
      created_at: new Date(),
    }
    this.Itens.push(checkIn)
    return checkIn
  }
}

agora o nosso inmemory para testes ja esta fucnionando. os testes est éao passando.
nos podemos fazer dois checkins em dias diferentes
vamos pensaragora para o usuario não pode fazer checkin a mais de 100m da academia
agora vamos começar a trabalahar com o repositorio de academia para buscar a academia do banco de dados e saber onde ela esta.
vamos criar o gyms repository e la por enquanto vai ter so o metodo find by id:
import { Gym } from '@prisma/client'

export interface GymsRepository {
  findById(gymId: string): Promise<Gym | null>
}

vamos no inmemory criar um inmemory gyl repository copiamos o user e deixampos so o metodo findbyid e trocamos todos os users por gym:
import { Gym } from '@prisma/client'
import { GymsRepository } from '../gyms-repository'

export class InMemoryGymRepository implements GymsRepository {
  public Itens: Gym[] = []

  async findById(id: string): Promise<Gym | null> {
    const gym = this.Itens.find((item) => item.id === id)
    if (!gym) {
      return null
    }
    return gym
  }
}

agora dentro do useCase do checkin para determinar a localisação do usuario existem varias formas.
a gente vai precisar da latitude e longitude nos aumentamos isso então na interface do checkinrequest
interface CheckInUseCaseRequest {
  userId: string
  gymId: string
  userLatitude: string
  userLongitude: string
}

como a gente vai ter acesso a isso fica para depois, o caso de uso não se preocupa com isso, ele so se preocupa em se ele recebe o que precisa para funcionar.

e agora no nosso constructor ele vai precisar tambem do osso gymsRepository
export class CheckInUseCase {
  constructor(
    private checkInRepository: CheckInRepository,
    private gymsRepository: GymsRepository,
  ) {}

  e agora no nosso execute a gente pode procurar o gymid n o gymrepository assim:
      const gym = await this.gymsRepository.findById(gymId)
      e se a gente néao achar a gente pode dar trhwoe ew error resorce not found que a gente ja tinha criado fica assim:
       async execute({
    userId,
    gymId,
  }: CheckInUseCaseRequest): Promise<CheckInUseCaseResponse> {
    const gym = await this.gymsRepository.findById(gymId)
    if (!gym) {
      throw new ResourceNotFoundError()
    }

    agora se a cademia existir a gente precisa calcular a distancia entre o usuario e a academia e se a distancia for maior a gente da um erro de distancia invalida.
    porem antes de a gente comecar isso o nosso teste do chekin vai estar cheio de erro porque ele agora precisa de duas dependencias então temos que fazer um let gym repository mesmq coisa que a gente fez com o user.
    dessa forma:
    let checkInsRepository: InMemoryCheckInsRepository
let gymRepository: InMemoryGymRepository
let sut: CheckInUseCase
describe('check-in use case', () => {
  beforeEach(() => {
    checkInsRepository = new InMemoryCheckInsRepository()
    gymRepository = new InMemoryGymRepository()
    sut = new CheckInUseCase(checkInsRepository, gymRepository)

    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimer

    so que nas chamadas ainda a erro porque não estamos eviando a latitude e longitude em cada caso. em todos que não sao importante nos podemos passar como zero. 
    porem se a gente rodar os testes vai dar erro porque agora estamos validando se a acedmia existe ou não então quando a gente passa o gym1 ele não acha ela no banco de dados. então antes de passar isso a gente tem que cadastrar ela. como a gente não tem ainda o metodo create vamos apenas acessar o array de itens e dar um push nele e passar o id; gym-1. e as outras informações obrigatorias. sabendo que na latitude e longitude o prisma pede o decimal ent éao não vai ser 0 então vamos ter que passar new Decimal(0) o decimal temos que importar do prisma
     test('if can check in', async () => {
    gymRepository.Itens.push({
      id: 'gym01',
      title: 'academiaTeste',
      description: 'a melhor academia',
      phone: '',
      latitude: new Decimal(0),
      longitude: new Decimal(0),
    })
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))
    const { checkIn } = await sut.execute({
      gymId: 'gym01',
      userId: 'user01',
      userLatitude: 0,
      userLongitude: 0,
    })
    como todos os testes precisam dessa criação de academia a gente pode fazer ela no before each.
    a pagina fica assim
    import { expect, test, describe, beforeEach, vi, afterEach } from 'vitest'
import { InMemoryCheckInsRepository } from '../repositories/in-memory/in-memory-check-in-repository'
import { CheckInUseCase } from './check-in'
import { InMemoryGymRepository } from '@/repositories/in-memory/in-memory-user-repository'
import { Decimal } from '@prisma/client/runtime/library'

let checkInsRepository: InMemoryCheckInsRepository
let gymRepository: InMemoryGymRepository
let sut: CheckInUseCase
describe('check-in use case', () => {
  beforeEach(() => {
    checkInsRepository = new InMemoryCheckInsRepository()
    gymRepository = new InMemoryGymRepository()
    sut = new CheckInUseCase(checkInsRepository, gymRepository)
    gymRepository.Itens.push({
      id: 'gym01',
      title: 'academiaTeste',
      description: 'a melhor academia',
      phone: '',
      latitude: new Decimal(0),
      longitude: new Decimal(0),
    })

    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })
  test('if can check in', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))
    const { checkIn } = await sut.execute({
      gymId: 'gym01',
      userId: 'user01',
      userLatitude: 0,
      userLongitude: 0,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  test('if cannot make check in twice in a day', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))
    await sut.execute({
      gymId: 'gym01',
      userId: 'user01',
      userLatitude: 0,
      userLongitude: 0,
    })

    await expect(() =>
      sut.execute({
        gymId: 'gym01',
        userId: 'user01',
        userLatitude: 0,
        userLongitude: 0,
      }),
    ).rejects.toBeInstanceOf(Error)
  })
  test('if cannot make check in in different days', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))
    await sut.execute({
      gymId: 'gym01',
      userId: 'user01',
      userLatitude: 0,
      userLongitude: 0,
    })

    vi.setSystemTime(new Date(2022, 0, 21, 8, 0, 0))
    const { checkIn } = await sut.execute({
      gymId: 'gym01',
      userId: 'user01',
      userLatitude: 0,
      userLongitude: 0,
    })
    expect(checkIn.id).toEqual(expect.any(String))
  })
})

eu tinha feito um erro de ter criado o gym repository dentro do user. eu modificiquei isso e a importação no checkin.spec. agora esta tudo certo. é so tomar cuidado com a importação uma vez que aqui no manual eu coloquei o titulo correto para os arquivos do inmemory gym e inmemory user.

# teste de chekckin longe da academia
para esse testenos vamos replicar o teste de checkin e fazer um teste chamado test if cnnot checkin in distant gym ele vai ter cpiar esse teste de checkin
test('if can check in', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))
    const { checkIn } = await sut.execute({
      gymId: 'gym01',
      userId: 'user01',
      userLatitude: 0,
      userLongitude: 0,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })
  nos botamos distante e não a distancia especifica porque no futuro essa distancia pode mudar.
  nos vamos abrir o mpara encontrar duas localizações que tem pelo menu pegar a distancia que elão vouabir o maps vou pegar a distancia que ele s dizem no rocketseat.
  vamos pegar a parte que a gente cria a academia e vamos copiar ela dentro desse teste.
  vamos criar uma nova academia dentro do repositorio com id 02
  e na latitude longitude a gente vai passar as que podemos pegar do google dentro do new decial. fica assim:
   gymRepository.Itens.push({
      id: 'gym02',
      title: 'academiaTeste',
      description: 'a melhor academia',
      phone: '',
      latitude: new Decimal(-27.8747279),
      longitude: new Decimal(-49.4889672),
    })
    com isso criamos uam nova academia com oa latitude e longitude agora vamos ppassar para o usuario uma latitude e longitude acam c100m da acatancia maior uque essa da acade 100m da academia. vamos dar isso dentro de uma promsse ent#ão o await antes e tem que voltar um rejects sendo um erro. fica asim:
   test('if cannot check in distant gym', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))
    gymRepository.Itens.push({
      id: 'gym02',
      title: 'academiaTeste',
      description: 'a melhor academia',
      phone: '',
      latitude: new Decimal(-27.8747279),
      longitude: new Decimal(-49.4889672),
    })

    await expect(() => {
      sut.execute({
        gymId: 'gym01',
        userId: 'user01',
        userLatitude: -27.2982852,
        userLongitude: -49.6481891,
      })
    }).rejects.toBeInstanceOf(Error)
  })
})

se a gente rodar o teste agora vai falhar porque ele pes ite qunocirar distancia.
dentro do nosso caso de uso a gente ja tem o que precisamos. a gente tem nosparametros a latitude e longitude do usuario e temos tambvem acesso a da academia.
nos parametros do execute então vamos passar o latitude e longitude assim:
 async execute({
    userId,
    gymId,
    userLatitude,
    userLongitude
  }: CheckInUseCaseRequest): Promise<CheckInUseCaseResponse> {

  porem para calclar a distancia não é téao siples vamos criar uma pasta chamada utils no src para armazenar esse calculo. nela vamos criar um arquivo chamado: get-distance-between-coordinates.ts
  nessa pagina vamos fazer uma interface chamada coordinate com latitude e longitude sendo numeros
  e ela vai exportar uma função que vai calcular de coordinates para coordinates fica assim:
  export interface Coordinate {
  latitude: number
  longitude: number
}

export function GetDistanceBetweenCoordinates(
  from: Coordinates,
  to: Coordinate,
) {}

tem uma função de calculo naval complicada para resolver isso a gente vai simplemsente copiar e colar ela dentro dessa funçéao que a gente fez. vou copiar aqui tambem

## funcão calculo naval latitude e longitude 

export interface Coordinate {
  latitude: number
  longitude: number
}

export function getDistanceBetweenCoordinates(
  from: Coordinate,
  to: Coordinate,
) {
  if (from.latitude === to.latitude && from.longitude === to.longitude) {
    return 0
  }

  const fromRadian = (Math.PI * from.latitude) / 180
  const toRadian = (Math.PI * to.latitude) / 180

  const theta = from.longitude - to.longitude
  const radTheta = (Math.PI * theta) / 180

  let dist =
    Math.sin(fromRadian) * Math.sin(toRadian) +
    Math.cos(fromRadian) * Math.cos(toRadian) * Math.cos(radTheta)

  if (dist > 1) {
    dist = 1
  }

  dist = Math.acos(dist)
  dist = (dist * 180) / Math.PI
  dist = dist * 60 * 1.1515
  dist = dist * 1.609344

  return dist
}

essa função retorna em kilometros a distancia entre dois pontos.
agora no nosso caso de uso de checkin a gente vai fazer uma const distance = getdistance betewcoordinates
podemos passar em qualqeur ordem vamos passar dois objetso uma com a user latitude e longitude e outro com a gym latitude e longitude no caso do gym o prisma salva como decimal então temos que usar a funcção toNumber() para adaptara ao numero do javascript.
const distance = getDistanceBetweenCoordinates(
      { latitude: userLatitude, longitude: userLongitude },
      { latitude: gym.latitude.toNumber(), longitude: gym.longitude.toNumber() },
    ) {

    }
* cuidado para não errar longitude com latitude porque o erro da muito errado.
agora fazemos um if(distance ) for maior wue à.1 que é 100m ele vai disparar um erro.
mas ja vamos vazer uma cont maxdistance = 0.1 assim a gente troca o 0.1 ali por maxdistance e fica mais claro para o codigo para entender oq é. tavew ate melhor maxdistanceInKM. ficpi assim:
: CheckInUseCaseRequest): Promise<CheckInUseCaseResponse> {
    const gym = await this.gymsRepository.findById(gymId)
    if (!gym) {
      throw new ResourceNotFoundError()
    }

    const distance = getDistanceBetweenCoordinates(
      { latitude: userLatitude, longitude: userLongitude },
      {
        latitude: gym.latitude.toNumber(),
        longitude: gym.longitude.toNumber(),
      },
    )
    const maxDistanceInKM = 0.1
    if (distance > maxDistanceInKM) {
      throw new Error()
    }

porem agora esse é o unico teste que vai passar (néao no nosso caso).
todos os outros vao dar erro agora para ele porque ele tinha passado uma distancia real para o usuario mas uma Zero para academia, como nos passamos zero tanteo para todos os usuarios quanto para a academia do beforeeach da certo.
.

# useCase criação de academia
fazemos um arquivo chamado creategym. para o use case e em todos os RegisterUseCase a gente muda para create Gym UseCase
nos pavamos passar as coisas que são para a criação de uma gyl
upcional é diferente de nulo por isso não colocamos a descrição como opcional. isso porque ao criar uma academia com a descrição vazia a gente pode simplismente não eviar a descriçéao. mas para atualizar se a gente não envia a descrição a gente não quer mexer ele e não atualizar para vazio. por isso que as vezes tambem temos opcional e nulo.
interface CreateGymUseCaseParams {
  title: string
  description: string | null
  phone: string
  latitude: number
  longitude: number
}
na interface da resposta a gente passa o gym do prisma client
no constructor pegamos o gym repository
no execute passamos as coisa que o interface pede (title description etc
)
e deletamos tudo que não é o create.
para ter acesso ao metodo create a gente tem que criar ele no gym repository. fica assim:
import { Gym, Prisma } from '@prisma/client'

export interface GymsRepository {
  findById(gymId: string): Promise<Gym | null>
  create(data: Prisma.GymCreateInput): Promise<Gym>
}

agora nossa pagina create-gym.ts fica assim usando o metodo e passando para ele as coisas que o gym recebe:
import { hash } from 'bcryptjs'
import { UserAlreadyExistsError } from './errors/user-already-exists'
import { Gym } from '@prisma/client'
import { GymsRepository } from '@/repositories/gyms-repository'

interface CreateGymUseCaseParams {
  title: string
  description: string | null
  phone: string
  latitude: number
  longitude: number
}
interface CreateGymUseCaseResponse {
  gym: Gym
}
export class CreateGymUseCase {
  constructor(private gymsRepository: GymsRepository) {}

  async execute({
    title,
    description,
    phone,
    latitude,
    longitude,
  }: CreateGymUseCaseParams): Promise<CreateGymUseCaseResponse> {
    const gym = await this.gymsRepository.create({
      title,
      description,
      phone,
      latitude,
      longitude,
    })

    return { gym }
  }
}
agora vamos no inMemory
e colocamos a função create para receber as coisas que vem do data. porem o latitude e longitude estao como decial nos temos que converter o que recebemos para esse sistema. tambem o description e phone podem ser nulos então temos que dar essa possibilidade usando o ?? fica assim:
 async create(data: Prisma.GymCreateInput): Promise<Gym> {
    const gym = {
      id: randomUUID(),
      title: data.title,
      description: data.description ?? null,
      phone: data.phone ?? null,
      latitude: new Prisma.Decimal(data.latitude.toString()),
      longitude: new Prisma.Decimal(data.longitude.toString()),
      created_at: new Date(),
    }
    this.Itens.push(gym)
    return gym
  }
}

e aggora a gente pode voltar ao nosso caso de uso. ele fica assim:
import { hash } from 'bcryptjs'
import { UserAlreadyExistsError } from './errors/user-already-exists'
import { Gym } from '@prisma/client'
import { GymsRepository } from '@/repositories/gyms-repository'

interface CreateGymUseCaseParams {
  title: string
  description: string | null
  phone: string
  latitude: number
  longitude: number
}
interface CreateGymUseCaseResponse {
  gym: Gym
}
export class CreateGymUseCase {
  constructor(private gymsRepository: GymsRepository) {}

  async execute({
    title,
    description,
    phone,
    latitude,
    longitude,
  }: CreateGymUseCaseParams): Promise<CreateGymUseCaseResponse> {
    const gym = await this.gymsRepository.create({
      title,
      description,
      phone,
      latitude,
      longitude,
    })

    return { gym }
  }
}

vamos agrora criar o create gy spec.ts e copiar o de registro pra dentro dele. apagar tudo e deixar so o de criação.
e mudamos o que tem user para gym. depois passamos as caracteristicas aqui escolhemos dar uma latitude e longitude real. a pagina fica assim:
import { expect, test, describe, beforeEach } from 'vitest'
import { InMemoryGymRepository } from '@/repositories/in-memory/in-memory-gym-repository'
import { CreateGymUseCase } from './create-gym'

let gymRepository: InMemoryGymRepository
let sut: CreateGymUseCase
describe('create gym use case', () => {
  beforeEach(() => {
    gymRepository = new InMemoryGymRepository()
    sut = new CreateGymUseCase(gymRepository)
  })
  test('if creation happens', async () => {
    const { gym } = await sut.execute({
      title: 'gym01',
      description: 'gym Description',
      phone: '0108074561',
      latitude: 27.8747279,
      longitude: -49.4889672,
    })

    expect(gym.id).toEqual(expect.any(String))
  })
})


agora todos os testes estão passando. 
agora podemos ir no cjeck in e aproveitar oo nosso metodo de criação de academia para parar de fazer o push nos itensm ara criar a academia.
tinha um pequeno erro  o checkin spec o arquivo correto fica assim:
import { expect, test, describe, beforeEach, vi, afterEach } from 'vitest'
import { InMemoryCheckInsRepository } from '../repositories/in-memory/in-memory-check-in-repository'
import { CheckInUseCase } from './check-in'
import { InMemoryGymRepository } from '@/repositories/in-memory/in-memory-gym-repository'
import { Decimal } from '@prisma/client/runtime/library'

let checkInsRepository: InMemoryCheckInsRepository
let gymRepository: InMemoryGymRepository
let sut: CheckInUseCase
describe('check-in use case', () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository()
    gymRepository = new InMemoryGymRepository()
    sut = new CheckInUseCase(checkInsRepository, gymRepository)
    await gymRepository.create({
      id: 'gym01',
      title: 'academiaTeste',
      description: 'a melhor academia',
      phone: '',
      latitude: 0,
      longitude: 0,
    })

    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })
  test('if can check in', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))
    const { checkIn } = await sut.execute({
      gymId: 'gym01',
      userId: 'user01',
      userLatitude: 0,
      userLongitude: 0,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  test('if cannot make check in twice in a day', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))
    await sut.execute({
      gymId: 'gym01',
      userId: 'user01',
      userLatitude: 0,
      userLongitude: 0,
    })

    await expect(() =>
      sut.execute({
        gymId: 'gym01',
        userId: 'user01',
        userLatitude: 0,
        userLongitude: 0,
      }),
    ).rejects.toBeInstanceOf(Error)
  })
  test('if cannot make check in in different days', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))
    await sut.execute({
      gymId: 'gym01',
      userId: 'user01',
      userLatitude: 0,
      userLongitude: 0,
    })

    vi.setSystemTime(new Date(2022, 0, 21, 8, 0, 0))
    const { checkIn } = await sut.execute({
      gymId: 'gym01',
      userId: 'user01',
      userLatitude: 0,
      userLongitude: 0,
    })
    expect(checkIn.id).toEqual(expect.any(String))
  })
  test('if cannot check in distant gym', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))
    gymRepository.Itens.push({
      id: 'gym02',
      title: 'academiaTeste',
      description: 'a melhor academia',
      phone: '',
      latitude: new Decimal(-27.8747279),
      longitude: new Decimal(-49.4889672),
    })

    await expect(() => {
      sut.execute({
        gymId: 'gym01',
        userId: 'user01',
        userLatitude: -27.2982852,
        userLongitude: -49.6481891,
      })
    }).rejects.toBeInstanceOf(Error)
  })
})


agora voltamos ma para o nosso inmemorygymrepository porque nos podemos receber um id no data. então vamos colocar para se a gente receber um id a gente usar ele se néao criarmos um. fica assim:
import { Gym, Prisma } from '@prisma/client'
import { GymsRepository } from '../gyms-repository'
import { randomUUID } from 'crypto'

export class InMemoryGymRepository implements GymsRepository {
  public Itens: Gym[] = []

  async findById(id: string): Promise<Gym | null> {
    const gym = this.Itens.find((item) => item.id === id)
    if (!gym) {
      return null
    }
    return gym
  }

  async create(data: Prisma.GymCreateInput): Promise<Gym> {
    const gym = {
      id: data.id ?? randomUUID(),
      title: data.title,
      description: data.description ?? null,
      phone: data.phone ?? null,
      latitude: new Prisma.Decimal(data.latitude.toString()),
      longitude: new Prisma.Decimal(data.longitude.toString()),
      created_at: new Date(),
    }
    this.Itens.push(gym)
    return gym
  }
}
com essa alteração a nossa criação de academia nos testes com id especifico vai funcionatr.
vamos agora criar um novo erro para nõa deixar os erros genericos no caso de uso de checkin
vamos criar o max-distance-error.ts
e la dentro como os outros erros passamos o constructor e a super.
export class MaxDistanceError extends Error {
  constructor() {
    super('Max distance reached')
  }
}
agora la no checkin a gente passa esse erro para esse caso.
vamos criar um segundo erro chamado
max-number-of-checkin-error.ts
e fazer um erro como o de cima neme so que passando o nome correto e a msg correta.
na pagina de checkin a gente coloca um erro no checkin on same day e outro no distance.
a pagina fica assim:
import { CheckIn } from '@prisma/client'
import { CheckInRepository } from '@/repositories/check-ins-repository'
import { GymsRepository } from '@/repositories/gyms-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-erros'
import { getDistanceBetweenCoordinates } from '@/utils/get-distance-between-coordinates'
import { MaxDistanceError } from './errors/max-distance-error'
import { MaxNumberOfCheckinError } from './errors/max-number-of-checkin-error'

interface CheckInUseCaseRequest {
  userId: string
  gymId: string
  userLatitude: number
  userLongitude: number
}
interface CheckInUseCaseResponse {
  checkIn: CheckIn
}
export class CheckInUseCase {
  constructor(
    private checkInRepository: CheckInRepository,
    private gymsRepository: GymsRepository,
  ) {}

  async execute({
    userId,
    gymId,
    userLatitude,
    userLongitude,
  }: CheckInUseCaseRequest): Promise<CheckInUseCaseResponse> {
    const gym = await this.gymsRepository.findById(gymId)
    if (!gym) {
      throw new ResourceNotFoundError()
    }

    const distance = getDistanceBetweenCoordinates(
      { latitude: userLatitude, longitude: userLongitude },
      {
        latitude: gym.latitude.toNumber(),
        longitude: gym.longitude.toNumber(),
      },
    )
    const maxDistanceInKM = 0.1
    if (distance > maxDistanceInKM) {
      throw new MaxDistanceError()
    }

    const checkInOnSameDay = await this.checkInRepository.findByUserIdOnDate(
      userId,
      new Date(),
    )
    if (checkInOnSameDay) {
      throw new MaxNumberOfCheckinError()
    }
    const checkIn = await this.checkInRepository.create({
      gym_id: gymId,
      user_id: userId,
    })
    return { checkIn }
  }
}

# historico de chekin useCase
vamos fazer o use case do historico de checki s ele tem a particularidade de uma paginação de 120 itens por pagina então tgambem vamos ter que nos preocupar com isso no futudo.
vamos la no usesCases e criar um arquivo para isso.
fetch-user-chickins-history.ts
na nomenclatura a gente pode usar o fetch para sinalizar que vamos pegar varias informações o get para sinalizar que vai ser uma so informação. mas isso não é uma obrigação e nem todo mundo usa essa mesma nomenclatura.
vamos ja deixar tambem o teste feito mesmo nome com spec nele.
vamos copiar e colar o caso de uso de checkins de la 
na nossa interface a gente diz que vai receber apenas um id e vamos retornar uma lista de checkins por isso colocamos ul array. fica assim:
interface FetchUserCheckinHistoryUseCaseRequest {
  userId: string
}
interface FetchUserCheckinHistoryUseCaseResponse {
  checkIns: CheckIn[]
}
no execute a gente recebe o userId. e no repository so colocamos o checkinreposit
so que no nosso repository nosprecisamos fazer um novo metodo chamado  findManyByUserId(userId: string): Promise<CheckIn[]>
 para achar varios checkins o many significa que vai devolver um lista na nossa semantica aqui de nomes. enquanto quando tem so findBy singifica que vai devolver so um.
agora vamos no inmemory checkinrepository para implementar o nosso metodo.
  async findManyByUserId(userId: string): Promise<CheckIn[]> {
    return this.Itens.filter((item) => item.user_id === userId)
  }

  agora voltamos para o nosso useCase e usamos esse metodo passanod o userId para ter uma lista de checkins.
  pagina fica assim:
  import { CheckIn } from '@prisma/client'
import { CheckInRepository } from '@/repositories/check-ins-repository'

interface FetchUserCheckinHistoryUseCaseRequest {
  userId: string
}
interface FetchUserCheckinHistoryUseCaseResponse {
  checkIns: CheckIn[]
}
export class FetchUserCheckinHistoryUseCase {
  constructor(private checkInRepository: CheckInRepository) {}

  async execute({
    userId,
  }: FetchUserCheckinHistoryUseCaseRequest): Promise<FetchUserCheckinHistoryUseCaseResponse> {
    const checkIns = await this.checkInRepository.findManyByUserId(userId)

    return { checkIns }
  }
}

agora vamos para os testes
podemos copiar o teste do checkin
apagamos tudo menos o primeiro teste.
tiramos os faketimers e a academia..
a gente muda os SUT
let checkInsRepository: InMemoryCheckInsRepository
let sut: FetchUserCheckinHistoryUseCase

describe('Fetch user check-ins history use case', () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository()
    sut = new FetchUserCheckinHistoryUseCase(checkInsRepository)
  })

  agora no teste a gente tem que criar dois checkins em duas acadamias:
   await checkInsRepository.create({
        gym_id: 'gym01',
        user_id:'user01',
    })
    await checkInsRepository.create({
        gym_id: 'gym02',
        user_id:'user01',
    })

    agora quando a ente for fazer nosso expects a primeira coisa que a gente pode verificar é que a lista tenha um tamanhoo de dois  expect(checkIns).toHaveLength(2)
    vamos fazer outro expect que esse checkins seja iguam a um array com dois objetos e esses objetos tem que conter o gymid sendo 01 e o outro sendo 02
    fica assim
     expect(checkIns).toEqual([
      expect.objectContaining({ gym_id: 'gym01' }),
      expect.objectContaining({ gym_id: 'gym02' }),
    ])
    com isso os checkins coprovam que são listados.
    mas ainda falta a parte de paginação
    vamos começar pelos teste.
    a gente vai copiar o teste anterior e colar mudando o nome para 
    if can have 20 check ins per page

    como sao 20 ao invez de a grnte copiar o codigo 20 vezes de criação a gente coloca detro de um for
       for (let i = 1; i <= 22; i++) {
      await checkInsRepository.create({
        gym_id: `gym${i}`,
        user_id: 'user01',
      })
    }
    ou seja enquanto for menor de 22 ele vai rodar essa função e a cada vez ele vai incrementar 1 e o numero da gym vai ser sempre o mesmo numero do i
    agora voltamos no caso de uso e no interface a gente coloca uma page
    interface FetchUserCheckinHistoryUseCaseRequest {
  userId: string
  page: number
}

assim se gente no tete mandar uma pagina como page 2 devem ter 2 elemento dentro porque a segunda pagin vai ter o excedente de 20
 test('if can have 20 check ins per page', async () => {
    for (let i = 1; i <= 22; i++) {
      await checkInsRepository.create({
        gym_id: 'gym01',
        user_id: 'user01',
      })
    }

    const { checkIns } = await sut.execute({
      userId: 'user01',
      page: 2,
    })

    expect(checkIns).toHaveLength(2)
  })

  agora para fazer esse teste funcionar la no nosso repository e passar tambem a page
    findManyByUserId(userId: string, page: number): Promise<CheckIn[]>
  
  agora no inmemory onde a gente implementa os metodos a gente esta filtrando. mas para dar so 20 a gente pode dar um slice.
  no slice a gente pode pegar do numero da pagina-1 ou seja se for page1 ele nos devolve o indce0 do array vezes 20 porque assim se estiver na pagina 2 ele vai pra 1 * 20 e começa o registro do indice 20 do array. e o segundo argumento é so page * 20
  fica assim:
   async findManyByUserId(userId: string, page: number): Promise<CheckIn[]> {
    return this.Itens.filter((item) => item.user_id === userId).slice(
      (page - 1) * 20,
      page * 20,
    )
  }
}
temos que passar a page no nosso useCase como parametro. o useCase fica assim:
import { CheckIn } from '@prisma/client'
import { CheckInRepository } from '@/repositories/check-ins-repository'

interface FetchUserCheckinHistoryUseCaseRequest {
  userId: string
  page: number
}
interface FetchUserCheckinHistoryUseCaseResponse {
  checkIns: CheckIn[]
}
export class FetchUserCheckinHistoryUseCase {
  constructor(private checkInRepository: CheckInRepository) {}

  async execute({
    userId,
    page,
  }: FetchUserCheckinHistoryUseCaseRequest): Promise<FetchUserCheckinHistoryUseCaseResponse> {
    const checkIns = await this.checkInRepository.findManyByUserId(userId, page)

    return { checkIns }
  }
}

# caso de uso metricas

vamos fazer um useCase para obter o numero de checkins feitos pelo usuario.
vamos fazer um arquivo chamado get-user-metrics.ts
e vamos copiar o checkin hitsoty
e trocamos os nomes por GetUserMetricsUseCase
vamos so precisar passar o userIr no request e a resposta vai ser o checkincount como sendo um numero.
interface GetUserMetricsUseCaseRequest {
  userId: string
}
interface GetUserMetricsUseCaseResponse {
  checkInsCount: number
}

agora vamos la no nosso checkin repository para criar um metodo chamado countByUserId
  countByUserId(userId: string): Promise<number>

  agora vamos no inmemory e implementamos ele. a gente passa o userId diz que a promisse vai ser um number e ai a gente retorna a filtragem pelo userId e da um .length para ele retornar o tamanho.
    async countByUserId(userId: string): Promise<number> {
    return this.Itens.filter((item) => item.user_id === userId).length
  }


e agora a gente volta la no nosso getUserMetrics e faz os ajustes para os nomes retira o page e etc fica assim
import { CheckInRepository } from '@/repositories/check-ins-repository'

interface GetUserMetricsUseCaseRequest {
  userId: string
}
interface GetUserMetricsUseCaseResponse {
  checkInsCount: number
}
export class GetUserMetricsUseCase {
  constructor(private checkInRepository: CheckInRepository) {}

  async execute({
    userId,
  }: GetUserMetricsUseCaseRequest): Promise<GetUserMetricsUseCaseResponse> {
    const checkInsCount = await this.checkInRepository.countByUserId(userId)
    return { checkInsCount }
  }
}

vamos agora criar o test
get-user-metrics.spec.ts
copiamos e colamos o hystory

mudamos os nomes do describe/sut e etc para bater com getUserMetrics
o cabeçalho fica assim:
import { expect, test, describe, beforeEach } from 'vitest'
import { InMemoryCheckInsRepository } from '../repositories/in-memory/in-memory-check-in-repository'
import { GetUserMetricsUseCase } from './get-user-metrics'

let checkInsRepository: InMemoryCheckInsRepository
let sut: GetUserMetricsUseCase

describe('get user metrics use case', () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository()
    sut = new GetUserMetricsUseCase(checkInsRepository)
  })

agora a gente deixa so o test que ele faz os dois checkins. tiramos a pagina. mudamos o nome de checkins para checkinsCounts e o resultado deve ser igual a 2. a pagina de teste fica assim:
import { expect, test, describe, beforeEach } from 'vitest'
import { InMemoryCheckInsRepository } from '../repositories/in-memory/in-memory-check-in-repository'
import { GetUserMetricsUseCase } from './get-user-metrics'

let checkInsRepository: InMemoryCheckInsRepository
let sut: GetUserMetricsUseCase

describe('get user metrics use case', () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository()
    sut = new GetUserMetricsUseCase(checkInsRepository)
  })

  test('if can get checkin counts from metrics', async () => {
    await checkInsRepository.create({
      gym_id: 'gym01',
      user_id: 'user01',
    })
    await checkInsRepository.create({
      gym_id: 'gym02',
      user_id: 'user01',
    })
    const { checkInsCount } = await sut.execute({
      userId: 'user01',
    })

    expect(checkInsCount).toEqual(2)
  })
})

# cso de uso de busca de academias
vamos fazer um arquivo chamado searchGyms.ts e vamos copiar o create Gyms para ele
a gente muda os nomes como sempre.
na interface de request a gente vai colocar uma query com uma string. e vamos paginar tambem então vamos colocar page number tambem. e isso vai retornar uma lista de academias ou seja a resposta vai ter que ser gym [ ] array.
interface SearchGymUseCaseParams {
  query: string
  page: number
}
interface SearchGymUseCaseResponse {
  gyms: Gym[]
}

no execute a gente passa a query e a page e agente vai para o repositorio criar um novo metodo.
  searchMany(query: string, page: number): Promise<Gym[]>

  a gente colocou so searchMany porque no futuro a ente pode implementar e não usar so o titulo para pesquisar, ai o nome ja esta correto. podem=ndo receber searchMany por varias coisas.
  agora vamos no gym in memory para implementar esse metodo. vamos fazer essa função retornar o this. filtrando por itens todos os que tiverem titulos que incluam a query e depois vbamos paginar isso de page -1 a 20 e depois de page * 20. fica assim:
    async searchMany(query: string, page: number) {
    return this.Itens.filter((item) => item.title.includes(query)).slice(
      (page - 1) * 20,
      page * 20,
    )
  }

  agora voltando para o nosso useCase a gente muda a função para a searchMany e passa para ele o query e a pagina . e a gente retorna o gyms como a interface pede. fica assim:
  import { Gym } from '@prisma/client'
import { GymsRepository } from '@/repositories/gyms-repository'

interface SearchGymUseCaseParams {
  query: string
  page: number
}
interface SearchGymUseCaseResponse {
  gyms: Gym[]
}
export class SearchGymUseCase {
  constructor(private gymsRepository: GymsRepository) {}

  async execute({
    query,
    page,
  }: SearchGymUseCaseParams): Promise<SearchGymUseCaseResponse> {
    const gyms = await this.gymsRepository.searchMany(query, page)

    return { gyms }
  }
}


agora vamos para os testes.

vamos pegar o fetchuserCheckin test para reaproveitar.
vamos trocar todos os inmemory importação instanciação e etc 
fica assim:
import { InMemoryGymRepository } from '@/repositories/in-memory/in-memory-gym-repository'
import { expect, test, describe, beforeEach } from 'vitest'
import { SearchGymUseCase } from './search-gyms'

let gymsRepository: InMemoryGymRepository
let sut: SearchGymUseCase

describe('search gyms use case', () => {
  beforeEach(async () => {
    gymsRepository = new InMemoryGymRepository()
    sut = new SearchGymUseCase(gymsRepository)
  })

agora vamos mudar o nome do teste e vamos criar duas academias. uma com o titulo javascript gym e a outra com o titulo a criação das duas academias ficam assim:
  test('if can search gms', async () => {
    await gymsRepository.create({
      title: 'javascript gym',
      description: 'gym Description',
      phone: '0108074561',
      latitude: 27.8747279,
      longitude: -49.4889672,
    })
    await gymsRepository.create({
        title: 'typescript gym',
        description: 'gym Description',
        phone: '0108074561',
        latitude: 27.8747279,
        longitude: -49.4889672,
    })

    agora no nosso sut execute a gente recebe as gyms e passa como query
    e no expect a gente pode colocar que esta esperando que  length seja 1 e em outro expect um objeto contendo como title o query qeu a gente passou e vamos dar um skip no teste sequente porque ainda não ajeitamos ele.
    nosso teste fica assim:
      test('if can search gms', async () => {
    await gymsRepository.create({
      title: 'javascript gym',
      description: 'gym Description',
      phone: '0108074561',
      latitude: 27.8747279,
      longitude: -49.4889672,
    })
    await gymsRepository.create({
      title: 'typescript gym',
      description: 'gym Description',
      phone: '0108074561',
      latitude: 27.8747279,
      longitude: -49.4889672,
    })
    const { gyms } = await sut.execute({
      query: 'javascript',
      page: 1,
    })

    expect(gyms).toHaveLength(1)
    expect(gyms).toEqual([expect.objectContaining({ title: 'javascript gym' })])
  })
  agora vamos para o teste que skipamos.
  aproveitamos nosso hook que ja esta feito e passamos para ele um monte de academias.
    for (let i = 1; i <= 22; i++) {
      await gymsRepository.create({
        title: `typescript gym${1}`,
        description: 'gym Description',
        phone: '0108074561',
        latitude: 27.8747279,
        longitude: -49.4889672,
      })
    }
    e no sut aexecute a gente vai puxar o gyms vai passar para ele um query e ua pagina 2 e a gente espera que tenhade lenght a pagina fica assim:
    
 # buscar academias proximas
    vamos criar um novo caso de uso chamado fetch-nearby-gyms.ts
    vamos copiar a estrutura do searchgyms.
    vamos trocar os nomes de searchgym para fetch nearby e vamos receber a latitude e longitude do usuario.
    retornamos o array de gyms e temos que ter acesso no execute ao user latitude e longitude por enquanto fica assim:
    import { Gym } from '@prisma/client'
import { GymsRepository } from '@/repositories/gyms-repository'

interface FetchNearbyGymsUseCaseParams {
  userLatitude: number
  userLongitute: number
}
interface FetchNearbyGymsUseCaseResponse {
  gyms: Gym[]
}
export class FetchNearbyGymsUseCase {
  constructor(private gymsRepository: GymsRepository) {}

  async execute({
    userLatitude,
    userLongitute,
  }: FetchNearbyGymsUseCaseParams):

  agora temos que fazer um novo metodo no nosso repositorio de gyms
  o metodo vai receber a latitude e longitude e devolver varias academias:
    findManyNearby(userLatitude: number, userLongitute: number): Promise<Gym[]>

    a latitude e longitude sãpo parametros que são numeros, porem assim fica dificil saber qual é qual porque nos vamos receber numeros assim (13451354,-163246234) e ai saber qual é quel pode ficar dificil, então pod isso a gente pode fazer uma interface no repositorio para passar isso como objeto. e agora podemos passar para o metodo os params como sendo tipados como essa interface e ai vamos receber la um objeto que vai dizer latitude: 143543 e longitude: 24352 assim a gente pode usar em outros lugares o nome e não os numeros. e vamos exportar essa interface parater acesso a ela em outros lugares.
    fica assim a pagina de repoistorio:
    import { Gym, Prisma } from '@prisma/client'

export interface findManyNearbyParams {
  latitude: number
  longitude: number
}

export interface GymsRepository {
  findById(gymId: string): Promise<Gym | null>
  searchMany(query: string, page: number): Promise<Gym[]>
  findManyNearby(params: findManyNearbyParams): Promise<Gym[]>
  create(data: Prisma.GymCreateInput): Promise<Gym>
}



agora quando a gente usar o metodo a gente tem que usar aassim findmanyNearby(latitude: 1345234, longitude: 1235423) ai fica mais descritivo.

vamos para o gyms in memoryu para implementar o metodo. como esta em memoria vamos fazer esse calculo de forma mais simples sem o todo o banco de dados como a gente tinha falado.
agora a gente vai filtrar os itens pegando a distancia então a gente faz o filter dos itens e dentro deles a gentepassa a const de distanceBetweenTwo que a gente tinha criado no utils. e nessa função a gente passa como primeiro parametro um objeto com a latitude e longitude que vem dos params ou seja que a gente vai passar qudno chama a função e o segundo argumento da função vai ser um objeto com a latitude e longitude que vão vir dos itens filtrados no banco de dados. assim essa const vai devolver a distancia entre todos esses elementos ( sabendo que em um banco de dadosgigante seria um trabalho enorme porqe ele teria que bater em todos as entradas do banco de dados e retornar uma distancia. por isso no banco de dados real vamos ter que mudar um pouco esse sistema.)
agora a gente pode retornar dessa filtragem se a distancia for menor que 10 
ou sja a nossa filtragem vai devolvr tudo que a distancia seja menot que 10 km. o metodo fica assim:
 async findManyNearby(params: findManyNearbyParams) {
    return this.Itens.filter((item) => {
      const distance = getDistanceBetweenCoordinates(
        {
          latitude: params.latitude,
          longitude: params.longitude,
        },
        {
          latitude: item.latitude.toNumber(),
          longitude: item.longitude.toNumber(),
        },
      )
      return distance < 10
    })
  }

  voltamos para o nosso uso de caso passamos a função como find many nearby e passamos para ela um objeto com latitude e longitude sendo igual aos userLatitude e longitude e retonra um gyms.. fica assim o caso de uso.
  import { Gym } from '@prisma/client'
import { GymsRepository } from '@/repositories/gyms-repository'

interface FetchNearbyGymsUseCaseParams {
  userLatitude: number
  userLongitute: number
}
interface FetchNearbyGymsUseCaseResponse {
  gyms: Gym[]
}
export class FetchNearbyGymsUseCase {
  constructor(private gymsRepository: GymsRepository) {}

  async execute({
    userLatitude,
    userLongitute,
  }: FetchNearbyGymsUseCaseParams): Promise<FetchNearbyGymsUseCaseResponse> {
    const gyms = await this.gymsRepository.findManyNearby({
      latitude: userLatitude,
      longitude: userLongitute,
    })

    return { gyms }
  }
}

agora vamos fazer o arquivo de teste fetchNearbyGyms.spec.ts vamos colar nele o teste do searchgyms. e adaptar as coisas nele como sempre.
agora no teste vamos cadastrar duas gyms e na execução a gente vai colocar o userLatitude e longitude que a gente tava usando nos testes. as duas gyms podem ter a mesma latitude e longitude. 
# tinha um pequeno erro nas implementação do metodo no useCase estava escrito londitute eu tive que mudar para longitude atenção a esse erro se for copiar algo darui

porem seria legal a gente coloca uma academia com mais de dez km tambem que ela não deveria entrar. então vamos cadastrar uma outra academia  então uma das academias vai ser a nearGym e a outra a farGym. agora no expect vamos dar que a gente quer que ele retone o array com apenas uma academia e que tenha oum objeto contendo o titulo near gym . fica assim o teste:import { InMemoryGymRepository } from '@/repositories/in-memory/in-memory-gym-repository'
import { expect, test, describe, beforeEach } from 'vitest'

import { FetchNearbyGymsUseCase } from './fetch-nearby-gyms'

let gymsRepository: InMemoryGymRepository
let sut: FetchNearbyGymsUseCase

describe('fetch nearby gyms use case', () => {
  beforeEach(async () => {
    gymsRepository = new InMemoryGymRepository()
    sut = new FetchNearbyGymsUseCase(gymsRepository)
  })

  test('if can find nearby gyms', async () => {
    await gymsRepository.create({
      title: 'near gym',
      description: 'gym Description',
      phone: '0108074561',
      latitude: -27.2982852,
      longitude: -49.6481891,
    })
    await gymsRepository.create({
      title: 'far gym',
      description: 'gym Description',
      phone: '0108074561',
      latitude: 27.0610928,
      longitude: -49.5229501,
    })
    const { gyms } = await sut.execute({
      userLatitude: -27.2982852,
      userLongitude: -49.6481891,
    })

    expect(gyms).toHaveLength(1)
    expect(gyms).toEqual([expect.objectContaining({ title: 'near gym' })])
  })
})

 a gente pode ate i na no nosso inmemory onde a gente implementa o metodo e dar um console.log (distance) ai ele vai retornar a distancia das duas academias para a gente em numero tambem quando a gente rodar os testes.

 # validar check in
 vamos fazer um arquivo de usecase para validate checkin
 o sistema de validar o checkin pode ser manual a pessoa da academia clica para validar ou é integrado que a pessoa a passar pela catraca vai automaticamente para nosso programa.
 vamos copiar o useCase de checkin nele. mudar os nomes para validateCheckin e no interface do request vamos passar o checkinID que vai ser string. o retorno vai ser o checkin(mas podia tambem ser nada.)
 no  constructor vamos pegar so o checkin repository no execute vamos passar o checkinIDagora vamos no checkinRepository e criamos um metodo chamado find by id.
   findCheckinById(id: string): Promise<CheckIn | null>
   agora vamos no inmemory implementar.

    async findCheckinById(id: string) {
    const checkIn = this.Itens.find((item) => item.id === id)
    if (!checkIn) {
      return null
    }
    return checkIn
  }

  agora voltamos para o usu de caso.
  a gente começa buscando o nosso chekin e caso a gente não encontre vamos dar ul erro de resorce not found assim:
  async execute({
    checkInID,
  }: ValidateCheckInUseCaseRequest): Promise<ValidateCheckInUseCaseResponse> {
    const checkIn = await this.checkInRepository.findCheckinById(checkInID)
    if (!checkIn) {
      throw new ResourceNotFoundError()
    }

e caso a gente encontre a gente vai atualizar a informação validated at ou seja pegamos o validatedat dele e damos um = new Date() para salvar com a data atual
 checkIn.validated_at = new Date()
 e agora vamos salvar esse checkin novamnte no nosso banco de dados. então agora alem do metodo create a gente vai ter o metodo save no nosso repository. que vai receber um checkin do tipo checkin e promete um checkin assim
 save(checkIn: CheckIn): Promise<CheckIn>

 vamos agora no in memory e vamos inplementar esse metodo save.
 nele nos vamos procurar pelo index dessa forma:
   const checkInIndex = this.Itens.findIndex(item=> item.id === checkIn.id)
   se a gente achar, ou seja se o index for >= 0 significa que existe um checkin que é igual ao checkin que a gente mandou. ou seja se ele não achar ele manda -1 se ele achar ele manda a posição desse checkin no array. ai a gente pega e atualiza esse checkin com o checkin que a gente esta enviando na requisição. e se não a gente so retorna o checkin. fia assim:
     async save(checkIn: CheckIn) {
    const checkInIndex = this.Itens.findIndex((item) => item.id === checkIn.id)
    if (checkInIndex >= 0) {
      this.Itens[checkInIndex] = checkIn
    }
    return checkIn
  }

  voltamos para o uso de caso.
  passamos um await chamalos o checkin repository e passamos o metodo save passando o checkin e depois retornamos o checkin a pagina fica assim:
  import { CheckIn } from '@prisma/client'
import { CheckInRepository } from '@/repositories/check-ins-repository'
import { GymsRepository } from '@/repositories/gyms-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-erros'
import { getDistanceBetweenCoordinates } from '@/utils/get-distance-between-coordinates'
import { MaxDistanceError } from './errors/max-distance-error'
import { MaxNumberOfCheckinError } from './errors/max-number-of-checkin-error'

interface ValidateCheckInUseCaseRequest {
  checkInID: string
}
interface ValidateCheckInUseCaseResponse {
  checkIn: CheckIn
}
export class ValidateCheckInUseCase {
  constructor(private checkInRepository: CheckInRepository) {}

  async execute({
    checkInID,
  }: ValidateCheckInUseCaseRequest): Promise<ValidateCheckInUseCaseResponse> {
    const checkIn = await this.checkInRepository.findCheckinById(checkInID)
    if (!checkIn) {
      throw new ResourceNotFoundError()
    }

    checkIn.validated_at = new Date()

    await this.checkInRepository.save(checkIn)

    return { checkIn }
  }
}

agora vamos para os testes.
criamos o arquivo com spec no fim do nome como sempre
vamos copiar nele o teste do checkin e deixar apenas o primeiro teste.
vamos comentar a parte das datas porque mais pra frente a gente vai utilizar elas.
vamos tirar a criação do before all e vamos tamber tirar o gym repository.
vamos mudar checkin use Case para validateCheckin use case no sut e etc.
fica assim:
import { expect, test, describe, beforeEach, vi, afterEach } from 'vitest'
import { InMemoryCheckInsRepository } from '../repositories/in-memory/in-memory-check-in-repository'
import { ValidateCheckInUseCase } from './validate-check-in'

let checkInsRepository: InMemoryCheckInsRepository
let sut: ValidateCheckInUseCase

describe('validate check-in use case', () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository()
    sut = new ValidateCheckInUseCase(checkInsRepository)

    //   vi.useFakeTimers()
  })
  afterEach(() => {
    //   vi.useRealTimers()
  })
  e o teste vai ser if can validate checkin
  então para validar esse checkin a gente vai ter que criar um checkin
  chamando o checkinRepository e usando o metodo create.
     const checkIn = await checkInsRepository.create({
      gym_id: 'gym01',
      user_id: 'user01',
    })
  
  agora a gente chama o sut.execut e passamos para ele o checkinID como checkin.id ou seja vamos passar como o parametro o id do checkin que a gente acabou de criar.
  agora a gente expera que o checkin no banco de memoria tenha a data de validação nova. para conferir isso a gente vai chamar o checkin que a gente criou e chamar de createdCheckIn e do sutExecute a gente vai pegar o checkin que ele retorna.
     const createdCheckIn = await checkInsRepository.create({
      gym_id: 'gym01',
      user_id: 'user01',
    })
    const { checkIn } = await sut.execute({
      checkInID: createdCheckIn.id,
    })

então a gente faz o primeiro expect que do checkinValidated a data de retorno seja qualquer data.
  expect(checkIn.validated_at).toEqual(expect.any(Date))

  e tambem um expect que no checkin repository dentro dos itens o primeiro itens a data de validaçãoestekja preenchida ou seja to euqyal anydate.
  agora vamos fazer um outro teste.
para que não possa validar um checkin inexistente vamos colocar tudo dentro de um expect. a gente obviamente não cria um checkin. e passa como id uma string dizendo que esse checkin nao, existe. agora o nosso expect tem que rejeitar sendo uma instancia do erro de resousrce not found.
  a pagina fica assim:
  import { expect, test, describe, beforeEach, vi, afterEach } from 'vitest'
import { InMemoryCheckInsRepository } from '../repositories/in-memory/in-memory-check-in-repository'
import { ValidateCheckInUseCase } from './validate-check-in'

let checkInsRepository: InMemoryCheckInsRepository
let sut: ValidateCheckInUseCase

describe('validate check-in use case', () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository()
    sut = new ValidateCheckInUseCase(checkInsRepository)

    //   vi.useFakeTimers()
  })
  afterEach(() => {
    //   vi.useRealTimers()
  })
  test('if can validate check in', async () => {
    const createdCheckIn = await checkInsRepository.create({
      gym_id: 'gym01',
      user_id: 'user01',
    })
    const { checkIn } = await sut.execute({
      checkInID: createdCheckIn.id,
    })

    expect(checkIn.validated_at).toEqual(expect.any(Date))
    expect(checkInsRepository.Itens[0].validated_at).toEqual(expect.any(Date))
  })
    test('if cannot validate an inexistent checkin', async () => {
    await expect(() =>
      sut.execute({
        checkInID: 'inexistent-checkin-id',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
})

com todos os nossos casos de uso criados a gente ainda tem umas coisas que precisam ser vistas das nossas regras de negocio. que são que o checkin so pode ser validado até no maximo 20 minutos apos a entrada e que so um admionistrador pode validar assim como a academia so pode ser criada por um adm.

# tempo limite de validaçao
vamos fazer isso usando o tdd então começamos por testes
conyinuamos no validatesoec e habilitamos o mocking de data.
e criamos um teste e passamos uma data para ele
  test('if cannot validated checkin after 20min of creation', async () => {
    vi.setSystemTime(new Date(2023, 0, 1, 13, 40))
  })

  agora a gente copia o created checkin e o sut execute que temos nos outros testes para esse teste tambem
  porem la no nosso inmemory a nossa data de criação usa o newDate()  então se o new date é chamado logo depois dessa linha que a gente deu de setSystem ou seja se a gente criar um checkin depois dessa linha. ele vai usar a nossa linha de mock que a gente setou no setSystem. poremos então setar uma nova data depois da criação do checkin para antes da validação. ao inves de setar uma nova data a gente pode usar a função advance timmersbytime e dentro dela passamos o numero de mili segundos que queremos avançar nosso tempo. ou seja agora depois disso quando o newDate for chamado ele vai ser chamado 21 minutos depois dessa criação. fica assim: 
    vi.setSystemTime(new Date(2023, 0, 1, 13, 40))

    const createdCheckIn = await checkInsRepository.create({
      gym_id: 'gym01',
      user_id: 'user01',
    })

    vi.advanceTimersByTime(1000 * 60 * 21) // 21 minutes

    const { checkIn } = await sut.execute({
      checkInID: createdCheckIn.id,
    })

    agor anos esperamos que essa validação de um erro e colocamos na verdade o await sut dentro do expect. o teste fica assim:
    test('if cannot validated checkin after 20min of creation', async () => {
    vi.setSystemTime(new Date(2023, 0, 1, 13, 40))

    const createdCheckIn = await checkInsRepository.create({
      gym_id: 'gym01',
      user_id: 'user01',
    })

    vi.advanceTimersByTime(1000 * 60 * 21) // 21 minutes

    await expect(() =>
      sut.execute({
        checkInID: createdCheckIn.id,
      }),
    ).rejects.toBeInstanceOf(Error)
  })

  agora vamos para o useCase de validateCheckin
  antes dele atualizar a data do validate a gente vai fazer uma condição. 
  vamos criar uma constante para calcular a diferença de tempo niusso nos vamos usar o dayJs passar para ele uma new date e usar o metodu diff e passar para ele o checkin.created_At e como segundo parametro uma string com minutes. esse metodo vai nos dar a diferença em minutos entre esses dois horarios.
    const distanceInMinutesFromCheckIn = dayjs(new Date()).diff(
      checkIn.created_at,
      'minutes',
    )
colocamos a distancia de agora para a data do checkin porque a data do checkin sempre vai ser anterior. assim a gente usa uma data maior menos uma data menor e teremos uma distancia em positivo.
    agora a gente vai dizer qeu se o distanceInMinutes  for maior que 20 da um erro.
    a pagina fica ssim:
    import { CheckIn } from '@prisma/client'
import { CheckInRepository } from '@/repositories/check-ins-repository'
import { GymsRepository } from '@/repositories/gyms-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-erros'
import { getDistanceBetweenCoordinates } from '@/utils/get-distance-between-coordinates'
import { MaxDistanceError } from './errors/max-distance-error'
import { MaxNumberOfCheckinError } from './errors/max-number-of-checkin-error'
import dayjs from 'dayjs'

interface ValidateCheckInUseCaseRequest {
  checkInID: string
}
interface ValidateCheckInUseCaseResponse {
  checkIn: CheckIn
}
export class ValidateCheckInUseCase {
  constructor(private checkInRepository: CheckInRepository) {}

  async execute({
    checkInID,
  }: ValidateCheckInUseCaseRequest): Promise<ValidateCheckInUseCaseResponse> {
    const checkIn = await this.checkInRepository.findCheckinById(checkInID)
    if (!checkIn) {
      throw new ResourceNotFoundError()
    }

    const distanceInMinutesFromCheckIn = dayjs(new Date()).diff(
      checkIn.created_at,
      'minutes',
    )

    if (distanceInMinutesFromCheckIn > 20) {
      throw new Error()
    }

    checkIn.validated_at = new Date()

    await this.checkInRepository.save(checkIn)

    return { checkIn }
  }
}

para melhorar a gente vai criar um erro especifico. latecheckinvalidation error.
salvamos e voltamos la e colocamos esse erro no lugar do error e no teste a gente tambem adapta o errr para ser esse erro.
export class LateCheckInValidationError extends Error {
  constructor() {
    super('Check-in can only be validateduntil 20 minutes after creation')
  }
}
no use Case o erro fica assim:
    if (distanceInMinutesFromCheckIn > 20) {
      throw new LateCheckInValidationError()
    }
e no teste assim:
  await expect(() =>
      sut.execute({
        checkInID: createdCheckIn.id,
      }),
    ).rejects.toBeInstanceOf(LateCheckInValidationError)
  })
  
  # prisma repository
  nos terminamos praticamente todos os casos de uso.
  os casos de uso são o nucleo de nossa aplicação e são a parte mais importante dela. e agora que eles estãopraticamente feitos a gente pode começar a expor eles ao mundo, ou seja tirar ele apenas do ambiente de teste e expor ele aos register, as rotas, ao banco de dados. então a gente pode implementar por exezmplo os metodos no nosso prisma repository.
  vamos na pasta repositories/prisma e vamos abrir o PrismaUsersRepostory (não confundir com o users-repository que esta fora da pasta prisma)
  a pagina é assim:
  import { prisma } from '@/lib/prisma'
import { Prisma, User } from '@prisma/client'
import { UsersRepository } from '../users-repository'

export class PrismaUsersRepository implements UsersRepository {
  findById(id: string): Promise<User | null> {
    throw new Error('Method not implemented.')
  }

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


por exemplo o find by id não esta implementado. a gente pode fazer ele com base na de email.
fica assim a parte do id 
async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    })

    return user
  }

  e ai o nosso repositorio do prisma para a parte de usuarios esta feita.
  vamos criar agora o 
  prisma-check-in-repository.ts
  nele vamos exportar uma classe prismaCheckInRepository e implementar a interface checkinRepository assim
  export class PrismaCheckInRepository implements CheckInRepository

  agora a gente pode clicar na lampara e implementar a interface assim ele vai implementar tudo mas ainda temos que ajustar porque o nosso promisse sai dando coisa por coisa ao invez da intarface na verdade não precisamos da promisse aqui. . corrigindo a implementação fica assi:
  import { CheckIn, Prisma } from '@prisma/client'
import { CheckInRepository } from '../check-ins-repository'

export class PrismaCheckInRepository implements CheckInRepository {
  create(data: Prisma.CheckInUncheckedCreateInput) {
    throw new Error('Method not implemented.')
  }

  save(checkIn: CheckIn) {
    throw new Error('Method not implemented.')
  }

  findCheckinById(id: string) {
    throw new Error('Method not implemented.')
  }

  findManyByUserId(userId: string, page: number) {
    throw new Error('Method not implemented.')
  }

  countByUserId(userId: string): Promise<number> {
    throw new Error('Method not implemented.')
  }

  findByUserIdOnDate(userId: string, date: Date) {
    throw new Error('Method not implemented.')
  }
}


agora a gente pode tirar os erros e implementar os metodos.
no find byid a gente vai fazer um checkin ser igual ao await prisma(que vem do lib) .checkin.findUnique onde tem o id ou seja onde tem o unico id igual ao id que a função recebe. e retornmaos o checkin
no create a gente faz igual so que ao invez do find unique a gente usa o create e passa para ele um objeto com o nosso data.
no save para não ficar o nome checkin repetitrivo a gente muda o nome do parametro para data. e ai a gente faz o checkin ser igual ao update where o id é igual ao data id e ele dar o update com o cata e retornar o checkin.
no count a gente faz a const count ser igual ao metodo count do prisma onde o user_id do checkin for igual ao userId que a gente manda como parametro e retornamos essa count
  no findMany a gente tem que lebrar da paginação. primeiro vamos fazer uma const checkins no plural ser igual ao metodo findMany do prisma onde o user_id é igual ao userId do parametro. depois disso a gente tem que ainda na funão findMany como segundo argumento o skip e o take eles servem para quandos items a gente quer trazer, que são e o skip para qantos itens a gente quer pular.ai no skip a gente faz a loica do page-1 * 20 que ai ele pula os 20 anteriores ou os 40 ou 0 se for na primeira pagina. e ai a gente retorna depis os checkins
  no find by user id on date a gente tem ocalculo de start of day e end of day e importamos o dayjs
  const startOfDay = dayjs(date).startOf('date')
    const endOfDay = dayjs(date).endOf('date')
    quando o checkin é criado no banco de dado ele é criado com hora minuto e segundo e a gente quer discartar umas coisas como os segundos e etc a gente quer so saber o dia.
    vamos usar uma estrategia de primeiro procrar no banco de dados por um checkin porem usando o findFirst poorque queremos encontrar um unico checkin que batra com as condições que temos aqui e nos vamos usar o created_at que não tem unic la no nosso banco de dados então nao podemos usar o findUnique.
    entéao nos passamos o userId igual ao user ai e para o created_at a gente passa uma objeto que pode elevar o filtro da data que vamos passar.a gente pode usar o equals que sera uma tada igual. mas temos os metodos gt gte lt e lte que é greater than / greaterthanequal e a mesma coisa com os lower than.
    enté"o a gente vai usar o gte : start of day ou seja o checkin vai ser feito apos o inicio do dia. e lower than equal end of day e temos que converter o endofday e star para uma data com o toDate(). depois a gente retorna o checkin e esta tudo feito.
    a pagina fica assim e nossos dois prisma repositorio tanto o de user quanto o de checkin estão prontos:
    import { CheckIn, Prisma } from '@prisma/client'
import { CheckInRepository } from '../check-ins-repository'
import { prisma } from '@/lib/prisma'
import dayjs from 'dayjs'

export class PrismaCheckInRepository implements CheckInRepository {
  async create(data: Prisma.CheckInUncheckedCreateInput) {
    const checkIn = await prisma.checkIn.create({ data })
    return checkIn
  }

  async save(data: CheckIn) {
    const checkIn = await prisma.checkIn.update({
      where: {
        id: data.id,
      },
      data,
    })
    return checkIn
  }

  async findCheckinById(id: string) {
    const checkIn = await prisma.checkIn.findUnique({
      where: {
        id,
      },
    })
    return checkIn
  }

  async findManyByUserId(userId: string, page: number) {
    const checkIns = await prisma.checkIn.findMany({
      where: {
        user_id: userId,
      },
      take: 20,
      skip: (page - 1) * 20,
    })
    return checkIns
  }

  async countByUserId(userId: string) {
    const count = await prisma.checkIn.count({
      where: {
        user_id: userId,
      },
    })
    return count
  }

  async findByUserIdOnDate(userId: string, date: Date) {
    const startOfDay = dayjs(date).startOf('date')
    const endOfDay = dayjs(date).endOf('date')
    const checkIn = await prisma.checkIn.findFirst({
      where: {
        user_id: userId,
        created_at: {
          gte: startOfDay.toDate(),
          lte: endOfDay.toDate(),
        },
      },
    })
    return checkIn
  }
}

# repositorio de academias
criamos o aruivo do prisma gym repository e fazemos a classe para implementar o gymsRepository e clicamos na lampada para implementar. mesmo sistema do outro.
no metodo find by id a gente da o find unique onde o id é igual ao id que a gente passa e retronamos um gym.
no reate a gente passa o metodo create do prisma.gym e para ele a gente passa a data dentro de um objeto e retornamos o gym.
no searchMany a gente passa a const gyms no plural e a gente passa o metodo findMany com where title e ai a gente passa um objeto para o title para pegar o contain e ai no contain a gente passa a query.
para a paginação a gente faz o take 20 e o skip(page-1) * 20 a gente bota o page -1 entre parenteses para ele não multiplicar antes o -1 por 20 . e damos um return gyms
até ai tudo bem. porem chegamos na find any nearby
a gente tinha feito no inMemory que é algo que usa apenas javascript aquela função para calcular as academias proximas, porem essa função não funciona mais quando a gente for em um banco de dados real, que vai ter outras linguagens. pore isso precisamos implementar sse metodo de uma forma diferente.
ou seja o nosso utils gtdistancebetweecoordinates não é mais tão util agora a n ão ser que a gente passasse todas as entradas do banco de dados por ele. o que daria um trabalho enormoe em um banco grande e levaria muito tempo. por isso é uma escolha que apesar de fucnionar esta errada.
então aqui a gente vai precisar selecionar as academias proximas ja direto no sql.
então existe uma query parecida com essa do javascript que a gente fez no utils qe existe cpara sql. a gente pode copiar essa query; 
A query SQL apresentada está realizando uma busca de todas as academias que estão a uma distância máxima de 10km da localização representada pela latitude e longitude informadas como parâmetros. A fórmula utilizada no WHERE é conhecida como Haversine Formula, e é utilizada para calcular a distância entre dois pontos em um globo. O resultado é multiplicado por 6371 para obter a distância em quilômetros.
SELECT * from gyms
WHERE ( 6371 * acos( cos( radians(${latitude}) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(${longitude}) ) + sin( radians(${latitude}) ) * sin( radians( latitude ) ) ) ) <= 10

porem para implementar isso o prisma que nos ajuda muito com suas tarefas ja tipificadas como achar algo por id e tudo mais. ele não funciona para todos os casos. e as vezes a gente precisa escrever sql nativo. para então buscar as academias proximas nos vamos usar o await prisma.$queryRaw`` ou seja usamos um metodo do prisma que é fazer os query em sql.
ai dentro dessas tamplate literals a gente pode fazer o select que a gente quiser ou o comando sql que a gente quiser.
vamos cmeçar a implementar esse metodo então.
a gete vai nos params pegar a latitude e a longitude por uma desestruturação
async findManyNearby({latitude, longitude}: findManyNearbyParams) {
  agora a gente da o $queryRaw e seleciono todas as academias com um where do calculo que pega essas latitude e longitude e ve se é a menos de 10km como explicado acima.
e depois desse query a gente da um returns gyms.
porem a função fica com o type dela como unknown e isso não é bom no typescript. esse type esta assim porque quando a gente quando a gente faz uma query raw o prisma não consegue entender qual é o formato de retorno dessa query. então a gente pode tipificar o wueryraw para dizer para ele qual é o retorno. então depois do wueryRaw a gente pode usar o <> e entro dele pegar o Gym[] uma lista de academias. sendo que esse Gym vem do prismaclient.

# factories
vamos criar factories para automatizar o trabalho de criação de um caso de uso com todas as suas dependencias
vamos criar um para cada useCase os arquivos vao se chamar make(seguido do nome do useCase)
agora vamos em cada um deles. 
a gente vai copiar o factory do autenticate que usa o usersRepository e vamos colar no getuser profile e ai a gente muda o nome da função.
a gente troca a const autenticateUseCase por so useCase para na hora que copiar e colar não ter que ficar mudando sempre (igual o sut). e mudamos e ela para o new GetUserProfileUseCase importando ele. deletamos a importação do autenticate e mudamos o retorno apenas para o useCase. fica assim:
import { PrismaUsersRepository } from '@/repositories/prisma/PrismaUsersRepository'
import { GetUserProfileUseCase } from '../get-user-profile'

export function makeGetUserProfileUseCase() {
  const prismaUsersRepositories = new PrismaUsersRepository()
  const useCase = new GetUserProfileUseCase(prismaUsersRepositories) // the file that need a useCase is the file that will send the dependencies as params to the useCase

  return useCase
}

vamos fazer o userMetrics a ideia é a mesma mas ele usa o checkin repository então temos que mudar isso. fica assim:
import { GetUserMetricsUseCase } from '../get-user-metrics'
import { PrismaCheckInRepository } from '@/repositories/prisma/prisma-check-in-repository'

export function makeGetUserMetricsUseCase() {
  const prismaCheckInRepositories = new PrismaCheckInRepository()
  const useCase = new GetUserMetricsUseCase(prismaCheckInRepositories) // the file that need a useCase is the file that will send the dependencies as params to the useCase

  return useCase
}

para o checkin ele usa duas dependendencias tanto o gym quanto o chekcin então tem que instanciar tambem o gym e passar como segundo argumento. fica assi:
import { PrismaGymRepository } from '@/repositories/prisma/prisma-gym-repository'
import { CheckInUseCase } from '../check-in'
import { PrismaCheckInRepository } from '@/repositories/prisma/prisma-check-in-repository'

export function makeCheckInUseCase() {
  const prismaCheckInRepositories = new PrismaCheckInRepository()
  const gymsRepository = new PrismaGymRepository()
  const useCase = new CheckInUseCase(prismaCheckInRepositories, gymsRepository) // the file that need a useCase is the file that will send the dependencies as params to the useCase

  return useCase
}

vamos copiar o metrics e passar ele para o fetchusecheckinhistoyr emudar o nome.
fica assim:
import { FetchUserCheckinHistoryUseCase } from '../fetch-user-checkins-history'
import { PrismaCheckInRepository } from '@/repositories/prisma/prisma-check-in-repository'

export function makeFetchUserCheckInHistoryUseCase() {
  const prismaCheckInRepositories = new PrismaCheckInRepository()
  const useCase = new FetchUserCheckinHistoryUseCase(prismaCheckInRepositories) // the file that need a useCase is the file that will send the dependencies as params to the useCase

  return useCase
}
mesma coisa para o validate
import { PrismaCheckInRepository } from '@/repositories/prisma/prisma-check-in-repository'
import { ValidateCheckInUseCase } from '../validate-check-in'

export function makeValidateCheckInUseCase() {
  const prismaCheckInRepositories = new PrismaCheckInRepository()
  const useCase = new ValidateCheckInUseCase(prismaCheckInRepositories) // the file that need a useCase is the file that will send the dependencies as params to the useCase

  return useCase
}

agora vamos para o searchgyms
mudamos a instanciação para pegar a academia e os nomes
import { SearchGymUseCase } from '../search-gyms'
import { PrismaGymRepository } from '@/repositories/prisma/prisma-gym-repository'

export function makeSearchGymsUseCase() {
  const gymRepository = new PrismaGymRepository()
  const useCase = new SearchGymUseCase(gymRepository) // the file that need a useCase is the file that will send the dependencies as params to the useCase

  return useCase
}

fazemos o fetch nearby gym no mesmo estilo fica assim:
import { FetchNearbyGymsUseCase } from '../fetch-nearby-gyms'
import { PrismaGymRepository } from '@/repositories/prisma/prisma-gym-repository'

export function makeFetchNearbyGymsUseCase() {
  const gymRepository = new PrismaGymRepository()
  const useCase = new FetchNearbyGymsUseCase(gymRepository) // the file that need a useCase is the file that will send the dependencies as params to the useCase

  return useCase
}

mesma coisa para o create gym fica assim:
import { CreateGymUseCase } from '../create-gym'
import { PrismaGymRepository } from '@/repositories/prisma/prisma-gym-repository'

export function makeCreateGymUseCase() {
  const gymRepository = new PrismaGymRepository()
  const useCase = new CreateGymUseCase(gymRepository) // the file that need a useCase is the file that will send the dependencies as params to the useCase

  return useCase
}

com isso temos todos os nossos factories criados.

# controlers
vamos criar na pasta de controlers um controler da parte de perfil do usuario, vai ser chamado profile.ts
e vamos exportar uma função asincrona com o fastyfy request e reply e retonrando um status 200. o esqueleto fica assim, agora falta fazer o miolo.

import { FastifyReply, FastifyRequest } from 'fastify'


export async function profile(request: FastifyRequest, reply: FastifyReply) {
 

  return reply.status(200).send()
}
agora vamos nas rotas e vamos dar m app.get('/me') a rota vai ser por exemplo me. essa é uma rota que o usuario so pode chamar se estiver autenticado. essa rota me vai chamar o controler profile com cuidado para importar de controllers.
a pagina de rotas fica assim:
import { FastifyInstance } from 'fastify'
import { register } from './controller/register'
import { autenticate } from './controller/autentificate'
import { profile } from './controller/profile'

export async function appRoutes(app: FastifyInstance) {
  app.post('/users', register)

  app.post('/sessions', autenticate)

  /* autenticado */
  app.get('/me', profile)
}

pore por eqnaunto como não tem nada no miolo de nosso controler profile ela não vai fazer nada. 
antes temos que falar sobre estrategias de autenticação na aplicação
existem tres estrategias basicas de autenticaçõ.
* o basic auth como o nome ja diz autenticação basica.
nessa em cada requisição o usuario precisa enviar as credenciais dele o cabeçalho (metadados) da requisição. essas credenciais vao dizer se ele esta autorizado ou não. existe um header que chama authorization e quando a gente passa para esse cabecalho o tipo baic a gente precisa enviar as credencias como usuario e senha porem converter isso em um formato de base 64 é um algoritmo ue permite a gente de fazer o encoding e o decoding de alguns dados.
o problema é que não é muito seguro a gente passar o email e senha do usuario sempre.
o json web token (jwt)
somente na rota de login o usuario envia o email e senha que são validados pelo backend e depois disso o nosso backend gera um token unico e ele não pode ser modificado a gente chama ele de stateless token. 
statless significa que ele não é armazenado em nenhuma estrutura de persistencia de dado (banco de dados)
o backend quando cria o token usa uma palavra chave que pode ter farios formatos, o mais simples é uma string. a gente vai configurar essa palavra chave no nosso backend.quanto mais dificil for mais dificil vai ser uma outra pessoa conseguir criar um token com a nossa mesma palavra chave.
a gente vai criar um token a partir dessa palavra chave mas nos odemos tambem descriptograffar esse token depois. o token é um composto entre teres coisas c  abeçalho payload e assinatura. eles são separados por . pontos.
o ackend é o unico sistema que tem acesso a palavra chave então so ele pode criar novos tokens e validar atravez da assinatura que um token condiz com essa palavra chave.
as partes de um jwt
header - 
  qual algoritmo usado para criar esse token. existem varios. por exemplo o hs256 que usa uma string para criar um token existem outros que usam não apenas palavras mas tambem chaves privadas e publicas e coisas assim.
payload -
  qualquer informação que a gente quuiser. a gente coloca por exemplo o sub: que vai ser o id do usuario, paraa gente saber quem criou e nas outras as gente colocar o que a gente quiser como.
assinatura -
assinatura impede de um usuario modificar nosso token, e é ela que o backend vai validar. tuo que a gente mudar no payload vai mudar a assinatura. então quando chegar uma requisição ele vai ver que a assinatura não foi o beckend que gerou quando ele comparar com a nossa palavra chave.
a assinatura é feita com o base64 do header + o base64 do payload + a nossa palavra chave, e ai ela gera a assinatura, então ela sempre muda caso o resto seja modificado.
então o fluxo da aplicação vai ser o usuario faz login e isso gera um jwt => agora o jwt é utilzado em todas as requisições sendo enviado no header ( authorization Bearer)
vamos implementar esse modelo de autenticação
# autenticação com fastify
jwt é usado 90%DOS CASOS DE USO PARA rotas http; QUANDO TEMOS OUTROS TIPOS como por exemplo integrar aplicação diferentes, ai a gente usaria outros metodo de autenticação como api token boal e outros.
como ela vai se relacionar apenas a http ela a autenticação vai estar toda na parte na camada http de nossas aplicação. ou seja se for impedir a gente impede nessa camada e não no caso de uso. o caso de uso esta desconexo do mundo externo. assim se um dia a gente usar ele em outro contexto o caso de uso ainda é valido.
comoe stamos usando o fatify vamos usar o modulo fastify jwt que vai servir para tratar os jason web token
vamos instalar ele 
npm i @fastify/jwt
para configurar ele a gente vai abrir o arquivo app.ts
e antes das rotas a gente vai passar o app.register(fastifyjwt) e vamos passar o jwt que vem de fastify em segundo parametro a gente pode passar um objeto com as configurações. uma delas é o secret. o ideal é essa palavrachave não estar disponivel nem pra quem é dev então a gente coloca ema em uma variavel ambiente. no desenvolvimento a gente não precisa necessariamente fazer uma chave complexa.
ai a gente salva ela la e depois vamos no nosso env.index e configuramos a nossa jwt secret
import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'production', 'test']).default('dev'),
  JWT_SECRET: z.string(),
  PORT: z.coerce.number().default(3333),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('invalid env vabriables', _env.error.format())
  throw new Error('invalid env vabriables')
}

export const env = _env.data
agora voltamos no app e podemos passar ela no secret do nosso objeto de configuração.
app.register(fastifyJwt, {
  secret: env.JWT_SECRET
})

atualizamos o nosso env example
o nosso app ficou assim:
import fastify from 'fastify'
import { appRoutes } from './http/routes'
import { ZodError } from 'zod'
import { env } from './env'
import fastifyJwt from '@fastify/jwt'

export const app = fastify()
app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})
app.register(appRoutes)

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation error', issues: error.format() })
  }
  if (env.NODE_ENV !== 'production') {
    console.error(error)
  } else {
    // TODO here we should log to a external tool like newrelic, datadog, sentry
  }
  return reply.status(500).send({ message: 'Internal server error' })
})

e agora a gente tem metodos de autenticação que ficam disponiveis em nossas rotas.
agora nos podemos ir la em http/controllers/autentificate
 processo de autenticação retorna somente um 200 e mais nada. e nos queremos agora gerar o token.o nosso caso de uso de autenticate retorna um usuario que fez a autenticação.
     const { user } = await autenticateUseCase.execute({
      email,
      password,
    })
    e embaixo vamos gerar o token.
    usando uma const token = await reply.jwtsign()
    ou seja agora dentro do reply apos a gente ter cadastrado a secretKey a gente tem o acesso a assinatura
    o primeiro parametro que vamos passar ao jwtsing é o payload ele vem como um objeto e são informações adicionais a gente não vai colocar nada nele. o id a gente vai colocar no segundo parametro dentro da opção sign e dentro do sub.
    ### importante JAMAIS COLOCAR EMAIL SENHA OU INFORMA9ÃO SIGILOSA DO USUARIO NO JWT
    porque o payload não é criptografado, ele so é encoded. e da prar descodificar muito facil. o token fica assim
     const token = await reply.jwtSign(
      {},
      {
        sign: {
          sub: user.id,
        },
      },
    )
    e agora a ente pode devolver esse token apos a requisição de autentificar. a gente vai colocar esse reply antes de pegar o erro. a pagina fica assim:
    import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error'
import { makeAutenticateUseCase } from '@/use-cases/factory/make-autenticate-use-case'
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
    const autenticateUseCase = makeAutenticateUseCase()
    const { user } = await autenticateUseCase.execute({
      email,
      password,
    })
    const token = await reply.jwtSign(
      {},
      {
        sign: {
          sub: user.id,
        },
      },
    )
    return reply.status(200).send({ token })
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return reply.status(400).send({ message: err.message })
    }
    return reply.status(500).send() // TODO fixthis
  }
}

com isso ao fazer a requisição de autentificar e mandar a senha e o email a gente vai receber um token de volta.
agora que a gente ja ta pegano o token a gente precisa criar a rota profile. primeiro vamos no insomnia e criamos essa rota profile com o get localhost/me 
ai se a gente mandar sem body ele devolve ok mas não faz nada porque a rota ta varia ainda. é a nossa rota profile.
agora a gente pode pegar la ao fazer a autenticatio e rodar a rota a gente pode pegar o valor do token e na rota profile a gente pode passar ele no insmomina sando o auth berrerToken e passando ele. a gente poderia passar tambem usando o header e configurando um berrer token mas o insomnia ja da a opção de aitenticantion para nos ajudar.
agora precisamos pegar esse token e verificar em nossa rota.
então a gente vai no corpo da rota profile fazer um await e usar uma função chamada request.jwtverify essa função vai buscar o token dentro do cabeçalhos e se ele existir ela vai validar se ele foi gerado na nossa aplicação. se não existir ja vai dar erro e nenhum codigo dai pra frente vai executar.
agora para buscar as informações do usuario. se a gente der um request.user nos temos osdados que estavam dentro do token. no nosso caso o userId.com request.user.sub a gente tem exatamente o id do usuario.
a nossa pagina profile fica assim:
import { FastifyReply, FastifyRequest } from 'fastify'

export async function profile(request: FastifyRequest, reply: FastifyReply) {
  await request.jwtVerify()
  console.log(request.user.sub)
  return reply.status(200).send()
}

ao fazer todo o processo com o banco de dados e o server rodando eu tive o d do usuario n o consolelog dessa forma
HTTP server running
prisma:query SELECT "public"."users"."id", "public"."users"."name", "public"."users"."email", "public"."users"."password_hash", "public"."users"."created_at" FROM "public"."users" WHERE ("public"."users"."email" = $1 AND 1=1) LIMIT $2 OFFSET $3
prisma:query SELECT 1
prisma:query SELECT "public"."users"."id", "public"."users"."name", "public"."users"."email", "public"."users"."password_hash", "public"."users"."created_at" FROM "public"."users" WHERE ("public"."users"."email" = $1 AND 1=1) LIMIT $2 OFFSET $3
922745d4-9e2d-49c7-aaf3-86a5b923c853

nosso database tambem esta mostrando os query por isso que ta meio sujo mas o id do usuario é esse que começa com 9. ou seja agora podemos ter acesso ao id. e ta tudo verificado a gente pode rodar outros codigos dentro que ele so vai todar se tiver passado a auatentificação.
porem o nosso sub esta sublinhado dentro da profile porque o fastify jwt pede que a gente ao colocar informação dentro do usuario que a gente indique isso para o fastify para ele saber que isso existe. entao vamos criar uma pasta chamada@types
dentro do src
e dentro dela vamos fazer um fastifyJwt.d.ts para que ele so tena **ha types por isso o .d
dentro desse arquivo a gente copia a documentação do fastify. eu vou coloar a documentação de tpy dele aqui.
import '@fastify/jwt'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: number }
    user: {
      id: number
      name: string
      age: number
    }
  }
}

agora nos vamos modificar isso.
o payload como a gente não usa vamos tirar.
dentro do user a gente vai colocar somente o sub e ele vai ser string e caso a interface esteja dando erro a gente pode jogar um export na frente dela. fica assim:
import '@fastify/jwt'

declare module '@fastify/jwt' {
  export interface FastifyJWT {
    user: {
      sub: string
    }
  }
}
(a minha ,éao tava dando erro mas botei o export mesmo assi.)
com isso o sub ja parou de dar erro porque ele ja entende que é uma propriedade do usuario e agora a gente terminoun a autentificaçõ. 

# controler de perfil
vamos l no nosso controler profile.ts
para pegar o nosso perfil nos vamos fazer uma cont ser para poder usar o factory getuserProfile
  const getUserProfile = makeGetUserProfileUseCase()

  e agora vamos fazer uma const profile que vai usar isso
  e vai dar o execute passando o userid que vem do requestusersub para o userid que eles pedem no factory. fica assim essa conts
    const profile = await getUserProfile.execute({
    userId: request.user.sub,
  })
  a gente pode trocar o profile do cost por uma desestruturação para o {user} que são todos os dados do usuario. ea gente pode devolver isso em nossa rota. no send
  porem não é legal a gente mandar o passwordhash nele a gente pode colocar no send o {user : {...user,(isso copia todos os dados de user) password_hash: undefined}} ou seja a gente ocultou o passwordhash passando ele como undefined a pagina fica assim:
  import { makeGetUserProfileUseCase } from '@/use-cases/factory/make-get-user-profile'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function profile(request: FastifyRequest, reply: FastifyReply) {
  await request.jwtVerify()

  const getUserProfile = makeGetUserProfileUseCase()
  const { user } = await getUserProfile.execute({
    userId: request.user.sub,
  })

  return reply.status(200).send({ user: { ...user, password_hash: undefined } })
}
isso é um ajuste. mas  no futuro
o poderemos ver jeitos melhores de fazer isso.

agora que pegamos os dadosz mais rotas em nossa aplicte noo que vao precisar que o usuario esteja logado.
a gente pode chamar a await request.jwtVerify() em todas as rotas ou podemos automatizar isso. para automatizar vamos na pasta http e vamos criar uma pasta chamada middleware e dentro dele um arquivo chamado verify-jwt.ts
dentro dele vamos exportar uma função assincrona qjue vai ser como um controller então ela vai receber o request e reply.
import { FastifyReply, FastifyRequest } from 'fastify'

export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {}

agora dentro dela a gente vai fazer o try para o jwt verify porque se der um erro a gente vai dar o catch e devolver uma resposta de 401 que é não autorizado.
fica assim:
import { FastifyReply, FastifyRequest } from 'fastify'

export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }
}
o que muda é que agora la na nossa profile.ts a gente não precisa mais ter o verify. o profile ts fica assim:
import { makeGetUserProfileUseCase } from '@/use-cases/factory/make-get-user-profile'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function profile(request: FastifyRequest, reply: FastifyReply) {
  const getUserProfile = makeGetUserProfileUseCase()
  const { user } = await getUserProfile.execute({
    userId: request.user.sub,
  })

  return reply.status(200).send({ user: { ...user, password_hash: undefined } })
}

porem nas nossas rotas que precisarem de autorização a gente vai colocar um argumento entre a rota e o controler e nele vamos passar um objeto de configuração. e para esse objeto de configuração a gente pega o onRequest e passamos o nosso middleware de verificaçao.
assim:
  app.get('/me', { onRequest: [verifyJWT] }, profile)
  não sei porque a gente passa ele dentro de array e não de objeto.
  aqui o que acontece é que esse onrequest passa antes do nosso controler e ele passa o nosso request pelo verify e se não for autentificado ele ja retorna o erro e nem roda o controler.

  # test environment
  teste end to end precisa bater no banco de dados. ele precisa testar a aplicação assim como um usuario utilizaria ela.
  então não podemos usar o banco separado para testes e um para desenvolvimento. podemos melhor ainda separar o banco de dados por suite de testes.
  a gente pode fazer com que os testes executem em um ambiente totalmente isolado. ele tem que ter minima interferencia com outros testes que executaram antes dele. resolvemnos isso nos unitarios com o inmemory repository e antes de cada teste a gente zera eles e ai o teste roda limpo.
  em end to end é mais complicado porque como temos banco de dados reais é mais pesado limpar sempre o banco de dados.
  então sera que da pra abrir mão de um pouco essa interferencia para ter mais performace na nossa aplicação.
  suite de test suite de teste é um arquivo com varios teste.
  a gente pode ter um ambiente limpo para cada suite ou seja a gente tem varios testes que rodam no mesmo contexto, dessa forma não precisa sujar tanto o banco de dados nem perder muitooo tempo mimpando tudo a zero sempre.
  o prisma usa a env.database_url para definir qual vai ser a database que vai ser usada. nos precisamos então que em cada suite de testes a gente mude essa url.
  existem varias formas de fazer isso. 
  aqui nos vamos usar o conceito de test environment que é uma configuração de ambiente para alguns tipos de testes possiveis.
  podemos no caso usando a testenviromnet mudar uma variavel ambuente.nos podemos tambem fazer muitas coisas nesse enviromnemt como executar script, migrations, etc.
  o problema é que atualmente a gente não pode ainda com o vitest configurar as enviromnet no nosso desenvolvimento . a gente so pode fazer isso configurando um pacote npm que tem como nome vitest-environment. tem varios no google que ja fiweram esses pacotes mas a gente queria criar o nosso. porem ainda assim a gente consegue burlar isso um pouco. dentro do prisma vamos fazer uma pasta.
  vitest-environment-prisma 
  o nome presica ser esse.
  vamos no terminal e vamos dar um cd para essa pasta e dar um npm init -y
  assim estamos criando um pacote json dentro dela.
  ai vamon no package json qjue isos criou e apagamos o script e mudamos o main para o nome prisma-test-environment
  e criamos esse arquivo tambem dentro dessa pasta
  prisma-test-environment.ts
  o package fica assim
  {
  "name": "vitest-environment-prisma",
  "version": "1.0.0",
  "description": "",
  "main": "prisma-test-environment.ts",
  "keywords": [],
  "author": "",
  "license": "ISC"
}

e agora no nosso arquivo prismatestenvironment a gente para testar vai importar de dentro do vitest o Environment e vamos dar um export default nele. e para que ele fique tipado e a gente possa ter o autocomplete dele a gente vai colocar um <environment >
a pagina fica assim

import { Environment } from 'vitest'

export default <Environment>()

agora temos que colocar as coisas que vao dentro desse environment o primeiro é o nome a gente pode colocar o que quiser.
e depois dele vamos colocar a unica função que o nevironment precisa que é a função chamada setup. essa função vai ser o que vai ser executado antes de cada suite de testes e nela a gente pode colocar o que quiser. 
depois a gente tem que retornar pelo menos um objeto com o metodo teardown e a gente pode deixar esse teardown vazio. fica assim 
import { Environment } from 'vitest'

export default <Environment>{
  name: 'prisma',
  async setup() {
    console.log('rodando')

    return {
      teardown() {
        console.log('parou de executar')
      },
    }
  },
}

porem para funcionar eu precisei instalar a versão mais antiga do vitest com esse comando:
 npm i vitest@0.33.0 -D

 agora vamos fazer o test do register.
 CRiamos no controler o register.spec.ts
 nele a gente importa o test do vitest e vamos so fazer um test para ver se o ambiente que a gente criou esta fucnionando.
 então vamos fazer algo bem simples: para o test ok a gente deixa em branco
 import { test } from 'vitest'

test('ok', async () => {})

o quea gente vai fazer agora:
queremos que sempre que um teste da pasta http for executado a gente quer que ele use o ambiente que a gente criou chamado vitest-environment-prisma
para isso nos vamos la nas configs do vite vite.config.ts
e la esta assim:
import { defineConfig } from 'vitest/config'
import tsconfigpaths from 'vite-tsconfig-paths'
export default defineConfig({
  plugins: [tsconfigpaths()],
})

a gente pode depois do plugins adicionar o test: e passar para ele um objeto nesse objeto a gente chama environmentsmacthglobe e passamos um array e dentro dele mais um array
  test: {
    environmentMatchGlobs: [
      []
    ]
  }
  dentro desse array o primeiro parametro que a gente vai passar é o caminho para os testes. ou seja para os testes que estiverem dentro de src dentro de http, dentro de controllers e ai dentro de qualquer outra pasta simbolizado po ** a gente vai fazer algo. então o caminho é esse
   'src/http/controllers/**'
   damos uma virgula e passamos entre aspas o ambiente que a gente ta criando chamado prisma. esse prisma precisa ser o nome que vem exatamente depois do vitest-environment- da pasta que a gente criou. então se o nome da pasta fosse vitest-environment-teste a gente escreveria teste ai
   fica assim:

   import { defineConfig } from 'vitest/config'
import tsconfigpaths from 'vite-tsconfig-paths'
export default defineConfig({
  plugins: [tsconfigpaths()],
  test: {
    environmentMatchGlobs: [['src/http/controller/**', 'prisma']],
  },
})

porem se a gente tentar rodar isso não vai funcionar porque ele vai procurar no nosso packagejson principal um packote com esse nome e não vai achar.
então agora vem o armengue.
entéao temos que no terminal ir para a pasta que tem o arquivo packagejson que a gente fez ou seja para a pasta vitest-environment prisma
essa pasta precisa ter um arquvio chamado packagejson e esse arquivo precisa ter o nome vitest-environment-prisma (se não não vai funcionar)
e la a gente da o comando npm link e esse link vai criar um link entre o pacote pricnipal e o nosso que a gente criou
agora a gente tem que votltar na raiz do projeto para instalar esese link a gente vai na raiz do projeto e da esse comando:
npm link vitest-environment-prisma
com isso ele instala
o teardown tambem precisa ser async.
vamos logo fazer tambem o arquivo autentificate.spec.ts e colocar nele o mesmo codigo do teste do register{})

com isso se a gente rodar o npm run test ele ja acha o  ✓ src/http/controller/register.spec.ts (1)
teste do controller.
agora so falta a gente implementar as logicas dos testes end2end

# organizeação de scripts
antes de fazer os testes vamos oorganizar um poucos nosso scripts de testes, para termos um script pata cada tipo de teste en não ficar rodando otodos os testes quando a gente quiser rodar so os unitarios, nem so os E2E.
vamos no package.json
vamos fazer um srcip para teste end to end que vai ser o vitest run mas passando uma flag de diretorio e mandando ele ir la na http que esta dentro do src e rodar os arquivos so desta pasta fica assim esse script:
 "test:e2e": "vitest run --dir src/http",
 vamos agora fazer yamoscrip o mesmo esquema masos testes unitarios/ vamos er o mesmo esquema mas ao inves de passar a pasta http vamos passar a pasta iuse-cases fica asism o script
 "test:unit": "vitest run --dir src/use-cases",
 e vamos apagar o test puro pu então usar o script test para rodar apenas o test useCase. para ficar igual o da aula a gente vai chamar o dos test unitarios apenas de tes e assim não vamos ter um test:unit mas o srcipt que a gente passou pro test unit vai ser usado no test e no test watch.
 a paste de coverage como a gente não usa muito a gente vai deixar como ta assim como o ui. se a gente usasse munito a gente não poderia fazer um especifico para coverage de unitario e etc.

 # npm link
 é importante saber que o npm link so vai fucnioncionar na nossa maquina se a gente passasse para o github para ele executar automaticamente a gente teria que ir la executar manualmente o processo dos link e tudo mais.
 para evitar esses problemas vamos achar essa solução.
 como vamos usar test end2nd mais raramente a gente vai fazer um comando camado pretest:end2end e esse comando vai poder realizar esses processos de likar para nos.
 é importante saber que o npm executa sempre todo o script que tem o pre ou o post antes ou depois do caomando que tem essa keyword entãpo nos temos que escrever o comando exatameten igual como esta o nosso teste end to end som que com o pre antes. se o nosso test end 2 end esta la no script assim: "test:e2e" a gente tem que escrever o pre assim pretest:e2e e nao algo como pretest:End2end ou preTest:e2e. entao como a gete vai vaer um pretest:e2e ele vai rodar isso sempre que a gente der o comando test:e2e e vai rodar antes do comando do test:e2e.
 a gente poderia entao no pretest fazer um cd prisma/vitest-environment-prisma && npm link assim ele iria ate a pasta desejada e rodaria o npm link.
 mas isso so roda em unix e em mac não vai rodar em windowns. para contornar esse problema a gente vai instalar um pacote como dependencia chamado npm run all
 npm install -D npm-run-all
 com isso vai rodar em qualquer sistema
 e agora para executar ele a gente vai la no script e vai mudar a forma . vamos dar o run-s na primeira coisa do scfript que ai ele vai executar o run all para a gente e logo apos o run-s temos tambem a opção do runp que vai rodar paralemaente mas a gente não quer iso a gente quer que primeiro rode o cd e depois o npm link
 mas para isso rodar a gente vai criar dois scripts anteriores que para rodar eles que vai ser
 test:create-prisma-environment e ele vai dar o npm link e passar o caminho da pasta (para o npm link funciona da mesma forma que dar o cd para a pasta e rodar o npm link) fica assim:
  "test:create-prisma-environment": "npm link ./prisma/vitest-environment-prisma" ,
 e outro chamado test:install-prisma-environment esse é o de instalar que vai ser o npm link e o nome do pacote que a gente criou que vai ser vitest-enrironment-prisma
 em outras palavras ul cira o pacote na maquina e o segundo instala ele.
 agora nos vamos la no pretest:e2e e damos o run-s a gente coloca o nome dos dois comandos e ai fica assim:
     "pretest:e2e": "run-s test:create-prisma-environment test:install-prisma-environment"
     o arquivo package json fica assim:
     {
  "name": "proj3",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsup src --out-dir build",
    "start": "node build/server.js",
    "test:create-prisma-environment": "npm link ./prisma/vitest-environment-prisma" ,
    "test:install-prisma-environment": "npm link vitest-environment-prisma" ,
    "test": "vitest run --dir src/use-cases",
    "pretest:e2e": "run-s test:create-prisma-environment test:install-prisma-environment",
    "test:e2e": "vitest run --dir src/http",
    "test:watch": "vitest --dir src/use-cases",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@rocketseat/eslint-config": "2.1.0",
    "@types/bcryptjs": "2.4.4",
    "@types/node": "18.16.1",
    "@vitest/coverage-v8": "0.34.6",
    "@vitest/ui": "0.34.6",
    "eslint": "8.50.0",
    "npm-run-all": "4.1.5",
    "prisma": "5.3.1",
    "tsup": "7.2.0",
    "tsx": "3.12.10",
    "typescript": "5.2.2",
    "vite-tsconfig-paths": "4.2.1",
    "vitest": "0.33.0"
  },
  "dependencies": {
    "@fastify/jwt": "7.2.2",
    "@prisma/client": "5.3.1",
    "bcryptjs": "2.4.3",
    "dayjs": "1.11.10",
    "dotenv": "16.3.1",
    "fastify": "4.23.2",
    "zod": "3.22.2"
  }
}

agora quando a gente rodar o test:e2e ele tem que rodar todo o processo de fazer os links e depois rodar os testes.
ele realmente faz isso. demora um pouco mais mas garante que o teste não vai ter problema por estar desconexo;.
# environment config
vamos agora la no nosso environment porque por enquanto ele so ta dando um console.log e um teradown e nos vamos configurar ele para dar um banco de dados isolado para cada suit de testes.
o que a gente quer fazer é mudar a variavel de b a database_url para vcada suite de testes.
o postgress perùite que a gente alem de ter o nosso banco de dados dentro dele existe uma outra separação que saéao o s schemas que é basicamente uma forma de a gente separar o banco de dados em varios banco de dados menor. o padrão que a gente usa é o public que é o nosso banco de dados padrão. mas a gente pode fazer outros schemas que vao ser isolados e eles não vao compartilhar dados com outros schemas. vamos usar o ramdumuuid para dar o nome ao schema dentro da função setup assim:
 const schema = randomUUID()
 e o que a gente quer fazer agora é pegar a nossa url da variavel database_url que é assim DATABASE_URL="postgresql://docker:docker@localhost:5432/apisolid?schema=public"
 e mudar o public do schema final.
 para fazer isso vamos fazer uma função chamada generatedatabaseurl e ela vai receber o nome do schema e ai a gente vai fazer um if para se dentro do process.env.database não houver a databaseurl a gente ja pode dar um erro porque ele precisa disso para funcionar.
 function generateDatabaseUrl(schema: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Please provide an DATABASE_URL environment variable')
  }
  se existir a gante vai criar uma instancia da classe URL que é global no node então a gente pode declarar ela sem criar e vamos passar para ela o proces env database url assim:
  const url = new URL(process.env.DATABASE_URL)
  agora nos temos acesso usando o url. a cada parte do url separada como host, port, protcol e etc.
  o schema=public q gente chama de serach params ou query params
  e ai nesse caso é searchparams e aio a gente vai dar um .set para substituir uma coisa por outra e a gente vai colocar a variavel shema e substituir ela pelo schema que a gente recebe nos parametros.
    url.searchParams.set('schema', schema) no final a gente retorna esa url e da um tostring para ele devolver ela como string ai ele vai devolver uma nova url.
    se agora dentro da nossa export default Environmnet a gente der um console.log e passar essa função generateDatabaseUrl e passar para ela o schema que a gente gerou com o ramdom uuid. a gente deve ver a nova url com um valor ramdomico no schema.
    fica assim a pagina para test com esse console.log
    import { randomUUID } from 'node:crypto'
import { Environment } from 'vitest'

function generateDatabaseUrl(schema: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Please provide an DATABASE_URL environment variable')
  }

  const url = new URL(process.env.DATABASE_URL)

  url.searchParams.set('schema', schema)

  return url.toString()
}

export default <Environment>{
  name: 'prisma',
  async setup() {
    const schema = randomUUID()

    console.log(generateDatabaseUrl(schema))

    return {
      async teardown() {
        console.log('parou de executar')
      },
    }
  },
}


agora se a gente rodar o test:e2e a gente deve ver a url la.
eu acho que esta tendo problema para ele rodar isso ntes dos testes. então eu vou terminar a aula e depois voltar para resolver esse problema achei  erro
# o erro era
no vitest.cofig o endereço do controller esta errado
import { defineConfig } from 'vitest/config'
import tsconfigpaths from 'vite-tsconfig-paths'
export default defineConfig({
  plugins: [tsconfigpaths()],
  test: {
    environmentMatchGlobs: [['src/http/controller/**', 'prisma']],
  },
})
 o correto é controller e não constrollers como tava antes. eu vou aproveitar e voltar aqui nas anotações e substituir onde eu tinha colocado a pagina inicialmente.
antes de tudo temos que tambem importar o dot.env nessa pagina
import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import { Environment } from 'vitest'

agora nos temos uma database com o schema diferente para cada teste.
vamos tirar esse console.log que era so um teste para ver se estava tendo acesso e agora no lugar dele vamos.
vamos pegar a process.env.DATABASE_URL e sobescrever com a nossa nova que a gente setou; assim:
 async setup() {
    const schema = randomUUID()

    const databaseURL = generateDatabaseUrl(schema)

    process.env.DATABASE_URL = databaseURL

  agora vamos usar isso para fazer as nossas migrations. assim nesse novo schema a fgente vai ter as tabeas de nossa aplicação.
  para fazer isso a partir do typescript a gente vai importar de dentro do node:childprocess uma função chamada execSync ess fu,ção a gente chama e tudo que a gente passar para ela vai ser como um comando executando no terminal. ai nela a gente vai passar npx prisma migrate deploy
  não vamos executar o migrate deve e sim o deploy porque nesse momento eu não quero que o prisma faça o processo de comparar o schema local com o banco de dados que existe para ver se houveram alterações e criar nova migrations. a gente so quer que ele abra a pasta migrations e execute elas.
  a pagina fica assim:
  import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import { execSync } from 'node:child_process'
import { Environment } from 'vitest'

function generateDatabaseUrl(schema: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Please provide an DATABASE_URL environment variable')
  }

  const url = new URL(process.env.DATABASE_URL)

  url.searchParams.set('schema', schema)

  return url.toString()
}

export default <Environment>{
  name: 'prisma',
  async setup() {
    const schema = randomUUID()

    const databaseURL = generateDatabaseUrl(schema)

    process.env.DATABASE_URL = databaseURL

    execSync('npx prisma migrate deploy')

    return {
      async teardown() {
        console.log('parou de executar')
      },
    }
  },
}

agora nos criarmos um novo 'banco de dados' no nosso banco de dados identico ao nosso banco de dados padrão e ele vai ser usado em nossos testes. cada suit de testes vai ter um/.
porem ainda precisamos eliminar ele quando a suite de testes terminar.
então para isso vamos usar o teardown
vamos antes de tudo fazer uma const prisma antes da função generate e esse prisma vai ser o new PrismaClient() isso vai ser para instanciar e criar uma conexão com o banco de dados.
agora dentro do teardown
vamos dar um await nele pegar o prisma
se a gente der um . apos o prisma a gente tem as funções $executeRaw e executeRawUnsafe o execute raw serve para a gente fazer operações no banco de dados como delete e etc coisas que não são buscas. quando for buscas vamos usar o query Raw. a diferença é que o unsafe permite fazer coisas que podem ser maliciosas como apagar banco de dados. o raw que não é unsafe tambem protege contra sql injection so que nesse caso a gente quer exatamente apagar o banco de dados. então vamos usar o rawUnsafe e passar depos dele parenteses e não literal strings como a gente usou no outro e dentro dele vamos colocar os literal string ai dentro dessas aspas nos vamos mandar um drop schema e vamos adicionar uma checagem por via das dvidas que é q if existes agora por volta do nome do schema tem q ter aspas enéao a gente coloca aspas duplas  e passamos o nosso ${} para colocar o nome do schema que é a const schema q a gente criou e no fim a gente bota CASCADE o cascade faz com que se alguma informação depender desse schema ela vai ser apagada ambem. ou seja tudo que for criada com o schema vai ser apagado junto no caso indice, chave prmaria chave foringer tudo. e por fim depois de fechar o rawunsafe a gente faz um await prisma disconect() para poder fechar o banco de dados depois dos testes.
fica assim:
import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import { execSync } from 'node:child_process'
import { Environment } from 'vitest'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function generateDatabaseUrl(schema: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Please provide an DATABASE_URL environment variable')
  }

  const url = new URL(process.env.DATABASE_URL)

  url.searchParams.set('schema', schema)

  return url.toString()
}

export default <Environment>{
  name: 'prisma',
  async setup() {
    const schema = randomUUID()

    const databaseURL = generateDatabaseUrl(schema)

    process.env.DATABASE_URL = databaseURL

    execSync('npx prisma migrate deploy')

    return {
      async teardown() {
        await prisma.$executeRawUnsafe(
          `DROP SCHEMA IF EXISTS "${schema} CASCADE"`,
        )
        await prisma.$disconnect()
      },
    }
  },
}

agora que ja temos um contexto isolado para cada suite de testes executar a gente pode escrever uos nosso testes end 2 end.

# testes e2e
vamos começar instalando a supertest que é a biblioteca mais utilizada para rodar testes end 2 end sem precisar colocar a aplicação no ar
npm i supertest -D
temos que instalar tambem os types separadamente porque não é uma biblioteca desenvolvida com typescript
npm i @types/supertest -D
agora vamos la no nosso test de register e imoortamos o app do @/app e o request do supertest
import {request} from 'supertest'
import {app} from '@/app'

importamos o describe do vitest e usamos ele descrevendo a suite como register (e2e) e dentro dele vamos fazer um teste se pode registrar
import { describe, test } from 'vitest'
import  request  from 'supertest'
import { app } from '@/app'

describe('register (e2e)', () => {
  test('if can register', async () => {})
})

agora dentro desse teste vamos fazer uma cont response = vamos dar um await request(app.server) para fazer a conexão com o server e ai a gente da um .post para postar na rota users e ai a gente da um .send() e as informações para criar um novo usuario
    const response = await request(app.server).post('/users').send({
      name: 'Jhon Doe',
      email: 'jhondoe@example.com',
      password: 'testpassword',
    })

    agora a gente pode criar as nossas expectations
 expect(response.statusCode).toEqual(201) a gente espera o estatuscode ser 201 que é sucesso.

 vamos tambem antes do teste criar um beforeAll e um afterall
 para garantir que antes dos testes executerm o nosso app do fastify esteja pronto ou seja ready. é um evento que o fastify emite para a gente saber que a aplicação terminou de ser inicializada e no afterall a gente que feche a aplcação.
 o teste fica assim:
 import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '@/app'

describe('register (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
  })
  test('if can register', async () => {
    const response = await request(app.server).post('/users').send({
      name: 'Jhon Doe',
      email: 'jhondoe@example.com',
      password: 'testpassword',
    })

    expect(response.statusCode).toEqual(201)
  })
})

para evitar de ficar fazendo o link todas as vezes a gente pode criar um script para o test:e2e:watch
"test:e2e:watch": "vitest --dir src/http",
rodando o docker e rodando esse comando os testes passam.

vamos agora fazer o teste do autenticate. a gente vai colar o este do register nele e mudar o nome para autenticate 
vamos deixar a criação de usuario que ja tinha porque para fazer login a gente precisa antes criar um usuario.
então a gente tira so o const response e deixar so a criação usando o await
a gente copia o email e password utilizados porque devemos ter eles para fazer o login.
fazemos então uma const response sendo o await app.server usando o metodo post na rota sessions que é a rota do autenticate.
e a gente passa o email e senha.
e agora a gente espera que o status code seja 200
e esperamos tambem que dentro do corpo da resposta venha um token e esse token é qualquer string
 ap pagina fica assim:
 import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '@/app'

describe('autenticate (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
  })
  test('if can autenticate', async () => {
    await request(app.server).post('/users').send({
      name: 'Jhon Doe',
      email: 'jhondoe@example.com',
      password: 'testpassword',
    })
    const response = await request(app.server).post('/sessions').send({
      email: 'jhondoe@example.com',
      password: 'testpassword',
    })

    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual({
      token: expect.any(String),
    })
  })
})


é importante entender que a gente não cria teste end2end para cada regra de negocio da aplicação, eles são mais abertose globais e e vão meio que testar as rotas. a gente não vai fazer um test end2end pra ver se caso o usuario mandar uma senha errada se ele não deixa autentificar. isso a gente faz nos testes unitarios. a gente testa no e12e as rotas de sucesso da aplicação. como cada teste e2e é pesado a gente não faz testes deles para testar coisas que ja são testadas nos unitarios. então a gente faz so esse teste para testar o fluxo de autentificação.
vamos  agora fazer um teste para o perfil então vamos abrir um arquivo
profile.spec.ts e nele vamos copiar o testo do autenticate.

mudamos o nome
agora temos que saber que para acessar o perfil de um usuario a gente precisa logar e para logar a gente precisa criar a cota. enão vamos fazer de uma forma mais simples e depois vamos otimizar.
primeiro vamos deixar com a criação e o login com as chamadas await
chamamos o longin de authResponse e pegamos de dentro do authresponse.body o token
agora podemos fazer uma requisição chamada de profileResponse para a rota me manda o metodo get para a rota me  e passar no header  o token para mandar o header a gente usa o .set ai a gente passa o Authorizatiion en string para o metodo set depois em segundo argumento o em string literal o bearer com o token em ileatarçéo e depois damos um send para enviar essa requisiçéao. o set tem que ser esatamente assim para que ele entenda que é um jwt.
 const profileResponse = await request(app.server)
      .get('/me')
      .set('Authorization', `Bearer ${token}`)
      .send()

agora a gente espera que do profile response a gente tenha um statuscode 200 e tambem esperamos que no body tenha um objeto e ele seja igual a um objeto contedo email
fica assim:
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '@/app'

describe('profile (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
  })
  test('if can get user profile', async () => {
    await request(app.server).post('/users').send({
      name: 'Jhon Doe',
      email: 'jhondoe@example.com',
      password: 'testpassword',
    })
    const authResponse = await request(app.server).post('/sessions').send({
      email: 'jhondoe@example.com',
      password: 'testpassword',
    })
    const { token } = authResponse.body

    const profileResponse = await request(app.server)
      .get('/me')
      .set('Authorization', `Bearer ${token}`)

    expect(profileResponse.statusCode).toEqual(200)
    expect(profileResponse.body.user).toEqual(
      expect.objectContaining({
        email: 'jhondoe@example.com',
      }),
    )
  })
})

ou seja a gente cria o usuuario, faz o login pega o token do login e ai faz a autentificação e ve se ele retorna o codigo certo e o usuario como a gente quer.
so que daqui para frente todas as rotas de nossa aplicação vao exigir que o usuario esteja logado. então a gente poderia talvez separar isso em uma funç;:éao. mas vamos focar em outros controller por enquanto e depois a gente ortimiza isso.

## outras rotas
vamos criar agora outras rotas para nosos outros casos de uso.
vamos dar uma organizada nos controllers
vamos criar uma pasra chamada users e todos os controlers e seus testes relacionados a users a gene joga la.
vamos mover tambem o routes para la se ele não arrumar as importações automaticamente a gente arruma.
agora vamos ter uma nova s nelemada gyms e vamos colocar um outro routes nele, para ter todas as rotas relacionadas a academia dentro dele. em cada um dos routes a gente vai mudar o nome de approutes para usersroutes ou gymroutes
no gym rotes a gente apaga todas as rotas e as importações dos controllers de users.
ele fica assim:
import { FastifyInstance } from 'fastify'

import { verifyJWT } from '../../middleware/verify-jwt'

export async function gymRoutes(app: FastifyInstance) {
 
}

agora dentro dele vamos pegar o app do fastify vamos dar um .addHook('onRequest', verifyJWT) ou seja a gente adicionou um hook para todos os request passarem pelo verify todas as rotas que estão dentro desse arquivo de rotas vao passar pelo midleware de autentificação. a gente fez diferente do users, porque la tem rotas que não precisa estar autentificado e outras que precisam. ai a gente deu o verify de outra forma/
mudamos o app para agora usar as userRoutes e as gymroutes e não mais as approutes ele fica assim:
import fastify from 'fastify'
import { userRoutes } from './http/controller/user/routes'
import { ZodError } from 'zod'
import { env } from './env'
import fastifyJwt from '@fastify/jwt'
import { gymRoutes } from './http/controller/gym/routes'

export const app = fastify()
app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})
app.register(userRoutes)
app.register(gymRoutes)

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation error', issues: error.format() })
  }
  if (env.NODE_ENV !== 'production') {
    console.error(error)
  } else {
    // TODO here we should log to a external tool like newrelic, datadog, sentry
  }
  return reply.status(500).send({ message: 'Internal server error' })
})

ainda vamos mostrar como ficaram as rotas gym, calma/;
vamos criar os controlers do gym. na pasta gym abrimos um novo arquivo com nome create.ts
vamos copiar o controler de registro de usuarios para ele.
e vamos mudar o nome para create
a const de schema vai se chamar creategymbodyschema
vamos coloca nele o titulo que é uma string uma descrição que é string ou nullable
o telehone que é uma string e nullable
oa latitude que é um number e nele podemos fazer uma validação um pouco maior que não é nativa do zod para isso a gente tem que usar o refine o refine traz o valor do campo e a gente faz uma arrow para dizer se ele va ser true ou false a depender dos criterios que a gente vai passar. e ai para fazer uma validação de latitude e longitude é o seguinte
a latitude sempre precisa ser um valor menor ou igual a noventa, porem pode ser tanto 90 negativo quanto positivo então a gente envolve o value em o Mah.abs esse metodo transforma qualquer numero em positivo.
a longitude a gente faz igual mas ela pode ser até 180
fica assim:

const createGymBodySchema = z.object({
    title: z.string(),
    description: z.string().nullable(),
    phone: z.string().nullable(),
    latitude: z.number().refine((value) => {
      return Math.abs(value) <= 90
    }),
    longitude: z.number().refine((value) => {
      return Math.abs(value) <= 180
    }),
  })
  agora a gente pode usar esse schema no lugar do registerBodySchema loco na cost abaixo para dar o parse e pegamos dela os campos que a gente acabou de tipificar
  
  const { title, description, phone, latitude, longitude } =
    createGymBodySchema.parse(request.body)
    e agora a gente vai pegar o nosso caso de uso que é makeCretaGymusecase e dar o nome correto e não register para ele e depois a gente da o await execute nele passando o title phone e etc..
    como o nosso creategym não tem nenhum tipo de erro especial criado a gente pode retirar esse trycatch. porque como não tem nenhul tipo de erro que a getne criou ele vai cair la no nosso erro global que a gente fez.
    pronto agora a gente tira as importações que n:éao usamos e o controller do gym create esta pronto. ele fica assim:
    import { makeCreateGymUseCase } from '@/use-cases/factory/make-create-gym-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createGymBodySchema = z.object({
    title: z.string(),
    description: z.string().nullable(),
    phone: z.string().nullable(),
    latitude: z.number().refine((value) => {
      return Math.abs(value) <= 90
    }),
    longitude: z.number().refine((value) => {
      return Math.abs(value) <= 180
    }),
  })

  const { title, description, phone, latitude, longitude } =
    createGymBodySchema.parse(request.body)

  const createGymUseCase = makeCreateGymUseCase()
  await createGymUseCase.execute({
    title,
    description,
    phone,
    latitude,
    longitude,
  })

  return reply.status(201).send()
}

vamos agora fazer os dois outros controles de academias o search.ts e o nearby.ts
copiamos o create no search e mudamos o nome. na tipioficação a gente muda o nome e dentrro dela a gete coloca o query qie é uma string e a page. sabendo que tudo que vem da queryparams vai ser uma string q gente pode dar um coerce para a page se tornar um numero. e depois disso a gente diz que o minimo de page é 1 e que se não tiver nada o default é 1 fica assim:
export async function search(request: FastifyRequest, reply: FastifyReply) {
  const searchGymQuerySchema = z.object({
    query: z.string(),
    page: z.coerce.number().min(1).default(1),
  })
  agora na const abaixo a gente pega o query e o page desse parse e depois a gente muda a instanciação para o search e quando usamos o execute a gente passa a query e page.
  const { query, page } = searchGymQuerySchema.parse(request.body)

  const searchGymUseCase = makeSearchGymsUseCase()
 const {gyms} await searchGymUseCase.execute({
    query,
    page,
  })
  e no fim a gente devolve a lista de academia. a pagina fica assim:
import { makeSearchGymsUseCase } from '@/use-cases/factory/make-search-gyms'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function search(request: FastifyRequest, reply: FastifyReply) {
  const searchGymQuerySchema = z.object({
    query: z.string(),
    page: z.coerce.number().min(1).default(1),
  })

  const { query, page } = searchGymQuerySchema.parse(request.body)

  const searchGymUseCase = makeSearchGymsUseCase()
  const { gyms } = await searchGymUseCase.execute({
    query,
    page,
  })

  return reply.status(201).send({
    gyms,
  })
}


agora para o nearby. a gente precisa da latitude e longitude. entéao a gente copia a validação de latitude e longitude do create o resto vem do search.
a gente faz as alteraçoes como nas outras vezes chama a latitude e longitude vindo do parse passa eles pro execute e no final devolve as gyms tambem. fica assim:
import { makeFetchNearbyGymsUseCase } from '@/use-cases/factory/make-fetch-nearby-gym-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function nearby(request: FastifyRequest, reply: FastifyReply) {
  const nearbyGymQuerySchema = z.object({
    latitude: z.number().refine((value) => {
      return Math.abs(value) <= 90
    }),
    longitude: z.number().refine((value) => {
      return Math.abs(value) <= 180
    }),
  })

  const { latitude, longitude } = nearbyGymQuerySchema.parse(request.body)

  const fetchNearbyGymUseCase = makeFetchNearbyGymsUseCase()
  const { gyms } = await fetchNearbyGymUseCase.execute({
    userLatitude: latitude,
    userLongitude: longitude,
  })

  return reply.status(201).send({
    gyms,
  })
}

agora vamos criar as rotas para eles.
vamos la no gym/routes.ts
la vamos fazer duas rotas get indo para gyms/o nome da rota nearby ou serch e uma rota post que vai so para gyms e vai usar o controler create importamos todos os controlles e a pagina fica assim:
import { FastifyInstance } from 'fastify'

import { verifyJWT } from '../../middleware/verify-jwt'
import { search } from './search'
import { nearby } from './nearby'
import { create } from './create'

export async function gymRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('gyms/search', search)
  app.get('gyms/nearby', nearby)

  app.post('gyms', create)
}

## controllers check in
vamos fazeer os controllers de checkin
vamos fazer uma pasta dentro do controllers com o nome checkin  dentro dela um arqauivo chamado routes.ts e ele pode ser igual ao do gyms so que a gente tira todas as rota e deixa apenas o hook da verificação e muda o nome dele.
import { FastifyInstance } from 'fastify'

import { verifyJWT } from '../../middleware/verify-jwt'

export async function checkInRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)
}

vamos agora criar os arquivos. nos temos um create, um history, um metrics, e um validate.

vamos copiar o create de gyms para colocar no create de checkin.
vamos fazer o createcheckinbody schema
ele precisa de um latitude e longitude que vao ser do usuario. o usuario vai fazer checkin em uma academia specifica. a gente pode fazer de duas formas, ou a gente recebe o id da academia no body, ou então a gente pode fazer para a rota receber 
  app.post('/gyms/:gymId/check-ins', create) assim a gente passa o id do gym pelo parametro da rota.

  então nos vamos criar um schema separado pra isso.
  fica assim os dois schemas
  export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createCheckinParmsSchema = z.object({
    gymId: z.string().uuid(),
  })
  const createCheckinBodySchema = z.object({
    latitude: z.number().refine((value) => {
      return Math.abs(value) <= 90
    }),
    longitude: z.number().refine((value) => {
      return Math.abs(value) <= 180
    }),
  })

  agor a a gente pega a latitude e longitude do parse do body.

  const { latitude, longitude } = createCheckinBodySchema.parse(request.body)
  const { gymId } = createCheckinParmsSchema.parse(request.params)

  ## correção. no nearby do gyms a gente ta usando body, no request tem que ser query   const { latitude, longitude } = nearbyGymQuerySchema.parse(request.query) mesma coisa no search.

  no execute do create checkin a gente precisa tambem passar o id do usuario usando o request.user.sub. ele fica assim:
    const createCheckInUseCase = makeCheckInUseCase()
  await createCheckInUseCase.execute({
    gymId,
    userId: request.user.sub,
    userLatitude: latitude,
    userLongitude: longitude,
  })
   o controler de create fica assim:
   import { makeCheckInUseCase } from '@/use-cases/factory/make-check-in-use-case'
import { makeCreateGymUseCase } from '@/use-cases/factory/make-create-gym-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createCheckinParmsSchema = z.object({
    gymId: z.string().uuid(),
  })
  const createCheckinBodySchema = z.object({
    latitude: z.number().refine((value) => {
      return Math.abs(value) <= 90
    }),
    longitude: z.number().refine((value) => {
      return Math.abs(value) <= 180
    }),
  })

  const { latitude, longitude } = createCheckinBodySchema.parse(request.body)
  const { gymId } = createCheckinParmsSchema.parse(request.params)

  const createCheckInUseCase = makeCheckInUseCase()
  await createCheckInUseCase.execute({
    gymId,
    userId: request.user.sub,
    userLatitude: latitude,
    userLongitude: longitude,
  })

  return reply.status(201).send()
}

vamos para os proximos.
para o history vamos copiar o search do gyms vamos substituir as coisas e ele fica assim:
import { makeFetchUserCheckInHistoryUseCase } from '@/use-cases/factory/make-fetch-user-checkins-history'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function history(request: FastifyRequest, reply: FastifyReply) {
  const CheckinHitoryQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
  })

  const { page } = CheckinHitoryQuerySchema.parse(request.query)

  const fetchUserCheckInHistoryUseCase = makeFetchUserCheckInHistoryUseCase()
  const { checkIns } = await fetchUserCheckInHistoryUseCase.execute({
    userId: request.user.sub,
    page,
  })

  return reply.status(200).send({
    checkIns,
  })
}

para o de metricas a gente copia o de history que é bem semelhante mas elas não tem nem parametro. então tiramos essa parte. apos as substituições fica assim:
import { makeGetUserMetricsUseCase } from '@/use-cases/factory/make-get-user-metrics'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function history(request: FastifyRequest, reply: FastifyReply) {
  const getUserMetricsUseCase = makeGetUserMetricsUseCase()
  const { checkInsCount } = await getUserMetricsUseCase.execute({
    userId: request.user.sub,
  })

  return reply.status(200).send({
    checkInsCount,
  })
}

para o validate a gente copia o create. mas a gente pega o id do cheki atravez dos parametros. porque a rota dos checkins vai ser um patch porque queremos mudar uma unica informação, e ela vai passar o checkinId nos parametros
 app.patch('/check_ins/:checkInId/validate', validate)
 voltando ao controller, não vai ter body
 ficou assim:
 import { makeValidateCheckInUseCase } from '@/use-cases/factory/make-validate-check-in'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function validate(request: FastifyRequest, reply: FastifyReply) {
  const validateCheckInParmsSchema = z.object({
    checkInId: z.string().uuid(),
  })

  const { checkInId } = validateCheckInParmsSchema.parse(request.params)

  const validateCheckInUseCase = makeValidateCheckInUseCase()
  await validateCheckInUseCase.execute({
    checkInID: checkInId,
  })

  return reply.status(204).send()
}

como o checkInId esta escrito diferente em dois lugares diferentes a gente teve que passar ele assim, fiquei com preguiçq de ir la nos arquivos corrigir.
por não ter nenhuma respsota a gentevai enviar um status code de 204
voltamos agora nas rotas para criar as outras, nos ja temos a post e a patch agora vamos criar uma get para history e outra para metric a pagina ficou assim:

import { FastifyInstance } from 'fastify'

import { verifyJWT } from '../../middleware/verify-jwt'
import { create } from './create'
import { validate } from './validate'
import { history } from './history'
import { metrics } from './metrics'

export async function checkInRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/check-ins/history', history)
  app.get('check-ins/metrics', metrics)

  app.post('/gyms/:gymId/check-ins', create)

  app.patch('/check-ins/:checkInId/validate', validate)
}

# testes rotas de academia
vamos agora fazer os arquivos de teste das rotas das academias
mas antes disso a gente vai fazer uma função pra reaproveitar aquela parte nos testes do usuario que criava um usuario e fazia autentificação e devolvia o token. porque todas essas rotas vao precisar ser autenticada então vai ser mais facil ficar chamando uma função do que repetir todo aquele esauema cada vez
vamos então pegar essa parte do teste do profile:
await request(app.server).post('/users').send({
      name: 'Jhon Doe',
      email: 'jhondoe@example.com',
      password: 'testpassword',
    })
    const authResponse = await request(app.server).post('/sessions').send({
      email: 'jhondoe@example.com',
      password: 'testpassword',
    })
    const { token } = authResponse.body
  
  vamos na pasta utils e dentro dela fazemos uma pasta test e dentro dela um arquivo chamad create-and-autenticate-user.ts
  dentro dele vamos export uma funcntion com esse mesmo nome e
  nela a gente recorta aquela parte do profile test que a gente colocou acima e cola nesse novo arquivo test importamos o request do supertest e a gente passa para a função o app do fastify instance para ele conseguir fazer a requisição. e a gente retorna dela o token dentro de um objeto porque tamvez a gente possa querer retornar mais coisas.. fica assim.
  import { FastifyInstance } from 'fastify'
import request from 'supertest'

export async function createAndAuntenticateUser(app: FastifyInstance) {
  await request(app.server).post('/users').send({
    name: 'Jhon Doe',
    email: 'jhondoe@example.com',
    password: 'testpassword',
  })
  const authResponse = await request(app.server).post('/sessions').send({
    email: 'jhondoe@example.com',
    password: 'testpassword',
  })
  const { token } = authResponse.body

  return {token}
}

agora no profile a gente pega o token assim:
 test('if can get user profile', async () => {
    const { token } = await createAndAuntenticateUser(app)
    passano o nosso app para a função create and autnticate user.
    agora a gente copia o teste do profile inteiro e a gente cria um test la no gyms para criação de academia
    create.spec.ts

a gente muda os nomes do test e do describe, depois da const do token a gente faz so uma const de response.

# vamos la no app. e colocamos uma rota de checkinRoutes
export const app = fastify()
app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})
app.register(userRoutes)
app.register(gymRoutes)
app.register(checkInRoutes)
# voltamos para o teste
no response a gente da um .postna rota gyms a gente da o set da autorização como estava e a gente envia os dados para a criação
# detalhe na profile test tem o send tambem em vazio assim
   const profileResponse = await request(app.server)
      .get('/me')
      .set('Authorization', `Bearer ${token}`)
      .send()
# voltamos para o test de gym creation
a gente passa as coisas para o send e valida um status code 201 fica assim a pagina:
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { createAndAuntenticateUser } from '@/utils/test/create-and-autenticate-user'

describe('create gym (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
  })
  test('if can create a gym', async () => {
    const { token } = await createAndAuntenticateUser(app)

    const response = await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'javascript gym',
        description: 'a gym for javascript',
        phone: '0154878954',
        latitude: -27.2892852,
        longitude: -49.6481891,
      })

    expect(response.statusCode).toEqual(201)
  })
})


vamos continuar fazendo os testes para as outras funcionalidaras. vamos fazer o teste de search gyms
search.spec.ts
a gente copia o teste de create nele.e muda os nomes. para a gente testar a busca vamos terq ue criar algumas academias antes então vamos chamar a trota de criação de academia duas vezes com titulos diferentes.
agora no const response a gente vai pegar o app.server e vamos dar um get/gyms/search que é a rota da busca depois enviamos o query que vai ser um objeto com query sedo igual a java ou type enviamos o header de autorização e damos um send 
agora a gente espera que o statuscode seja duzendo esperamos que o body gyms tenha length 1 ou seja que seja um array com um unico index la dentro. e que ele seja um array que conhea um objeto que contenha o titulo typescript gym fica assim:
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { createAndAuntenticateUser } from '@/utils/test/create-and-autenticate-user'

describe('search gyms (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
  })
  test('if can search  gyms', async () => {
    const { token } = await createAndAuntenticateUser(app)

    await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'javascript gym',
        description: 'a gym for javascript',
        phone: '0154878954',
        latitude: -27.2892852,
        longitude: -49.6481891,
      })
    await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'typescript gym',
        description: 'a gym for javascript',
        phone: '0154878954',
        latitude: -27.2892852,
        longitude: -49.6481891,
      })
    const response = await request(app.server)
      .get('/gyms/search')
      .query({ query: 'type' })
      .set('Authorization', `Bearer ${token}`)
      .send()
    expect(response.statusCode).toEqual(200)
    expect(response.body.gyms).toHaveLength(1)
    expect(response.body.gyms).toEqual([
      expect.objectContaining({ title: 'typescript gym' }),
    ])
  })
})

agora vamos fazer o nearby.spec.ts quje vamos copiar do search gym a gente vai no teste do fetch nery do use case e copia as informaç éoes das academias proxima e perto e cola no nosso teste.
agora  na response a gente vai pra rota nearby e no query a gente envia a latitude elongitude  vai ser a latitude e longitude da academia que a gente quer que traga. passamos o set tokent e damos send no expect é parecido com o outro do array com um so o codigo e deve trazer um objeto dentro do array com o titlo near gym fica assim a pagina
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { createAndAuntenticateUser } from '@/utils/test/create-and-autenticate-user'

describe('search nearby gyms (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
  })
  test('if can search nearby gyms', async () => {
    const { token } = await createAndAuntenticateUser(app)

    await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'near gym',
        description: 'gym Description',
        phone: '0108074561',
        latitude: -27.2982852,
        longitude: -49.6481891,
      })
    await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'far gym',
        description: 'gym Description',
        phone: '0108074561',
        latitude: 27.0610928,
        longitude: -49.5229501,
      })
    const response = await request(app.server)
      .get('/gyms/nearby')
      .query({
        
          latitude: -27.2982852,
          longitude: -49.6481891,
       
      })
      .set('Authorization', `Bearer ${token}`)
      .send()
    expect(response.statusCode).toEqual(201)
    expect(response.body.gyms).toHaveLength(1)
    expect(response.body.gyms).toEqual([
      expect.objectContaining({ title: 'near gym' }),
    ])
  })
})
porem isso vai dar erro porque todo parametro que vem no query é obrigatoriamente uma string então la no controller do nerby a gente tem que na validação do zod dar um coerce para number

# checkin test
vamos passar para o create.spec.ts de checkin copiando o da criação de academia.
para criar o checkin a gente precisa ter uma academia criada.
vão haver casos em que para criar o checkin voce não vai ter a rota pra criar a academia. nesses casos não vai ter problema em importar o prisma e fazer a inseção manual. a com um Prisma.gym.create({
  aqui os dados da academia.
})

geralmente a gente evita de fazer isso porque isso é jum pouco mais sucetivel a erro. no caso desse teste a gente vai fazer com essa criação pelo prisma.
  const gym = await prisma.gym.create({
      data: {
        title: 'javascript gym',
        latitude: -27.2892852,
        longitude: -49.6481891,
      },
    })

    agora na nossa rota post a gente vai jogar o post no gyms/${gym.id}/check-ins pegando o ide desse gym que a gente criou.
    para fazer o checkin a gente precisa enviar a latitude e longitude e esperamos que o status seja 201
    fica assim o teste
    import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { createAndAuntenticateUser } from '@/utils/test/create-and-autenticate-user'
import { prisma } from '@/lib/prisma'

describe('create check-in (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
  })
  test('if can create a check-in', async () => {
    const { token } = await createAndAuntenticateUser(app)

    const gym = await prisma.gym.create({
      data: {
        title: 'javascript gym',
        latitude: -27.2892852,
        longitude: -49.6481891,
      },
    })

    const response = await request(app.server)
      .post(`/gyms/${gym.id}/check-ins`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        latitude: -27.2892852,
        longitude: -49.6481891,
      })

    expect(response.statusCode).toEqual(201)
  })
})

agora vamos para o teste de histoic e a gente copia o create nele.

mudamos o nome e agoa para listar os checkins a gente precisa fazer os checkins antes, então criamos tambel a academia pelo prisma. a gente poderia tambem criar o checkin pelo prisma. a gente vai usar no prisma o metodo createMany para criar varios checkins.
ai no create many a gente passa data como sendo um array e dentro de cada objeto que a gente vai passar dentro desse array vai ser um checkin diferente. temos que passar o id do gym pelo gym, mas para pegar o usuario id do usuario autentificado a gente vai ter que fazer uma const user para pegar um usuario cadastrado no banco, no nosso caso nos so temos um. etão vamos jogar um find first or trwho. 
const user = await prisma.user.findFirstOrThrow()
agora nos nossos checkins a gente pode usar ele usando o user.id
vamos fazer dois checkins iguais
e agora na const response a rota vai ser get checkin / history
no send a gente não manda nada
e no expect alem de a gente esperar um 200 de status a gente expera tambem que o body seja um array com objetos contento o gym id e o userid fica assim:
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { createAndAuntenticateUser } from '@/utils/test/create-and-autenticate-user'
import { prisma } from '@/lib/prisma'

describe('check-in history (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
  })
  test('if can list a history of check-ins', async () => {
    const { token } = await createAndAuntenticateUser(app)

    const gym = await prisma.gym.create({
      data: {
        title: 'javascript gym',
        latitude: -27.2892852,
        longitude: -49.6481891,
      },
    })

    const user = await prisma.user.findFirstOrThrow()

    await prisma.checkIn.createMany({
      data: [
        {
          gym_id: gym.id,
          user_id: user.id,
        },
        {
          gym_id: gym.id,
          user_id: user.id,
        },
      ],
    })

    const response = await request(app.server)
      .get('check-ins/history')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.checkIns).toEqual([
      expect.objectContaining({ gym_id: gym.id, user_id: user.id }),
    ])
  })
})

vamos agora fazer o metrics copiamos o history dentro dele e mudamos os nomes
deixamos a criação de academia e checkins no response mudamos a rota para check-ins/metrics

no expect deixamos o 200 e esperamos que no checkinCounts tenha igual a 2 porque temos dois checkins fica asim:
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { createAndAuntenticateUser } from '@/utils/test/create-and-autenticate-user'
import { prisma } from '@/lib/prisma'

describe('check-in metrics (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
  })
  test('if can get a count of check-ins', async () => {
    const { token } = await createAndAuntenticateUser(app)

    const gym = await prisma.gym.create({
      data: {
        title: 'javascript gym',
        latitude: -27.2892852,
        longitude: -49.6481891,
      },
    })

    const user = await prisma.user.findFirstOrThrow()

    await prisma.checkIn.createMany({
      data: [
        {
          gym_id: gym.id,
          user_id: user.id,
        },
        {
          gym_id: gym.id,
          user_id: user.id,
        },
      ],
    })

    const response = await request(app.server)
      .get('/check-ins/metrics')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.checkInsCount).toEqual(2)
  })
})

vamos agora para o validate
nesse a gente vai copiar o do create mudamos os nomes.
no vaidatade a gente criou a academia e vamos criar um checkin tambem usando o prisma esse checkin vai ser declarado como let. e vamos tambem pegar o usuario como fizemos nos outros
agora na nossa const response a gente vai pegar a rota checkins/${checkin.id}/validate com um patch e no send a gente não envia nada.
esperalmos que o statuscode seja 204 e esperamos tambem que a gente possa fazer uma nova busca no bancode dados usando o find unique or trhow do prisma where o checinid seja igual ao checkin id qu a gente passou.
  checkIn = await prisma.checkIn.findUniqueOrThrow({
      where: {
        id: checkIn.id,
      },
    })

    nos temos que fazer dessa forma porque o validate néao retorna um body então a gente não tem como pegar o response.body para saber se o validate_at mudou a gente precisa é chamar o banco de dados para preencher o checkin que a gente tinha com o checkin do banco de dados e assim poder examinar ele 
dessa forma agora a gente pode esperar depois que a gente chalou a rota que a nossa validate_at do checkin esteja preenchida com qualquer data(temporal).
 expect(checkIn.validated_at).toEqual(expect.any(Date))
 o legal disso é que com o teste endtoend a gente pode inclusive validar se alguma informação mudou no banco de dados.


 a pagina toda fica assim:
 import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { createAndAuntenticateUser } from '@/utils/test/create-and-autenticate-user'
import { prisma } from '@/lib/prisma'

describe('validate check-in (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
  })
  test('if can validate a check-in', async () => {
    const { token } = await createAndAuntenticateUser(app)
    const user = await prisma.user.findFirstOrThrow()

    const gym = await prisma.gym.create({
      data: {
        title: 'javascript gym',
        latitude: -27.2892852,
        longitude: -49.6481891,
      },
    })
    let checkIn = await prisma.checkIn.create({
      data: { user_id: user.id, gym_id: gym.id },
    })

    const response = await request(app.server)
      .patch(`/check-ins/${checkIn.id}validate`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(204)

    checkIn = await prisma.checkIn.findUniqueOrThrow({
      where: {
        id: checkIn.id,
      },
    })

    expect(checkIn.validated_at).toEqual(expect.any(Date))
  })
})

## fazer atençao a colocar a / nas rotas quando a gente chama a const response por exemplo aqui  .get('check-ins/metrics') isso esta errado e muitos dos arquivos que copiei aqui tem esse erro. temos que tomar cuidado com isso o correto é .get('/check-ins/metrics') atenção para a barra antes do checkin.

## jaspn web token
um dos problemas do jason web token é que ele é valido eternamente, se o usuario tiver o conhecimento tecnico para obter o token ao se logar uma vez pode continuar usando esse token eternamente e ele sempre va ser valido.
para contornar esse problema. então o que muita aplicação faz é colocar uma dar uma data de validação para esse token, eles fazem isso com o iat sendo a data que foi feito o token assim o token pode expirar depois de um tempo como 1 semana por exemplo.
para manter o usuario logado pra sempre a gente usa o refresh token que é o seguinte quando o usuario faz o login a gente cria um jwt normal como a gente faz e faz tambem um segundo jwt com expiração maior e esse seguntdo token não vai ser visivel, então apos o primeiro expirar o backend vai ver se existe um segundo token, gerado para ele. e esse segundo token vai servir para recriar um token de validação para ele. a diferença é que o primeiro token é acessivel a nivel de frontend o segundo vai ficar encriptado e invisivel para o frontend não conseguir acesso a ele. assim uma pessoa maliciosa não tem acesso a ele. tem varias extrategias para fazer isso. a ente pode salvar esse token por exemplo no banco de dados e assim que o usuario fazer logout a gente marca ess tokne como não mais valido; 
para implementar o resfresh token nos vamos la dentro do app ts e na linha appregister
app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})
nos vamos configurar nobvas linhas
sign: {
  experiseAt:'' -- em aplicação que a gente vai deixar o usuario logado para sempre a gente vai tragalhar com data de expiração bem curta assim a gente consegue revalidar esse token sempre com o nosso refreshtoken - vamos botar 10m ou seja 10 minutos
}
fica asim
app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  sign: {
    expiresIn: '10m',
  },
})
agora nos vamos para o nosso controller de autenticate que é onde a gente cria o token do usuario
a gente pega essa const que cria o token e faz outra para criar o refreshtoken assim ficamos con duas const parecdas uma token e uma refreshtoken
    const token = await reply.jwtSign(
      {},
      {
        sign: {
          sub: user.id,
        },
      },
    )

so que nesse refresh token a gente configura uma quantidade maior de tempo como 7d sete dias assim o usuario so vai perder autenticação se ele ficar 7 dias sem entrar na aplicação. 
os dois tokens juntos ficam assim:
 const token = await reply.jwtSign(
      {},
      {
        sign: {
          sub: user.id,
        },
      },
    )
    const refreshToken = await reply.jwtSign(
      {},
      {
        sign: {
          sub: user.id,
          expiresIn: '7d',
        },
      },
    )

    agora no return o primeiro token a gente vai continuar mandando como a gente manda. e o front end vai ter acesso. porem o segundo cookie a gente vai mandar como um cookie e a vantagem disso é que o cookie pode não ser visto pelo front end.
    para trabalhar com cookies a gente vai ter que instalar o modulo
    npm i @fastify/cookie 
    voltamos para o app.ts e importamos o fastify/cookie
    e a geten cadastra ele assim: parte cortada da pagina que pega as a importação e a register:
    import fastifyCookie from '@fastify/cookie'
import { gymRoutes } from './http/controller/gym/routes'
import { checkInRoutes } from './http/controller/checkIn/routes'

export const app = fastify()
app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  sign: {
    expiresIn: '10m',
  },
})
app.register(fastifyCookie)

voltamos para a autenticate
agora no reply antes do send() a gente coloca a opção setCokkie e passa para ele como primeiro argumento uma string com o nome do cookie que vai ser refreshtoken um segundo argumento a gente passa o refreshtoken que a gente criou e o terceiro argumento vai ser um objeto e nele a gente vai configurar algumas coisas; primeiro o path que vai ser / assim dizemos que todas as rotas da nossa aplicação podem ter acesso a esse cookie.
segunda opçõa vai ser o secure e a gente bota nela true para dizer que ele vai ser encriptado com https depois a gente tem a opção sameSite true tambem para dizer que ai ser so acessivel no nosso dominio e por fim a httpOnly
 tambem true para dizer que ele so vai ser acessivel no nosso backend.
 o autenticate fica assim:
 import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error'
import { makeAutenticateUseCase } from '@/use-cases/factory/make-autenticate-use-case'
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
    const autenticateUseCase = makeAutenticateUseCase()
    const { user } = await autenticateUseCase.execute({
      email,
      password,
    })

    const token = await reply.jwtSign(
      {},
      {
        sign: {
          sub: user.id,
        },
      },
    )
    const refreshToken = await reply.jwtSign(
      {},
      {
        sign: {
          sub: user.id,
          expiresIn: '7d',
        },
      },
    )

    return reply
      .setCookie('refreshToken', refreshToken, {
        path: '/',
        secure: true,
        sameSite: true,
        httpOnly: true,
      })
      .status(200)
      .send({ token })
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return reply.status(400).send({ message: err.message })
    }
    return reply.status(500).send() // TODO fixthis
  }
}

com isso salvo podemos testar com o insmomnia vamos na rota autenticate e enviamos o usuario e devemos ver o cookie voltar dessa forma
agora a gente volta para o app e dentro do nosso register que tem o jwt a gente coloca uma segunda opção 
app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: 'refreshToken',
    signed: false,
  },
  sign: {
    expiresIn: '10m',
  },
})
ou seja a gente coloca um cookie para ele ler da o nome do cookie e diz que néao é assinado porque ele não tem aquela assinatura do jwt que a gente discutiu antes.
# controller de refrsh
vamos na pasta users e vamoscriar um arquivo chamado refresh.ts
esse arquivo vai servrir para revalidar o token iusando o refresh quando o outro token expirar.
vamos copiar o codigo da rota autenticate e mudar o nome para refresh.
antes de a gente melhorar esse arquivo a gente vai logo no nosso routes.ts e vamos crar uma nova rota usando o metodo patch.('/token/refresh) ou seja ela vai pegar um token e vai atualizar ele
  app.patch('/token/refresh', refresh)
  a gente não vai colocar nela o hook de autentificação porque éla é justamente para ser chamada pelo frontedn quando o usuario não estiver mais autentificado.
  então voltamos la no nosso arquivo refresh e logo no inicio dafunção a gente coloca como primeira coisa a ser feita a chamada do await request.jwtverify e a gente vai passar para esse jwtverify a opção onlyCookie como sendo true.
  essa opão vai validar que o usuario esta verificado mas não vai olhar para o cabecalho dfa aplicação que é o que nos usamos para normalmente passar a autentificação. ela vai olhar apenas para o cookie que é onde a gente passa o refreshtoken
  se o refreshtoken existir e ainda for valido ele vai rodar o resto dessa função. então com ele existindo e sendo valido a gente vai gerar um novo token.
  então vamos deletar tudo até a const token retiramos tambem o catch do fim
  agora a gente tem que mudar o user porque a gente não tem mais acesso ao user então vamos fazer requst.user.sub para pegar os dados do user logado.
  o controller fica assim:
  import { FastifyReply, FastifyRequest } from 'fastify'

export async function refresh(request: FastifyRequest, reply: FastifyReply) {
  await request.jwtVerify({ onlyCookie: true })

  const token = await reply.jwtSign(
    {},
    {
      sign: {
        sub: request.user.sub,
      },
    },
  )
  const refreshToken = await reply.jwtSign(
    {},
    {
      sign: {
        sub: request.user.sub,
        expiresIn: '7d',
      },
    },
  )

  return reply
    .setCookie('refreshToken', refreshToken, {
      path: '/',
      secure: true,
      sameSite: true,
      httpOnly: true,
    })
    .status(200)
    .send({ token })
}


a gente pode testar peo insmonia criando uma nova rota chamada refreshToken e não enviar nada pela autorização a gente cria essa rota para o metodo patch para localhost/token/refresh
e enviamos para ele o email e senha no body.
ele vai gerar novos tokens tanto o de autentificação quanto o novo cookie do refresh.
é uma rota que não bate no banco de dados ntão ela é bem rapida.
porem uma estrategia que a gente poderia ter para o futuro seia salvar esse refreshtoken no banco de dados assim se em algum momento a gente quiser invalidar o login do usuario basta a gente ir na coluna do refresh token e falar que esse token não é mais valido.
é importante entender que teoricamente o token dura so 7 dias,então apos sete dias ele expiraria. mas não é em assim porque se o usuario estiver sempre entrando na aplicação ele nunca expira porque sempre faz um novo, então existe essa seguranda que a gente poderia fazer uma logica para mesmo se o usuario estivesse sempre na aplicação apos um numero X de requisições por exemplo fosse necessario a senha de novo, e isso teria que invalidar o refreshtoken.
agora vamos criar um teste para essa rota
vamos co^piar o teste de autenticate e mudar os nomes para refresh e vamos trocar o nome na const response para authResponse
ai a gente abaixo faz uma const cookies para pegar os cookies da authResponse e dele a gente da um get e pass o set-cookie
 const cookies = authResponse.get('Set-Cookie') 

 e agora a gente cria a const response criando uma nova chamada para o servidor usando o metodo patch e a tora /tokens/refresh a gente da um set cookie para enviar nossos cookies e depois da um .send() 
    const response = await request(app.server)
      .patch('/token/refresh')
      .set('Cookie', cookies)
      .send()

      agora o nosso expect é o statuscode 200 e que o body tenha um novo token e esperamos tambem que o nosso response.get('set-cookie') seja iguam a um array e dentro desse array esperamos que tenha uma sgtring contendo refreshToken=

# autorizaçao por cargos (rbca)
nos podemos ter esse conceito de autorização por cargos ou seja um admin tem mais autorizações do que um usuario padrão.
ou seja cada usuario vai ter acesso a partes do sistema baseado no cargo dele.
trm aplicações que vao em niveis profundos outros so olham as rotas se o usuario estiver autentificado ele pode chamar a rota. isso é o que a gente faz e a maioria das alicações fazem.
nos vamos no nosso schema do banco de dados
ou seja na pasta prisma e no schema.prisma
e no model user a gente vai adicionar a role que vai ser uma string:
model User {
  id            String   @id @default(uuid())
  name          String
  email         String   @unique
  password_hash String
  role          String
  created_at    DateTime @default(now())

  CheckIns CheckIn[]

  @@map("users")
}

e como vamos ter umleque de cargos predeterminados dentro do prisma eu posso criar o enum então antes do model user a gente cria um enum e vamos chamar ele de Role e abrimos um objeto para colocar quais são os cargos vamos criar eles em caixa alta vamos teradmin e memeber e dentro vamos colocar admin e member em caixa alta
ai agora no role ao inves de colocar string a gente vai colocar Role ou seja vamos pegar essa tipagem,  e colocamos o default para ser member fica assim:
enum Role {
    ADMIN
    MEMBER
}

model User {
  id            String   @id @default(uuid())
  name          String
  email         String   @unique
  password_hash String
  role          Role @default(MEMBER)
  created_at    DateTime @default(now())

  CheckIns CheckIn[]

  @@map("users")
}

agora rodamos um npx prisma migrate dev 
assim ele vai rodar essa migration
vamos dar o nome ou motivo de add role to userrs
e como a  gente colocou default como memeber todos agora vao ser membezr
agora a gente vai no insomnia cadastramos um outro usuario e no prisma estudio a gente troca o role deme para admin
tentei criar passando como role ADMIN na requisição. vou ver pelo prisma sudio se a gente acha ele como admin.
n éao tinha feito. e eu tambem ja tinha varios registros la, todos como member. eu apaguei os registros desnecessarios e so deixei dois. mudei um dos dois de member para admin manualmente.
iuri212154@hotmail.com
esse acima é o usuario que esta como admin
agora vamos la no autentificate é alem de salvar no token do usuario o sign dele com o id dele a gente tambem no primeiro objeto {o payload} vamos salvar tambem a role dele sendo user.role fica assim:

porem no refresh teria duas formar de pegar a role do usuario. a gente poderia crar um user como a gente fez no autenticate. ou então a gente pode enviar a role dentro do refreshtoken do autenticate e assim ter acesso no refresh é o que vamos fazer.
ela fica assim:
import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error'
import { makeAutenticateUseCase } from '@/use-cases/factory/make-autenticate-use-case'
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
    const autenticateUseCase = makeAutenticateUseCase()
    const { user } = await autenticateUseCase.execute({
      email,
      password,
    })

    const token = await reply.jwtSign(
      {
        role: user.role,
      },
      {
        sign: {
          sub: user.id,
        },
      },
    )
    const refreshToken = await reply.jwtSign(
      {
        role: user.role,
      },
      {
        sign: {
          sub: user.id,
          expiresIn: '7d',
        },
      },
    )

    return reply
      .setCookie('refreshToken', refreshToken, {
        path: '/',
        secure: true,
        sameSite: true,
        httpOnly: true,
      })
      .status(200)
      .send({ token })
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return reply.status(400).send({ message: err.message })
    }
    return reply.status(500).send() // TODO fixthis
  }
}

agora a gente vai em types fatsityJWT.d.ts 
e adiciona n usero role podendo ser adin ou member fica assim:
import '@fastify/jwt'

declare module '@fastify/jwt' {
  export interface FastifyJWT {

    user: {
      sub: string
       role: 'ADMIN' | 'MEMBER'
    }
  }
}

agora no refreshe a gente faz uma const para pegar a role de dentro do request.user e ai a gente reencaminha ela dentro do payload do refresh fica assim:
import { FastifyReply, FastifyRequest } from 'fastify'

export async function refresh(request: FastifyRequest, reply: FastifyReply) {
  await request.jwtVerify({ onlyCookie: true })
  const { role } = request.user
  const token = await reply.jwtSign(
    {
      role,
    },
    {
      sign: {
        sub: request.user.sub,
      },
    },
  )
  const refreshToken = await reply.jwtSign(
    { role },
    {
      sign: {
        sub: request.user.sub,
        expiresIn: '7d',
      },
    },
  )

  return reply
    .setCookie('refreshToken', refreshToken, {
      path: '/',
      secure: true,
      sameSite: true,
      httpOnly: true,
    })
    .status(200)
    .send({ token })
}

agora vamos manter o cargo do usuario quando a gente fizer o refreh. porem agora vamos criar um novo middleware para nossa aplicação.
vamos criar um arquivo chamado ondly-admin e nele vamos copiar o middleware do verify e trocar de nome para only admin
porem ne e a gente não vai verificar o token/ a gente vai fazer uma cont chaada role, que vai pegar o role do request.user e vamos fazer uma coisa if assim se o role nao for o de admin a gente vai retornar o erro. se não a gente  não rtorna nada a pessoa vai ser adm vai ser adm e ela vai poder ter acesso ao resto; fica assim:
import { FastifyReply, FastifyRequest } from 'fastify'

export async function onlyAdmin(request: FastifyRequest, reply: FastifyReply) {
  const { role } = request.user
  if (role !== 'ADMIN') {
    return reply.status(401).send({ message: 'Unauthorized' })
  }
}
porem vamos modificar isso para ser melhor a gente vai trocar o nome do middleware para verifyRole.ts
e la dentro a gente troca a middleware para ser uma função de dentro dela a gente vai fazer essa verificação a essa função vai receber o roleToVerify que pode ser ADMIN ou MEMBER e caso não seja o role ela vai dar o erro.
import { FastifyReply, FastifyRequest } from 'fastify'

export function verifyUser(roleToVerify: 'ADMIN' | 'MEMBER') {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const { role } = request.user
    if (role !== roleToVerify) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }
  }
}

como vamos usar isso agora
nos vamos por exemplo em gyms /routes vamos pegar a rota de verificação e vamos passar o onRequest passando para ela o verifyRole e passando o cargo de ADMIN
assim:
import { FastifyInstance } from 'fastify'

import { verifyJWT } from '../../middleware/verify-jwt'
import { search } from './search'
import { nearby } from './nearby'
import { create } from './create'
import { verifyUser } from '@/http/middleware/verifyRole'

export async function gymRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/gyms/search', search)
  app.get('/gyms/nearby', nearby)

  app.post('/gyms', { onRequest: [verifyUser('ADMIN')] }, create)
}

agora se a gente for no insmonia e autentificar com um usuario que não é admin para poder pegar o token dele. e usar o token dele em uma requisição de criar academia vai dar erro.
se a gente usar o de um admin e a gente passar os dados necessarios para crar uma academia não vai dar erro.
vamos passar amesma validação para a rota de checkin validation
import { FastifyInstance } from 'fastify'

import { verifyJWT } from '../../middleware/verify-jwt'
import { create } from './create'
import { validate } from './validate'
import { history } from './history'
import { metrics } from './metrics'
import { verifyUser } from '@/http/middleware/verifyRole'

export async function checkInRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/check-ins/history', history)
  app.get('/check-ins/metrics', metrics)

  app.post('/gyms/:gymId/check-ins', create)

  app.patch(
    '/check-ins/:checkInId/validate',
    { onRequest: [verifyUser('ADMIN')] },
    validate,
  )
}
# teste para o role
vamos agora fazer a atualização teste para a autorização por meio de role.
se a gente rodar nossos testes agora vamos ter bastante erros porque o nosso backend vai pedir uma autorização por role que nossas solicitações não vao ter. entéao nos vamos começar a reparar isso. vamos começar por esses erros de autorização por role. 
no nosso create and auntenticate user na pasta utils/test a gente ta criando o usuario chamando a rota e não estamo passando se ele é um admin então ele é por padr ão um membrer. vamos então mudar a forma que ele é feito. atualmente ele esta assim:
import { FastifyInstance } from 'fastify'
import request from 'supertest'

export async function createAndAuntenticateUser(app: FastifyInstance) {
  await request(app.server).post('/users').send({
    name: 'Jhon Doe',
    email: 'jhondoe@example.com',
    password: 'testpassword',
  })
  const authResponse = await request(app.server).post('/sessions').send({
    email: 'jhondoe@example.com',
    password: 'testpassword',
  })
  const { token } = authResponse.body

  return { token }
}

a gente vai adicionar aos parametros que  função recebe o isAdmin e a gente vai sertar ele como false
e a gente vai  usar o await prisma.user.create e passar para o create como data as especificaçãoes para criar um usuario mudando de password para password_hash e usando a função hash do bcrypt para fazer um hash de 6 rounds da stringonar o ronte passar. alem disso a gente vai adicionar o role, e esse role se ele existir vai ser admin, se não vai ser member. fica assim:
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import request from 'supertest'

export async function createAndAuntenticateUser(
  app: FastifyInstance,
  isAdmin = false,
) {
  await prisma.user.create({
    data: {
      name: 'Jhon Doe',
      email: 'jhondoe@example.com',
      password_hash: await hash('testPassword', 6),
      role: isAdmin ? 'ADMIN' : 'MEMBER',
    },
  })
  const authResponse = await request(app.server).post('/sessions').send({
    email: 'jhondoe@example.com',
    password: 'testpassword',
  })
  const { token } = authResponse.body

  return { token }
}

agora quando a gente for la no checkins/validate.spec.ts quando passamos o token para validar o chekin a gente passa como segundo argumento o true, assim a gente valida o usuario como member.
 test('if can validate a check-in', async () => {
    const { token } = await createAndAuntenticateUser(app, true)

    vamos agora no teste de criação de academia gyms/create.spec.ts e fazemos a mesma coisa passamos o true onde pegamos o token.
    vamos agora na nearby.spec e na searchGym e faz a mesma coisa. e agora se a gente rodar o docker nossos testes devem passar.





































































































































































