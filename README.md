**This repo is still experimental. Please use with caution.**

# detect-multiple-awaits

A command line tool to detect functions with multiple `await` keywords.

With this tool, you can find functions that may potentially impede the performance of your product.

## 🚀 Usage
```bash
$ npx detect-multiple-awaits run "./src/**/*"
```

Here is an example output:

```
🗄 src/main.ts
  - fetchUser() at src/main.ts:45 has 2 await keyword(s).

🗄 src/index.html
  - submit() at src/index.ts:101 has 3 await keyword(s).

🗄 src/Index.vue
  - save() at src/Index.vue:53 has 2 await keyword(s).
  - reload() at src/Index.vue:73 has 5 await keyword(s).
  - submit() at src/Index.vue:113 has 3 await keyword(s).
```

It extracts the script tag from a target file if any, otherwise treats the entire file as a JS/TS file.

## 📄 License

MIT.
