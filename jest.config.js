module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: 'src',
    moduleNameMapper: {
        '^obsidian$': 'node_modules/obsidian/obsidian.d.ts', // Adjust path accordingly
    },
};