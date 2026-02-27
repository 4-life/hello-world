/* eslint-disable prettier/prettier */
/**
 * ESLint rule: require-typegraphql-explicit-name
 *
 * Enforces that @ObjectType() and @InputType() decorators from type-graphql
 * always receive an explicit string name as their first argument.
 *
 * Why: Next.js production builds minify class names (keep_classnames: false),
 * so TypeGraphQL's default of using constructor.name breaks — the GraphQL
 * schema ends up with types named "r" instead of "UsersFilter".
 *
 * Bad:  @InputType()
 * Good: @InputType('UsersFilter')
 */

/** @type {import('eslint').Rule.RuleModule} */
export const requireTypegraphqlExplicitName = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require explicit string name in @ObjectType() and @InputType() decorators to prevent class-name minification issues in production builds.',
      recommended: true,
    },
    schema: [],
    messages: {
      missingName:
        '@{{decorator}}() must include an explicit string name as the first argument (e.g. @{{decorator}}(\'{{className}}\')), because Next.js production builds mangle class names.',
    },
  },

  create(context) {
    const DECORATORS = new Set(['ObjectType', 'InputType']);

    function checkDecorator(decorator, className) {
      const expr = decorator.expression;

      // Handle both @InputType() (CallExpression) and bare @InputType (Identifier, unlikely but safe)
      if (expr.type !== 'CallExpression') return;

      const callee = expr.callee;
      if (callee.type !== 'Identifier') return;
      if (!DECORATORS.has(callee.name)) return;

      const args = expr.arguments;
      const firstArg = args[0];

      // First argument must be a string literal
      const hasExplicitName =
        firstArg &&
        firstArg.type === 'Literal' &&
        typeof firstArg.value === 'string';

      if (!hasExplicitName) {
        context.report({
          node: decorator,
          messageId: 'missingName',
          data: {
            decorator: callee.name,
            className: className ?? 'ClassName',
          },
        });
      }
    }

    return {
      ClassDeclaration(node) {
        const className = node.id?.name ?? null;
        for (const decorator of node.decorators ?? []) {
          checkDecorator(decorator, className);
        }
      },
      ClassExpression(node) {
        const className = node.id?.name ?? null;
        for (const decorator of node.decorators ?? []) {
          checkDecorator(decorator, className);
        }
      },
    };
  },
};
