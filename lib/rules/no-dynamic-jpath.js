"use strict";

const END_COMMA = /\.$/u;
const END_ROUND_BRACKET = /\)$/u;

/**
 * Returns true if node is static string
 * @param {ASTNode} node The AST node to check
 * @returns {boolean} true if node is Literal or TemplateLiteral without expressions
 */
function isNodeStaticString(node) {
    return node.type === "Literal" || (
        node.type === "TemplateLiteral" && node.expressions.length === 0
    );
}

/**
 * Returns true if node is static string or concatenation of static strings.
 * @param {ASTNode} node The AST node to check
 * @returns {boolean} Check result
 */
function isNodeHasOnlyStringConcatenation(node) {
    if (isNodeStaticString(node)) {
        return true;
    }

    return (
        node.type === "BinaryExpression" &&
        isNodeHasOnlyStringConcatenation(node.left) &&
        node.operator === "+" &&
        isNodeHasOnlyStringConcatenation(node.right)
    );
}

// eslint-disable-next-line jsdoc/require-jsdoc
function reportError(context, node, obj) {
    context.report(Object.assign({
        message: "Only static no.jpath allowed",
        node
    }, obj));
}

module.exports = {
    meta: {
        docs: {
            description: "Forbid hanging hyphens"
        },
        schema: [{
            type: "object",
            properties: {
                hyphens: { type: "array" }
            }
        }],
        fixable: true
    },
    create(context) {
        return {
            CallExpression(node) {

                // accept only obj.prop()
                if (node.callee.type !== "MemberExpression") {
                    return;
                }

                // accept only no.prop()
                if (node.callee.object.name !== "no") {
                    return;
                }

                // accept only no.jpath()
                if (node.callee.property.name !== "jpath") {
                    return;
                }

                const firstArgument = node.arguments[0];

                // no.jpath('.path', data) - VALID
                // no.jpath(`.path`, data) - VALID
                // no.jpath('.foo' + '.bar', data) - VALID
                if (isNodeHasOnlyStringConcatenation(firstArgument)) {
                    return;
                }

                if (firstArgument.type === "TemplateLiteral") {

                    // no.jpath(`.foo.${ bar }`, data)
                    if (firstArgument.expressions.every(item => item.type === "Identifier" || item.type === "MemberExpression")) {

                        const firstQuasis = firstArgument.quasis[0];

                        // no.jpath(`.${ foo }`, data)
                        if (firstQuasis && firstQuasis.value.raw === ".") {
                            reportError(context, node);
                            return;
                        }

                        reportError(context, node, {
                            fix(fixer) {
                                const sourceCode = context.getSourceCode();
                                let replaceText = sourceCode.getText(node);
                                const varsToObject = [];
                                const { expressions } = firstArgument;

                                for (let i = 0; i < expressions.length; i++) {
                                    const exressionNode = expressions[i];
                                    let jpathVariableName;
                                    let exressionName;

                                    if (exressionNode.type === "Identifier") {
                                        jpathVariableName = exressionNode.name;
                                        exressionName = exressionNode.name;
                                        varsToObject.push(exressionNode.name);
                                    } else {
                                        jpathVariableName = `jpathVariable${i}`;
                                        exressionName = sourceCode.getText(exressionNode);
                                        varsToObject.push(`${jpathVariableName}: ${exressionName}`);
                                    }

                                    const nextReplaceText = replaceText
                                        // eslint-disable-next-line require-unicode-regexp
                                        .replace(new RegExp(`\\.\\\${\\s*${exressionName}\\s*}`), () => `[${jpathVariableName}]`)
                                        // eslint-disable-next-line require-unicode-regexp
                                        .replace(new RegExp(`\\[\\s*\\\${\\s*${exressionName}\\s*}\\s*]`), () => `[${jpathVariableName}]`)
                                        // eslint-disable-next-line require-unicode-regexp
                                        .replace(new RegExp(`"\\\${\\s*${exressionName}\\s*}"`), () => jpathVariableName);

                                    // I can't fix its
                                    if (replaceText === nextReplaceText) {
                                        return null;
                                    }

                                    replaceText = nextReplaceText;
                                }

                                replaceText = replaceText
                                    .replace(
                                        END_ROUND_BRACKET,
                                        `, { ${varsToObject.join(", ")} })`
                                    );

                                return fixer.replaceText(node, replaceText);
                            }
                        });
                        return;
                    }
                }

                // no.jpath('.foo.' + bar, data)
                if (
                    firstArgument.type === "BinaryExpression" &&
                    firstArgument.left.type === "Literal" &&
                    firstArgument.left.value.endsWith(".") &&
                    firstArgument.operator === "+" &&
                    firstArgument.right.type === "Identifier"
                ) {
                    reportError(context, node, {
                        fix(fixer) {
                            const sourceCode = context.getSourceCode().getText(node);
                            const stringValue = firstArgument.left.value;
                            const variableValue = firstArgument.right.name;

                            // no.jpath('.' + foo, data)
                            if (stringValue === ".") {
                                return null;
                            }

                            const replaceText = sourceCode
                                .replace(` + ${variableValue}`, "")
                                .replace(
                                    stringValue,
                                    stringValue.replace(END_COMMA, `[${variableValue}]`)
                                )
                                .replace(
                                    END_ROUND_BRACKET,
                                    `, { ${variableValue} })`
                                );

                            return fixer.replaceText(node, replaceText);
                        }
                    });
                    return;
                }

                reportError(context, node);
            }
        };
    }
};
