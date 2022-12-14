export default {
    type: "object",
    properties: {
        key: { type: "string" },
        contentType: { type: "string" }
    },
    required: ["key", "contentType"]
} as const;
