/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: { "^.+\\.ts$": "ts-jest" },
  collectCoverageFrom: ["**/*.ts", "!**/index.ts", "!**/*.module.ts", "!main.ts", "!**/__tests__/**"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@database/(.*)$": "<rootDir>/database/$1",
    "^@auth/(.*)$": "<rootDir>/auth/$1",
    "^@tenant/(.*)$": "<rootDir>/tenant/$1",
    "^@ifood/(.*)$": "<rootDir>/ifood/$1",
    "^@orders/(.*)$": "<rootDir>/orders/$1",
    "^@dashboard/(.*)$": "<rootDir>/dashboard/$1",
    "^@shared/(.*)$": "<rootDir>/shared/$1",
  },
};
