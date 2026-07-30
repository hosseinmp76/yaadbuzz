import type { CodegenConfig } from '@graphql-codegen/cli'

/**
 * Typed documents from Quarkus SDL + hand-written operations.
 * Schema: graphql/schema.graphql
 * Operations: graphql/operations/
 *
 * npm run graphql:generate
 * or: ./mvnw -Pgraphql-codegen generate-sources
 */
const config: CodegenConfig = {
  schema: 'graphql/schema.graphql',
  documents: ['graphql/operations/**/*.graphql'],
  ignoreNoDocuments: false,
  generates: {
    'src/api/generated/graphql.ts': {
      // typescript-operations v6+ owns schema Input/Enum + operation types in one file
      plugins: ['typescript-operations', 'typed-document-node'],
      config: {
        maybeValue: 'T',
        inputMaybeValue: 'T | null | undefined',
        enumType: 'string-literal',
        skipTypename: true,
        useTypeImports: true,
        avoidOptionals: {
          inputValue: false,
          variableValue: false,
          defaultValue: false,
        },
        scalars: {
          DateTime: 'string',
        },
      },
    },
  },
}

export default config
