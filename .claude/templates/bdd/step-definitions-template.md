# BDD Step Definitions Template

Este arquivo documenta como implementar step definitions para os cenários Gherkin.

---

## Estrutura de Arquivos

```
tests/
└── bdd/
    ├── features/
    │   └── [feature-name].feature
    ├── steps/
    │   └── [feature-name].steps.ts
    └── support/
        ├── world.ts
        └── hooks.ts
```

---

## Step Definitions (TypeScript)

```typescript
// tests/bdd/steps/[feature-name].steps.ts

import { Given, When, Then, Before, After } from '@cucumber/cucumber'
import { expect } from 'chai'
import { World } from '../support/world'

// GIVEN steps - Pré-condições
Given('que o sistema está disponível', async function (this: World) {
  await this.app.start()
  expect(this.app.isRunning()).to.be.true
})

Given('que existem os seguintes usuários no sistema:', async function (this: World, dataTable) {
  const users = dataTable.hashes()
  for (const user of users) {
    await this.database.insert('users', user)
  }
})

Given('que eu estou logado como {string}', async function (this: World, username: string) {
  const user = await this.database.findUserByName(username)
  this.authToken = await this.auth.generateToken(user)
})

// WHEN steps - Ações
When('eu tento {string}', async function (this: World, action: string) {
  try {
    this.response = await this.api.post(`/actions/${action}`, {
      headers: { Authorization: `Bearer ${this.authToken}` }
    })
  } catch (error) {
    this.error = error
  }
})

When('eu faço uma requisição para {string}', async function (this: World, endpoint: string) {
  this.response = await this.api.get(endpoint)
})

// THEN steps - Verificações
Then('eu devo ver {string}', function (this: World, expectedMessage: string) {
  expect(this.response.body.message).to.equal(expectedMessage)
})

Then('a resposta deve ter status {string}', function (this: World, statusCode: string) {
  expect(this.response.status).to.equal(parseInt(statusCode))
})

Then('o payload deve conter:', function (this: World, docString: string) {
  const expected = JSON.parse(docString)
  expect(this.response.body).to.deep.include(expected)
})

Then('eu devo receber um erro {string}', function (this: World, errorCode: string) {
  expect(this.response.status).to.equal(parseInt(errorCode.split(' ')[0]))
})

// Hooks
Before(async function (this: World) {
  await this.database.clean()
  await this.database.migrate()
})

After(async function (this: World) {
  await this.app.stop()
})
```

---

## World Object

```typescript
// tests/bdd/support/world.ts

import { World as CucumberWorld } from '@cucumber/cucumber'
import { Application } from '../../../src/app'
import { Database } from '../../../src/infrastructure/database'
import { ApiClient } from './api-client'
import { AuthService } from './auth-service'

export class World extends CucumberWorld {
  app: Application
  database: Database
  api: ApiClient
  auth: AuthService
  response: any
  error: any
  authToken: string

  constructor(options: any) {
    super(options)
    this.app = new Application()
    this.database = new Database()
    this.api = new ApiClient()
    this.auth = new AuthService()
  }
}
```

---

## Cucumber Configuration

```typescript
// cucumber.config.ts

export default {
  require: ['tests/bdd/steps/**/*.ts'],
  requireModule: ['ts-node/register'],
  format: [
    'progress-bar',
    'html:reports/cucumber-report.html',
    'json:reports/cucumber-report.json'
  ],
  formatOptions: { snippetInterface: 'async-await' },
  parallel: 2,
  retry: 1,
  strict: true,
  failFast: false
}
```

---

## Package.json Scripts

```json
{
  "scripts": {
    "test:bdd": "cucumber-js",
    "test:bdd:watch": "cucumber-js --watch",
    "test:bdd:report": "cucumber-js --format html:reports/cucumber-report.html"
  }
}
```

---

## Exemplo Completo

### Feature File
```gherkin
Funcionalidade: Autenticação de Usuário
  Como um usuário
  Eu quero fazer login
  Para acessar o sistema

  Cenário: Login com credenciais válidas
    Dado que existe um usuário com email "user@test.com" e senha "password123"
    Quando eu tento fazer login com:
      | email          | password    |
      | user@test.com  | password123 |
    Então eu devo receber um token JWT
    E o token deve ser válido por "24" horas
```

### Step Definitions
```typescript
Given('que existe um usuário com email {string} e senha {string}', async function (email, password) {
  await this.database.createUser({ email, password })
})

When('eu tento fazer login com:', async function (dataTable) {
  const credentials = dataTable.hashes()[0]
  this.response = await this.api.post('/auth/login', credentials)
})

Then('eu devo receber um token JWT', function () {
  expect(this.response.body).to.have.property('token')
  expect(this.response.body.token).to.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/)
})

Then('o token deve ser válido por {string} horas', function (hours) {
  const decoded = this.auth.decodeToken(this.response.body.token)
  const expiresIn = decoded.exp - decoded.iat
  expect(expiresIn).to.equal(parseInt(hours) * 3600)
})
```

---

## Best Practices

1. **One Assertion Per Then**: Cada `Then` deve verificar uma coisa
2. **Reusable Steps**: Escreva steps reutilizáveis
3. **Avoid Technical Details in Feature**: Feature files devem ser legíveis por não-técnicos
4. **Use Background**: Para setup comum entre cenários
5. **Tag Scenarios**: Use `@smoke`, `@integration`, `@security` para filtrar testes

---

## References
- [Cucumber Documentation](https://cucumber.io/docs)
- [Gherkin Syntax](https://cucumber.io/docs/gherkin/)
- [@cucumber/cucumber](https://github.com/cucumber/cucumber-js)
