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
        }]
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

                // no.jpath(`.path`, data) - VALID
                if (firstArgument.type === "TemplateLiteral" && firstArgument.expressions.length === 0) {
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
