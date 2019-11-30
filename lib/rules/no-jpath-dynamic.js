"use strict";

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
                if (firstArgument.type === "Literal") {
                    return;
                }

                if (firstArgument.type === "TemplateLiteral") {

                    // no.jpath(`.path`, data) - VALID
                    if (firstArgument.expressions.length === 0) {
                        return;
                    }

                    // no.jpath(`.foo.${ bar }`, data)
                    if (firstArgument.expressions.every(item => item.type === "Identifier" || item.type === "MemberExpression")) {
                        context.report({
                            message: "Only static no.jpath allowed",
                            node,
                            fix(fixer) {
                                const sourceCode = context.getSourceCode();
                                const sourceCodeText = sourceCode.getText(node);
                                let replaceText = sourceCodeText;
                                const varsToObject = [];

                                firstArgument.expressions.forEach((exressionNode, index) => {
                                    let jpathVariableName;
                                    let exressionName;

                                    if (exressionNode.type === "Identifier") {
                                        jpathVariableName = exressionNode.name;
                                        exressionName = exressionNode.name;
                                        varsToObject.push(exressionNode.name);
                                    } else {
                                        jpathVariableName = `jpathVariable${index}`;
                                        exressionName = sourceCode.getText(exressionNode);
                                        varsToObject.push(`${jpathVariableName}: ${exressionName}`);
                                    }

                                    replaceText = replaceText
                                        .replace(new RegExp(`\\.\\\${\\s*${exressionName}\\s*}`), () => `[${jpathVariableName}]`)
                                        .replace(new RegExp(`\\[\\s*\\\${\\s*${exressionName}\\s*}\\s*]`), () => `[${jpathVariableName}]`)
                                        .replace(new RegExp(`"\\\${\\s*${exressionName}\\s*}"`), () => jpathVariableName);
                                });

                                replaceText = replaceText
                                    .replace(
                                        /\)$/,
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
                    context.report({
                        message: "Only static no.jpath allowed",
                        node,
                        fix(fixer) {
                            const sourceCode = context.getSourceCode().getText(node);
                            const stringValue = firstArgument.left.value;
                            const variableValue = firstArgument.right.name;

                            const replaceText = sourceCode
                                .replace(` + ${variableValue}`, "")
                                .replace(
                                    stringValue,
                                    stringValue.replace(/\.$/, `[${variableValue}]`)
                                )
                                .replace(
                                    /\)$/,
                                    `, { ${variableValue} })`
                                );

                            return fixer.replaceText(node, replaceText);
                        }
                    });
                    return;
                }

                context.report({
                    message: "Only static no.jpath allowed",
                    data: { },
                    node
                });
            }
        };
    }
};
