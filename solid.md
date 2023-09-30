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








