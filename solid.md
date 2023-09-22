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


